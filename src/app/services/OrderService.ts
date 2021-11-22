import type { Order, Event, PrismaClient, Prisma } from ".prisma/client";
import type PaymentService from "./PaymentService";

export class OrderService {
    constructor(private readonly prisma: PrismaClient,
        private readonly paymentService: PaymentService) { }

    async createOrder(orderData: Prisma.OrderUncheckedCreateInput) {
        let eventId = orderData.eventId;
        let userId = orderData.userId;
        let canFulfillOrder = await this.canFulfillOrder(eventId, userId);
        if (!canFulfillOrder) {
            return [0, null];
        }
        return await this.prisma.$transaction(async () => {
            let affected = await this.prisma.$executeRaw`
                UPDATE "Event" SET "takenSeats" = "takenSeats" + 1
                WHERE id = ${eventId} AND "takenSeats" < seats;
                `;
            if (affected == 0) {
                throw new Error("Cannot create Order, no more available Seats");
            }
            let order = await this.prisma.order.create({
                data: orderData
            });
            if (!order) {
                throw new Error("Cannot create Order, something wrong");
            }
            return [affected, order];
        }
        );
    }

    async confirmOrder(orderId: string) {
        return this.prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: "CONFIRMED"
            }
        });
    }

    async needPayment(eventId: string) {
        let event = await this.prisma.event.findUnique({
            where: {
                id: eventId,
            },
        });
        if (event && event.price > 0) {
            return event;
        }
        return false;
    }

    async cancelOrder(order: Order) {
        return this.prisma.$transaction([
            this.prisma.$executeRaw`
            UPDATE "Event" SET "takenSeats" = "takenSeats" - 1
            WHERE id = ${order.eventId} AND "takenSeats" > 0;
            `,
            this.prisma.order.delete({
                where: {
                    id: order.id,
                }
            })
        ]);
    }

    async canFulfillOrder(eventId: string, userId: string): Promise<boolean> {
        let event = await this.prisma.event.findUnique({
            where: { id: eventId }
        });
        if (event?.endSale && event.endSale < new Date()) {
            return false;
        }
        let hasOrder = await this.prisma.order.findFirst({
            where: { userId, eventId }
        });
        if (hasOrder) {
            return false;
        }

        return true;
    }

    async completePaidOrder(data: { signature: string, eventBody: any }) {
        const event = this.paymentService.getPaymentEvent(data);
        let object = event.data.object as any;
        switch (event.type) {
            case 'payment_intent.succeeded': {
                console.log('succeeded');
                const paymentIntent = object.payment_intent || object.id || '';
                let order = await this.prisma.order.findFirst({
                    where: { paymentIntent }
                });
                return this.confirmOrder(order?.id || "");
            }
            case 'payment_intent.canceled':
            case 'payment_intent.failed': {
                console.log('canceled');
                
                const paymentIntent = object.payment_intent || object.id || '';
                let order = await this.prisma.order.findFirst({
                    where: { paymentIntent }
                });
                return this.cancelOrder(order as Order);
            }
            default:
                console.warn(`Event should be logged ${event.type}`);
        }

    }

    async createPaidOrder(event: Event, options: {
        userId: string,
        successUrl: string,
        cancelUrl: string,
        quantity: number,
    }) {
        let session = await this.paymentService.createSession(
            {
                successUrl: options.successUrl,
                cancelUrl: options.cancelUrl,
                quantity: options.quantity,
                metadata: {},
                product: {
                    description: event.description as string,
                    images: ["my_image"],
                    price: event.price,
                    title: event.title
                }
            }
        );
        if (!session) {
            throw new Error("Cannot create Payment Session");
        }
        let paymentIntent = session.payment_intent?.toString() || 'not set';
        let [, order] = await this.createOrder({
            eventId: event.id,
            userId: options.userId,
            paymentIntent,
        });
        if (!order) {
            throw new Error("Cannot create order");
        }
        return [session, order as Order];
    }
}

export default OrderService;
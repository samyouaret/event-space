import type { Order, OrderStatus, PrismaClient } from ".prisma/client";
import type PaymentService from "./PaymentService";

export class OrderService {
    constructor(private readonly prisma: PrismaClient,
        private readonly paymentService: PaymentService) { }

    async createOrder(eventId: string, userId: string, status?: OrderStatus) {
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
                data: {
                    eventId,
                    userId,
                    status: status,
                }
            });
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
        // const paymentIntent = event.data.object;
        let orderId = (event as any).metadata.orderId;
        switch (event.type) {
            case 'payment_intent.succeeded':
                return this.confirmOrder(orderId);
            case 'payment_intent.canceled':
            case 'payment_intent.failed': {
                let order = await this.prisma.order.findUnique({
                    where: { id: orderId }
                });
                await this.cancelOrder(order as Order);
                return order;
            }
            default:
                console.warn(`Event should be logged ${event.type}`);
        }

    }

}

export default OrderService;
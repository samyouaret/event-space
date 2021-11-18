import type { Order, OrderStatus, PrismaClient } from ".prisma/client";

export class OrderSerivce {
    constructor(private readonly prisma: PrismaClient) { }

    async createOrder(eventId: string, userId: string, status?: OrderStatus) {
        let canFulfillOrder = await this.canFulfillOrder(eventId, userId);
        if (!canFulfillOrder) {
            return false;
        }
        return this.prisma.$transaction([
            this.prisma.event.update({
                where: { id: eventId },
                data: {
                    takenSeats: { increment: 1 },
                }
            }),
            this.prisma.order.create({
                data: {
                    eventId,
                    userId,
                    status: status,
                }
            })
        ]);
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
            this.prisma.event.update({
                where: { id: order.eventId },
                data: {
                    takenSeats: { decrement: 1 },
                }
            }),
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
        if (!event) {
            return false;
        }
        if (event.takenSeats === event.seats) {
            return false;
        }
        if (event.endSale && event.endSale < new Date()) {
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
}

export default OrderSerivce;

import { v4 as uuid } from 'uuid';
import type { Prisma, PrismaClient } from ".prisma/client";

export class EventService {
    constructor(private readonly prisma: PrismaClient) { }

    async create(event: Prisma.EventCreateInput) {
        return this.save({
            ...event,
            id: uuid(),
        });
    }

    async all(params?: any) {
        return this.prisma.event.findMany({
            where: params,
            orderBy: { createdAt: 'desc' }
        });
    }

    async save(event: any) {
        return this.prisma.event.upsert(event);
    }

    async remove(uuid: string) {
        return this.prisma.event.delete({
            where: { id: uuid }
        });
    }
}

export default EventService;
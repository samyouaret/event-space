import type { Prisma, PrismaClient } from ".prisma/client";

export class EventService {
    constructor(private readonly prisma: PrismaClient) { }

    async create(event: Prisma.EventUncheckedCreateInput) {
        let newEvent = Object.assign({}, event);
        delete newEvent.id;
        try {
            let createdEvent = await this.prisma.event.create({
                data: newEvent
            });
            return createdEvent;
        } catch (error) {
            throw new Error("Cannot create event");
        }
    }

    async find({ params, filters, order = 'desc' }: { params: Prisma.EventWhereInput; filters?: Prisma.EventFindManyArgs; order?: 'asc' | 'desc'; }) {
        try {
            let events = await this.prisma.event.findMany({
                where: params,
                orderBy: { createdAt: order },
                ...filters
            });
            return events;
        } catch (error) {
            return [];
        }
    }

    async count(params?: Prisma.EventWhereInput): Promise<number> {
        try {
            return await this.prisma.event.count({
                where: params,
            });
        } catch (error) {
            return 0;
        }
    }

    async findById(id: string) {
        return this.prisma.event.findFirst({
            where: { id }
        });
    }

    async findByUserId(userId: string) {
        return this.prisma.event.findMany({
            where: { userId }
        });
    }

    async update(id: string, event: Prisma.EventUpdateInput) {
        let newEvent = Object.assign({}, event);
        delete newEvent.id;
        return this.prisma.event.update({
            data: newEvent, where: { id }
        });
    }

    async remove(uuid: string) {
        return this.prisma.event.delete({
            where: { id: uuid }
        });
    }
}

export default EventService;
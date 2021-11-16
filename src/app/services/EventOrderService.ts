import type { Prisma, PrismaClient } from ".prisma/client";

export class EventOrderSerivce {
    constructor(private readonly prisma: PrismaClient) { }
}

export default EventOrderSerivce;
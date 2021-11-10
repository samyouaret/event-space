import type { PrismaClient } from "@prisma/client";

export default class UserRepository {

    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    getPrisma(): PrismaClient {
        return this.prisma;
    }

    async save(user: any) {
        user = {
            ...user,
            role: 0
        };
        return this.prisma.user.create({ data: user });
    }

    async update(user: any, where: any):Promise<any> {
        return this.prisma.user.update({ data: user, where });
    }

    async findByEmail(email: string): Promise<any> {
        return this.prisma.user.findFirst({
            where:
                { email }
        });
    }

    async findById(id: number): Promise<any> {
        return this.prisma.user.findFirst({
            where:
                { id }
        });
    }

}
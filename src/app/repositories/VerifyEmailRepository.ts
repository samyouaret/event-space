import type { PrismaClient } from "@prisma/client";
import crypto from 'crypto'

export default class VerifyEmailRepository {

    prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    getPrisma(): PrismaClient {
        return this.prisma;
    }

    async create(email: string) {
        return this.prisma.verifyEmail.create({
            data: {
                hash: crypto.randomBytes(50).toString("hex"),
                timestamp: new Date(),
                email
            }
        });
    }

    async find(hash: string): Promise<any> {
        return this.prisma.verifyEmail.findUnique({
            where:
                { hash }
        });
    }

    async remove(hash: string): Promise<any> {
        return this.prisma.verifyEmail.delete({
            where:
                { hash }
        });
    }

}
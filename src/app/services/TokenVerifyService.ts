import MailService from "./MailService";
import { PrismaClient, TokenVerify } from ".prisma/client";
import UserService from "./UserService";
import crypto from 'crypto'

export default class TokenVerifyService {

    constructor(private readonly prisma: PrismaClient) { }

    async create(expireAt: Date): Promise<TokenVerify> {
        let createdAt = new Date();
        if (createdAt > expireAt) {
            throw new Error("Expire Date cannot be in the past");
        }
        return this.prisma.tokenVerify.create({
            data: {
                createdAt: new Date(),
                expireAt
            }
        });
    }

    async remove(token: string): Promise<TokenVerify | undefined> {
        return this.prisma.tokenVerify.delete({
            where:
                { token }
        });
    }

    async isValid(token: string): Promise<Boolean> {
        let record = await this.prisma.tokenVerify.findUnique({ where: { token } });
        if (!record) {
            return false;
        }
        if (record.expireAt < new Date()) {
            return false;
        }

        return true;
    }

}
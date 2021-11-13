import { PrismaClient, TokenVerify } from ".prisma/client";

export default class TokenVerifyService {

    constructor(private readonly prisma: PrismaClient) { }

    async create(expireAt: Date, email: string, reason: string): Promise<TokenVerify> {
        let createdAt = new Date();
        if (createdAt > expireAt) {
            throw new Error("Expire Date cannot be in the past");
        }
        return this.prisma.tokenVerify.create({
            data: {
                createdAt: new Date(),
                expireAt,
                email,
                reason
            }
        });
    }

    async remove(token: string): Promise<TokenVerify | undefined> {
        return this.prisma.tokenVerify.delete({
            where:
                { token }
        });
    }

    async isValid(token: string, reason: string): Promise<false | TokenVerify> {
        let record = await this.prisma.tokenVerify.findUnique({ where: { token } });
        if (!record) {
            return false;
        }
        if (record.reason !== reason) {
            return false;
        }
        if (record.expireAt < new Date()) {
            return false;
        }

        return record;
    }

    /**
     * Verify the token with provided reason, executes a success callback 
     *  and remove token from database (return true), othewise it return false.
     * @returns boolean
     */
    async verify({ token, execute, reason }: { token: string, execute: (record: TokenVerify) => Promise<void>, reason: string }): Promise<Boolean> {
        let record = await this.isValid(token, reason);
        if (record) {
            await execute(record);
            await this.remove(token);
            return true;
        }

        return false;
    }

}
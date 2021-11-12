import { PrismaClient } from ".prisma/client";
import MailService from "./MailService";
import type UserService from "./UserService";
import crypto from 'crypto'

export default class VerifyEmailService {

    constructor(
        private readonly prisma: PrismaClient,
        private readonly userService: UserService,
        private readonly mailService: MailService) { }

    async verify(token: string) {
        let record = await this.find(token);
        if (record) {
            await this.userService.update({ verified: true }, { email: record.email });
            await this.remove(token);
            return true;
        }

        return false;
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

    async notifyUser(email: string) {
        let record = await this.create(email);
        let info = await this.mailService.send({
            to: email,
            from: "samyouaret.me",
            subject: "Please confirm your email",
            text: "One step to start.",
            html: `<h2>please confirm your email ${record}<h2>`,
        });

        return info;
    }

}
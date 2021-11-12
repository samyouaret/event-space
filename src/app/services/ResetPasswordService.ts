import MailService from "./MailService";
import { PrismaClient } from ".prisma/client";
import UserService from "./UserService";
import crypto from 'crypto'

export default class ResetPasswordService {

    constructor(private readonly prisma: PrismaClient,
        private readonly userService: UserService,
        private readonly mailService: MailService) { }

    async reset(hash: string, password: string) {
        let record = await this.prisma.resetPassword.findUnique({
            where:
                { hash }
        });
        if (record) {
            await this.userService.updatePassword(record.email, password);
            await this.remove(hash);
            return true;
        }

        return false;
    }

    async create(email: string) {
        return this.prisma.resetPassword.create({
            data: {
                hash: crypto.randomBytes(50).toString("hex"),
                timestamp: new Date(),
                email
            }
        });
    }

    async remove(hash: string): Promise<any> {
        return this.prisma.resetPassword.delete({
            where:
                { hash }
        });
    }

    async notifyUser(email: string) {
        let record = await this.create(email)
        let info = await this.mailService.send({
            to: email,
            from: "samyouaret.me",
            subject: "Password reset Request",
            text: "follow the link to reset your password",
            html: `<h2>reset your password ${record.hash}<h2>`,
        });

        return info;
    }

}
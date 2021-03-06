import MailService from "./MailService";
import type UserService from "./UserService";
import TokenVerifyService from "./TokenVerifyService";

export default class VerifyEmailService {
    reason: string;

    constructor(
        private readonly tokenVerifyService: TokenVerifyService,
        private readonly userService: UserService,
        private readonly mailService: MailService) {
        this.reason = "email_verification";
    }

    async verify(token: string): Promise<Boolean> {
        return this.tokenVerifyService.verify({
            token,
            reason: this.reason,
            execute: async (record) => {
                await this.userService.update({ verified: true }, { email: record.email });
            }
        })
    }
    // not your responsibility
    async notifyUser(email: string): Promise<any> {
        let user = await this.userService.findByEmail(email);
        if (!user) {
            return;
        }
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let token = await this.tokenVerifyService.create(expireAt, email, this.reason);
        let info = await this.mailService.send({
            to: email,
            from: "samyouaret.me",
            subject: "Please confirm your email",
            text: "One step to start.",
            html: `<h2>please confirm your email ${token.token}<h2>`,
        });

        return { info, token };
    }

}
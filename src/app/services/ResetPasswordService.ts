import MailService from "./MailService";
import UserService from "./UserService";
import TokenVerifyService from "./TokenVerifyService";

export default class ResetPasswordService {
    reason: string;

    constructor(
        private readonly tokenVerifyService: TokenVerifyService,
        private readonly userService: UserService,
        private readonly mailService: MailService) {
        this.reason = "reset_password";
    }

    async reset(token: string, password: string) {
        return this.tokenVerifyService.verify({
            token,
            reason: this.reason,
            execute: async (record) => {
                await this.userService.updatePassword(record.email, password);
            }
        })
    }

    async notifyUser(email: string) {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let token = await this.tokenVerifyService.create(expireAt, email, this.reason);
        let info = await this.mailService.send({
            to: email,
            from: "samyouaret.me",
            subject: "Password reset Request",
            text: "follow the link to reset your password",
            html: `<h2>reset your password ${token.token}<h2>`,
        });

        return { info, token };
    }

}
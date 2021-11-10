import UserRepository from "../repositories/UserRepository";
import ResetPasswordRepository from "../repositories/ResetPasswordRepository";
import MailService from "./MailService";
import { hash } from '../../helpers/crypto'

export default class ResetPasswordService {

    constructor(
        private readonly resetPasswordRepository: ResetPasswordRepository,
        private readonly userRepository: UserRepository,
        private readonly mailService: MailService) { }

    async reset(token: string, password: string) {
        let record = await this.resetPasswordRepository.find(token);
        if (record) {
            password = await hash(password);
            await this.userRepository.update({ password }, { email: record.email });
            await this.resetPasswordRepository.remove(token);
            return true;
        }

        return false;
    }

    async notifyUser(email: string) {
        let record = await this.resetPasswordRepository.create(email)
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
import UserRepository from "../repositories/UserRepository";
import VerifyEmailRepository from "../repositories/VerifyEmailRepository";
import MailService from "./MailService";

export default class VerifyEmailService {

    constructor(
        private readonly verifyEmailRepository: VerifyEmailRepository,
        private readonly userRepository: UserRepository,
        private readonly mailService: MailService) { }

    async verify(token: string) {
        let record = await this.verifyEmailRepository.find(token);
        if (record) {
            await this.userRepository.update({ verified: true }, { email: record.email });
            await this.verifyEmailRepository.remove(token);
            return true;
        }

        return false;
    }

    async notifyUser(email: string) {
        let record = await this.verifyEmailRepository.create(email);
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
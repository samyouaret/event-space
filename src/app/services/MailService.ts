import { MailMessage } from "./contracts/MailServiceContract";

export interface MailSender {
    sendMail(msg: MailMessage): Promise<any>;
}

export default class MailService {
    constructor(private readonly sender: MailSender) { }

    async send(msg: MailMessage): Promise<any> {
        return this.sender.sendMail(msg);
    }
}
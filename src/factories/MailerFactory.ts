import nodemailer from 'nodemailer';
import { MailMessage } from '../app/services/contracts/MailServiceContract';

export async function createMailer() {
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
}

export async function createFakeMailer():Promise<any> {
    return {
        async sendMail(msg: MailMessage): Promise<any> {
            return {
                response: '250 Accepted',
                messageId: Math.floor(Math.random() * 100000),
            }
        }
    }
}
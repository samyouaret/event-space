import { getPrisma } from "./prisma";
import VerifyEmailService from "./services/VerifyEmailService";
import TokenVerifyService from "./services/TokenVerifyService";
import nodemailer from 'nodemailer';
import Application from "./Application";
import MailService from "./services/MailService";
import { UserService } from "./services/UserService";

export default async function singletons(app: Application) {
    const prisma = getPrisma();
    let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });
    let userService: UserService = new UserService(prisma);
    let mailService = new MailService(transporter);
    let tokenVerifyService = new TokenVerifyService(prisma);
    let verifyEmailService = new VerifyEmailService(tokenVerifyService, userService, mailService);

    return {
        prisma,
        mailService,
        verifyEmailService,
        userService,
    };
};
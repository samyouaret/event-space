import { getPrisma } from "./prisma";
import UserRepository from "./repositories/UserRepository";
import VerifyEmailService from "./services/VerifyEmailService";
import nodemailer from 'nodemailer';
import Application from "./Application";
import VerifyEmailRepository from "./repositories/VerifyEmailRepository";


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
    let mailService = new app.providers.MailService(transporter);
    let userRepository = new UserRepository(prisma);
    let verifyEmailRepository = new VerifyEmailRepository(prisma);
    let verifyEmailService = new VerifyEmailService(
        verifyEmailRepository,
        userRepository, mailService);

    return {
        prisma,
        mailService,
        verifyEmailService,
        userRepository,
        verifyEmailRepository,
    };
};
import { getPrisma } from "./prisma";
import VerifyEmailService from "./services/VerifyEmailService";
import TokenVerifyService from "./services/TokenVerifyService";
import Application from "./Application";
import MailService from "./services/MailService";
import { UserService } from "./services/UserService";
import { createMailer } from "../factories/MailterFactory";

export default async function singletons(app: Application) {
    const prisma = getPrisma();
    let transporter = await createMailer();
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
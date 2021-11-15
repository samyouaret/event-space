import ResetPasswordService from '../../app/services/ResetPasswordService';
import UserService from '../../app/services/UserService';
import { getPrisma } from '../../app/prisma';
import TokenVerifyService from '../../app/services/TokenVerifyService';
import faker from 'faker';
import { Prisma } from '.prisma/client';
import MailService, { MailSender } from '../../app/services/MailService';
import { createFakeMailer, createMailer } from '../../factories/MailerFactory';
import { generateFakeUser } from '../../helpers/fakers';
import { seedNewUser } from '../../helpers/test';

let prisma = getPrisma();
let userService = new UserService(prisma);
let mailer: MailSender;

beforeAll(async () => {
    await prisma.$connect();
    mailer = await createFakeMailer()
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Testing resetPassword Service', () => {

    it('should notify user with token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let newUser = await seedNewUser(userService);
        let tokenVerifyService = new TokenVerifyService(prisma);

        let mailService = new MailService(mailer);
        let resetPasswordService = new ResetPasswordService(
            tokenVerifyService,
            userService,
            mailService);

        let { info, token } = await resetPasswordService.notifyUser(newUser.email);
        expect(info).toHaveProperty('messageId');
        expect(info.response).toContain('250 Accepted');
        let validToken = await tokenVerifyService.isValid(token.token, resetPasswordService.reason);
        expect(validToken).toBeTruthy();
    });

    it('should reset password', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let newUser = await seedNewUser(userService);
        let tokenVerifyService = new TokenVerifyService(prisma);
        let reason = "reset_password";
        let newToken = await tokenVerifyService.create(expireAt, newUser.email, reason);
        let dummyMailService = {};
        let resetPasswordService = new ResetPasswordService(
            tokenVerifyService,
            userService,
            dummyMailService as any);
        let newPassword = faker.random.alphaNumeric();
        let UserBeforeReset = await userService.findByEmail(newUser.email);
        let reset = await resetPasswordService.reset(newToken.token, newPassword);
        expect(reset).toBeTruthy();
        let UserAfterReset = await userService.findByEmail(newUser.email);
        expect(UserBeforeReset.password).not.toEqual(UserAfterReset.password);
    });

});
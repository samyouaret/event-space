import ResetPasswordService from '../../app/services/ResetPasswordService';
import UserService from '../../app/services/UserService';
import { getPrisma } from '../../app/prisma';
import TokenVerifyService from '../../app/services/TokenVerifyService';
import faker from 'faker';
import { Prisma } from '.prisma/client';
import MailService, { MailSender } from '../../app/services/MailService';
import { createFakeMailer, createMailer } from '../../factories/MailerFactory';

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
        let email = faker.internet.email();
        let newUser: Prisma.UserCreateInput = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email,
            password: faker.random.alphaNumeric(),
            role: 0,
            verified: false,
        };
        await userService.create(newUser);
        let tokenVerifyService = new TokenVerifyService(prisma);

        let mailService = new MailService(mailer);
        let resetPasswordService = new ResetPasswordService(
            tokenVerifyService,
            userService,
            mailService);

        let { info, token } = await resetPasswordService.notifyUser(email);
        expect(info).toHaveProperty('messageId');
        expect(info.response).toContain('250 Accepted');
        let validToken = await tokenVerifyService.isValid(token.token, resetPasswordService.reason);
        expect(validToken).toBeTruthy();
    });

    it('should reset password', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let newUser: Prisma.UserCreateInput = {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email,
            password: faker.random.alphaNumeric(),
            role: 0,
            verified: false,
        };
        await userService.create(newUser);
        let tokenVerifyService = new TokenVerifyService(prisma);
        let reason = "reset_password";
        let newToken = await tokenVerifyService.create(expireAt, email, reason);
        let dummyMailService = {};
        let resetPasswordService = new ResetPasswordService(
            tokenVerifyService,
            userService,
            dummyMailService as any);
        let newPassword = faker.random.alphaNumeric();
        let UserBeforeReset = await userService.findByEmail(email);
        let reset = await resetPasswordService.reset(newToken.token, newPassword);
        expect(reset).toBeTruthy();
        let UserAfterReset = await userService.findByEmail(email);
        expect(UserBeforeReset.password).not.toEqual(UserAfterReset.password);
    });

});
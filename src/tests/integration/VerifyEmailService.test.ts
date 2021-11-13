import VerifyEmailService from '../../app/services/VerifyEmailService';
import UserService from '../../app/services/UserService';
import { getPrisma } from '../../app/prisma';
import TokenVerifyService from '../../app/services/TokenVerifyService';
import faker from 'faker';
import { Prisma } from '.prisma/client';

let prisma = getPrisma();
let userService = new UserService(prisma);

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$queryRaw`DELETE 
    FROM "TokenVerify"
    WHERE token IS NOT NULL;`;
    await prisma.$queryRaw`DELETE 
    FROM "User"
    WHERE id IS NOT NULL;`;

    await prisma.$disconnect();
});

describe('Testing VerifyEmail Service', () => {

    it('should verify user if token is valid', async () => {
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

        let newToken = await tokenVerifyService.create(expireAt, email);
        let dummyMailService = {};
        let verifyEmailService = new VerifyEmailService(
            tokenVerifyService,
            userService,
            dummyMailService as any);

        let verified = await verifyEmailService.verify(newToken.token);
        expect(verified).toBeTruthy();
        let verfiedUser = await userService.findByEmail(email);
        expect(verfiedUser.verified).toBeTruthy();
    });

});
import faker from 'faker';
import TokenVerifyService from '../../app/services/TokenVerifyService';
import { getPrisma } from '../../app/prisma';

let prisma = getPrisma();
beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

afterAll((done) => {
    prisma.$queryRaw`DELETE 
    FROM "TokenVerify" 
    WHERE token IS NOT NULL;`.then(() => {
        prisma.$disconnect().then(done);
    });
});


describe('Testing TokenVerifyService', () => {

    it('should generate new token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let tokenVerifyService = new TokenVerifyService(prisma);
        let token = await tokenVerifyService.create(expireAt, email);
        expect(token).toMatchObject(expect.objectContaining({
            email,
            expireAt,
        }));
    });

    it('check if a token is valid', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let tokenVerifyService = new TokenVerifyService(prisma);
        let token = await tokenVerifyService.create(expireAt, email);

        let isValid = await tokenVerifyService.isValid(token.token);
        expect(isValid).toEqual(token);

        expireAt = new Date();
        expireAt.setSeconds(expireAt.getSeconds() + 5);
        let token2 = await tokenVerifyService.create(expireAt, email);
        await new Promise(resolve => setTimeout(resolve, 6000));
        isValid = await tokenVerifyService.isValid(token2.token);
        expect(isValid).toBeFalsy();
    });

    it('sould delete a token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let tokenVerifyService = new TokenVerifyService(prisma);
        let token = await tokenVerifyService.create(expireAt, email);
        await tokenVerifyService.remove(token.token);
        let exists = await prisma.tokenVerify.findUnique({ where: { token: token.token } });
        expect(exists).toBeNull();
    });

});
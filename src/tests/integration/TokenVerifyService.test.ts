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
        let reason = "testing_purpose";
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let tokenVerifyService = new TokenVerifyService(prisma);
        let token = await tokenVerifyService.create(expireAt, email, reason);
        expect(token).toMatchObject(expect.objectContaining({
            email,
            expireAt,
        }));
    });

    it('check if a token is valid', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let reason = "testing_purpose";
        let tokenVerifyService = new TokenVerifyService(prisma);
        let token = await tokenVerifyService.create(expireAt, email, reason);

        let isValid = await tokenVerifyService.isValid(token.token, reason);
        expect(isValid).toEqual(token);

        expireAt = new Date();
        expireAt.setSeconds(expireAt.getSeconds() + 5);
        let token2 = await tokenVerifyService.create(expireAt, email, reason);
        await new Promise(resolve => setTimeout(resolve, 6000));
        isValid = await tokenVerifyService.isValid(token2.token, reason);
        expect(isValid).toBeFalsy();
        let unknown_reasonn = "another-reason";
        isValid = await tokenVerifyService.isValid(token.token, unknown_reasonn);
        expect(isValid).toBeFalsy();
    });

    it('sould delete a token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let email = faker.internet.email();
        let reason = "testing_purpose";
        let tokenVerifyService = new TokenVerifyService(prisma);
        let token = await tokenVerifyService.create(expireAt, email, reason);
        await tokenVerifyService.remove(token.token);
        let exists = await prisma.tokenVerify.findUnique({ where: { token: token.token } });
        expect(exists).toBeNull();
    });

});
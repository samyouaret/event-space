import { v4 as uuid } from 'uuid';
import faker from 'faker';
import VerifyEmailService from '../../../app/services/VerifyEmailService';

function generateFakeToken(AfterInMinutes: number) {
    let expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + AfterInMinutes);
    return {
        token: uuid(),
        createdAt: new Date(),
        email: faker.internet.email(),
        reason: "testing_purpose",
        expireAt,
    };
}

describe('Testing VerifyEmail Service', () => {

    it('should notify user with token', async () => {
        let newToken = generateFakeToken(30);
        let createMock = jest.fn().mockImplementation(() => { });
        createMock.mockResolvedValue(Promise.resolve(newToken));
        let tokenVerifyService = {
            create: createMock,
            remove: async function (token: string) {
                return true;
            },
        };
        let updateMock = jest.fn().mockImplementation(() => { });
        updateMock.mockResolvedValue(Promise.resolve(newToken));
        let userService = {
            update: updateMock,
            findByEmail: () => {
                return true;
            }
        };
        let dummyMailService = {
            send: jest.fn().mockImplementation(() => { }),
        };
        let verifyEmailService = new VerifyEmailService(
            tokenVerifyService as any,
            userService as any,
            dummyMailService as any);
        let email = faker.internet.email();
        await verifyEmailService.notifyUser(email);
        expect(createMock).toHaveBeenCalled();
        expect(dummyMailService.send).toHaveBeenCalled();
    });

    it('should verify user if token is valid', async () => {
        let newToken = generateFakeToken(30);
        let verifyMock = jest.fn().mockImplementation(() => { });
        verifyMock.mockResolvedValue(Promise.resolve(true));
        let tokenVerifyService = {
            verify: verifyMock
        };
        let updateMock = jest.fn().mockImplementation(() => { });
        updateMock.mockResolvedValue(Promise.resolve(newToken));
        let userService = {
            update: updateMock,
        };
        let dummyMailService = {};
        let verifyEmailService = new VerifyEmailService(
            tokenVerifyService as any,
            userService as any,
            dummyMailService as any);

        let verified = await verifyEmailService.verify(newToken.token);
        expect(verifyMock).toHaveBeenCalled();
        expect(verified).toBeTruthy();
    });

});
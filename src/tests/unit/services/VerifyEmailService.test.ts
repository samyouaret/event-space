import { v4 as uuid } from 'uuid';
import faker from 'faker';
import VerifyEmailService from '../../../app/services/VerifyEmailService';

describe('Testing VerifyEmail Service', () => {

    it('should notify user with token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let newToken: any = {
            token: uuid(),
            createdAt: new Date(),
            expireAt,
        };
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
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let newToken: any = {
            token: uuid(),
            createdAt: new Date(),
            expireAt,
        };
        let isValidMock = jest.fn().mockImplementation(() => { });
        isValidMock.mockResolvedValue(Promise.resolve(newToken));
        let tokenVerifyService = {
            isValid: isValidMock,
            remove: async function (token: string) {
                return true;
            },
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
        expect(isValidMock).toHaveBeenCalled();
        expect(verified).toBeTruthy();
    });

});
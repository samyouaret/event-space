import { v4 as uuid } from 'uuid';
import faker from 'faker';
import ResetPasswordService from '../../../app/services/ResetPasswordService';

describe('Testing resetPassword Service', () => {

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
        let resetPasswordService = new ResetPasswordService(
            tokenVerifyService as any,
            userService as any,
            dummyMailService as any);
        let email = faker.internet.email();
        await resetPasswordService.notifyUser(email);
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
        let verifyMock = jest.fn().mockImplementation(() => { });
        verifyMock.mockResolvedValue(Promise.resolve(true));
        let tokenVerifyService = {
            verify: verifyMock
        };
        let updateMock = jest.fn().mockImplementation(() => { });
        updateMock.mockResolvedValue(Promise.resolve(newToken));
        let userService = {
            updatePassword: updateMock,
        };
        let dummyMailService = {};
        let resetPasswordService = new ResetPasswordService(
            tokenVerifyService as any,
            userService as any,
            dummyMailService as any);
        let password = "somePass";
        let verified = await resetPasswordService.reset(newToken.token,password);
        expect(verifyMock).toHaveBeenCalled();
        expect(verified).toBeTruthy();
    });

});
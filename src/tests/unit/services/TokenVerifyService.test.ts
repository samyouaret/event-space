import TokenVerifyService from '../../../app/services/TokenVerifyService';
import { generateFakeToken } from '../../../helpers/fakers';

describe('Testing TokenVerifyService', () => {

    it('should generate new token', async () => {
        let newToken = generateFakeToken(30);
        let { email, expireAt } = newToken;
        let createMock = jest.fn().mockImplementation(() => { });
        createMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {
            tokenVerify: {
                create: createMock,
            }
        };

        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        let reason = "testing_purpose";
        let token = await tokenVerifyService.create(expireAt, email, reason);
        expect(createMock).toHaveBeenCalled();
        expect(token).toEqual(newToken);
    });

    it('should Allow only for a valid future expire date', async () => {
        let newToken = generateFakeToken(-30);
        let { email, expireAt } = newToken;
        let createMock = jest.fn().mockImplementation(() => { });
        createMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {
            tokenVerify: {
                create: createMock,
            }
        };

        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        expect.assertions(2);
        try {
            let reason = "testing_purpose";
            await tokenVerifyService.create(expireAt, email, reason);
        } catch (error) {
            expect((error as any).message).toContain('Expire Date cannot be in the past');
            expect(createMock).not.toHaveBeenCalled();
        }
    });

    it('check if a token is valid', async () => {
        let newToken = generateFakeToken(30);
        let { expireAt, token: tokenId } = newToken;
        let findMock = jest.fn().mockImplementation(() => { });
        findMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {
            tokenVerify: {
                findUnique: findMock,
            }
        };

        let reason = "testing_purpose";
        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        let isValid = await tokenVerifyService.isValid(tokenId, reason);
        expect(isValid).toEqual(newToken);
        expireAt.setMinutes(expireAt.getMinutes() - 90);
        isValid = await tokenVerifyService.isValid(tokenId, reason);
        expect(isValid).toBeFalsy();
        let unknown_reasonn = "another-reason";
        isValid = await tokenVerifyService.isValid(tokenId, unknown_reasonn);
        expect(isValid).toBeFalsy();
    });

    it('should delete a token', async () => {
        let newToken = generateFakeToken(30);
        let { token: tokenId } = newToken;
        let removeMock = jest.fn().mockImplementation(() => { });
        removeMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {
            tokenVerify: {
                delete: removeMock,
            }
        };

        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        let token = await tokenVerifyService.remove(tokenId);
        expect(removeMock).toHaveBeenCalled();
        expect(token).toEqual(newToken);
    });

    it('should verify token', async () => {
        let newToken = generateFakeToken(30);
        let { token: tokenId } = newToken;
        let isValidMock = jest.fn().mockImplementation(() => { });
        isValidMock.mockResolvedValue(Promise.resolve(newToken));
        let removeMock = jest.fn().mockImplementation(() => { });
        removeMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {};
        let reason = "testing_purpose";
        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        tokenVerifyService.remove = removeMock;
        tokenVerifyService.isValid = isValidMock
        let executeMock = jest.fn().mockImplementation(() => { });
        let verified = await tokenVerifyService.verify({
            token: tokenId,
            reason,
            execute: executeMock,
        });
        expect(isValidMock).toHaveBeenCalled();
        expect(executeMock).toHaveBeenCalled();
        expect(removeMock).toHaveBeenCalled();
        expect(verified).toBeTruthy();
    });

});
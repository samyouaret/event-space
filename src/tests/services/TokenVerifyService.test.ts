import faker from 'faker';
import { v4 as uuid } from 'uuid';
import TokenVerifyService from '../../app/services/TokenVerifyService';

describe('Testing TokenVerifyService', () => {

    it('should generate new token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let newToken: any = {
            token: uuid(),
            createdAt: new Date(),
            expireAt,
        };
        let createMock = jest.fn().mockImplementation(() => { });
        createMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {
            tokenVerify: {
                create: createMock,
            }
        };

        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        let token = await tokenVerifyService.create(expireAt);
        expect(createMock).toHaveBeenCalled();
        expect(token).toEqual(newToken);
    });

    it('should Allow only for a valid future expire date', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() - 30);
        let newToken: any = {
            token: uuid(),
            createdAt: new Date(),
            expireAt,
        };
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
            await tokenVerifyService.create(expireAt);
        } catch (error) {
            expect((error as any).message).toContain('Expire Date cannot be in the past');
            expect(createMock).not.toHaveBeenCalled();
        }
    });

    it('check if a token is valid', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let tokenId: string = uuid();
        let newToken: any = {
            token: tokenId,
            createdAt: new Date(),
            expireAt,
        };

        let findMock = jest.fn().mockImplementation(() => { });
        findMock.mockResolvedValue(Promise.resolve(newToken));
        let prismaMock = {
            tokenVerify: {
                findUnique: findMock,
            }
        };

        let tokenVerifyService = new TokenVerifyService(prismaMock as any);
        let isValid = await tokenVerifyService.isValid(tokenId);
        expect(isValid).toBeTruthy();

        expireAt.setMinutes(expireAt.getMinutes() - 90);
        isValid = await tokenVerifyService.isValid(tokenId);
        expect(isValid).toBeFalsy();
    });

    it('sould delete a token', async () => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let tokenId: string = uuid();
        let newToken: any = {
            token: tokenId,
            createdAt: new Date(),
            expireAt,
        };

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
    
});
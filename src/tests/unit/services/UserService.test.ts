import UserService from '../../../app/services/UserService';
import { User } from ".prisma/client";
import { generateFakeUser } from '../../../helpers/fakers';

let fakeUser: User = generateFakeUser();

it('should create a new a User', async () => {
    let findFirst = jest.fn().mockImplementation(() => { });
    findFirst.mockResolvedValue(Promise.resolve(undefined));
    let createMock = jest.fn().mockImplementation(() => { });
    createMock.mockResolvedValue(Promise.resolve(fakeUser));
    let prismaMock = {
        user: {
            findFirst: findFirst,
            create: createMock,
        }
    };

    let authService = new UserService(prismaMock as any);

    let user = await authService.create(fakeUser);

    expect(findFirst).toHaveBeenCalled();
    expect(createMock).toHaveReturnedWith(Promise.resolve(fakeUser));
    expect(findFirst).toHaveReturnedWith(Promise.resolve(undefined));
    expect(user).toBeDefined();
    expect(user).toEqual(fakeUser);

});

it('should fail to register if email is taken', async () => {
    let findFirst = jest.fn().mockImplementation(() => { });
    findFirst.mockResolvedValue(Promise.resolve(fakeUser));
    let prismaMock = {
        user: {
            findFirst: findFirst,
        }
    };

    let authService = new UserService(prismaMock as any);
    expect.assertions(2);
    try {
        await authService.create(fakeUser)
    } catch (error) {
        expect(findFirst).toHaveReturnedWith(Promise.resolve(undefined));
        expect((error as any).message).toEqual('User already exists');
    }
});
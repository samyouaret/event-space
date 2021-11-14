import faker from 'faker';
import UserService from '../../../app/services/UserService';
import { User } from ".prisma/client";
import { v4 as uuid } from 'uuid';

let fakeUser: User = {
    id: uuid(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.random.alphaNumeric(),
    role: 0,
    verified: false,
};

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
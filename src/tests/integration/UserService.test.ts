import faker from 'faker';
import UserService from '../../app/services/UserService';
import { Prisma } from ".prisma/client";
import { getPrisma } from '../../app/prisma';

let prisma = getPrisma();

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

it('should create a new a User', async () => {
    let email = faker.internet.email();
    let newUser: Prisma.UserCreateInput = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password: faker.random.alphaNumeric(),
        role: 0,
        verified: false,
    };

    let userService = new UserService(prisma);

    let user = await userService.create(newUser);
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.password).toBeUndefined();
});

it('should fail to register if email is taken', async () => {
    let email = faker.internet.email();
    let fakeUser: Prisma.UserCreateInput = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password: faker.random.alphaNumeric(),
        role: 0,
        verified: false,
    };
    let userService = new UserService(prisma);
    await userService.create(fakeUser);
    expect.assertions(1);
    try {
        await userService.create(fakeUser);
    } catch (error) {
        expect((error as any).message).toEqual('User already exists');
    }
});
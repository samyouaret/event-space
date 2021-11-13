import faker from 'faker';
import AuthService from '../../app/services/AuthService';
import UserService from '../../app/services/UserService';
import { getPrisma } from '../../app/prisma';
import { Prisma } from '.prisma/client';

let prisma = getPrisma();
let userService = new UserService(prisma);

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    // await prisma.$queryRaw`DELETE 
    // FROM "User"
    // WHERE id IS NULL;`;
    await prisma.$disconnect();
});

it('should authenticate a valid user', async () => {
    let email = faker.internet.email();
    let password = faker.random.alphaNumeric();
    let newUser: Prisma.UserCreateInput = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password,
        role: 0,
        verified: false,
    };

    let authService = new AuthService(userService);
    await userService.create(newUser);
    let token = await authService.authenticate(email, password);
    expect(token).toBeDefined();
    expect(token).toHaveProperty('token');

});

it('should fail authenticate a user with invalid password', async () => {
    let email = faker.internet.email();
    let password = faker.random.alphaNumeric();
    let newUser: Prisma.UserCreateInput = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password,
        role: 0,
        verified: false,
    };

    let authService = new AuthService(userService);
    await userService.create(newUser);
    let token = await authService.authenticate(email, faker.random.alphaNumeric());
    expect(token).toBeUndefined();
});

it('should fail authenticate unfound user', async () => {
    let email = faker.internet.email();
    let password = faker.random.alphaNumeric();
    let authService = new AuthService(userService);
    let token = await authService.authenticate(email, password);
    expect(token).toBeUndefined();
});
import faker from 'faker';
import AuthService from '../../app/services/AuthService';
import UserService from '../../app/services/UserService';
import { getPrisma } from '../../app/prisma';
import { Prisma } from '.prisma/client';
import { generateFakeUser } from '../../helpers/fakers';

let prisma = getPrisma();
let userService = new UserService(prisma);
let authService = new AuthService(userService);
beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

it('should authenticate a valid user', async () => {
    let password = faker.random.alphaNumeric();
    let newUser: Prisma.UserCreateInput = generateFakeUser({ password});
    await userService.create(newUser);
    let token = await authService.authenticate(newUser.email, password);
    expect(token).toBeDefined();
    expect(token).toHaveProperty('token');

});

it('should fail authenticate a user with invalid password', async () => {
    let newUser: Prisma.UserCreateInput = generateFakeUser();
    await userService.create(newUser);
    let token = await authService.authenticate(newUser.email, faker.random.alphaNumeric());
    expect(token).toBeUndefined();
});

it('should fail authenticate unfound user', async () => {
    let email = faker.internet.email();
    let password = faker.random.alphaNumeric();
    let token = await authService.authenticate(email, password);
    expect(token).toBeUndefined();
});
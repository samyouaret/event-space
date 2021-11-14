import faker from 'faker';
import AuthService from '../../../app/services/AuthService';
import { hash } from '../../../helpers/crypto';

async function getFakeUser(password?: string) {
    password = password || faker.random.alphaNumeric();
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: await hash(password),
    };
}

it('should authenticate a valid user', async () => {
    let findByEmailMock = jest.fn().mockImplementation(() => { });
    let password = faker.random.alphaNumeric();
    let fakeUser = await getFakeUser(password);
    findByEmailMock.mockResolvedValue(Promise.resolve(fakeUser));
    let userServiceMock: any = { findByEmail: findByEmailMock };
    let authService = new AuthService(userServiceMock);

    let { email } = fakeUser;
    let token = await authService.authenticate(email, password);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(fakeUser));
    expect(token).toBeDefined();
    expect(token).toHaveProperty('token');

});

it('should fail authenticate a user with invalid password', async () => {
    let fakeUser = await getFakeUser();
    let { email } = fakeUser;
    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve(fakeUser));
    let userServiceMock: any = { findByEmail: findByEmailMock };
    let authService = new AuthService(userServiceMock);
    let password = "some-other-pass";
    let token = await authService.authenticate(email, password);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(undefined));
    expect(token).toBeUndefined();
});

it('should fail authenticate unfound user', async () => {
    let email = faker.internet.email();

    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve());
    let userServiceMock: any = { findByEmail: findByEmailMock };
    let authService = new AuthService(userServiceMock);

    let password = faker.random.alphaNumeric();
    let token = await authService.authenticate(email, password);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(undefined));
    expect(token).toBeUndefined();
});
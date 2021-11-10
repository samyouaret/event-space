import faker from 'faker';
import AuthService from '../../app/services/AuthService';
import { hash } from '../../helpers/crypto';

it('should authenticate a valid user', async () => {
    let password = "Arfc1456_$1";
    let hashedPass = await hash(password);
    let email = faker.internet.email('farmer', 'birte');
    let fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password: hashedPass,
    };
    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve(fakeUser));
    let mockRepository: any = { findByEmail: findByEmailMock };
    let authService = new AuthService(mockRepository);

    let token = await authService.authenticate(email, password);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(fakeUser));
    expect(token).toBeDefined();
    expect(token).toHaveProperty('token');

});

it('should fail authenticate a user with invalid password', async () => {
    let password = "Arfc1456_$1";
    let hashedPass = await hash(password);
    let email = faker.internet.email('farmer', 'birte');
    let fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password: hashedPass,
    };
    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve(fakeUser));
    let mockRepository: any = { findByEmail: findByEmailMock };
    let authService = new AuthService(mockRepository);

    let token = await authService.authenticate(email, "some-other-pass");

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(undefined));
    expect(token).toBeUndefined();
});

it('should fail authenticate unfound user', async () => {
    let password = "Arfc1456_$1";
    let email = faker.internet.email('farmer', 'birte');

    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve());
    let mockRepository: any = { findByEmail: findByEmailMock };
    let authService = new AuthService(mockRepository);

    let token = await authService.authenticate(email, password);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(undefined));
    expect(token).toBeUndefined();
});
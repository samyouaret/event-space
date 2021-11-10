import faker from 'faker';
import RegisterService from '../../app/services/RegisterService';
import { User } from ".prisma/client";
import { hash } from '../../helpers/crypto';

it('should create a new a User', async () => {
    let password = "Arfc1456_$1";
    let hashedPass = await hash(password);
    let email = faker.internet.email('farmer', 'birte');
    let fakeUser: User = {
        id: Math.floor(Math.random() * 1000),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password:hashedPass,
        role: 1,
        verified: false,
    };
    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve(undefined));
    let saveUserMock = jest.fn().mockImplementation(() => { });
    saveUserMock.mockResolvedValue(Promise.resolve(fakeUser));
    let mockRepository: any = { findByEmail: findByEmailMock,save:saveUserMock };
    let authService = new RegisterService(mockRepository);

    let user = await authService.register(fakeUser);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(undefined));
    expect(saveUserMock).toHaveReturnedWith(Promise.resolve(fakeUser));
    expect(user).toBeDefined();
    expect(user).toEqual(fakeUser);

});

it('should fail to register if email is taken', async () => {
    let password = "Arfc1456_$1";
    let email = faker.internet.email('farmer', 'birte');
    let fakeUser: User = {
        id: Math.floor(Math.random() * 1000),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email,
        password,
        role: 1,
        verified: false,
    };
    let findByEmailMock = jest.fn().mockImplementation(() => { });
    findByEmailMock.mockResolvedValue(Promise.resolve(fakeUser));
    let mockRepository: any = { findByEmail: findByEmailMock };
    let authService = new RegisterService(mockRepository);

    let user = await authService.register(fakeUser);

    expect(findByEmailMock).toHaveBeenCalledWith(email);
    expect(findByEmailMock).toHaveReturnedWith(Promise.resolve(undefined));
    expect(user).toBeUndefined();

});
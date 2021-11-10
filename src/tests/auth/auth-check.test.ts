import request from 'supertest'
import Application from '../../app/Application';
import faker from 'faker';
import AuthCheck from "../../app/http/middlewares/api/auth-check";
import { Request, Response } from 'express'
import { createExpressApp } from '../../factories/ExpressFactory';
import RegisterService from '../../app/services/RegisterService';
import UserRepository from '../../app/repositories/UserRepository';

let app: Application;

let handlerMock: any;
const testUrl = '/test-secure-routes';

beforeAll(async () => {
    let expressApp = createExpressApp();
    app = new Application(expressApp);
    let handler = (req: Request, res: Response) => {
        res.status(200).end('Hello world');
    };
    handlerMock = jest.fn().mockImplementationOnce(handler);
    expressApp.on('beforeRoutesLoaded', () => {
        app.getApplicationGateWay().getServer()
            .get(testUrl, AuthCheck, handlerMock);
    });
    await app.init();
});

afterAll((done) => {
    app.getPrisma().$queryRaw`DELETE 
    FROM User 
    WHERE id > 0;`.then(() => {
        app.getPrisma().$disconnect().then(done);
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

it('should pass auth middlware with valid token', (done) => {
    let userRepository = new UserRepository(app.getPrisma());
    const fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: "Arfc1456_$1",
        role: 0
    }
    let registerService: RegisterService = new RegisterService(userRepository);
    registerService.register(fakeUser).then(user => {
        expect(user?.email).toBe(fakeUser.email);
        done();
    });
});

it('should fail to pass auth middlware with Invalid token', (done) => {
    request.agent(app.getApplicationGateWay().getServer())
        .get(testUrl)
        .set('Authorization', 'Bearer invalidBearer.invalidBearer.invalidBearer')
        .expect(403)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(handlerMock).not.toHaveBeenCalled();
            done();
        });

});

it('should fail to pass auth middlware with no token', (done) => {
    request.agent(app.getApplicationGateWay().getServer())
        .get(testUrl)
        .expect(401)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(handlerMock).not.toHaveBeenCalled();
            done();
        });

});

import request from 'supertest'
import Application from '../../../app/Application';
import faker from 'faker';
import { createExpressApp } from '../../../factories/ExpressFactory';
import TokenVerifyService from '../../../app/services/TokenVerifyService';
import { Prisma } from '.prisma/client';
import UserService from '../../../app/services/UserService';

const expressApp = createExpressApp();
const app = new Application(expressApp);
const GENEARTE_PASSWORD_URL = '/api/reset-password/generate';
const RESET_PASSWORD_URL = '/api/reset-password';
let tokenVerifyService: TokenVerifyService;
let userService: UserService;

async function createNewUser() {
    let newUser: Prisma.UserCreateInput = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.random.alphaNumeric(),
        role: 0,
        verified: false,
    };
    return userService.create(newUser)
}

beforeAll(async () => {
    await app.init();
    tokenVerifyService = new TokenVerifyService(app.getPrisma());
    userService = new UserService(app.getPrisma());
});


afterAll(async () => {
    await app.getPrisma().$disconnect();
});

describe('Reset Password Routes', () => {
    it('should generate a new password reset token', (done) => {
        createNewUser().then(user => {
            let payload = { email: user.email };
            request.agent(app.getApplicationGateWay().getServer())
                .post(GENEARTE_PASSWORD_URL)
                .set('Content-Type', 'application/json')
                .send(payload)
                .expect(201)
                .end(function (err, res) {
                    expect(err).toBeNull();
                    expect(res.body).toBeDefined();
                    expect(res.body.message).toBe('Request sent to user email.');
                    app.prisma.tokenVerify.findFirst({
                        where: payload
                    }).then((token) => {
                        expect(token).toBeDefined();
                        done();
                    });
                });
        });
    });

    it('should reset a password with valid token', (done) => {
        let password = "Arfc1456_$1";
        let confirmPassword = password;
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let reason = "reset_password";
        createNewUser().then(user => {
            tokenVerifyService.create(expireAt, user.email, reason).then((newToken) => {
                let url = `${RESET_PASSWORD_URL}/${newToken.token}`;
                console.log(url);
                request.agent(app.getApplicationGateWay().getServer())
                    .put(url)
                    .set('Content-Type', 'application/json')
                    .send({ password, confirmPassword })
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).toBeNull();
                        expect(res.body).toBeDefined();
                        expect(res.body.message).toBe('Password reset successfully');
                        app.prisma.tokenVerify.findFirst({
                            where: { token: newToken.token }
                        }).then((token) => {
                            expect(token).toBeNull();
                            done();
                        });
                    });
            });
        });
    });

    it('should fail reset a password with unmatched confirmation password', (done) => {
        let password = "Arfc1456_$1";
        let confirmPassword = "Some-Other-Passowrd";
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let reason = "reset_password";
        createNewUser().then(user => {
            tokenVerifyService.create(expireAt, user.email, reason).then((newToken) => {
                let url = `${RESET_PASSWORD_URL}/${newToken.token}`;
                console.log(url);
                request.agent(app.getApplicationGateWay().getServer())
                    .put(url)
                    .set('Content-Type', 'application/json')
                    .send({ password, confirmPassword })
                    .expect(422)
                    .end(function (err, res) {
                        expect(err).toBeNull();
                        expect(res.body.error).toBe('Password confirmation does not match password');
                        done();
                    });
            });
        });
    });
});
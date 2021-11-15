import request from 'supertest'
import Application from '../../../app/Application';
import { createExpressApp } from '../../../factories/ExpressFactory';
import TokenVerifyService from '../../../app/services/TokenVerifyService';
import UserService from '../../../app/services/UserService';
import { seedNewUser } from '../../../helpers/test';

const expressApp = createExpressApp();
const app = new Application(expressApp);
const GENEARTE_PASSWORD_URL = '/api/reset-password/generate';
const RESET_PASSWORD_URL = '/api/reset-password';
let tokenVerifyService: TokenVerifyService;
let userService: UserService;

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
        seedNewUser(userService).then(user => {
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
        seedNewUser(userService).then(user => {
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
        seedNewUser(userService).then(user => {
            tokenVerifyService.create(expireAt, user.email, reason).then((newToken) => {
                let url = `${RESET_PASSWORD_URL}/${newToken.token}`;
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
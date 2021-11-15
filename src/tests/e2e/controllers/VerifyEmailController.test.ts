import request from 'supertest'
import Application from '../../../app/Application';
import { createExpressApp } from '../../../factories/ExpressFactory';
import TokenVerifyService from '../../../app/services/TokenVerifyService';
import UserService from '../../../app/services/UserService';
import { seedNewUser } from '../../../helpers/test';

const expressApp = createExpressApp();
const app = new Application(expressApp);

const VERIFY_EMAIL_URL = '/api/verify-email';
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

describe('Verify Email Routes', () => {
    it('should generate a new email verification token', (done) => {
        seedNewUser(userService).then(user => {
            let payload = { email: user.email };
            request.agent(app.getApplicationGateWay().getServer())
                .post(VERIFY_EMAIL_URL)
                .set('Content-Type', 'application/json')
                .send(payload)
                .expect(201)
                .end(function (err, res) {
                    expect(err).toBeNull();
                    expect(res.body).toBeDefined();
                    expect(res.body.message).toBe('Request sent to user email.');
                    done();
                    app.prisma.tokenVerify.findFirst({
                        where: payload
                    }).then((token) => {
                        expect(token).toBeDefined();
                        done();
                    })
                });
        });
    });

    it('should validate email before send a reset token', (done) => {
        let email = "invalid@email";
        request.agent(app.getApplicationGateWay().getServer())
            .post(VERIFY_EMAIL_URL)
            .set('Content-Type', 'application/json')
            .send({ email })
            .expect(422)
            .end(function (err, res) {
                expect(err).toBeNull();
                expect(res.body.errors.email).toBeDefined();
                done();
            });
    });

    it('should verify an email with valid token', (done) => {
        let expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + 30);
        let reason = "email_verification";
        seedNewUser(userService).then(user => {
            tokenVerifyService.create(expireAt, user.email, reason).then((newToken) => {
                let url = `${VERIFY_EMAIL_URL}/${newToken.token}`;
                request.agent(app.getApplicationGateWay().getServer())
                    .put(url)
                    .set('Content-Type', 'application/json')
                    .send({ email: user.email })
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).toBeNull();
                        expect(res.body).toBeDefined();
                        expect(res.body.message).toBe('Email verified sucessfully');
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

});
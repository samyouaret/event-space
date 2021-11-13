import request from 'supertest'
import Application from '../../../../app/Application';
import faker from 'faker';
import { createExpressApp } from '../../../../factories/ExpressFactory';

const expressApp = createExpressApp();
const app = new Application(expressApp);
beforeAll(async () => {
    await app.init();
});


afterAll(async () => {
    await app.getPrisma().$disconnect();
});

it('should signup a new user', (done) => {
    const fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: "Arfc1456_$1"
    }
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(fakeUser)
        .expect(201)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('email');
            expect(res.body).not.toHaveProperty('password');
            app.prisma.user.findFirst({
                where: { email: fakeUser.email }
            }).then((user) => {
                expect(user).toBeDefined();
                done();
            });
        });
});

it('should fail signup with empty fields', (done) => {
    const user = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    };
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(user)
        .expect(422)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(Object.keys(res.body.errors).sort())
                .toEqual(Object.keys(user).sort());
            app.prisma.user.findFirst({
                where: { email: user.email }
            }).then((user) => {
                expect(user).toBeDefined();
                done();
            });
        });
});

it('should fail signup with invalid email', (done) => {
    const user = {
        email: 'invalidemail@mail',
        password: "Arfc1456_$1",
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
    }
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(user)
        .expect(422)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(Object.keys(res.body.errors))
                .toHaveLength(1);
            expect(res.body.errors.email.length)
                .toBeGreaterThan(0);
            app.prisma.user.findFirst({
                where: { email: user.email }
            }).then((user) => {
                expect(user).toBeDefined();
                done();
            });
        });
});

it('should fail signup with short password', (done) => {
    const user = {
        email: faker.internet.email(),
        password: "Fke633$",
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
    }
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(user)
        .expect(422)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(Object.keys(res.body.errors))
                .toHaveLength(1);
            expect(res.body.errors.password.length)
                .toBeGreaterThan(0);
            app.prisma.user.findFirst({
                where: { email: user.email }
            }).then((user) => {
                expect(user).toBeDefined();
                done();
            });
        });
});

it('should fail signup with weak password', (done) => {
    const user = {
        email: faker.internet.email(),
        password: "Far13252d",
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
    }
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send(user)
        .expect(422)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(Object.keys(res.body.errors))
                .toHaveLength(1);
            expect(res.body.errors.password.length)
                .toBeGreaterThan(0);
            app.prisma.user.findFirst({
                where: { email: user.email }
            }).then((user) => {
                expect(user).toBeDefined();
                done();
            });
        });
});

it('should fail login with invalid credentials', (done) => {
    const fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: "Arf1756_$1"
    }
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(fakeUser)
        .expect(401)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(res.body.error).toBeDefined();
            done();
        });
});
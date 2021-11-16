import request from 'supertest'
import Application from '../../../app/Application';
import { createExpressApp } from '../../../factories/ExpressFactory';
import UserService from '../../../app/services/UserService';
import { seedNewUser } from '../../../helpers/test';
import { generateFakeEvent } from '../../../helpers/fakers';
import faker from 'faker';

const expressApp = createExpressApp();
const app = new Application(expressApp);

const EVENT_URL = '/api/events';
let userService: UserService;

beforeAll(async () => {
    await app.init();
    userService = new UserService(app.getPrisma());
});


afterAll(async () => {
    await app.getPrisma().$disconnect();
});

describe('Event api routes', () => {
    it('should create a new event', (done) => {
        seedNewUser(userService).then(user => {
            let payload = generateFakeEvent(user);
            request.agent(app.getApplicationGateWay().getServer())
                .post(EVENT_URL)
                .set('Content-Type', 'application/json')
                .send(payload)
                .expect(201)
                .end(function (err, res) {
                    expect(err).toBeNull();
                    expect(res.body).toBeDefined();
                    app.prisma.event.findFirst({
                        where: { id: res.body.id }
                    }).then((event) => {
                        expect(event).not.toBeNull();
                        done();
                    })
                });
        });
    });

    it('should update an event', (done) => {
        let partialEvent = {
            image: faker.image.imageUrl(),
            summary: faker.lorem.paragraphs(),
            description: faker.lorem.sentence(),
        }
        seedNewUser(userService).then(user => {
            let payload = generateFakeEvent(user);
            app.prisma.event.create({ data: payload }).then(event => {
                request.agent(app.getApplicationGateWay().getServer())
                    .put(`${EVENT_URL}/${event.id}`)
                    .set('Content-Type', 'application/json')
                    .send(partialEvent)
                    .expect(200)
                    .end(function (err, res) {
                        expect(err).toBeNull();
                        expect(res.body).toBeDefined();
                        app.prisma.event.findFirst({
                            where: { id: event.id }
                        }).then((event) => {
                            expect(event?.image).toEqual(partialEvent.image);
                            done();
                        })
                    });
            })
        });
    });

    it('should remove an event', (done) => {
        seedNewUser(userService).then(user => {
            let payload = generateFakeEvent(user);
            app.prisma.event.create({ data: payload }).then(event => {
                request.agent(app.getApplicationGateWay().getServer())
                    .delete(`${EVENT_URL}/${event.id}`)
                    .expect(204)
                    .end(function (err, res) {
                        expect(err).toBeNull();
                        app.prisma.event.findFirst({
                            where: { id: event.id }
                        }).then((event) => {
                            expect(event).toBeNull();
                            done();
                        })
                    });
            })
        });
    });
});
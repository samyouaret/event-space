import request from 'supertest'
import Application from '../../../app/Application';
import { createExpressApp } from '../../../factories/ExpressFactory';
import UserService from '../../../app/services/UserService';
import { seedNewUser } from '../../../helpers/test';
import { generateFakeEvent, seedEvents } from '../../../helpers/fakers';
import faker from 'faker';
import EventService from '../../../app/services/EventService';
import { v4 as uuid } from 'uuid';
import { root_path } from '../../../helpers/pathHelper';
import { Awsconfig } from '../../../config/storage';
import AWS from 'aws-sdk';

const expressApp = createExpressApp();
const app = new Application(expressApp);

const EVENT_URL = '/api/events';
let userService: UserService;
let eventService: EventService;

const SEED_EVENT_COUNT = 10;
AWS.config.update(Awsconfig);
let s3: AWS.S3 = new AWS.S3();
let user: any;
beforeAll(async () => {
    await app.init();
    userService = new UserService(app.getPrisma());
    eventService = new EventService(app.getPrisma());
    user = await seedNewUser(userService);
    await seedEvents(eventService, userService, SEED_EVENT_COUNT);
});


afterAll(async () => {
    await app.getPrisma().$disconnect();
});

describe('Event api routes', () => {
    test('should create a new event', (done) => {
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

    test('should get bad request when create an event with bad fields', (done) => {
        let payload = generateFakeEvent(user);
        (payload as any).foobar = "foobar";
        request.agent(app.getApplicationGateWay().getServer())
            .post(EVENT_URL)
            .set('Content-Type', 'application/json')
            .send(payload)
            .expect(400)
            .end(function (err, res) {
                expect(err).toBeNull();
                expect(res.body.message).toBe('Cannot create event');
                done();
            });
    });

    test('should get and event by id', (done) => {
        let newEvent = generateFakeEvent(user);
        eventService.create(newEvent).then(event => {
            request.agent(app.getApplicationGateWay().getServer())
                .get(`${EVENT_URL}/${event.id}`)
                .expect(200)
                .end(function (err, res) {
                    expect(err).toBeNull();
                    expect(res.body).toBeTruthy();
                    done();
                });
        });
    });

    test('should fail to get unexistent event by id', (done) => {
        let id = uuid();
        request.agent(app.getApplicationGateWay().getServer())
            .get(`${EVENT_URL}/${id}`)
            .expect(404)
            .end(function (err, res) {
                expect(err).toBeNull();
                done();
            });
    });

    test('should get many events', (done) => {
        let take = 3;
        request.agent(app.getApplicationGateWay().getServer())
            .get(`${EVENT_URL}`)
            .query({ take })
            .set('content-type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                expect(err).toBeNull();
                expect(res.body.value).toBeDefined();
                expect(res.body.total).toBeGreaterThanOrEqual(SEED_EVENT_COUNT);
                expect(res.body.nextPage).not.toBeNull();
                expect(res.body.value).toHaveLength(take);
                expect(res.body.previousPage).toBeNull();
                done();
            });
    });

    test('should get many events by page', (done) => {
        let take = 3;
        let page = 2;
        request.agent(app.getApplicationGateWay().getServer())
            .get(`${EVENT_URL}`)
            .query({ take, page })
            .set('content-type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                expect(err).toBeNull();
                expect(res.body.value).toBeDefined();
                expect(res.body.total).toBeGreaterThanOrEqual(SEED_EVENT_COUNT);
                expect(res.body.nextPage).not.toBeNull();
                expect(res.body.value).toHaveLength(take);
                expect(res.body.page).toBe(page);
                expect(res.body.previousPage).toBe(page - 1);
                expect(res.body.nextPage).toBe(page + 1);
                expect(res.body.previousPage).not.toBeNull();
                done();
            });
    });


    test('should update an event', (done) => {
        let partialEvent = {
            summary: faker.lorem.paragraphs(),
            description: faker.lorem.sentence(),
            price: faker.datatype.float()
        }
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
                        expect(event?.price).toEqual(partialEvent.price);
                        done();
                    })
                });
        })
    });

    test('should upload image to an event', (done) => {
        let payload = generateFakeEvent(user);
        app.prisma.event.create({ data: payload }).then(event => {
            request.agent(app.getApplicationGateWay().getServer())
                .patch(`${EVENT_URL}/${event.id}/upload-image`)
                .attach('image', root_path('src/tests/files/image_test.jpg'))
                .expect(200)
                .end(function (err, res) {
                    expect(err).toBeNull();
                    expect(res.body).toBeDefined();
                    app.prisma.event.findFirst({
                        where: { id: event.id }
                    }).then((event) => {
                        expect(event?.image).not.toBeNull();
                        let Key = event?.image?.split('/').pop() as string;
                        s3.headObject({
                            Bucket: Awsconfig.bucket_name,
                            Key,
                        }).promise().then(() => {
                            done()
                        });
                    })
                });
        })
    });
});

test('should remove an event', (done) => {
    let payload = generateFakeEvent(user);
    app.prisma.event.create({ data: payload }).then(event => {
        request.agent(app.getApplicationGateWay().getServer())
            .delete(`${EVENT_URL}/${event.id}`)
            .expect(204)
            .end(function (err) {
                expect(err).toBeNull();
                app.prisma.event.findFirst({
                    where: { id: event.id }
                }).then((event) => {
                    expect(event).toBeNull();
                    done();
                })
            });
    });
});
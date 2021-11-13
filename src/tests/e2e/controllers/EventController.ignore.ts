import request from 'supertest'
import Application from '../../../app/Application';
import faker from 'faker';
import { createExpressApp } from '../../../factories/ExpressFactory';
import type { Prisma } from ".prisma/client";
import EventService from '../../../app/services/EventService';
import UserService from '../../../app/services/UserService';

const expressApp = createExpressApp();
const app = new Application(expressApp);
let user: any = {};
beforeAll(async () => {
    const fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: "Arfc1456_$1",
        role: 0
    }
    let userService: UserService = new UserService(app.getPrisma());
    let user: any = await userService.create(fakeUser);
    await app.init();
});


afterAll(async () => {
    await app.getPrisma().$disconnect();
});

it('should create a new event', async (done) => {
    const fakeUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: "Arfc1456_$1",
        role: 0
    }
    let eventService: EventService = new EventService(app.getPrisma());
    let fakeEvent: Prisma.EventCreateInput = {
        createdAt: new Date(),
        startDate: new Date(),
        endDate: faker.date.future(),
        location: faker.address.country(),
        timezone: faker.address.timeZone(),
        title: faker.datatype.string(30),
        organizer: "samy",
        type: "somtype",
        User: user,
        
    };
    let newEvent: any = await eventService.create(fakeEvent);
    request.agent(app.getApplicationGateWay().getServer())
        .post('/api/events')
        .set('Content-Type', 'application/json')
        .send(fakeEvent)
        .expect(201)
        .end(function (err, res) {
            expect(err).toBeNull();
            expect(res.body).toBeDefined();
            expect(res.body).toHaveProperty('id');
            app.prisma.event.findFirst({
                where: { id: res.body.id }
            }).then((event) => {
                expect(event).toBeDefined();
                done();
            });
        });
});
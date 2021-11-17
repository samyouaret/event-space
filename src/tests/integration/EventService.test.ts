import faker from "faker";
import { v4 as uuid } from "uuid";
import { getPrisma } from "../../app/prisma";
import EventService from "../../app/services/EventService";
import UserService from "../../app/services/UserService";
import { generateFakeEvent } from "../../helpers/fakers";
import { seedNewUser } from "../../helpers/test";

let prisma = getPrisma();
let userService = new UserService(prisma);

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

afterEach(async () => {
    await prisma.event.deleteMany();
});

test('should create new event', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    expect(createdEvent).toBeDefined();
    expect(createdEvent.userId).toEqual(user.id);
});

test('should fail create an event with invalid fields', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    (fakeEvent as any).foobar = "foobar";
    expect.assertions(1);
    try {
        await eventService.create(fakeEvent);
    } catch (err) {
        expect((err as Error).message).toBe('Cannot create event');
    }
});


test('should update an event', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let partialEvent = {
        image: faker.image.imageUrl(),
        summary: faker.lorem.paragraphs(),
        description: faker.lorem.sentence()
    }
    let updatedEvent = await eventService.update(createdEvent.id, partialEvent)
    expect(updatedEvent).toMatchObject(expect.objectContaining(partialEvent));
});

test('should find event by id', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let event = await eventService.findById(createdEvent.id);
    expect(createdEvent).toEqual(event);
});

test('should find events by user Id', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let events = await eventService.findByUserId(user.id);
    expect(events).toContainEqual(createdEvent);
});

test('should filter events', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let timezone = faker.address.timeZone();
    let location = faker.address.country();
    let newEvent = generateFakeEvent(user);
    newEvent.timezone = timezone;
    newEvent.location = location;
    await eventService.create(newEvent);
    newEvent.id = uuid();
    await eventService.create(newEvent);
    let events = await eventService.find({ params: { location, timezone } as any });
    expect(events).toHaveLength(2);
    expect(events).not.toContainEqual([createdEvent]);
});

test('should filter events', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let timezone = faker.address.timeZone();
    let location = faker.address.country();
    let newEvent = generateFakeEvent(user);
    newEvent.timezone = timezone;
    newEvent.location = location;
    await eventService.create(newEvent);
    newEvent.id = uuid();
    await eventService.create(newEvent);
    let events = await eventService.find({ params: { location, timezone } as any });
    expect(events).toHaveLength(2);
    expect(events).not.toContainEqual([createdEvent]);
});

test('should fail filter events with invalid fields', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    await eventService.create(generateFakeEvent(user));
    await eventService.create(generateFakeEvent(user));
    let events = await eventService.find({ params: { invalid: "invalid" } as any });
    expect(events).toHaveLength(0);
});

test('should take only N events', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    await eventService.create(generateFakeEvent(user));
    await eventService.create(generateFakeEvent(user));
    await eventService.create(generateFakeEvent(user));
    let take = 2;
    let events = await eventService.find({ params: {}, filters: { take } });
    expect(events).toHaveLength(take);
});

test('should get correct count of events', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    await eventService.create(generateFakeEvent(user));
    await eventService.create(generateFakeEvent(user));
    await eventService.create(generateFakeEvent(user));
    let count = await eventService.count();
    expect(count).toEqual(3);
});

test('should fail get count of events with invalid fields', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    await eventService.create(generateFakeEvent(user));
    await eventService.create(generateFakeEvent(user));
    let events = await eventService.count({ invalid: "invalid" } as any);
    expect(events).toHaveLength(0);
});

test('should remove an event', async () => {
    let eventService: EventService = new EventService(prisma);
    let user = await seedNewUser(userService);
    let fakeEvent = generateFakeEvent(user);
    let createdEvent = await eventService.create(fakeEvent);
    let DeletedEvent = await eventService.remove(createdEvent.id);
    let event = await eventService.findById(createdEvent.id);
    expect(event).toBeNull();
    expect(createdEvent).toEqual(DeletedEvent);
});
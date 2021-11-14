import faker from "faker";
import { v4 } from "uuid";
import EventService from "../../../app/services/EventService";

test('can create new event', async () => {
    let fakeEvent = {
        createdAt: new Date(),
        startDate: new Date(),
        endDate: faker.date.future(),
        location: faker.address.country(),
        id: v4(),
        timezone: "US/NY",
        title: faker.datatype.string(30),
        organizer:"sam",
        type:"somtype",
    };
    let saveMock = jest.fn().mockImplementation(() => { });
    saveMock.mockResolvedValue(Promise.resolve(fakeEvent));
    let mockRepo: any = { save: saveMock };
    let eventService: EventService = new EventService(mockRepo);
    let createdEvent = await eventService.create(fakeEvent as any);
    expect(createdEvent).toBeDefined();
    expect(createdEvent).toHaveProperty('id');
});
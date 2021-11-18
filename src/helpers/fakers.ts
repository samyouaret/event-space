import type { User } from ".prisma/client";
import faker from "faker";
import { v4 as uuid } from "uuid";
import type EventService from "../app/services/EventService";
import type UserService from "../app/services/UserService";
import { seedNewUser } from "./test";

export const generateFakeUser = (OverrideUser?: any): User => {
    return {
        id: uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.random.alphaNumeric(),
        role: 0,
        verified: false,
        ...OverrideUser
    };
}

export const generateFakeToken = (AfterInMinutes: number) => {
    let expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + AfterInMinutes);
    return {
        token: uuid(),
        createdAt: new Date(),
        email: faker.internet.email(),
        reason: "testing_purpose",
        expireAt,
    };
}

export const generateFakeEvent = (user: any) => {
    let seats = faker.datatype.number({ min: 30 });
    let startSale = faker.date.future();
    let endSale = new Date(startSale);
    endSale.setDate(endSale.getDate() + 30);
    let takenSeats = 0;
    return {
        createdAt: new Date(),
        startDate: new Date(),
        endDate: faker.date.future(),
        location: faker.address.country(),
        id: uuid(),
        userId: user.id,
        price: faker.datatype.float(2),
        seats,
        takenSeats,
        startSale: faker.date.future(),
        endSale: faker.date.future(),
        timezone: faker.address.timeZone(),
        title: faker.datatype.string(30),
        organizer: faker.name.findName(),
        type: faker.random.alpha({ count: 10 }),
    };
}

export const seedEvents = async (eventService: EventService, userService: UserService, n: number = 20) => {
    let user = await seedNewUser(userService);
    for (let i = 0; i < n; i++) {
        let event = generateFakeEvent(user);
        await eventService.create(event);
    }
    return user;
}
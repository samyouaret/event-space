import type { User } from ".prisma/client";
import faker from "faker";
import { v4 as uuid } from "uuid";

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
    return {
        createdAt: new Date(),
        startDate: new Date(),
        endDate: faker.date.future(),
        location: faker.address.country(),
        id: uuid(),
        userId: user.id,
        timezone: faker.address.timeZone(),
        title: faker.datatype.string(30),
        organizer: faker.name.findName(),
        type: faker.random.alpha({ count: 10 }),
    };
}
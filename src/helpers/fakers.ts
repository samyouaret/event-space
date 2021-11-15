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
import type { Prisma } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import faker from "faker";
import type UserService from "../app/services/UserService";

export const actAs = (user: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        (req as any).user = user;
        next()
    };
}

export const seedNewUser = async (userService: UserService) => {
    let newUser: Prisma.UserCreateInput = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.random.alphaNumeric(),
        role: 0,
        verified: false,
    };
    return userService.create(newUser)
}
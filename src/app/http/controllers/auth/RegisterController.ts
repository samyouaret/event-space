import type { Prisma } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import { UserService, UserNoPassword } from "../../../services/UserService";
import VerifyEmailService from "../../../services/VerifyEmailService";

export default class RegisterController {

    constructor(
        private readonly userService: UserService,
        private readonly verifyEmailservice: VerifyEmailService,
    ) { }

    async register(request: Request, response: Response, next: NextFunction) {
        let user: Prisma.UserCreateInput = {
            email: request.body.email,
            password: request.body.password,
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            role: 0,
        };

        try {
            let registred_user: UserNoPassword = await this.userService.create(user);
            // TODO log email info
            let info = await this.verifyEmailservice.notifyUser(registred_user.email);
            return response.status(201).json(registred_user);
        } catch (error) {
            return response.status(403).json({ error: (error as any).message })
        }

    }

}
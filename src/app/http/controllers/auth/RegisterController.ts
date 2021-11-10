import { User } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import { RegisterService, UserNoPassword } from "../../../services/RegisterService";
import VerifyEmailService from "../../../services/VerifyEmailService";

interface CreateUserDto {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
}

export default class RegisterController {

    constructor(
        private readonly registerService: RegisterService,
        private readonly verifyEmailservice: VerifyEmailService,
    ) { }

    async register(request: Request, response: Response, next: NextFunction) {
        let user: CreateUserDto = {
            email: request.body.email,
            password: request.body.password,
            firstName: request.body.firstName,
            lastName: request.body.lastName
        };
        let registred_user: UserNoPassword | undefined = await this.registerService.register(user);
        if (registred_user) {
            let info = await this.verifyEmailservice.notifyUser(registred_user.email);
            return response.status(201).json(registred_user);
        }

        return response.status(403).json({ error: "Email already taken" })
    }

}
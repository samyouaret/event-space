import { NextFunction, Request, Response } from "express";
import { AuthService, Token } from "../../../services/AuthService";

export default class AuthController {

    constructor(private readonly authService: AuthService) { }

    async login(request: Request, response: Response, next: NextFunction) {
        let token: Token | undefined =
            await this.authService.authenticate(request.body.email, request.body.password);
        if (token) {
            return response.status(200).json(token);
        }
        return response.status(401).json({ error: "Invalid credentials provided" });
    }

}
import { Event } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import { EventService } from "../../services/EventService";

export default class AuthController {

    constructor(private readonly eventService: EventService) { }

    async login(request: Request, response: Response, next: NextFunction) {
        let event: Event | undefined =
            await this.eventService.create(request.body);
        if (event) {
            return response.status(201).json(event);
        }
        return response.status(401).json();
    }

}
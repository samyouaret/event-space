import { Event } from ".prisma/client";
import { Request, Response } from "express";
import { EventService } from "../../services/EventService";

export default class AuthController {

    constructor(private readonly eventService: EventService) { }

    async create(request: Request, response: Response) {
        try {
            let event: Event | undefined =
                await this.eventService.create(request.body);
            if (event) {
                return response.status(201).json(event);
            }
            return response.status(401).json();
        } catch (err) {
            return response.status(401).json({ message: (err as Error).message });
        }
    }

    async update(request: Request, response: Response) {
        let event: Event | undefined =
            await this.eventService.update(request.params.id, request.body);
        if (event) {
            return response.status(200).json(event);
        }
        return response.status(400).json();
    }

    async remove(request: Request, response: Response) {
        let event: Event | undefined =
            await this.eventService.remove(request.params.id);
        if (event) {
            return response.status(204).json(event);
        }
        return response.status(204).json();
    }

}
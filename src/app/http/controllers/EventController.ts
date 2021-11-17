import { Event } from ".prisma/client";
import type { S3 } from "aws-sdk";
import { Request, Response } from "express";
import { Awsconfig } from "../../../config/storage";
import { EventService } from "../../services/EventService";

export default class EventController {

    constructor(private readonly eventService: EventService,
        private readonly s3: S3) { }

    async create(request: Request, response: Response) {
        try {
            let event: Event | undefined =
                await this.eventService.create(request.body);
            if (event) {
                return response.status(201).json(event);
            }
            return response.sendStatus(401);
        } catch (err) {
            return response.status(400).json({ message: (err as Error).message });
        }
    }

    async update(request: Request, response: Response) {
        delete request.body.image;
        let event: Event | undefined =
            await this.eventService.update(request.params.id, request.body);
        if (event) {
            return response.status(200).json(event);
        }
        return response.sendStatus(400);
    }

    async uploadImage(request: Request, response: Response) {
        let filename = (request.file as any).location;
        await this.deleteImageFromS3(request.params.id);
        let event: Event | undefined =
            await this.eventService.update(request.params.id, { image: filename });
        if (event) {
            return response.status(200).json(event);
        }
        response.sendStatus(400);
    }

    private async deleteImageFromS3(id: string) {
        let currentEvent: Event | null = await this.eventService.findById(id);
        if (currentEvent && currentEvent.image != null) {
            let Key = currentEvent.image.split('/').pop() as string;
            await this.s3.deleteObject({
                Bucket: Awsconfig.bucket_name,
                Key,
            }).promise();
        }
    }

    async findOne(request: Request, response: Response) {
        let event: Event | null =
            await this.eventService.findById(request.params.id);
        if (event) {
            return response.status(200).json(event);
        }
        return response.sendStatus(404);
    }

    async findMany(request: Request, response: Response) {
        let take = Math.min(50, +(request.query as any).take);
        let page = request.query.page || 0;
        page = parseInt(request.query.page as any) || 1;
        let skip = page == 1 ? 0 : page * take;
        delete request.query.page;
        delete request.query.take;
        let events: Event[] =
            await this.eventService.find({
                params: request.query,
                filters: {
                    take,
                    skip,
                }
            });
        let total = await this.eventService.count(request.query);
        let nextPage = (skip + take) < total ? page + 1 : null;
        let previousPage = (skip - take) > 0 ? page - 1 : null;
        response.status(200).json({
            value: events,
            total,
            page,
            nextPage,
            previousPage,
        });
    }

    async remove(request: Request, response: Response) {
        let event: Event | undefined =
            await this.eventService.remove(request.params.id);
        if (event) {
            return response.status(204).json(event);
        }
        return response.sendStatus(204);
    }

}
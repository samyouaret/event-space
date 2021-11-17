import { S3 } from 'aws-sdk';
import express from 'express'
import Application from '../../app/Application';
import EventController from '../../app/http/controllers/EventController';
import eventCreateValidator from '../../app/http/middlewares/validators/eventCreateValidator';
import validate from '../../app/http/middlewares/validators/validate';
import EventService from '../../app/services/EventService';
import { getS3Uploader } from '../../factories/S3MulterStorage';
import AWS from 'aws-sdk';
import { env } from '../../helpers/pathHelper';
import { Awsconfig } from '../../config/storage';

export default async function (app: Application): Promise<void> {
    AWS.config.update(Awsconfig.credentials);
    let s3 = new S3();
    let eventService: EventService = new EventService(app.getPrisma());
    let controller: EventController = new EventController(eventService,s3);

    let router: express.Router = express.Router();
    router.post('/api/events', express.json(), eventCreateValidator.rules(), validate, controller.create.bind(controller));
    router.put('/api/events/:id', express.json(), controller.update.bind(controller));
    router.delete('/api/events/:id', express.json(), controller.remove.bind(controller));
    router.get('/api/events/:id', controller.findOne.bind(controller));
    router.get('/api/events', controller.findMany.bind(controller));

    let uploader = getS3Uploader(
        s3,
        env("aws_s3_bucket"),
    );
    router.patch('/api/events/:id/upload-image',
        uploader.single('image'),
        controller.uploadImage.bind(controller));

    app.getApplicationGateWay().getServer().use(router);
}
import express from 'express'
import Application from '../../app/Application';
import EventController from '../../app/http/controllers/EventController';
import eventCreateValidator from '../../app/http/middlewares/validators/eventCreateValidator';
import validate from '../../app/http/middlewares/validators/validate';
import EventService from '../../app/services/EventService';

export default async function (app: Application): Promise<void> {
    let eventService:EventService = new EventService(app.getPrisma());
    let controller: EventController = new EventController(eventService);

    let router: express.Router = express.Router();
    router.post('/api/events', express.json(), eventCreateValidator.rules(), validate, controller.create.bind(controller));
    router.put('/api/events/:id', express.json(), controller.update.bind(controller));
    router.delete('/api/events/:id', express.json(), controller.remove.bind(controller));
    router.get('/api/events/:id', controller.findOne.bind(controller));

    app.getApplicationGateWay().getServer().use(router);
}
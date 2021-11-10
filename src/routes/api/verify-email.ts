import express from 'express'
import Application from '../../app/Application';
import VerifyEmailController from '../../app/http/controllers/auth/VerifyEmailController';

export default async function (app: Application): Promise<void> {
    let controller: VerifyEmailController = new VerifyEmailController(app.singletons.verifyEmailService);

    let router: express.Router = express.Router();
    router.get('/verify/:hash', controller.verify.bind(controller));

    app.getApplicationGateWay().getServer().use(router);
}
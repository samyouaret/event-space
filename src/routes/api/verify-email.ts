import express from 'express'
import { body } from 'express-validator';
import Application from '../../app/Application';
import VerifyEmailController from '../../app/http/controllers/auth/VerifyEmailController';
import validate from '../../app/http/middlewares/validators/validate';

export default async function (app: Application): Promise<void> {
    let controller: VerifyEmailController = new VerifyEmailController(app.singletons.verifyEmailService);

    let router: express.Router = express.Router();
    let emailvalidator = body('email')
        .bail()
        .isEmail()
        .withMessage('Please provide a valid email');
    router.post('/api/verify-email', express.json(), emailvalidator, validate, controller.generateToken.bind(controller));
    router.put('/api/verify-email/:token', express.json(), controller.verify.bind(controller));

    app.getApplicationGateWay().getServer().use(router);
}
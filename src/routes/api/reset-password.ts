import express from 'express'
import type Application from '../../app/Application';
import ResetPasswordController from '../../app/http/controllers/auth/ResetPasswordController';
import passwordResetValidator from '../../app/http/middlewares/validators/passwordResetValidator';
import validate from '../../app/http/middlewares/validators/validate';
import ResetPasswordService from '../../app/services/ResetPasswordService';

export default async function resetPassword(app: Application): Promise<void> {

    let resetPasswordService = new ResetPasswordService(
        app.singletons.tokenVerifyService,
        app.singletons.userService,
        app.singletons.mailService);
    let controller: ResetPasswordController = new ResetPasswordController(resetPasswordService);

    let router: express.Router = express.Router();
    router.post('/api/reset-password/generate', express.json(), controller.generateToken.bind(controller));
    let passwordResetRules = passwordResetValidator.rules();
    router.put('/api/reset-password/:token', express.json(), passwordResetRules, validate, controller.reset.bind(controller));

    app.getApplicationGateWay().getServer().use(router);
}
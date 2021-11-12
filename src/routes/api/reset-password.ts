import express from 'express'
import type Application from '../../app/Application';
import ResetPasswordController from '../../app/http/controllers/auth/ResetPasswordController';
import ResetPasswordService from '../../app/services/ResetPasswordService';

export default async function resetPassword(app: Application): Promise<void> {

    let resetPasswordService = new ResetPasswordService(
        app.singletons.prisma,
        app.singletons.userService,
        app.singletons.mailService);
    let controller: ResetPasswordController = new ResetPasswordController(resetPasswordService);

    let router: express.Router = express.Router();
    router.post('/api/reset-password', express.json(), controller.generateToken.bind(controller));
    router.post('/api/reset-password/:hash', express.json(), controller.reset.bind(controller));

    app.getApplicationGateWay().getServer().use(router);
}
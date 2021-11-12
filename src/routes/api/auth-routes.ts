import express from 'express'
import AuthController from "../../app/http/controllers/auth/AuthController";
import guest from '../../app/http/middlewares/api/guest';
import userValidator from '../../app/http/middlewares/validators/userValidator';
import validate from '../../app/http/middlewares/validators/validate';
import Application from '../../app/Application';
import RegisterController from '../../app/http/controllers/auth/RegisterController';
import AuthService from '../../app/services/AuthService';

export default async function (app: Application): Promise<void> {

    let authService = new AuthService(app.singletons.userService);
    let authController: AuthController = new AuthController(authService);
    let registerController: RegisterController = new RegisterController(
        app.singletons.userService,
        app.singletons.verifyEmailService);
    let router: express.Router = express.Router();
    let userRules = userValidator.rules();
    router.post('/register', userRules, validate, registerController.register.bind(registerController));
    let emailAndPassword = userRules.slice(0, 2);
    router.post('/login', emailAndPassword, validate, authController.login.bind(authController));
    app.getApplicationGateWay().getServer().use('/api/auth', guest, express.json(), router);
}
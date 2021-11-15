import { Request, Response } from "express";
import ResetPasswordService from "../../../services/ResetPasswordService";

export default class ResetPasswordController {

    constructor(private readonly resetPasswordService: ResetPasswordService) { }

    async reset(req: Request, res: Response) {
        let token = req.params.token;
        let password = req.body.password;
        if (req.body.confirmPassword !== req.body.password) {
            return res.status(422).json({ "error": "Password confirmation does not match password" });
        }
        let reset = await this.resetPasswordService.reset(token, password);
        if (reset) {
            return res.status(200).json({ "message": "Password reset successfully" });
        }

        return res.status(422).json({ "error": "Cannot reset password." });
    }

    async generateToken(req: Request, res: Response) {
        let email = req.body.email;
        let notified = await this.resetPasswordService.notifyUser(email);
        if (notified) {
            return res.status(201).json({ "message": "Request sent to user email." });
        }

        return res.status(422).json({ "error": "Cannot notify user." });
    }

}
import { Request, Response } from "express";
import ResetPasswordService from"../../../services/ResetPasswordService";

export default class ResetPasswordController {

    constructor(private readonly resetPasswordService: ResetPasswordService) { }

    async reset(req: Request, res: Response) {
        let hash = req.params.hash;
        let password = req.body.password;
        let reset = await this.resetPasswordService.reset(hash, password);
        if (reset) {
            return res.status(200).json({ "message": "Password reset." });
        }

        return res.status(404).json({ "message": "Cannot reset password." });
    }

    async generateToken(req: Request, res: Response) {
        let email = req.body.email;
        let notified = await this.resetPasswordService.notifyUser(email);
        if (notified) {
            return res.status(200).json({ "message": "User notified" });
        }

        return res.status(404).json({ "message": "Cannot notify user." });
    }

}
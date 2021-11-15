import {  Request, Response } from "express";
import VerifyEmailService from "../../../services/VerifyEmailService";

export default class VerifyEmailController {

    constructor(private readonly verifyEmailService: VerifyEmailService) { }

    async verify(req: Request, res: Response) {
        let token = req.params.token;
        let verified = await this.verifyEmailService.verify(token);
        if (verified) {
            return res.status(200).json({ "message": "Email verified sucessfully" });
        }

        return res.status(422).json({ "error": "Cannot verify email." });
    }

    async generateToken(req: Request, res: Response) {
        let email = req.body.email;
        let notified = await this.verifyEmailService.notifyUser(email);
        if (notified) {
            return res.status(201).json({ "message": "Request sent to user email." });
        }

        return res.status(422).json({ "error": "Cannot notify user." });
    }

}
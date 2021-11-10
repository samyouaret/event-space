import {  Request, Response } from "express";
import VerifyEmailService from "../../../services/VerifyEmailService";

export default class VerifyEmailController {

    constructor(private readonly verifyEmailService: VerifyEmailService) { }

    async verify(req: Request, res: Response) {
        let hash = req.params.hash;
        let verified = await this.verifyEmailService.verify(hash);
        if (verified) {
            return res.status(200).json({ "message": "User verified" });
        }

        return res.status(404).json({ "message": "Cannot verify user." });
    }

}
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { env } from "../../../../helpers/pathHelper";

export default (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).json({ error: "Unauthorized action" });
    (jwt as any).verify(token, env('APP_KEY'), (err: Error, user: { email: string, id: number }) => {
        if (err) return res.sendStatus(403);
        (req as any).user = user
        next()
    });
}

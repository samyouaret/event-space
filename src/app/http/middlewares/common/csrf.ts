import { env } from '../../../../helpers/pathHelper';
import { NextFunction, Request, Response } from "express";

export default function (options = { cookie: true }) {
    if (env('APP_ENV') == 'test') {
        return (req: Request, res: Response, next: NextFunction) => next();
    }
    return require('csurf')(options);
}
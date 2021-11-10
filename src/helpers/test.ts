import { NextFunction, Request, Response } from "express";

module.exports = {
    actAs(user: any) {
        return (req: Request, res: Response, next: NextFunction) => {
            (req as any).user = user;
            next()
        };
    },
    mountMiddleware(app: any, name: string) {
        if (app[name]) {
            return app.use(app[name]);
        }
        throw new Error(`cannot mount ${name} which is ${app[name]} `);
    },
}
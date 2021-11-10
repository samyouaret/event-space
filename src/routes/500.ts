import express from 'express'
import Application from '../app/Application';

export default function error500(app: Application): express.ErrorRequestHandler {
    return (err: Error, req: express.Request, res: express.Response) => {
        let message: { message: string, error?: Error } = { message: "internal Error" };
        if (app.APP_ENV != 'production') {
            message.error = err;
        }
        res.status(500).json(message);
    }
}
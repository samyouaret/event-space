import express from 'express';
import { static_path } from '../helpers/pathHelper';
import { NextFunction, Request, Response } from "express";

let router: express.Router = express.Router();

router.get('*', (req: Request, res: Response, next: NextFunction) => {
    // res.cookie('XSRF-TOKEN', req.csrfToken())
    res.sendFile(static_path('index.html'))
});

export default router;
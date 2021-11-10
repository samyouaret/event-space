import express from 'express'
import { NextFunction, Request, Response } from "express";
import type { PrismaClient } from '@prisma/client';

export default function (prisma: PrismaClient): express.Router {
    let router: express.Router = express.Router();

    router.get("api/*", (req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ mesage: "api version 1.0" }));
    });

    return router;
}
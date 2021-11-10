import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";

export default function validate(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next()
    }
    const formattedErrors: any = {};
    errors.array().map(err => {
        if (!formattedErrors[err.param]) {
            formattedErrors[err.param] = [];
        }
        formattedErrors[err.param].push(err.msg);
    });
    return res.status(422).json({ errors: formattedErrors })
}
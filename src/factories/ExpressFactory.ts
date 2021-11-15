import * as pathHelper from '../helpers/pathHelper';
import ExpressApplication from "../app/gateways/ExpressApplication";
import express from "express";

export function createExpressApp() {
    let server = express();
    let expressApp = new ExpressApplication(
        server,
        {
            environment: pathHelper.env('APP_ENV'),
            csrf: false,
            cors: false,
            helmet: true,
            parseCookie: false,
            urlencoded: true,
            openApiDoc: true,
            port: pathHelper.env('APP_PORT'),
            // view_path: pathHelper.root_path(pathHelper.env('VIEWS_PATH')) || pathHelper.view_path(),
            // view_engine: pathHelper.env('VIEWS_ENGINE'),
            // static_path: pathHelper.root_path(pathHelper.env('STATIC_PATH')) || pathHelper.static_path(),
        });

    return expressApp;
}
import dotenv from "dotenv";
dotenv.config();
import Application from './Application';
import { createExpressApp } from "../factories/ExpressFactory";

export default {
    start: async function () {
        let expressApp = createExpressApp();
        let app = new Application(expressApp);
        await app.start();
    }
}
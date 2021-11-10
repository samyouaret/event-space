import dotenv from "dotenv";
dotenv.config({ debug: true });
import Application from './Application';
import { createExpressApp } from "../factories/ExpressFactory";

export default {
    start: async function () {
        let expressApp = createExpressApp();
        let app = new Application(expressApp);
        await app.start();
    }
}
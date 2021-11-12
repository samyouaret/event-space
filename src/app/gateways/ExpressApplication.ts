import express from 'express';
import EventEmitter from 'events';
import routes from '../routes'
import { ApplicationGatewayContract } from './ApplicationGatewayContract';
import Application from '../Application';

// declare type RouteLoader = (app: Application) => express.Router | express.RequestHandler | express.ErrorRequestHandler;
export interface ExpressConfig {
    port: string | number,
    environment?: string,
    cors?: boolean,
    csrf?: boolean,
    helmet?: boolean,
    parseCookie?: boolean,
    view_path?: string,
    openApiDoc?:boolean,
    view_engine?: string,
    urlencoded?: boolean,
    static_path?: string,
}

export default class ExpressApplication extends EventEmitter implements ApplicationGatewayContract {
    server: express.Express;
    private config: ExpressConfig;

    constructor(server: express.Express, config: ExpressConfig) {
        super();
        this.server = server;
        this.config = config;
    }

    getServer(): express.Express {
        return this.server;
    }

    async start(): Promise<any> {
        this.startServer();
    }

    async init(application: Application) {
        if (this.config.view_path) {
            this.server.set('view engine', this.config.view_engine);
            this.server.set('views', this.config.view_path);
        }
        if (this.config.helmet) {
            const helmet = await import("helmet");
            this.server.use(helmet.default());
        }
        if (this.config.static_path) {
            this.server.use(express.static(this.config.static_path));
        }
        if (this.config.urlencoded) {
            this.server.use(express.urlencoded({ extended: false }));
        }

        if (this.config.parseCookie) {
            const cookieParser = await import("cookie-parser");
            this.server.use(cookieParser.default());
        }
        if (this.config.csrf) {
            const csrf = await import("../http/middlewares/common/csrf");
            const csrfProtection = csrf.default();
            this.server.use(csrfProtection);
        }
        if (this.config.openApiDoc) {
            const swaggerUi = await import('swagger-ui-express');
            const { apiDoc } = await import('../http/open-api-docs/api');
            this.server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDoc));
        }
        this.emit('beforeRoutesLoaded');
        await this.loadRoutes(application);
    }


    async loadRoutes(application: Application) {
        routes.forEach(async (route: any) => {
            let router: express.Router | undefined = await route(application);
            if (router instanceof express.Router ||
                typeof router === 'function') {
                this.server.use(router);
            }
        });
    }

    startServer(): void {
        this.server.listen(this.config.port, () => {
            console.log(`server listening ⚡️ at http://localhost:${this.config.port}`)
        });
    }
}

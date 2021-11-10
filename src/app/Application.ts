import * as pathHelper from '../helpers/pathHelper';
import EventEmitter from 'events';
import { PrismaClient } from '@prisma/client'
import singletons from './singletons'
import providers from './providers'
import { ApplicationGatewayContract } from './gateways/ApplicationGatewayContract';

export default class Application extends EventEmitter {
    pathHelper: any;
    appGateway: ApplicationGatewayContract;
    prisma: PrismaClient;
    singletons: any;
    providers: any;
    APP_ENV: any;

    constructor(appGateway: ApplicationGatewayContract) {
        super();
        this.appGateway = appGateway;
        this.pathHelper = pathHelper;
        this.APP_ENV = pathHelper.env('APP_ENV');
        if (pathHelper.env('NODE_ENV')) {
            pathHelper.env('APP_ENV', pathHelper.env('NODE_ENV'));
        } else {
            pathHelper.env('NODE_ENV', this.APP_ENV);
        }
        this.APP_ENV = pathHelper.env('APP_ENV');
    }

    setApplicationGateWay(appGateway: ApplicationGatewayContract): any {
        this.appGateway = appGateway;
    }

    getApplicationGateWay(): any {
        return this.appGateway;
    }

    async start() {
        console.log("init App ...");
        await this.init();
        console.log("starting App ...");
        return this.appGateway.start();
    }

    async init() {
        this.providers = providers;
        if (typeof singletons === 'function') {
            this.singletons = await singletons(this);
        } else {
            this.singletons = singletons;
        }
        this.prisma = this.singletons.prisma;
        await this.prisma.$connect();
        await this.appGateway.init(this);
    }

    getPrisma(): PrismaClient {
        return this.prisma;
    }

    async resetDatabase(): Promise<void> {
        if (this.prisma) {
            await this.prisma.$disconnect();
            await this.prisma.$connect();
        }
        this.emit('resetdatabase');
    }
}
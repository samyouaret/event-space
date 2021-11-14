import * as pathHelper from '../helpers/pathHelper';
import EventEmitter from 'events';
import { PrismaClient } from '@prisma/client'
import singletons from './singletons'
import { ApplicationGatewayContract } from './gateways/ApplicationGatewayContract';

export default class Application extends EventEmitter {
    pathHelper: any;
    appGateway: ApplicationGatewayContract;
    prisma: PrismaClient;
    singletons: any;
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
        console.log("Init App ...");
        await this.init();
        console.log("Starting App ...");
        return this.appGateway.start();
    }

    async init() {
        await this.loadSingletons();
        this.prisma = this.singletons.prisma;
        await this.prisma.$connect();
        await this.appGateway.init(this);
    }

    private async loadSingletons() {
        if (typeof singletons === 'function') {
            this.singletons = await singletons(this);
        } else {
            this.singletons = singletons;
        }
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
import Application from "../Application";

export interface ApplicationGatewayContract {
    init(application: Application): Promise<any>;
    start(): Promise<any>;
}
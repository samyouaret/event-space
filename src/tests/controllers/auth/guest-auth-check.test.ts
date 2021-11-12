import request from 'supertest'
import Application from '../../../app/Application';
import Guest from "../../../app/http/middlewares/api/guest";
import { Request, Response } from 'express'
import { createExpressApp } from '../../../factories/ExpressFactory';

let app: Application;

let mock: any;
const testUrl = '/guest-check';

beforeAll(async () => {
    let expressApp = createExpressApp();
    app = new Application(expressApp);
    let handler = (req: Request, res: Response) => {
        res.status(200).end('Hello world');
    };
    mock = jest.fn(handler);
    expressApp.on('beforeRoutesLoaded', () => {
        app.getApplicationGateWay().getServer().get(testUrl, Guest, mock);
    });
    await app.init();
});

afterAll((done) => {
    app.getPrisma().$disconnect().then(done);
});

it('should pass guest middlware with no token', (done) => {
    request.agent(app.getApplicationGateWay().getServer())
        .get(testUrl)
        .expect(200)
        .end(function (err, res) {
            expect(err).toBeNull();
            done();
        });

});

it('should fail pass guest middlware with Authorization token even it is invalid', (done) => {
    request.agent(app.getApplicationGateWay().getServer())
        .get(testUrl)
        .set('Authorization', 'Bearer invalidBearer.invalidBearer.invalidBearer')
        .expect(401)
        .end(function (err, res) {
            expect(err).toBeNull();
            done();
        });

});
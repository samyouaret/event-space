import express from 'express'
import Application from '../../app/Application';
import OrderService from '../../app/services/OrderService';
import PaymentService from '../../app/services/PaymentService';
import { env } from '../../helpers/pathHelper';
import { Stripe } from 'stripe';
import OrderController from '../../app/http/controllers/OrderController';

export default async function (app: Application): Promise<void> {
    const stripe = new Stripe(env("stripe_api_key"), {
        apiVersion: '2020-08-27',
    });
    let paymentService = new PaymentService(env("stripe_endpoint_secret"), stripe);
    let orderService: OrderService = new OrderService(app.getPrisma(), paymentService);
    let controller: OrderController = new OrderController(orderService);

    let router: express.Router = express.Router();
    router.post('/api/orders/:eventId', controller.create.bind(controller));
    router.post('/api/orders_webhook', express.raw({ type: 'application/json' }), controller.webhook.bind(controller));
    app.getApplicationGateWay().getServer().use(router);
}
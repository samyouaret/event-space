import { Request, Response } from "express";
import OrderService from "../../services/OrderService";

export default class OrderController {

    constructor(private readonly orderService: OrderService) { }

    async create(req: Request, res: Response) {
        let event = await this.orderService.needPayment(req.params.eventId);
        if (event === false) {
            return res.sendStatus(401);
        }
        let userId = (req as any).user.id;
        try {
            let result = await this.orderService.createPaidOrder(event, {
                userId,
                successUrl: "http://localhost:3000/orders/success",
                cancelUrl: "http://localhost:3000/orders/cancel",
                quantity: 1,
            });
            if (result) {
                return res.status(201).json(result);
            }
            return res.sendStatus(401);
        } catch (err) {
            return res.status(400).json({ message: (err as Error).message });
        }
    }

    async webhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        try {
            let order = await this.orderService.completePaidOrder({
                signature: sig,
                eventBody: req.body
            });
            if (order) {
                return res.status(200);
            }
            return res.sendStatus(400);
        } catch (err) {
            console.log(err);
            return res.sendStatus(400);
        }
    }
}
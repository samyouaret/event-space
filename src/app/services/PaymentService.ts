import { Stripe } from 'stripe';

export class PaymentService {
    constructor(
        private readonly endpointSecret: string,
        private readonly stripe: Stripe,
    ) { }

    async createSession(options: {
        quantity: number,
        successUrl: string,
        cancelUrl: string,
        product: {
            title: string,
            price: number,
            description: string,
            images: string[],
        },
        metadata: Stripe.MetadataParam | undefined,
    }) {
        let date = new Date();
        date.setMinutes(date.getMinutes() + 60);
        const session = await this.stripe.checkout.sessions.create({
            metadata: options.metadata,
            expires_at: Math.floor(date.getTime() / 1000),
            line_items: [
                {
                    price_data: {
                        unit_amount: options.product.price * 100,
                        currency: 'usd',
                        product_data: {
                            metadata: options.metadata,
                            name: options.product.title,
                            description: options.product.description || undefined,
                            images: options.product.images
                        },
                    },
                    quantity: options.quantity,
                },
            ],
            mode: 'payment',
            success_url: options.successUrl,
            cancel_url: options.cancelUrl,
        });

        return session;
    }

    getPaymentEvent({ signature, eventBody }: { signature: string, eventBody: any }) {
        return this.stripe.webhooks.constructEvent(eventBody, signature, this.endpointSecret);
    }

}

export default PaymentService;

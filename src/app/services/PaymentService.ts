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
        const session = await this.stripe.checkout.sessions.create({
            metadata: options.metadata,
            line_items: [
                {
                    price_data: {
                        unit_amount: options.product.price * 100,
                        currency: 'usd',
                        product_data: {
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

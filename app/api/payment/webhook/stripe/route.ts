import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '../../../../../lib/payment-service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature')!;

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle the webhook
        const result = await handleStripeWebhook(event);

        if (!result.success) {
            console.error('Webhook handling failed:', result.error);
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

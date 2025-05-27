import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2025-04-30.basil' },
    );
  }

  async createPaymentIntent(amount: number, method: 'card' | 'oxxo') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'mxn',
      payment_method_types: [method],
    });

    if (method === 'oxxo') {
      // ⚡️ Aquí va el fix: se requiere payment_method_data con type y oxxo[country]
      const confirmedIntent = await this.stripe.paymentIntents.confirm(
        paymentIntent.id,
        {
          payment_method_data: {
            type: 'oxxo',            
            billing_details: {
              name: 'Juan Perez', // Puedes recibirlo del frontend
              email: 'juan@correo.com', // Puedes recibirlo del frontend
            },
          },
        },
      );
      return confirmedIntent;
    }

    return paymentIntent;
  }
}

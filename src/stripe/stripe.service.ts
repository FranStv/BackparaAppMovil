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
      const confirmedIntent = await this.stripe.paymentIntents.confirm(
        paymentIntent.id,
      );
      return confirmedIntent;
    }

    // Para tarjeta, solo regresa el intent creado
    return paymentIntent;
  }
}

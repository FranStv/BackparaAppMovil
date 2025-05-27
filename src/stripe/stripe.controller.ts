import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create-payment-intent')
  async createPaymentIntent(
    @Request() req,
    @Body('amount') amount: number,
    @Body('method') method: 'card' | 'oxxo',
  ) {
    
    const paymentIntent = await this.stripeService.createPaymentIntent(amount, method);

    // Incluye el voucher url para OXXO si aplica
    let voucherUrl: string | undefined = undefined;
    if (
      method === 'oxxo' &&
      paymentIntent.next_action &&
      (paymentIntent.next_action as any).oxxo_display_details
    ) {
      voucherUrl = (paymentIntent.next_action as any).oxxo_display_details.hosted_voucher_url;
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntent,
      voucherUrl,
    };
  }
}

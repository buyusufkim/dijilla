/**
 * Payment Integration Abstraction
 * Allows switching between Stripe, Iyzico, or other gateways.
 */
export interface IPaymentMetadata {
  orderId?: string;
  userId?: string;
  customerEmail?: string;
  [key: string]: any;
}

export interface IPaymentGateway {
  createPaymentIntent(amount: number, currency: string, metadata?: IPaymentMetadata): Promise<string>;
  reconcilePayment(paymentIntentId: string): Promise<boolean>;
}

/**
 * System Payment Simulator
 * Used for development/simulation when no real gateway credentials provided.
 * In a real production environment, this would be replaced by a Stripe or Iyzico implementation.
 */
export class SystemPaymentSimulator implements IPaymentGateway {
  async createPaymentIntent(amount: number, currency: string, metadata?: IPaymentMetadata): Promise<string> {
    console.log(`[Simulator] Creating payment intent for ${amount} ${currency}`);
    // Explicitly labeled as simulator generated ID
    return `sim_pi_${crypto.randomUUID()}`;
  }

  async reconcilePayment(paymentIntentId: string): Promise<boolean> {
    console.log(`[Simulator] Reconciling intent: ${paymentIntentId}`);
    return paymentIntentId.startsWith("sim_pi_");
  }
}

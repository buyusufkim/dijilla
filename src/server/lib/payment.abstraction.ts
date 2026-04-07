/**
 * Payment Integration Abstraction
 * Allows switching between Stripe, Iyzico, or other gateways.
 */
export interface IPaymentGateway {
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<string>;
  reconcilePayment(paymentIntentId: string): Promise<boolean>;
}

/**
 * Mock Payment Gateway for Demonstration
 */
export class MockPaymentGateway implements IPaymentGateway {
  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<string> {
    console.log(`[Payment] Creating intent for ${amount} ${currency}`);
    return `PI-${crypto.randomUUID()}`;
  }

  async reconcilePayment(paymentIntentId: string): Promise<boolean> {
    console.log(`[Payment] Reconciling intent: ${paymentIntentId}`);
    return true; // Always successful in mock
  }
}

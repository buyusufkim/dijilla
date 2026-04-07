import { CheckoutRepository } from "./checkout.repository.js";
import { CreateCheckoutInput, PaymentInput, CheckoutStatus, CheckoutResponseDTO } from "./checkout.types.js";
import { PolicyService } from "../policies/policy.service.js";

export class CheckoutService {
  private repository = new CheckoutRepository();
  private policyService = new PolicyService();

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResponseDTO> {
    const offer = await this.repository.getOfferById(input.offerId);

    if (!offer) {
      throw new Error("Teklif bulunamadı.");
    }

    // Verify offer/quote_request ownership
    if (offer.quote_requests.user_id !== input.userId) {
      throw new Error("Bu teklif için ödeme başlatma yetkiniz yok.");
    }

    const checkout = await this.repository.createCheckout({
      user_id: input.userId,
      offer_id: input.offerId,
      amount: offer.premium,
      status: CheckoutStatus.PENDING
    });

    return {
      id: checkout.id,
      offerId: checkout.offer_id,
      amount: checkout.amount,
      status: checkout.status,
      createdAt: checkout.created_at
    };
  }

  async processPayment(checkoutId: string, payment: PaymentInput, userId: string): Promise<void> {
    const checkout = await this.repository.getCheckoutById(checkoutId);

    if (!checkout) {
      throw new Error("Ödeme oturumu bulunamadı.");
    }

    if (checkout.user_id !== userId) {
      throw new Error("Bu ödeme oturumuna erişim yetkiniz yok.");
    }

    if (checkout.status === CheckoutStatus.PAID) {
      throw new Error("Bu ödeme zaten tamamlanmış.");
    }

    // 1. Update status to processing
    await this.repository.updateStatus(checkoutId, CheckoutStatus.PROCESSING);

    try {
      // 2. Stubbed Payment Provider Call
      // In a real app, this would call Stripe, Iyzico, etc.
      const paymentSuccess = await this.stubPaymentProvider(payment, checkout.amount);

      if (paymentSuccess) {
        // 3. Update status to paid
        await this.repository.updateStatus(checkoutId, CheckoutStatus.PAID);

        // 4. Trigger Policy Issuance
        const offer = await this.repository.getOfferById(checkout.offer_id);
        await this.policyService.issuePolicy(checkout, offer);
      } else {
        await this.repository.updateStatus(checkoutId, CheckoutStatus.FAILED);
        throw new Error("Ödeme reddedildi.");
      }
    } catch (error: any) {
      await this.repository.updateStatus(checkoutId, CheckoutStatus.FAILED);
      throw error;
    }
  }

  private async stubPaymentProvider(payment: PaymentInput, amount: number): Promise<boolean> {
    console.log(`[PaymentProvider] Processing payment for amount: ${amount}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success for all valid-looking cards
    return !payment.cardNumber.startsWith("0000");
  }
}

import { BaseProviderAdapter } from "./BaseProviderAdapter.js";
import { QuoteRequest, NormalizedOffer } from "../../modules/quotes/quote.types.js";

export class FakeTrafficProviderAdapter extends BaseProviderAdapter {
  providerId = "traffic-fake-001";
  providerName = "Dijilla Trafik Sigorta";

  async getQuotes(quoteRequest: QuoteRequest, vehicle: any): Promise<Partial<NormalizedOffer>[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate provider response
    const rawOffers = [
      {
        externalId: "OFFER-T-101",
        price: 4500.50,
        currency: "TRY",
        details: {
          imm: 100000,
          assistance: true,
          miniRepair: false
        }
      },
      {
        externalId: "OFFER-T-102",
        price: 5200.00,
        currency: "TRY",
        details: {
          imm: 250000,
          assistance: true,
          miniRepair: true
        }
      }
    ];

    return rawOffers.map((offer) => this.normalize(offer, quoteRequest.id));
  }

  protected normalize(rawOffer: any, quoteRequestId: string): Partial<NormalizedOffer> {
    return {
      quote_request_id: quoteRequestId,
      provider_id: this.providerId,
      provider_name: this.providerName,
      premium: rawOffer.price,
      currency: rawOffer.currency,
      coverage_details: rawOffer.details,
      status: "active"
    };
  }
}

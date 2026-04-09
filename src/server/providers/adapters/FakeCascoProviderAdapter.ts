import { BaseProviderAdapter } from "./BaseProviderAdapter.js";
import { QuoteRequest, NormalizedOffer } from "../../modules/quotes/quote.types.js";

export class FakeCascoProviderAdapter extends BaseProviderAdapter {
  providerId = "casco-fake-001";
  providerName = "Droto Kasko";

  async getQuotes(quoteRequest: QuoteRequest, vehicle: any): Promise<Partial<NormalizedOffer>[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulate provider response
    const rawOffers = [
      {
        externalId: "OFFER-C-201",
        price: 12500.00,
        currency: "TRY",
        details: {
          theft: true,
          fire: true,
          glass: true,
          replacementVehicle: "7 days"
        }
      },
      {
        externalId: "OFFER-C-202",
        price: 15800.00,
        currency: "TRY",
        details: {
          theft: true,
          fire: true,
          glass: true,
          replacementVehicle: "15 days",
          originalParts: true
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

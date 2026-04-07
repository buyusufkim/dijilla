import { QuoteRepository } from "./quote.repository.js";
import { QuoteRequestDTO, QuoteResponseDTO, QuoteStatus, OfferDTO } from "./quote.types.js";
import { QuoteOrchestrator } from "../../orchestration/QuoteOrchestrator.js";
import { OfferScoring } from "../../recommendation/offerScoring.js";
import { supabaseAdmin } from "../../lib/supabase.js";

/**
 * Quote Service
 * Handles business logic for quote requests and offers.
 */
export class QuoteService {
  private repository = new QuoteRepository();
  private orchestrator = new QuoteOrchestrator();

  /**
   * Processes a new quote request.
   * @param input The quote request input.
   */
  async requestQuotes(input: QuoteRequestDTO): Promise<string> {
    // 0. Verify vehicle ownership
    if (input.userId) {
      const { data: vehicle, error: vehicleError } = await (supabaseAdmin as any)
        .from("vehicles")
        .select("user_id")
        .eq("id", input.vehicleId)
        .single();

      if (vehicleError || !vehicle || vehicle.user_id !== input.userId) {
        throw new Error("Bu araç için teklif alma yetkiniz yok.");
      }
    }

    // 1. Create quote request record
    const quoteRequest = await this.repository.createQuoteRequest({
      vehicle_id: input.vehicleId,
      user_id: input.userId || null,
      status: QuoteStatus.PENDING,
      type: input.type
    });

    // 2. Trigger orchestration (async)
    // In a real production app, this might be handled by a message queue.
    // For this implementation, we run it in the background.
    this.orchestrator.orchestrate(quoteRequest, { id: input.vehicleId }).catch((error) => {
      console.error(`[QuoteService] Orchestration failed for Request: ${quoteRequest.id}`, error);
    });

    return quoteRequest.id;
  }

  /**
   * Fetches offers for a quote request.
   * @param requestId The quote request ID.
   */
  async getOffers(requestId: string, userId: string): Promise<QuoteResponseDTO> {
    const quoteRequest = await this.repository.getQuoteRequestById(requestId);

    if (!quoteRequest) {
      throw new Error("Teklif talebi bulunamadı.");
    }

    // Ownership check
    if (quoteRequest.user_id && quoteRequest.user_id !== userId) {
      throw new Error("Bu teklif talebine erişim yetkiniz yok.");
    }

    const offers = await this.repository.getOffersByRequestId(requestId);
    const scoredOffers = OfferScoring.rankOffers(offers);

    const offerDTOs: OfferDTO[] = scoredOffers.map((offer) => ({
      id: offer.id,
      providerId: offer.provider_id,
      providerName: offer.provider_name,
      premium: offer.premium,
      currency: offer.currency,
      coverageDetails: offer.coverage_details,
      status: offer.status,
      score: offer.score,
      badges: offer.badges
    }));

    return {
      requestId: quoteRequest.id,
      status: quoteRequest.status,
      offers: offerDTOs
    };
  }
}

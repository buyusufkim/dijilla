import { supabaseAdmin } from "../lib/supabase.js";
import { QuoteRequest, NormalizedOffer, QuoteStatus } from "../modules/quotes/quote.types.js";
import { BaseProviderAdapter } from "../providers/adapters/BaseProviderAdapter.js";
import { FakeTrafficProviderAdapter } from "../providers/adapters/FakeTrafficProviderAdapter.js";
import { FakeCascoProviderAdapter } from "../providers/adapters/FakeCascoProviderAdapter.js";

/**
 * Quote Orchestrator
 * Coordinates multiple provider adapters to fetch and store insurance offers.
 */
export class QuoteOrchestrator {
  private adapters: BaseProviderAdapter[];

  constructor() {
    this.adapters = [
      new FakeTrafficProviderAdapter(),
      new FakeCascoProviderAdapter()
    ];
  }

  /**
   * Orchestrates the quote fetching process.
   * @param quoteRequest The quote request record.
   * @param vehicle The vehicle information.
   */
  async orchestrate(quoteRequest: QuoteRequest, vehicle: any): Promise<void> {
    console.log(`[QuoteOrchestrator] Starting orchestration for Request: ${quoteRequest.id} (Type: ${quoteRequest.type})`);

    // Filter adapters by quote type
    const filteredAdapters = this.adapters.filter(adapter => {
      if (quoteRequest.type === "traffic") return adapter instanceof FakeTrafficProviderAdapter;
      if (quoteRequest.type === "casco") return adapter instanceof FakeCascoProviderAdapter;
      // Add assistance adapters here when implemented
      return false;
    });

    if (filteredAdapters.length === 0) {
      console.warn(`[QuoteOrchestrator] No adapters found for type: ${quoteRequest.type}`);
    }

    // Update status to processing
    await (supabaseAdmin
      .from("quote_requests") as any)
      .update({ status: QuoteStatus.PROCESSING })
      .eq("id", quoteRequest.id);

    const results = await Promise.allSettled(
      filteredAdapters.map(async (adapter) => {
        try {
          // Log provider request start
          const { data: providerReq } = await (supabaseAdmin
            .from("provider_requests") as any)
            .insert({
              quote_request_id: quoteRequest.id,
              provider_id: adapter.providerId,
              status: "pending"
            })
            .select()
            .single();

          const offers = await adapter.getQuotes(quoteRequest, vehicle);

          // Save offers
          if (offers.length > 0) {
            await (supabaseAdmin
              .from("normalized_offers") as any)
              .insert(offers as any[]);
          }

          // Update provider request to success
          if (providerReq) {
            await (supabaseAdmin
              .from("provider_requests") as any)
              .update({ status: "completed" })
              .eq("id", (providerReq as any).id);
          }

          return offers;
        } catch (error: any) {
          console.error(`[QuoteOrchestrator] Provider ${adapter.providerId} failed:`, error.message);
          
          // Log provider request failure
          await (supabaseAdmin
            .from("provider_requests") as any)
            .insert({
              quote_request_id: quoteRequest.id,
              provider_id: adapter.providerId,
              status: "failed",
              error_message: error.message
            });

          throw error;
        }
      })
    );

    // Finalize quote request status
    const allFailed = results.every((r) => r.status === "rejected");
    const finalStatus = allFailed ? QuoteStatus.FAILED : QuoteStatus.COMPLETED;

    await (supabaseAdmin
      .from("quote_requests") as any)
      .update({ status: finalStatus })
      .eq("id", quoteRequest.id);

    console.log(`[QuoteOrchestrator] Orchestration finished with status: ${finalStatus}`);
  }
}

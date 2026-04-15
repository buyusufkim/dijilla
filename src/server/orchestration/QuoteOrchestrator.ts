import { supabaseAdmin } from "../lib/supabase.js";
import { QuoteRequest, NormalizedOffer, QuoteStatus } from "../modules/quotes/quote.types.js";
import { BaseProviderAdapter } from "../providers/adapters/BaseProviderAdapter.js";
import { FakeTrafficProviderAdapter } from "../providers/adapters/FakeTrafficProviderAdapter.js";
import { FakeCascoProviderAdapter } from "../providers/adapters/FakeCascoProviderAdapter.js";

/**
 * Quote Orchestrator
 * Coordinates multiple provider adapters to fetch and store insurance offers using Supabase.
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
      switch (quoteRequest.type) {
        case "traffic":
          return adapter instanceof FakeTrafficProviderAdapter;
        case "casco":
          return adapter instanceof FakeCascoProviderAdapter;
        default:
          console.error(`[QuoteOrchestrator] Unsupported quote type: ${quoteRequest.type}`);
          return false;
      }
    });

    if (filteredAdapters.length === 0) {
      const errorMsg = `[QuoteOrchestrator] No adapters found for type: ${quoteRequest.type}`;
      console.error(errorMsg);
      
      await supabaseAdmin.from("quote_requests").update({ status: QuoteStatus.FAILED }).eq("id", quoteRequest.id);
      return;
    }

    // Update status to processing
    await supabaseAdmin.from("quote_requests").update({ status: QuoteStatus.PROCESSING }).eq("id", quoteRequest.id);

    let successCount = 0;
    let totalAdapters = filteredAdapters.length;

    for (const adapter of filteredAdapters) {
      try {
        // Log provider request start
        const { data: providerReq, error: reqError } = await supabaseAdmin
          .from("provider_requests")
          .insert({
            quote_request_id: quoteRequest.id,
            provider_id: adapter.providerId,
            status: "pending",
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (reqError) throw reqError;

        const offers = await adapter.getQuotes(quoteRequest, vehicle);

        // Save offers
        if (offers.length > 0) {
          const { error: offersError } = await supabaseAdmin
            .from("normalized_offers")
            .insert(offers.map(offer => ({
              ...offer,
              created_at: new Date().toISOString()
            })));
          
          if (offersError) throw offersError;
          successCount++;
        }

        // Update provider request to success
        await supabaseAdmin
          .from("provider_requests")
          .update({ status: "completed" })
          .eq("id", providerReq.id);

      } catch (error: any) {
        console.error(`[QuoteOrchestrator] Provider ${adapter.providerId} failed:`, error.message);
        
        // Log provider request failure
        await supabaseAdmin.from("provider_requests").insert({
          quote_request_id: quoteRequest.id,
          provider_id: adapter.providerId,
          status: "failed",
          error_message: error.message,
          created_at: new Date().toISOString()
        });
      }
    }

    // Finalize quote request status
    let finalStatus: QuoteStatus;
    if (successCount === 0) {
      finalStatus = QuoteStatus.FAILED;
    } else if (successCount === totalAdapters) {
      finalStatus = QuoteStatus.COMPLETED;
    } else {
      finalStatus = QuoteStatus.PARTIAL;
    }

    await supabaseAdmin.from("quote_requests").update({ status: finalStatus }).eq("id", quoteRequest.id);

    console.log(`[QuoteOrchestrator] Orchestration finished with status: ${finalStatus} (Success: ${successCount}/${totalAdapters})`);
  }
}

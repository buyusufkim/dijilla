import { supabaseAdmin } from "../../lib/supabase.js";
import { QuoteRequest, QuoteRequestInsert, NormalizedOffer, QuoteStatus } from "./quote.types.js";

/**
 * Quote Repository
 * Handles database interactions for quote requests and offers.
 */
export class QuoteRepository {
  /**
   * Creates a new quote request.
   * @param data The quote request data.
   */
  async createQuoteRequest(data: QuoteRequestInsert): Promise<QuoteRequest> {
    const { data: quoteRequest, error } = await (supabaseAdmin
      .from("quote_requests") as any)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[QuoteRepository] Error creating quote request:", error);
      throw new Error("Teklif talebi oluşturulamadı.");
    }

    return quoteRequest as QuoteRequest;
  }

  /**
   * Fetches a quote request by ID.
   * @param id The quote request ID.
   */
  async getQuoteRequestById(id: string): Promise<QuoteRequest | null> {
    const { data, error } = await (supabaseAdmin
      .from("quote_requests") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[QuoteRepository] Error fetching quote request ${id}:`, error);
      return null;
    }

    return data as QuoteRequest;
  }

  /**
   * Fetches normalized offers for a quote request.
   * @param requestId The quote request ID.
   */
  async getOffersByRequestId(requestId: string): Promise<NormalizedOffer[]> {
    const { data, error } = await (supabaseAdmin
      .from("normalized_offers") as any)
      .select("*")
      .eq("quote_request_id", requestId);

    if (error) {
      console.error(`[QuoteRepository] Error fetching offers for request ${requestId}:`, error);
      return [];
    }

    return data as NormalizedOffer[];
  }

  /**
   * Updates the status of a quote request.
   * @param id The quote request ID.
   * @param status The new status.
   */
  async updateStatus(id: string, status: QuoteStatus): Promise<void> {
    const { error } = await (supabaseAdmin
      .from("quote_requests") as any)
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(`[QuoteRepository] Error updating status for request ${id}:`, error);
    }
  }
}

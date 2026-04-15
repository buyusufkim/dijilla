import { supabaseAdmin } from "../../lib/supabase.js";
import { QuoteRequest, QuoteRequestInsert, NormalizedOffer, QuoteStatus } from "./quote.types.js";

/**
 * Quote Repository
 * Handles database interactions for quote requests and offers using Supabase.
 */
export class QuoteRepository {
  /**
   * Creates a new quote request.
   * @param data The quote request data.
   */
  async createQuoteRequest(data: QuoteRequestInsert): Promise<QuoteRequest> {
    const { data: inserted, error } = await supabaseAdmin
      .from("quote_requests")
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return inserted as QuoteRequest;
  }

  /**
   * Fetches a quote request by ID.
   * @param id The quote request ID.
   */
  async getQuoteRequestById(id: string): Promise<QuoteRequest | null> {
    const { data, error } = await supabaseAdmin
      .from("quote_requests")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as QuoteRequest;
  }

  /**
   * Fetches normalized offers for a quote request.
   * @param requestId The quote request ID.
   */
  async getOffersByRequestId(requestId: string): Promise<NormalizedOffer[]> {
    const { data, error } = await supabaseAdmin
      .from("normalized_offers")
      .select("*")
      .eq("quote_request_id", requestId);
    
    if (error) throw error;
    return (data || []) as NormalizedOffer[];
  }

  /**
   * Updates the status of a quote request.
   * @param id The quote request ID.
   * @param status The new status.
   */
  async updateStatus(id: string, status: QuoteStatus): Promise<void> {
    const { error } = await supabaseAdmin
      .from("quote_requests")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    
    if (error) throw error;
  }
}

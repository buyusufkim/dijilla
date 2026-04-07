import { QuoteRequest, NormalizedOffer, QuoteStatus } from "../../modules/quotes/quote.types";
import { IProviderAdapter } from "../../types";

/**
 * Base Provider Adapter
 * Defines the contract for all insurance provider integrations.
 */
export abstract class BaseProviderAdapter implements IProviderAdapter {
  abstract providerId: string;
  abstract providerName: string;

  /**
   * Fetches quotes from the provider.
   * @param quoteRequest The quote request record.
   * @param vehicle The vehicle information.
   */
  abstract getQuotes(quoteRequest: QuoteRequest, vehicle: any): Promise<Partial<NormalizedOffer>[]>;

  /**
   * Normalizes the provider's raw response into the system's format.
   * @param rawOffer The raw offer data from the provider.
   * @param quoteRequestId The ID of the quote request.
   */
  protected abstract normalize(rawOffer: any, quoteRequestId: string): Partial<NormalizedOffer>;
}

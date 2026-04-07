import { NormalizedOffer } from "../modules/quotes/quote.types.js";

/**
 * Offer Scoring & Ranking Logic
 * Assigns scores and badges to insurance offers based on premium and coverage.
 */
export interface ScoredOffer extends NormalizedOffer {
  score: number;
  badges: string[];
}

export class OfferScoring {
  /**
   * Ranks and scores a list of offers.
   * @param offers The normalized offers.
   */
  static rankOffers(offers: NormalizedOffer[]): ScoredOffer[] {
    if (offers.length === 0) return [];

    // Sort by premium (ascending)
    const sortedByPrice = [...offers].sort((a, b) => a.premium - b.premium);
    const cheapest = sortedByPrice[0];

    return offers.map((offer) => {
      const badges: string[] = [];
      let score = 50; // Base score

      // Badge: Cheapest
      if (offer.id === cheapest.id) {
        badges.push("En Ucuz");
        score += 30;
      }

      // Badge: Recommended (Mock logic)
      if (offer.provider_name.includes("Dijilla") && offer.premium < 10000) {
        badges.push("Önerilen");
        score += 20;
      }

      // Badge: Best Value (Mock logic)
      if (offer.premium > cheapest.premium && offer.premium < cheapest.premium * 1.2) {
        badges.push("Fiyat/Performans");
        score += 15;
      }

      return {
        ...offer,
        score: Math.min(score, 100),
        badges
      };
    }).sort((a, b) => b.score - a.score); // Sort by score descending
  }
}

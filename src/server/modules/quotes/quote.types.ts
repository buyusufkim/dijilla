import { Database } from "../../types.js";

export type QuoteRequest = Database["public"]["Tables"]["quote_requests"]["Row"];
export type QuoteRequestInsert = Database["public"]["Tables"]["quote_requests"]["Insert"];

export type NormalizedOffer = Database["public"]["Tables"]["normalized_offers"]["Row"];

export enum QuoteStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface QuoteRequestDTO {
  vehicleId: string;
  userId?: string;
  type: string;
}

export interface OfferDTO {
  id: string;
  providerId: string;
  providerName: string;
  premium: number;
  currency: string;
  coverageDetails: any;
  status: string;
  score: number;
  badges: string[];
}

export interface QuoteResponseDTO {
  requestId: string;
  status: string;
  offers: OfferDTO[];
}

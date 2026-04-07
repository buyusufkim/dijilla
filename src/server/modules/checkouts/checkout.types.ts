import { Database } from "../../types";

export type Checkout = Database["public"]["Tables"]["checkouts"]["Row"];
export type CheckoutInsert = Database["public"]["Tables"]["checkouts"]["Insert"];

export enum CheckoutStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PAID = "paid",
  FAILED = "failed"
}

export interface CreateCheckoutInput {
  offerId: string;
  userId: string;
}

export interface PaymentInput {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}

export interface CheckoutResponseDTO {
  id: string;
  offerId: string;
  amount: number;
  status: string;
  createdAt: string;
}

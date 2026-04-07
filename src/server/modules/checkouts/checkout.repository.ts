import { supabaseAdmin } from "../../lib/supabase";
import { Checkout, CheckoutInsert, CheckoutStatus } from "./checkout.types";

export class CheckoutRepository {
  async createCheckout(data: CheckoutInsert): Promise<Checkout> {
    const { data: checkout, error } = await (supabaseAdmin
      .from("checkouts") as any)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[CheckoutRepository] Error creating checkout:", error);
      throw new Error("Ödeme oturumu oluşturulamadı.");
    }

    return checkout as Checkout;
  }

  async getCheckoutById(id: string): Promise<Checkout | null> {
    const { data, error } = await (supabaseAdmin
      .from("checkouts") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`[CheckoutRepository] Error fetching checkout ${id}:`, error);
      return null;
    }

    return data as Checkout;
  }

  async updateStatus(id: string, status: CheckoutStatus): Promise<void> {
    const { error } = await (supabaseAdmin
      .from("checkouts") as any)
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error(`[CheckoutRepository] Error updating checkout status ${id}:`, error);
    }
  }

  async getOfferById(offerId: string): Promise<any | null> {
    const { data, error } = await (supabaseAdmin
      .from("normalized_offers") as any)
      .select("*, quote_requests(vehicle_id, type, user_id)")
      .eq("id", offerId)
      .single();

    if (error) {
      console.error(`[CheckoutRepository] Error fetching offer ${offerId}:`, error);
      return null;
    }

    return data;
  }
}

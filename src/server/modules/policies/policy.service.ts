import { supabaseAdmin } from "../../lib/supabase.js";
import { Checkout } from "../checkouts/checkout.types.js";
import { PolicyDTO } from "../../types.js";

export class PolicyService {
  /**
   * Issues a new policy record after successful payment.
   * @param checkout The checkout record.
   * @param offer The normalized offer record.
   */
  async issuePolicy(checkout: Checkout, offer: any): Promise<PolicyDTO> {
    console.log(`[PolicyService] Issuing policy for Checkout: ${checkout.id}`);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    const policyData = {
      user_id: checkout.user_id,
      vehicle_id: offer.quote_requests.vehicle_id,
      checkout_id: checkout.id,
      policy_number: `POL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      provider: offer.provider_name,
      type: offer.quote_requests.type || "traffic",
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      premium: checkout.amount,
      status: "active",
      document_url: `https://storage.dijilla.com/policies/${checkout.id}.pdf`
    };

    const { data: policy, error } = await (supabaseAdmin
      .from("policies") as any)
      .insert(policyData)
      .select()
      .single();

    if (error) {
      console.error("[PolicyService] Error creating policy:", error);
      throw new Error("Poliçe oluşturulamadı.");
    }

    console.log(`[PolicyService] Policy issued successfully: ${policy.policy_number}`);

    return policy as PolicyDTO;
  }

  /**
   * Fetches policies for a user.
   * @param userId The user ID.
   */
  async getPoliciesByUserId(userId: string): Promise<PolicyDTO[]> {
    const { data, error } = await (supabaseAdmin
      .from("policies") as any)
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error(`[PolicyService] Error fetching policies for user ${userId}:`, error);
      return [];
    }

    return data as PolicyDTO[];
  }
}

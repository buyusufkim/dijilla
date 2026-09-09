/**
 * Initial catalog approved by the product owner.
 * Prices are in kurus. Dealer commission never belongs in this public catalog.
 * Coverage wording must be verified before publishing customer-facing terms.
 * This data alone does not enable sales or activate a customer's package.
 */
export type RoadsidePackageId = "eco" | "standard" | "pro";

export interface RoadsidePackage {
  readonly id: RoadsidePackageId;
  readonly name: string;
  readonly priceMinor: number;
  readonly currency: "TRY";
}

export const ROADSIDE_PACKAGES = [
  { id: "eco", name: "Eco Paket", priceMinor: 75_000, currency: "TRY" },
  { id: "standard", name: "Standart Paket", priceMinor: 90_000, currency: "TRY" },
  { id: "pro", name: "PRO Paket", priceMinor: 150_000, currency: "TRY" },
] as const satisfies readonly RoadsidePackage[];

export const ROADSIDE_SALES_RULES = {
  paymentCollection: "manual",
  issuance: "dealer_panel",
  startsAt: "confirmed_payment_time",
  waitingPeriodHours: 24,
  termCalendarYears: 1,
  cancellation: {
    windowDays: 15,
    startsAt: "confirmed_payment_time",
    requiresNoServiceUsage: true,
    refundPercent: 100,
  },
  contactSettingsSource: "admin",
} as const;

import { z } from "zod";

/**
 * Quote Request Validation Schemas
 */
export const quoteRequestSchema = z.object({
  vehicleId: z.string().uuid({ message: "Geçersiz araç ID" }),
  userId: z.string().uuid().optional(),
  type: z.enum(["traffic", "casco", "assistance"], { message: "Geçersiz sigorta türü" })
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

import { z } from "zod";

export const createCheckoutSchema = z.object({
  offerId: z.string().uuid({ message: "Geçersiz teklif ID" }),
  userId: z.string().uuid({ message: "Geçersiz kullanıcı ID" })
});

export const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, { message: "Geçersiz kart numarası" }),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: "Geçersiz ay" }),
  expiryYear: z.string().regex(/^\d{2}$/, { message: "Geçersiz yıl" }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "Geçersiz CVV" }),
  holderName: z.string().min(3, { message: "Geçersiz kart sahibi ismi" })
});

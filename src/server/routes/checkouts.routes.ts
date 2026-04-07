import { Router, Request, Response } from "express";
import { CheckoutService } from "../modules/checkouts/checkout.service.js";
import { createCheckoutSchema, paymentSchema } from "../modules/checkouts/checkout.schemas.js";
import { ApiResponse } from "../types.js";
import { authMiddleware, AuthRequest } from "../lib/authMiddleware.js";

const router = Router();
const checkoutService = new CheckoutService();

/**
 * POST /api/checkouts/create
 * Initiates a new checkout session.
 */
router.post("/create", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const validation = createCheckoutSchema.safeParse({
      ...req.body,
      userId: req.user?.id
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Geçersiz giriş verisi.",
          details: validation.error.format()
        }
      } as ApiResponse<any>);
    }

    const checkout = await checkoutService.createCheckout(validation.data as any);

    return res.status(201).json({
      success: true,
      data: checkout
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error("[CheckoutsRoutes] Error in /create:", error.message);
    return res.status(500).json({
      success: false,
      error: { message: error.message || "Ödeme oturumu oluşturulurken bir hata oluştu." }
    } as ApiResponse<any>);
  }
});

/**
 * POST /api/checkouts/:checkoutId/pay
 * Processes payment for a checkout session.
 */
router.post("/:checkoutId/pay", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { checkoutId } = req.params;
    const userId = req.user?.id;
    const validation = paymentSchema.safeParse(req.body);

    if (!validation.success || !userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Geçersiz ödeme verisi veya yetkilendirme.",
          details: validation.error?.format()
        }
      } as ApiResponse<any>);
    }

    await checkoutService.processPayment(checkoutId, validation.data as any, userId);

    return res.status(200).json({
      success: true,
      data: { message: "Ödeme başarıyla tamamlandı, poliçe oluşturuldu." }
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error(`[CheckoutsRoutes] Error in /pay for ${req.params.checkoutId}:`, error.message);
    return res.status(500).json({
      success: false,
      error: { message: error.message || "Ödeme işlemi sırasında bir hata oluştu." }
    } as ApiResponse<any>);
  }
});

export default router;

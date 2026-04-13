import { Response } from "express";
import { CheckoutService } from "./checkout.service.js";
import { createCheckoutSchema, paymentSchema } from "./checkout.schemas.js";
import { AuthRequest } from "../../lib/authMiddleware.js";
import { ApiResponse } from "../../types.js";

export class CheckoutController {
  private checkoutService = new CheckoutService();

  async createCheckout(req: AuthRequest, res: Response) {
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

      const checkout = await this.checkoutService.createCheckout(validation.data as any);

      return res.status(201).json({
        success: true,
        data: checkout
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error("[CheckoutController] Error in createCheckout:", error.message);
      return res.status(500).json({
        success: false,
        error: { message: error.message || "Ödeme oturumu oluşturulurken bir hata oluştu." }
      } as ApiResponse<any>);
    }
  }

  async processPayment(req: AuthRequest, res: Response) {
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

      await this.checkoutService.processPayment(checkoutId, validation.data as any, userId);

      return res.status(200).json({
        success: true,
        data: { message: "Ödeme başarıyla tamamlandı, poliçe oluşturuldu." }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error(`[CheckoutController] Error in processPayment for ${req.params.checkoutId}:`, error.message);
      return res.status(500).json({
        success: false,
        error: { message: error.message || "Ödeme işlemi sırasında bir hata oluştu." }
      } as ApiResponse<any>);
    }
  }
}

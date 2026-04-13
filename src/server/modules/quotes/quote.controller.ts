import { Response } from "express";
import { QuoteService } from "./quote.service.js";
import { quoteRequestSchema } from "./quote.schemas.js";
import { AuthRequest } from "../../lib/authMiddleware.js";
import { ApiResponse } from "../../types.js";

export class QuoteController {
  private quoteService = new QuoteService();

  async requestQuotes(req: AuthRequest, res: Response) {
    try {
      const validation = quoteRequestSchema.safeParse({
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

      const requestId = await this.quoteService.requestQuotes(validation.data as any);

      return res.status(202).json({
        success: true,
        data: { requestId }
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error("[QuoteController] Error in requestQuotes:", error.message);
      return res.status(500).json({
        success: false,
        error: { message: error.message || "Teklif talebi oluşturulurken bir hata oluştu." }
      } as ApiResponse<any>);
    }
  }

  async getOffers(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;

      if (!requestId || !userId) {
        return res.status(400).json({
          success: false,
          error: { message: "Talep ID'si ve yetkilendirme gereklidir." }
        } as ApiResponse<any>);
      }

      const response = await this.quoteService.getOffers(requestId, userId);

      return res.status(200).json({
        success: true,
        data: response
      } as ApiResponse<any>);
    } catch (error: any) {
      console.error(`[QuoteController] Error in getOffers for ${req.params.requestId}:`, error.message);
      return res.status(500).json({
        success: false,
        error: { message: error.message || "Teklifler getirilirken bir hata oluştu." }
      } as ApiResponse<any>);
    }
  }
}

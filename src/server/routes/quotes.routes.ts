import { Router, Request, Response } from "express";
import { QuoteService } from "../modules/quotes/quote.service";
import { quoteRequestSchema } from "../modules/quotes/quote.schemas";
import { ApiResponse } from "../types";
import { authMiddleware, AuthRequest } from "../lib/authMiddleware";

const router = Router();
const quoteService = new QuoteService();

/**
 * POST /api/quotes/request
 * Initiates a new quote request.
 */
router.post("/request", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const validation = quoteRequestSchema.safeParse({
      ...req.body,
      userId: req.user?.id // Force current user ID
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

    const requestId = await quoteService.requestQuotes(validation.data as any);

    return res.status(202).json({
      success: true,
      data: { requestId }
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error("[QuotesRoutes] Error in /request:", error.message);
    return res.status(500).json({
      success: false,
      error: { message: error.message || "Teklif talebi oluşturulurken bir hata oluştu." }
    } as ApiResponse<any>);
  }
});

/**
 * GET /api/quotes/:requestId/offers
 * Fetches normalized offers for a quote request.
 */
router.get("/:requestId/offers", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.id;

    if (!requestId || !userId) {
      return res.status(400).json({
        success: false,
        error: { message: "Talep ID'si ve yetkilendirme gereklidir." }
      } as ApiResponse<any>);
    }

    const response = await quoteService.getOffers(requestId, userId);

    return res.status(200).json({
      success: true,
      data: response
    } as ApiResponse<any>);
  } catch (error: any) {
    console.error(`[QuotesRoutes] Error in /offers for ${req.params.requestId}:`, error.message);
    return res.status(500).json({
      success: false,
      error: { message: error.message || "Teklifler getirilirken bir hata oluştu." }
    } as ApiResponse<any>);
  }
});

export default router;

import { Router } from "express";
import { QuoteController } from "../modules/quotes/quote.controller.js";
import { authMiddleware } from "../lib/authMiddleware.js";

const router = Router();
const quoteController = new QuoteController();

/**
 * POST /api/quotes/request
 * Initiates a new quote request.
 */
router.post("/request", authMiddleware, (req, res) => quoteController.requestQuotes(req, res));

/**
 * GET /api/quotes/:requestId/offers
 * Fetches normalized offers for a quote request.
 */
router.get("/:requestId/offers", authMiddleware, (req, res) => quoteController.getOffers(req, res));

export default router;

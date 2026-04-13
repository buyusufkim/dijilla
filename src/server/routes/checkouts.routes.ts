import { Router } from "express";
import { CheckoutController } from "../modules/checkouts/checkout.controller.js";
import { authMiddleware } from "../lib/authMiddleware.js";

const router = Router();
const checkoutController = new CheckoutController();

/**
 * POST /api/checkouts/create
 * Initiates a new checkout session.
 */
router.post("/create", authMiddleware, (req, res) => checkoutController.createCheckout(req, res));

/**
 * POST /api/checkouts/:checkoutId/pay
 * Processes payment for a checkout session.
 */
router.post("/:checkoutId/pay", authMiddleware, (req, res) => checkoutController.processPayment(req, res));

export default router;

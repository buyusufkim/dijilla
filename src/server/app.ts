import express, { Request, Response, NextFunction } from "express";
import quotesRouter from "./routes/quotes.routes.js";
import checkoutsRouter from "./routes/checkouts.routes.js";

const app = express();

// Middleware
app.use(express.json());

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "Dijilla Insurtech Backend" });
});

// Routes
app.use("/api/quotes", quotesRouter);
app.use("/api/checkouts", checkoutsRouter);

// 404 Handler for API routes
app.use("/api", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: "İstenen kaynak bulunamadı." }
  });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[AppError]", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || "Sunucu tarafında bir hata oluştu."
    }
  });
});

export default app;

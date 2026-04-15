import express, { Request, Response, NextFunction } from "express";
import quotesRouter from "./routes/quotes.routes.js";
import checkoutsRouter from "./routes/checkouts.routes.js";
import aiRouter from "./routes/ai.routes.js";
import { isSupabaseConfigured } from "./lib/supabase.js";

const app = express();

// Middleware
app.use(express.json());

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ 
    status: "ok", 
    service: "Droto Insurtech Backend",
    config: {
      supabase: isSupabaseConfigured ? "configured" : "missing"
    }
  });
});

// Routes
app.use("/api/quotes", quotesRouter);
app.use("/api/checkouts", checkoutsRouter);
app.use("/api/ai", aiRouter);

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

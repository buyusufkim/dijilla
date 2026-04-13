import dotenv from "dotenv";
import app from "./src/server/app.js";
import { setupMiddleware } from "./src/server/setup.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await setupMiddleware(app);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Droto Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Startup failed:", err);
  process.exit(1);
});

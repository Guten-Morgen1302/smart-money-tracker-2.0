
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS
  app.use(cors());
  app.use(express.json());

  // Register API routes first
  registerRoutes(app);

  // Development vs Production setup
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // Development server
  if (process.env.NODE_ENV !== 'production') {
    const port = parseInt(process.env.PORT || '5000');
    server.listen(port, '0.0.0.0', () => {
      log(`serving on port ${port}`);
    });
  }

  return app;
}

// Start the server
const app = await startServer();

// Export for Vercel
export default app;

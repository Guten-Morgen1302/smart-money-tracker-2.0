
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files (built client assets)
const staticPath = path.join(__dirname, '../dist/public');
app.use(express.static(staticPath));

// Register API routes
registerRoutes(app);

// Serve the React app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath);
});

// Development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, '0.0.0.0', () => {
    console.log('[express] serving on port 5000');
  });
}

// Export for Vercel
export default app;

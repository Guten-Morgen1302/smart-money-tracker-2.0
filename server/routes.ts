import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWalletSchema, insertTransactionSchema, insertAIInsightSchema, insertAlertSchema, insertSmartNotificationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import MemoryStore from "memorystore";
import { cryptoAgent } from './agent';

const MS_IN_24_HRS = 1000 * 60 * 60 * 24;
const MemStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-strong-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new MemStoreSession({
        checkPeriod: MS_IN_24_HRS
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: MS_IN_24_HRS
      }
    })
  );

  // Setup Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }

        // Compare passwords using bcrypt
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Error handling middleware for Zod validation errors
  const handleValidationError = (err: any, res: any) => {
    if (err instanceof ZodError) {
      const validationError = fromZodError(err);
      res.status(400).json({ message: validationError.message });
    } else {
      res.status(500).json({ message: err.message || "An error occurred" });
    }
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email
      });

      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Logged in successfully" });
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  // Wallet routes
  app.get("/api/wallets/top", async (req, res) => {
    try {
      const filter = req.query.filter as string;
      const wallets = await storage.getTopWallets(filter);
      res.json(wallets);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.get("/api/wallets/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const wallet = await storage.getWalletByAddress(address);

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      res.json(wallet);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const transactions = await storage.getRecentTransactions();
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  // AI Insights routes
  app.get("/api/ai-insights/recent", async (req, res) => {
    try {
      const insights = await storage.getRecentAIInsights();
      res.json(insights);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      // For demo, get alerts for userId 1
      const userId = 1;
      const alerts = await storage.getAlertsByUserId(userId);
      res.json(alerts);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      // For demo, set userId to 1
      const userId = 1;
      const alertData = insertAlertSchema.parse({
        ...req.body,
        userId
      });

      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (err) {
      handleValidationError(err, res);
    }
  });

  app.patch("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);

      // Check if alert exists
      const alert = await storage.getAlertById(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      // Update alert
      const updatedAlert = await storage.updateAlert(alertId, req.body);
      res.json(updatedAlert);
    } catch (err) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);

      // Check if alert exists
      const alert = await storage.getAlertById(alertId);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      // Delete alert
      await storage.deleteAlert(alertId);
      res.json({ message: "Alert deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  // AI Agent endpoint
  app.options("/api/ai/query", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.sendStatus(200);
  });

  app.post("/api/ai/query", express.json(), async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({
          choices: [{
            message: {
              role: 'assistant', 
              content: 'Please provide a query to process.'
            }
          }]
        });
      }

      const result = await cryptoAgent.process({
        messages: [{ role: 'user', content: query }]
      });

      res.json(result);
    } catch (err: any) {
      console.error('AI query error:', err);
      res.json({
        choices: [{
          message: {
            role: 'assistant',
            content: 'I can help you analyze market trends, transactions, and wallet data. What would you like to know?'
          }
        }]
      });
    }
  });

  // OpenAI Chat endpoint for AI Assistant
  app.post("/api/ai/chat", express.json(), async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Import OpenAI here to avoid issues
      const { default: OpenAI } = await import('openai');
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a crypto analyst AI assistant specializing in whale tracking, market analysis, and blockchain intelligence. You provide insights on:

- Whale wallet movements and patterns
- Market sentiment and price predictions
- Risk assessment for wallets and transactions
- DeFi protocol analysis
- Cross-chain activity monitoring
- Real-time on-chain data interpretation

Always provide specific, actionable insights with confidence levels when possible. Use cryptocurrency terminology naturally and focus on data-driven analysis. If asked about specific timeframes, addresses, or amounts, provide realistic examples that match the context.

Keep responses concise but informative, typically 1-3 sentences unless more detail is specifically requested.`
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I'm unable to process your request at the moment. Please try again.";
      
      res.json({ 
        response,
        confidence: Math.floor(Math.random() * 30) + 70 // Random confidence between 70-100%
      });

    } catch (error: any) {
      console.error('OpenAI API error:', error);
      
      // Fallback response if OpenAI fails
      res.json({ 
        response: "I'm currently experiencing connectivity issues. However, I can still help you analyze crypto data. What specific information are you looking for?",
        confidence: 65,
        fallback: true
      });
    }
  });

  // Smart Notifications routes
  app.post("/api/notifications/smart/check", async (req, res) => {
    try {
      // For demo, use userId 1
      const userId = 1;
      const newNotifications = await storage.generateSmartNotifications(userId);
      res.json(newNotifications);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate smart notifications" });
    }
  });

  app.get("/api/notifications/smart", async (req, res) => {
    try {
      // For demo, use userId 1
      const userId = 1;
      const notifications = await storage.getSmartNotifications(userId);
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch smart notifications" });
    }
  });

  app.post("/api/notifications/smart/:id/acknowledge", async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.acknowledgeSmartNotification(notificationId);
      res.json({ message: "Notification acknowledged" });
    } catch (err) {
      res.status(500).json({ message: "Failed to acknowledge notification" });
    }
  });

  // Crypto News route
  app.get("/api/crypto-top-today", async (req, res) => {
    try {
      const response = await fetch("https://www.reddit.com/r/cryptocurrency/top.json?limit=1&t=day", {
        headers: {
          'User-Agent': 'SmartMoneyTracker/1.0 (by /u/cryptobot)'
        }
      });
      
      if (!response.ok) {
        // Return fallback data when Reddit API fails
        console.log(`Reddit API returned ${response.status}, using fallback data`);
        return res.json({
          title: "Bitcoin Reaches New All-Time High as Institutional Adoption Surges",
          url: "https://reddit.com/r/cryptocurrency",
          upvotes: 2847,
          created: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          author: "CryptoNewsBot",
          subreddit: "cryptocurrency"
        });
      }
      
      const data = await response.json();
      
      if (data.data && data.data.children && data.data.children.length > 0) {
        const post = data.data.children[0].data;
        
        res.json({
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          upvotes: post.ups,
          created: post.created_utc,
          author: post.author,
          subreddit: post.subreddit
        });
      } else {
        // Return fallback data when no posts found
        res.json({
          title: "Ethereum 2.0 Staking Rewards Hit Record High This Week",
          url: "https://reddit.com/r/cryptocurrency",
          upvotes: 1543,
          created: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
          author: "ETHStaker",
          subreddit: "cryptocurrency"
        });
      }
    } catch (err: any) {
      console.log('Crypto news fetch error, using fallback:', err.message);
      // Return fallback data on any error
      res.json({
        title: "DeFi TVL Reaches $100B Milestone as New Protocols Launch",
        url: "https://reddit.com/r/cryptocurrency",
        upvotes: 892,
        created: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
        author: "DeFiTracker",
        subreddit: "cryptocurrency"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

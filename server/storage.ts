import { users, type User, type InsertUser, wallets, type Wallet, type InsertWallet, transactions, type Transaction, type InsertTransaction, aiInsights, type AIInsight, type InsertAIInsight, alerts, type Alert, type InsertAlert, smartNotifications, type SmartNotification, type InsertSmartNotification } from "@shared/schema";
import { generateActivityData } from "@/lib/utils";

// Interface for storage methods
export interface IStorage { 
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet operations
  getTopWallets(filter?: string): Promise<Wallet[]>;
  getWalletByAddress(address: string): Promise<Wallet | undefined>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  
  // AI Insight operations
  getRecentAIInsights(limit?: number): Promise<AIInsight[]>;
  
  // Alert operations
  getAlertsByUserId(userId: number): Promise<Alert[]>;
  getAlertById(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, data: Partial<Alert>): Promise<Alert>;
  deleteAlert(id: number): Promise<void>;
  
  // Smart Notification operations
  getSmartNotifications(userId: number): Promise<SmartNotification[]>;
  createSmartNotification(data: InsertSmartNotification): Promise<SmartNotification>;
  acknowledgeSmartNotification(id: number): Promise<void>;
  generateSmartNotifications(userId: number): Promise<SmartNotification[]>;
}

export class MemStorage implements IStorage {
  // Storage maps
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private aiInsights: Map<number, AIInsight>;
  private alerts: Map<number, Alert>;
  private smartNotifications: Map<number, SmartNotification>;
  
  // ID counters
  private userIdCounter: number;
  private walletIdCounter: number;
  private transactionIdCounter: number;
  private aiInsightIdCounter: number;
  private alertIdCounter: number;
  private smartNotificationIdCounter: number;
  
  // User spending data for smart notifications (simulated)
  private userSpendingData: Map<number, {
    category: string;
    currentMonth: number;
    previousMonth: number;
    historicalAverage: number;
    threshold?: number;
  }[]>;
  
  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.aiInsights = new Map();
    this.alerts = new Map();
    this.smartNotifications = new Map();
    
    this.userIdCounter = 1;
    this.walletIdCounter = 1;
    this.transactionIdCounter = 1;
    this.aiInsightIdCounter = 1;
    this.alertIdCounter = 1;
    this.smartNotificationIdCounter = 1;
    this.userSpendingData = new Map();
    
    // Initialize sample spending data for smart notifications
    this.userSpendingData.set(1, [
      {
        category: "BTC",
        currentMonth: 12500,
        previousMonth: 8200,
        historicalAverage: 9500,
        threshold: 15000
      },
      {
        category: "ETH",
        currentMonth: 8500,
        previousMonth: 7800,
        historicalAverage: 7200,
        threshold: 10000
      },
      {
        category: "SOL",
        currentMonth: 2800,
        previousMonth: 1900,
        historicalAverage: 2100,
        threshold: 3000
      },
      {
        category: "USDC",
        currentMonth: 5200,
        previousMonth: 4100,
        historicalAverage: 4800
      }
    ]);
    
    // Initialize with sample data
    this.initSampleData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Wallet operations
  async getTopWallets(filter?: string): Promise<Wallet[]> {
    let wallets = Array.from(this.wallets.values());
    
    // Apply filter if provided
    if (filter && filter !== "All") {
      wallets = wallets.filter(wallet => wallet.type === filter);
    }
    
    // Sort by balance (descending)
    return wallets.sort((a, b) => {
      const aValue = parseFloat(a.balance.replace(/[^0-9.-]+/g, ""));
      const bValue = parseFloat(b.balance.replace(/[^0-9.-]+/g, ""));
      return bValue - aValue;
    });
  }
  
  async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.address === address
    );
  }
  
  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  
  async getRecentTransactions(limit: number = 4): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, limit);
  }
  
  // AI Insight operations
  async getRecentAIInsights(limit: number = 3): Promise<AIInsight[]> {
    return Array.from(this.aiInsights.values())
      .sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, limit);
  }
  
  // Alert operations
  async getAlertsByUserId(userId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async getAlertById(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const newAlert: Alert = {
      ...alert,
      id,
      createdAt: new Date().toISOString()
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }
  
  async updateAlert(id: number, data: Partial<Alert>): Promise<Alert> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error("Alert not found");
    }
    
    const updatedAlert: Alert = {
      ...alert,
      ...data
    };
    
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  async deleteAlert(id: number): Promise<void> {
    if (!this.alerts.has(id)) {
      throw new Error("Alert not found");
    }
    
    this.alerts.delete(id);
  }
  
  // Helper method to initialize sample data
  private initSampleData(): void {
    // Sample wallets
    const sampleWallets: Omit<Wallet, "id" | "createdAt">[] = [
      {
        address: "0x7a250d5",
        type: "Smart Money",
        balance: "$145.2M",
        monthChange: "+12.5% MoM",
        riskScore: 82,
        aiRating: "Bullish",
        activityData: [3, 4, 5, 4, 6, 7, 8, 7, 9, 8, 10, 11, 12]
      },
      {
        address: "0x9b32f81d",
        type: "Institution",
        balance: "$278.5M",
        monthChange: "+8.2% MoM",
        riskScore: 75,
        aiRating: "Bullish",
        activityData: [8, 7, 6, 8, 9, 8, 9, 10, 11, 10, 9, 10, 11]
      },
      {
        address: "0x3f56d9e3",
        type: "Smart Money",
        balance: "$92.1M",
        monthChange: "+23.8% MoM",
        riskScore: 88,
        aiRating: "Bullish",
        activityData: [5, 6, 8, 10, 9, 11, 12, 14, 15, 16, 15, 17, 18]
      },
      {
        address: "0x8c714fe7",
        type: "Risk Alert",
        balance: "$58.6M",
        monthChange: "-5.1% MoM",
        riskScore: 91,
        aiRating: "Bearish",
        activityData: [12, 10, 9, 8, 10, 8, 7, 6, 5, 6, 4, 3, 4]
      }
    ];
    
    sampleWallets.forEach(wallet => {
      const id = this.walletIdCounter++;
      this.wallets.set(id, {
        ...wallet,
        id,
        createdAt: new Date().toISOString()
      });
    });
    
    // Sample transactions
    const sampleTransactions: Omit<Transaction, "id" | "timestamp">[] = [
      {
        type: "Large Transfer",
        fromAddress: "0x7a25d7f96a4e1fe2",
        toAddress: "0x9b32f81d8ad1",
        amount: "245 BTC",
        asset: "BTC",
        category: "Exchange Outflow",
        riskScore: 72
      },
      {
        type: "Whale Movement",
        fromAddress: "0x3f56d9e3",
        toAddress: "0x8c714fe7",
        amount: "12,450 ETH",
        asset: "ETH",
        category: "Validator Deposit",
        riskScore: 68
      },
      {
        type: "Smart Contract",
        fromAddress: "0x2a557fc3",
        toAddress: "Contract",
        amount: "1.2M USDC",
        asset: "USDC",
        category: "DeFi Interaction",
        riskScore: 45
      },
      {
        type: "Exchange Deposit",
        fromAddress: "0x9f882ad5",
        toAddress: "Binance",
        amount: "18,320 SOL",
        asset: "SOL",
        category: "Potential Sell",
        riskScore: 82
      }
    ];
    
    // Create transactions with timestamps spaced apart
    sampleTransactions.forEach((transaction, index) => {
      const id = this.transactionIdCounter++;
      const minutesAgo = [2, 12, 28, 45][index];
      
      this.transactions.set(id, {
        ...transaction,
        id,
        timestamp: new Date(Date.now() - minutesAgo * 60 * 1000).toISOString()
      });
    });
    
    // Sample AI Insights
    const sampleInsights: Omit<AIInsight, "id" | "timestamp">[] = [
      {
        title: "BTC Accumulation Alert",
        description: "AI detected unusual accumulation pattern among top 5 BTC whales. Historically, this pattern precedes a 12-15% price increase within 2 weeks.",
        icon: "ri-flashlight-line",
        confidence: 86,
        category: "BTC Accumulation",
        color: "blue"
      },
      {
        title: "ETH Exchange Outflows",
        description: "Large ETH outflows detected from major exchanges. Supply shock possible as staking ratio increases simultaneously.",
        icon: "ri-radar-line",
        confidence: 78,
        category: "Exchange Activity",
        color: "purple"
      },
      {
        title: "DeFi Protocol Attention",
        description: "AI detected significant smart money movement into new DeFi protocol. TVL increased 215% in 48 hours with whale wallet participation.",
        icon: "ri-bubble-chart-line",
        confidence: 72,
        category: "DeFi",
        color: "green"
      }
    ];
    
    // Create insights with timestamps spaced apart
    sampleInsights.forEach((insight, index) => {
      const id = this.aiInsightIdCounter++;
      const hoursAgo = [2, 5, 24][index];
      
      this.aiInsights.set(id, {
        ...insight,
        id,
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
      });
    });
    
    // Sample user with hashed password (password: "password")
    const sampleUser: User = {
      id: this.userIdCounter++,
      username: "demo",
      password: "$2b$10$8D3kSYQGJ9UEAVYPZtp0sO66X5/4XpbUFWA0.0JY3cZZKzVwJ8N1.", // bcrypt hash for "password"
      email: "demo@example.com",
      createdAt: new Date().toISOString()
    };
    
    this.users.set(sampleUser.id, sampleUser);
    
    // Sample alerts for the demo user
    const sampleAlerts: Omit<Alert, "id" | "createdAt">[] = [
      {
        userId: 1,
        title: "Large BTC Transfers",
        condition: "Transaction amount > 100 BTC",
        active: true
      },
      {
        userId: 1,
        title: "Whale Wallet Activity",
        condition: "Wallet 0x7a25...1fe2 transactions",
        active: true
      },
      {
        userId: 1,
        title: "Exchange Outflows",
        condition: "ETH exchange outflows > 5000 ETH",
        active: false
      }
    ];
    
    // Create alerts with timestamps spaced apart
    sampleAlerts.forEach((alert, index) => {
      const id = this.alertIdCounter++;
      const daysAgo = [2, 5, 7][index];
      
      this.alerts.set(id, {
        ...alert,
        id,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
      });
    });
  }
  
  // Smart Notifications Methods
  async getSmartNotifications(userId: number): Promise<SmartNotification[]> {
    return Array.from(this.smartNotifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  
  async createSmartNotification(data: InsertSmartNotification): Promise<SmartNotification> {
    const id = this.smartNotificationIdCounter++;
    const notification: SmartNotification = {
      ...data,
      id,
      createdAt: new Date().toISOString()
    };
    
    this.smartNotifications.set(id, notification);
    return notification;
  }
  
  async acknowledgeSmartNotification(id: number): Promise<void> {
    const notification = this.smartNotifications.get(id);
    if (notification) {
      this.smartNotifications.set(id, { ...notification, acknowledged: true });
    }
  }
  
  async generateSmartNotifications(userId: number): Promise<SmartNotification[]> {
    const spendingData = this.userSpendingData.get(userId) || [];
    const newNotifications: SmartNotification[] = [];
    
    for (const data of spendingData) {
      const { category, currentMonth, previousMonth, historicalAverage, threshold } = data;
      
      // Check for threshold warnings
      if (threshold && currentMonth >= threshold) {
        const existing = Array.from(this.smartNotifications.values())
          .find(n => n.userId === userId && n.category === category && 
                    n.triggerType === 'THRESHOLD' && !n.acknowledged);
        
        if (!existing) {
          const notification = await this.createSmartNotification({
            userId,
            title: `${category} Spending Threshold Reached`,
            description: `You've reached your spending threshold for ${category}. Current: $${currentMonth.toLocaleString()}, Threshold: $${threshold.toLocaleString()}`,
            category,
            triggerType: 'THRESHOLD',
            triggerValue: threshold.toString(),
            acknowledged: false
          });
          newNotifications.push(notification);
        }
      }
      
      // Check for month-to-month increases
      const monthlyIncrease = ((currentMonth - previousMonth) / previousMonth) * 100;
      if (monthlyIncrease > 20) {
        const existing = Array.from(this.smartNotifications.values())
          .find(n => n.userId === userId && n.category === category && 
                    n.triggerType === 'MONTHLY_COMPARISON' && !n.acknowledged);
        
        if (!existing) {
          const notification = await this.createSmartNotification({
            userId,
            title: `${category} Monthly Spending Spike`,
            description: `Your ${category} expenses have risen by ${monthlyIncrease.toFixed(1)}% since last month. Current: $${currentMonth.toLocaleString()}, Previous: $${previousMonth.toLocaleString()}`,
            category,
            triggerType: 'MONTHLY_COMPARISON',
            triggerValue: monthlyIncrease.toFixed(1),
            acknowledged: false
          });
          newNotifications.push(notification);
        }
      }
      
      // Check for trend deviations
      const trendDeviation = ((currentMonth - historicalAverage) / historicalAverage) * 100;
      if (trendDeviation > 20) {
        const existing = Array.from(this.smartNotifications.values())
          .find(n => n.userId === userId && n.category === category && 
                    n.triggerType === 'TREND' && !n.acknowledged);
        
        if (!existing) {
          const notification = await this.createSmartNotification({
            userId,
            title: `${category} Spending Pattern Alert`,
            description: `Your ${category} spending is ${trendDeviation.toFixed(1)}% higher than your usual trend. Current: $${currentMonth.toLocaleString()}, Average: $${historicalAverage.toLocaleString()}`,
            category,
            triggerType: 'TREND',
            triggerValue: trendDeviation.toFixed(1),
            acknowledged: false
          });
          newNotifications.push(notification);
        }
      }
    }
    
    return newNotifications;
  }
}

export const storage = new MemStorage();

import { z } from 'zod';
import OpenAI from 'openai';
import { storage } from './storage';

// OpenServ SDK Agent implementation
class Agent {
  private systemPrompt: string;
  private capabilities: any[] = [];
  private openai: OpenAI | null = null;
  private openservApiKey: string | undefined;

  constructor({ systemPrompt }: { systemPrompt: string }) {
    this.systemPrompt = systemPrompt;
    this.openservApiKey = process.env.OPENSERV_API_KEY || '';

    // Initialize OpenAI if API key is available
    const apiKey = process.env.OPENAI_API_KEY || '';
    this.openai = new OpenAI({
      apiKey
    });

    if (!apiKey && !this.openservApiKey) {
      console.warn('API keys not found. Using fallback capabilities.');
    }
  }

  addCapability({ name, description, schema, run }: any) {
    this.capabilities.push({
      name,
      description,
      schema,
      run
    });
    return this;
  }

  async process({ messages }: { messages: any[] }) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.');
    }

    try {
      const userMessage = messages.find(m => m.role === 'user')?.content || '';

      // Use OpenServ SDK if available
      if (this.openservApiKey) {
        try {
          // Find the appropriate capability based on message content
          for (const capability of this.capabilities) {
            if (this.shouldUseCapability(userMessage, capability)) {
              // Use OpenServ SDK to process the capability
              const args = this.extractArgs(userMessage, capability);

              // In a production environment, this would use the OpenServ SDK
              // For now, we'll just call our capabilities directly
              const result = await capability.run({ args });

              return {
                choices: [
                  {
                    message: {
                      role: 'assistant',
                      content: result
                    }
                  }
                ]
              };
            }
          }
        } catch (error: any) {
          console.error('OpenServ SDK error:', error);
          // Fall back to standard capabilities if OpenServ fails
        }
      }

      // Use standard capabilities if OpenServ is not available or failed
      for (const capability of this.capabilities) {
        if (this.shouldUseCapability(userMessage, capability)) {
          try {
            const args = this.extractArgs(userMessage, capability);
            const result = await capability.run({ args });

            return {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: result
                  }
                }
              ]
            };
          } catch (error: any) {
            return {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: `Error processing request: ${error.message}`
                  }
                }
              ]
            };
          }
        }
      }

      // If no capability matched, try OpenAI with fallback
      if (this.openai) {
        try {
          const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: this.systemPrompt },
              ...messages
            ]
          });

          return {
            choices: response.choices
          };
        } catch (error: any) {
          // Handle quota errors by falling back to local capabilities
          if (error?.error?.type === 'insufficient_quota') {
            return {
              choices: [{
                message: {
                  role: 'assistant',
                  content: "I can help you with:\n- Market trends\n- Wallet information\n- Transaction history\n- AI insights\n\nPlease ask about one of these topics!"
                }
              }]
            };
          }
          throw error;
        }
      }

      // Fallback if OpenAI call fails
      return {
        choices: [
          {
            message: {
              role: 'assistant',
              content: "I'm not sure how to help with that specific request. You can ask me about cryptocurrency market trends, wallet information, or transactions."
            }
          }
        ]
      };
    } catch (error: any) {
      console.error("Error processing agent request:", error);

      // Handle rate limit errors specifically
      if (error?.status === 429) {
        return {
          choices: [
            {
              message: {
                role: 'assistant',
                content: `I'm currently experiencing high traffic. In the meantime, I can help you with:\n- Market trends\n- Wallet information\n- Transaction history\n- AI insights\n\nPlease try one of these topics!`
              }
            }
          ]
        };
      }

      // Generic error fallback
      return {
        choices: [
          {
            message: {
              role: 'assistant',
              content: `I'm having trouble accessing some of my capabilities right now. You can still ask me about market trends, wallet information, or view recent transactions.`
            }
          }
        ]
      };
    }
  }

  private shouldUseCapability(userMessage: string, capability: any): boolean {
    const message = userMessage.toLowerCase();

    switch (capability.name) {
      case 'getMarketTrends':
        return message.includes('market') || 
               message.includes('trend') || 
               message.includes('price');
      case 'getWalletInfo':
        return message.includes('wallet') || 
               message.includes('address') || 
               message.includes('balance');
      case 'getTransactionInfo':
        return message.includes('transaction') || 
               message.includes('transfer') || 
               message.includes('sent') || 
               message.includes('received');
      case 'getAIInsights':
        return message.includes('insight') || 
               message.includes('predict') || 
               message.includes('analysis') ||
               message.includes('ai');
      default:
        return false;
    }
  }

  private extractArgs(userMessage: string, capability: any): any {
    // This is a simplified implementation - in a real agent this would be done by the LLM
    const message = userMessage.toLowerCase();

    switch (capability.name) {
      case 'getWalletInfo': {
        // Basic regex to extract wallet addresses (0x followed by alphanumeric)
        const addressMatch = userMessage.match(/0x[a-fA-F0-9]+/);
        return { address: addressMatch ? addressMatch[0] : null };
      }
      case 'getTransactionInfo': {
        // Check if message mentions recent transactions
        const isRecent = message.includes('recent') || message.includes('latest');
        const limit = isRecent ? 5 : 10;
        return { limit };
      }
      case 'getAIInsights': {
        // Check for specific insight requests
        const insights = {
          price: message.includes('price'),
          whale: message.includes('whale'),
          market: message.includes('market'),
          trend: message.includes('trend')
        };
        return { insights };
      }
      default:
        return {};
    }
  }

  start(port = 7378) {
    console.log(`[Agent] OpenServ SDK agent running on port ${port}`);
    // In a production OpenServ implementation, this would start the HTTP server
    return this;
  }
}

// Create the crypto market intelligence agent
export const cryptoAgent = new Agent({
  systemPrompt: 'You are an AI assistant for Smart Money Tracker, a cyberpunk-themed platform for monitoring cryptocurrency market trends, whale transactions, and wallet insights. Provide detailed, accurate information about crypto markets, wallets, and transactions.'
});

// Add capabilities based on our existing functions
cryptoAgent.addCapability({
  name: 'getMarketTrends',
  description: 'Get current cryptocurrency market trends and data',
  schema: z.object({
    timeframe: z.string().optional(),
    limit: z.number().optional()
  }),
  async run({ args }: any) {
    // Mock data - in real implementation this would use real market data
    const trendDescription = "Bitcoin has shown a 5% increase over the last 24 hours, with Ethereum following at 3.2%. The overall market sentiment is bullish based on on-chain metrics, with accumulation patterns visible among whale wallets. Trading volume has increased by 12% across major exchanges.";

    return `Market Trend Analysis:\n${trendDescription}`;
  }
});

cryptoAgent.addCapability({
  name: 'getWalletInfo',
  description: 'Get information about a specific wallet address',
  schema: z.object({
    address: z.string().nullable()
  }),
  async run({ args }: any) {
    try {
      if (!args.address) {
        return "Please provide a wallet address to analyze.";
      }

      // Get wallet from storage
      const wallet = await storage.getWalletByAddress(args.address);

      if (!wallet) {
        return `No information found for wallet address ${args.address}. This address may not be tracked in our system or may be incorrect.`;
      }

      return `
Wallet Analysis for ${args.address}:
Type: ${wallet.type}
Balance: ${wallet.balance} 
Monthly Change: ${wallet.monthChange}
Risk Score: ${wallet.riskScore}/10
AI Rating: ${wallet.aiRating}

This ${wallet.type.toLowerCase()} wallet has been showing ${wallet.monthChange && wallet.monthChange.startsWith('+') ? 'accumulation' : 'distribution'} patterns recently.
`;
    } catch (error: any) {
      return `Error retrieving wallet information: ${error.message}`;
    }
  }
});

cryptoAgent.addCapability({
  name: 'getTransactionInfo',
  description: 'Get information about recent cryptocurrency transactions',
  schema: z.object({
    limit: z.number().optional()
  }),
  async run({ args }: any) {
    try {
      const limit = args.limit || 3;
      const transactions = await storage.getRecentTransactions(limit);

      if (!transactions.length) {
        return "No recent transactions found.";
      }

      let response = `Recent Transactions (${transactions.length}):\n\n`;

      transactions.forEach((tx, i) => {
        response += `${i+1}. ${tx.type}: ${tx.amount} ${tx.asset}\n`;
        response += `   From: ${tx.fromAddress} → To: ${tx.toAddress}\n`;
        response += `   Category: ${tx.category} | Risk Score: ${tx.riskScore}/10\n`;
        response += `   Time: ${tx.timestamp}\n\n`;
      });

      return response;
    } catch (error: any) {
      return `Error retrieving transaction information: ${error.message}`;
    }
  }
});

cryptoAgent.addCapability({
  name: 'getAIInsights',
  description: 'Get AI-powered insights about cryptocurrency trends and predictions',
  schema: z.object({
    insights: z.object({
      price: z.boolean().optional(),
      whale: z.boolean().optional(),
      market: z.boolean().optional(),
      trend: z.boolean().optional()
    }).optional()
  }),
  async run({ args }: any) {
    try {
      const insights = await storage.getRecentAIInsights(5);

      if (!insights.length) {
        return "No AI insights available at this time.";
      }

      let response = "AI-Powered Crypto Insights:\n\n";

      insights.forEach((insight, i) => {
        response += `${i+1}. ${insight.title}\n`;
        response += `   ${insight.description}\n`;
        response += `   Confidence: ${insight.confidence}% | Category: ${insight.category}\n\n`;
      });

      return response;
    } catch (error: any) {
      return `Error retrieving AI insights: ${error.message}`;
    }
  }
});

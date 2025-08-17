import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Copy, Pin, StopCircle, Paperclip, TrendingUp, AlertTriangle, Zap } from "lucide-react";

// Types
type Message = {
  id: string;
  type: "user" | "ai" | "thinking";
  content: string;
  timestamp: Date;
  confidence?: number;
  isStreaming?: boolean;
  isStopped?: boolean;
};

type ContextWidget = "price" | "whale" | "alerts" | "subnet" | null;

type Chain = "all" | "eth" | "avax" | "subnets";

// Animated Background Orbs
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full opacity-20 blur-3xl ${
            i % 4 === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' :
            i % 4 === 1 ? 'bg-gradient-to-r from-purple-500 to-teal-500' :
            i % 4 === 2 ? 'bg-gradient-to-r from-teal-400 to-green-500' :
            'bg-gradient-to-r from-green-400 to-indigo-500'
          }`}
          style={{
            width: `${200 + i * 50}px`,
            height: `${200 + i * 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

// Thinking Animation Component
function ThinkingMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="flex items-start space-x-3 mb-4"
    >
      <motion.div
        className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center"
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(6, 182, 212, 0.5)",
            "0 0 30px rgba(168, 85, 247, 0.7)",
            "0 0 20px rgba(6, 182, 212, 0.5)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🤖
      </motion.div>
      <div className="flex-1">
        <motion.div
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl rounded-tl-sm p-4 shadow-lg"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          whileHover={{ 
            rotateX: 2, 
            rotateY: -2,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-cyan-400 font-medium">Thinking</span>
            <motion.div className="flex space-x-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                />
              ))}
            </motion.div>
          </div>
          <p className="text-sm text-gray-300">
            Analyzing on-chain, social & price signals...
          </p>
          <motion.div
            className="mt-3 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 0.7, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Confidence Ring Component
function ConfidenceRing({ confidence }: { confidence: number }) {
  const circumference = 2 * Math.PI * 18;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;
  
  return (
    <div className="relative w-10 h-10">
      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2"
        />
        <motion.circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={confidence >= 80 ? "#10b981" : confidence >= 60 ? "#f59e0b" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {confidence}
      </span>
    </div>
  );
}

// Chat Message Component
function ChatMessage({ 
  message, 
  onCopy, 
  onPin, 
  onStop 
}: { 
  message: Message;
  onCopy: (content: string) => void;
  onPin: (content: string) => void;
  onStop: (id: string) => void;
}) {
  const isUser = message.type === "user";
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(message.isStreaming || false);

  // Typewriter effect for AI messages
  useEffect(() => {
    if (message.type === "ai" && message.isStreaming) {
      setIsTyping(true);
      let currentIndex = 0;
      const content = message.content;
      
      const typeTimer = setInterval(() => {
        if (currentIndex < content.length) {
          setDisplayText(content.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeTimer);
        }
      }, 60);
      
      return () => clearInterval(typeTimer);
    } else {
      setDisplayText(message.content);
    }
  }, [message.content, message.isStreaming, message.type]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      data-testid={`message-${message.id}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
          🤖
        </div>
      )}
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : ''}`}>
        <motion.div
          className={`relative backdrop-blur-md border rounded-2xl p-4 shadow-lg ${
            isUser 
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-cyan-400/30 rounded-tr-sm'
              : 'bg-white/10 border-white/20 rounded-tl-sm'
          }`}
          whileHover={{ 
            rotateX: isUser ? -2 : 2, 
            rotateY: isUser ? 2 : -2,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Streaming progress bar */}
          {isTyping && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-t-2xl"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 0.7, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          
          <div className="flex items-start justify-between">
            <p className="text-sm text-white flex-1 leading-relaxed">
              {displayText}
              {isTyping && (
                <motion.span
                  className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </p>
            
            {!isUser && message.confidence && (
              <div className="ml-3">
                <ConfidenceRing confidence={message.confidence} />
              </div>
            )}
          </div>
          
          {/* Action buttons for AI messages */}
          {!isUser && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-white/10"
                  onClick={() => onCopy(message.content)}
                  data-testid="button-copy"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:bg-white/10"
                  onClick={() => onPin(message.content)}
                  data-testid="button-pin"
                >
                  <Pin className="w-3 h-3 mr-1" />
                  Pin
                </Button>
                {isTyping && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs hover:bg-red-500/20 text-red-400"
                    onClick={() => onStop(message.id)}
                    data-testid="button-stop"
                  >
                    <StopCircle className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                )}
              </div>
              
              {message.isStopped && (
                <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                  Stopped
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
          👤
        </div>
      )}
    </motion.div>
  );
}

// Price Widget Component
function PriceWidget({ symbol = "BTC" }: { symbol?: string }) {
  const [price, setPrice] = useState(43250);
  const [change, setChange] = useState(2.34);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{symbol}/USD</span>
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <div className="space-y-1">
        <div className="text-xl font-orbitron font-bold">
          ${price.toLocaleString()}
        </div>
        <div className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change}% (24h)
        </div>
        <div className="w-full h-8 mt-2">
          <svg viewBox="0 0 100 30" className="w-full h-full">
            <motion.path
              d="M0,25 Q25,15 50,20 T100,10"
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2 }}
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

// Whale Leaderboard Widget
function WhaleWidget() {
  const whales = [
    { addr: "0x3f5...7aE2", move: "+$45M BTC", time: "2h ago" },
    { addr: "0x742...9B4f", move: "-$23M ETH", time: "4h ago" },
    { addr: "0x1a9...3D1e", move: "+$67M USDC", time: "6h ago" },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Whale Moves</span>
        <span className="text-xs text-gray-400">Live</span>
      </div>
      <div className="space-y-2">
        {whales.map((whale, index) => (
          <motion.div
            key={whale.addr}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between text-xs"
          >
            <span className="font-mono text-gray-300">{whale.addr}</span>
            <div className="text-right">
              <div className={whale.move.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                {whale.move}
              </div>
              <div className="text-gray-400">{whale.time}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Alerts Widget
function AlertsWidget() {
  const [alerts, setAlerts] = useState([
    { id: 1, name: "BTC > $45K", active: true },
    { id: 2, name: "ETH Whale Alert", active: false },
    { id: 3, name: "DeFi TVL Drop", active: true },
  ]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Active Alerts</span>
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{alert.name}</span>
            <motion.button
              className={`w-8 h-4 rounded-full border ${
                alert.active ? 'bg-green-400 border-green-400' : 'bg-gray-600 border-gray-600'
              }`}
              onClick={() => setAlerts(prev => 
                prev.map(a => a.id === alert.id ? { ...a, active: !a.active } : a)
              )}
              whileTap={{ scale: 0.95 }}
              data-testid={`toggle-alert-${alert.id}`}
            >
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={{ x: alert.active ? 4 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Subnet Heatmap Widget (for Avalanche)
function SubnetWidget() {
  const subnets = [
    { name: "DeFi Kings", wallets: 1250, tx: 4500, size: "large" },
    { name: "GameFi Hub", wallets: 890, tx: 2300, size: "medium" },
    { name: "Social Layer", wallets: 450, tx: 1200, size: "small" },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Subnet Activity</span>
        <span className="text-xs text-red-400">🔺 AVAX</span>
      </div>
      <div className="space-y-2">
        {subnets.map((subnet, index) => (
          <motion.div
            key={subnet.name}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div 
                className={`rounded-full bg-gradient-to-r from-red-400 to-orange-500 ${
                  subnet.size === 'large' ? 'w-4 h-4' : subnet.size === 'medium' ? 'w-3 h-3' : 'w-2 h-2'
                }`}
              />
              <span className="text-xs">{subnet.name}</span>
            </div>
            <div className="text-xs text-gray-400">
              {subnet.wallets} wallets
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// System Messages Carousel
function SystemMessages() {
  const messages = [
    "Your AI Whale Tracker 🐋",
    "Stay Ahead of Smart Money 💸",
    "Predict. Protect. Profit.",
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [messages.length]);
  
  return (
    <div className="text-center mb-6">
      <AnimatePresence mode="wait">
        <motion.h2
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-orbitron bg-gradient-to-r from-cyan-400 via-purple-500 to-green-400 bg-clip-text text-transparent"
        >
          {messages[currentIndex]}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activeWidget, setActiveWidget] = useState<ContextWidget>("price");
  const [selectedChain, setSelectedChain] = useState<Chain>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const quickPrompts = [
    { text: "Top Whale Moves", intent: "whale" },
    { text: "Wallet Risk Check", intent: "wallet" },
    { text: "AI Market Prediction", intent: "price" },
    { text: "Explain in Simple Words", intent: "explain" },
    { text: "🔺 Avalanche Whale Inflows", intent: "avax" },
  ];
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Intent detection
  const detectIntent = useCallback((text: string): ContextWidget => {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('btc') || lower.includes('eth')) return 'price';
    if (lower.includes('whale') || lower.includes('top wallet')) return 'whale';
    if (lower.includes('alert') || lower.includes('notify')) return 'alerts';
    if (lower.includes('subnet') || lower.includes('avalanche') || lower.includes('avax')) return 'subnet';
    return null;
  }, []);
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    
    const thinkingMessage: Message = {
      id: Date.now().toString() + "_thinking",
      type: "thinking",
      content: "",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage, thinkingMessage]);
    setInputValue("");
    
    // Detect intent and update widget
    const intent = detectIntent(content);
    if (intent) {
      setActiveWidget(intent);
    }
    
    // Simulate thinking delay
    const thinkingDelay = Math.random() * 600 + 900; // 900-1500ms
    
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== thinkingMessage.id));
      
      const aiMessage: Message = {
        id: Date.now().toString() + "_ai",
        type: "ai",
        content: generateAIResponse(content),
        timestamp: new Date(),
        confidence: Math.floor(Math.random() * 30) + 70,
        isStreaming: true,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, thinkingDelay);
  }, [detectIntent]);
  
  const generateAIResponse = (prompt: string): string => {
    const lower = prompt.toLowerCase().trim();
    
    // Extract time periods from the query
    const extractTimeFrame = (text: string) => {
      if (text.includes('30 min') || text.includes('30min')) return '30 minutes';
      if (text.includes('1 hour') || text.includes('1hr')) return '1 hour';
      if (text.includes('2 hour') || text.includes('2hr')) return '2 hours';
      if (text.includes('6 hour') || text.includes('6hr')) return '6 hours';
      if (text.includes('24 hour') || text.includes('24hr') || text.includes('1 day')) return '24 hours';
      if (text.includes('1 week')) return '1 week';
      return '6 hours'; // default
    };
    
    // Extract cryptocurrency from query
    const extractCrypto = (text: string) => {
      if (text.includes('avax') || text.includes('avalanche')) return 'AVAX';
      if (text.includes('btc') || text.includes('bitcoin')) return 'BTC';
      if (text.includes('eth') || text.includes('ethereum')) return 'ETH';
      if (text.includes('usdc')) return 'USDC';
      if (text.includes('usdt')) return 'USDT';
      return 'BTC'; // default
    };
    
    // Extract transaction type
    const getTransactionType = (text: string) => {
      if (text.includes('inflow') || text.includes('deposit')) return 'inflows to exchanges';
      if (text.includes('outflow') || text.includes('withdrawal')) return 'outflows from exchanges';
      return 'movements';
    };
    
    const timeFrame = extractTimeFrame(lower);
    const crypto = extractCrypto(lower);
    const transactionType = getTransactionType(lower);
    
    // Basic greetings - more flexible matching
    if (lower.match(/^(hi+|hey+|hello|sup|what's up|yo)$/)) {
      return "Hi there! I'm your AI crypto analyst. I can help you track whale movements, analyze market trends, check wallet risk scores, and provide real-time crypto insights. What would you like to know?";
    }
    
    // Whale movements with contextual details
    if (lower.includes('whale') || lower.includes('top') || lower.includes('large')) {
      const amounts = ['$12.5M', '$45.8M', '$23.1M', '$67.3M', '$89.2M', '$156.7M'];
      const amount = amounts[Math.floor(Math.random() * amounts.length)];
      
      if (crypto === 'AVAX' && timeFrame === '30 minutes') {
        return `Top AVAX whale ${transactionType} in the last 30 minutes: 3 major transactions totaling ${amount}. Largest single move: ${amounts[0]} from 0x3f5...7aE2 to Binance. This suggests potential selling pressure or profit-taking activity.`;
      }
      
      return `Top ${crypto} whale ${transactionType} in the last ${timeFrame} include ${Math.floor(Math.random() * 5) + 2} major transactions totaling ${amount}. This ${transactionType.includes('outflow') ? 'typically indicates institutional accumulation' : 'suggests potential selling pressure'} and could signal ${transactionType.includes('outflow') ? 'bullish' : 'bearish'} sentiment.`;
    }
    
    // Price related queries with time context
    if (lower.includes('price') || lower.includes('btc') || lower.includes('bitcoin') || lower.includes('eth') || lower.includes('ethereum')) {
      return `Based on ${crypto} analysis over the last ${timeFrame}, I'm seeing ${Math.random() > 0.5 ? 'significant accumulation' : 'distribution'} patterns in addresses over $10M. The data suggests potential ${Math.random() > 0.5 ? 'upward' : 'downward'} price pressure with ${Math.floor(Math.random() * 20) + 75}% confidence.`;
    }
    
    // Wallet analysis
    if (lower.includes('wallet') || lower.includes('address') || lower.includes('0x')) {
      return `The wallet you're analyzing shows ${['low', 'moderate', 'high'][Math.floor(Math.random() * 3)]} risk indicators over the last ${timeFrame}. Transaction patterns suggest ${['legitimate DeFi activity', 'mixed protocol interactions', 'high-frequency trading'][Math.floor(Math.random() * 3)]}. Risk score: ${['Low (2.1/10)', 'Medium (6.2/10)', 'High (8.7/10)'][Math.floor(Math.random() * 3)]}.`;
    }
    
    // Market predictions with timeframe
    if (lower.includes('predict') || lower.includes('forecast') || lower.includes('market')) {
      return `Market prediction models for the next ${timeFrame} show ${Math.floor(Math.random() * 30) + 65}% probability of a price ${Math.random() > 0.5 ? 'breakout above resistance' : 'correction below support'} levels. Social sentiment has turned ${Math.random() > 0.5 ? 'bullish' : 'bearish'} with ${Math.floor(Math.random() * 200) + 150}% change in mentions.`;
    }
    
    // Explain/simplify requests
    if (lower.includes('explain') || lower.includes('simple') || lower.includes('eli5')) {
      return "Let me break this down simply: When whales (big investors) move their crypto off exchanges, it usually means they're planning to hold for longer. This reduces selling pressure and often leads to price increases.";
    }
    
    // Avalanche specific with context
    if (lower.includes('avalanche') || lower.includes('avax') || lower.includes('subnet')) {
      return `Avalanche ecosystem activity in the last ${timeFrame}: subnet deployments ${Math.random() > 0.5 ? 'increased' : 'decreased'} ${Math.floor(Math.random() * 30) + 15}%. Major DeFi protocols are ${Math.random() > 0.5 ? 'migrating to' : 'evaluating'} custom subnets for better performance. Current AVAX whale activity shows ${transactionType} trending ${Math.random() > 0.5 ? 'upward' : 'downward'}.`;
    }
    
    // Default intelligent response
    const defaultResponses = [
      `I can analyze ${crypto} data for the ${timeFrame} timeframe you specified. Could you be more specific about what type of analysis you need?`,
      `For the ${timeFrame} period you mentioned, I can provide insights on whale movements, market trends, or wallet analysis. What would you like to focus on?`,
      `Based on current ${crypto} market conditions over ${timeFrame}, I can help you understand on-chain patterns and price movements. What specific aspect interests you?`,
      `I'm analyzing real-time ${crypto} data for your ${timeFrame} timeframe. Would you like whale tracking, price analysis, or risk assessment?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };
  
  const handleQuickPrompt = useCallback((prompt: string, intent: string) => {
    setInputValue(prompt);
    sendMessage(prompt);
  }, [sendMessage]);
  
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
  }, []);
  
  const handlePin = useCallback((content: string) => {
    // Implement pin functionality
    console.log("Pinned:", content);
  }, []);
  
  const handleStop = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isStreaming: false, isStopped: true } : m
    ));
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };
  
  const chains = [
    { id: "all" as Chain, name: "All", color: "bg-gray-500" },
    { id: "eth" as Chain, name: "ETH", color: "bg-blue-500" },
    { id: "avax" as Chain, name: "AVAX", color: "bg-red-500" },
    { id: "subnets" as Chain, name: "Subnets", color: "bg-orange-500" },
  ];
  
  return (
    <div className="font-inter text-white bg-background min-h-screen relative">
      <BackgroundOrbs />
      <Sidebar />
      <Header title="AI" highlight="Assistant" />
      
      <main className="pl-16 lg:pl-64 pt-16 relative z-10">
        <div className="container mx-auto p-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
            {/* Chat Pane - Left 65% */}
            <div className="lg:col-span-2 flex flex-col">
              <SystemMessages />
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" style={{ scrollBehavior: 'smooth' }}>
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {quickPrompts.slice(0, 3).map((prompt, index) => (
                        <motion.button
                          key={prompt.text}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleQuickPrompt(prompt.text, prompt.intent)}
                          className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
                          data-testid={`quick-prompt-${index}`}
                        >
                          <div className="text-sm font-medium mb-1">{prompt.text}</div>
                          <div className="text-xs text-gray-400">Click to start</div>
                        </motion.button>
                      ))}
                    </div>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-cyan-400"
                    >
                      ↓ Ask me anything about crypto
                    </motion.div>
                  </motion.div>
                )}
                
                <AnimatePresence>
                  {messages.map((message) => (
                    message.type === "thinking" ? (
                      <ThinkingMessage key={message.id} />
                    ) : (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onCopy={handleCopy}
                        onPin={handlePin}
                        onStop={handleStop}
                      />
                    )
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 hover:bg-white/10"
                  data-testid="button-attach"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about whale movements, market trends, or wallet analysis..."
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-gray-400 pr-12"
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Context Pane - Right 35% */}
            <div className="space-y-4">
              {/* Chain Switcher */}
              <div className="flex space-x-2">
                {chains.map((chain) => (
                  <motion.button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${
                      selectedChain === chain.id
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-testid={`chain-${chain.id}`}
                  >
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${chain.color}`} />
                      <span>{chain.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <motion.button
                    key={prompt.text}
                    onClick={() => handleQuickPrompt(prompt.text, prompt.intent)}
                    className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-xs font-medium hover:bg-white/20 transition-all duration-300"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`prompt-chip-${index}`}
                  >
                    {prompt.text}
                  </motion.button>
                ))}
              </div>
              
              {/* Context Widgets */}
              <AnimatePresence mode="wait">
                {activeWidget === "price" && <PriceWidget key="price" />}
                {activeWidget === "whale" && <WhaleWidget key="whale" />}
                {activeWidget === "alerts" && <AlertsWidget key="alerts" />}
                {activeWidget === "subnet" && selectedChain === "avax" && <SubnetWidget key="subnet" />}
              </AnimatePresence>
              
              {/* Default widget when no specific context */}
              {!activeWidget && <PriceWidget />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
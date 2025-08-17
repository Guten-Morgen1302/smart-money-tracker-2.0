import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import MarketTrendChart from "@/components/market-trend-chart";
import AIInsights from "@/components/ai-insights"; 
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

// AI Prediction type with enhanced properties
type AIPrediction = {
  id: number;
  title: string;
  description: string;
  confidence: number;
  status: "LIVE" | "Pending" | "Successful" | "Failed";
  timestamp: string;
  category: string;
  icon: string;
  amount?: string;
  accuracy?: number;
  isNew?: boolean;
};

// Animated Counter Component
function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = "",
  prefix = "",
  decimals = 0 
}: { 
  end: number; 
  duration?: number; 
  suffix?: string; 
  prefix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setHasAnimated(true);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [end, duration, hasAnimated]);

  const displayValue = decimals > 0 ? (count / Math.pow(10, decimals)).toFixed(decimals) : count;
  
  return <span>{prefix}{displayValue}{suffix}</span>;
}

// Confidence Badge with Pulsing Animation
function ConfidenceBadge({ confidence, isNew }: { confidence: number; isNew?: boolean }) {
  const getColorAndGlow = (conf: number) => {
    if (conf >= 85) return { 
      color: "text-green-400", 
      bg: "bg-green-400/10", 
      border: "border-green-400/30",
      glow: "shadow-lg shadow-green-400/20",
      ring: "from-green-400 to-emerald-500"
    };
    if (conf >= 60) return { 
      color: "text-yellow-400", 
      bg: "bg-yellow-400/10", 
      border: "border-yellow-400/30",
      glow: "shadow-lg shadow-yellow-400/20",
      ring: "from-yellow-400 to-orange-500"
    };
    return { 
      color: "text-red-400", 
      bg: "bg-red-400/10", 
      border: "border-red-400/30",
      glow: "shadow-lg shadow-red-400/20",
      ring: "from-red-400 to-pink-500"
    };
  };

  const styles = getColorAndGlow(confidence);

  return (
    <motion.div
      className={`relative inline-flex items-center px-3 py-1 rounded-full ${styles.bg} ${styles.border} ${styles.glow} border`}
      animate={isNew ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: isNew ? Infinity : 0 }}
    >
      {/* Animated ring */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${styles.ring} opacity-20`}
        animate={confidence >= 85 ? { 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2] 
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <span className={`relative text-xs font-medium ${styles.color}`}>
        <AnimatedCounter end={confidence} suffix="%" duration={1500} />
      </span>
      
      {/* Sparkle effect for high confidence */}
      {confidence >= 90 && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ rotate: 360, scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}
    </motion.div>
  );
}

// Status Badge with animations
function StatusBadge({ status }: { status: AIPrediction["status"] }) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "LIVE":
        return {
          color: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/30",
          animation: { scale: [1, 1.05, 1], opacity: [1, 0.7, 1] }
        };
      case "Pending":
        return {
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          border: "border-amber-400/30",
          animation: { opacity: [1, 0.5, 1] }
        };
      case "Successful":
        return {
          color: "text-green-400",
          bg: "bg-green-400/10",
          border: "border-green-400/30",
          animation: { scale: [1, 1.1, 1] }
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-400/10",
          border: "border-gray-400/30",
          animation: {}
        };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <motion.span
      className={`px-2 py-0.5 rounded-full text-xs border ${styles.bg} ${styles.color} ${styles.border}`}
      animate={styles.animation}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {status}
    </motion.span>
  );
}

// Typewriter Effect Component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, delay + currentIndex * 30);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return <span>{displayText}</span>;
}

// Main Prediction Card Component
function PredictionCard({ 
  prediction, 
  index 
}: { 
  prediction: AIPrediction; 
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const timeAgo = Math.floor((Date.now() - new Date(prediction.timestamp).getTime()) / 60000);

  return (
    <motion.div
      initial={prediction.isNew ? { 
        x: 300, 
        opacity: 0,
        scale: 0.8
      } : false}
      animate={{ 
        x: 0, 
        opacity: 1,
        scale: 1,
        rotateY: isHovered ? 3 : 0,
        rotateX: isHovered ? -1 : 0,
      }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ 
        duration: 0.6,
        delay: prediction.isNew ? 0.2 : index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      layout
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      data-testid={`card-prediction-${prediction.id}`}
    >
      {/* Glow trail effect for new predictions */}
      {prediction.isNew && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-transparent rounded-lg blur-xl"
          initial={{ opacity: 0, scale: 1.5 }}
          animate={{ opacity: [0, 1, 0], scale: [1.5, 1, 0.8] }}
          transition={{ duration: 2, delay: 0.3 }}
        />
      )}

      <motion.div
        className={`relative bg-[#0A0A10]/70 p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
          isHovered 
            ? 'border-cyan-400/50 shadow-xl shadow-cyan-400/10' 
            : 'border-white/10'
        }`}
        style={{
          transformStyle: "preserve-3d",
          background: isHovered 
            ? 'linear-gradient(135deg, rgba(10,10,16,0.9) 0%, rgba(25,26,42,0.9) 100%)'
            : undefined
        }}
        whileHover={{ y: -5 }}
      >
        {/* Glass reflection effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-center flex-1">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 flex items-center justify-center mr-3"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <span className="text-lg">{prediction.icon}</span>
            </motion.div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white mb-1" data-testid={`text-title-${prediction.id}`}>
                {prediction.title}
              </h4>
              <div className="flex items-center space-x-2 mb-2">
                <ConfidenceBadge confidence={prediction.confidence} isNew={prediction.isNew} />
                <StatusBadge status={prediction.status} />
              </div>
            </div>
          </div>
          
          <motion.span
            className="text-xs text-gray-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {timeAgo} min ago
          </motion.span>
        </div>

        <motion.div
          className="mt-3 text-xs text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <TypewriterText text={prediction.description} delay={prediction.isNew ? 800 : 0} />
        </motion.div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-white/5"
            >
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Category: </span>
                  <span className="text-cyan-400">{prediction.category}</span>
                </div>
                {prediction.amount && (
                  <div>
                    <span className="text-gray-400">Amount: </span>
                    <span className="text-green-400">{prediction.amount}</span>
                  </div>
                )}
                {prediction.accuracy && (
                  <div>
                    <span className="text-gray-400">Accuracy: </span>
                    <span className="text-purple-400">
                      <AnimatedCounter end={prediction.accuracy} suffix="%" />
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function AITrends() {
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [stats, setStats] = useState({
    accuracy: 89,
    activeSignals: 9,
    dataSources: 14
  });
  const nextIdRef = useRef(1000);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add circuit pattern background effect
  useEffect(() => {
    const circuitPattern = document.createElement('div');
    circuitPattern.className = 'circuit-pattern';
    document.body.appendChild(circuitPattern);
    
    return () => {
      document.body.removeChild(circuitPattern);
    };
  }, []);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmQdBjOF0fPTgjMGLYPV9N2OPQkdYbfp6qNbHggykdz2zn8vBi6Iz+PugEwMGWSy5N2VVw0LTafj7aVfIg');
    audioRef.current.volume = 0.3;
  }, []);

  // Sample predictions data
  const samplePredictions: AIPrediction[] = [
    {
      id: 1,
      title: "Whale Accumulation Detected",
      description: "Large BTC addresses show 15% increase in holdings. Historical patterns suggest price surge within 24-48 hours.",
      confidence: 91,
      status: "LIVE",
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      category: "Whale Activity",
      icon: "🐋",
      amount: "$45.2M",
      accuracy: 87
    },
    {
      id: 2,
      title: "ETH DeFi TVL Surge Incoming",
      description: "Smart contract interactions spike 300%. DeFi protocols preparing for major liquidity influx.",
      confidence: 78,
      status: "Pending",
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      category: "DeFi Analysis",
      icon: "⚡",
      amount: "$120M",
      accuracy: 82
    },
    {
      id: 3,
      title: "Social Sentiment Bullish Turn",
      description: "Twitter sentiment analysis shows 65% positive mentions. Reddit activity up 40% in crypto subreddits.",
      confidence: 73,
      status: "Successful",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      category: "Social Analysis",
      icon: "📊",
      accuracy: 91
    }
  ];

  // Initialize predictions
  useEffect(() => {
    setPredictions(samplePredictions);
  }, []);

  // Generate new predictions dynamically
  const generateNewPrediction = useCallback((): AIPrediction => {
    const titles = [
      "Major Exchange Outflow Detected",
      "Institutional Buying Pattern",
      "Cross-Chain Bridge Activity Spike",
      "DEX Volume Anomaly",
      "Stablecoin Mint Acceleration",
      "Layer 2 Adoption Surge",
      "NFT Market Recovery Signal",
      "Yield Farming Migration Pattern"
    ];
    
    const descriptions = [
      "Unusual on-chain activity suggests significant market movement incoming.",
      "Large-scale institutional patterns detected across multiple wallets.",
      "Cross-chain bridge volume increases 400% in last 6 hours.",
      "Decentralized exchange shows unusual trading patterns.",
      "Stablecoin minting accelerates, indicating potential market entry.",
      "Layer 2 solutions see 250% increase in transaction volume.",
      "NFT floor prices showing early recovery signals across collections.",
      "Yield farming protocols experiencing significant TVL migration."
    ];

    const categories = ["Whale Activity", "DeFi Analysis", "Social Analysis", "Market Structure", "Institutional"];
    const icons = ["🐋", "⚡", "📊", "🔥", "💎", "🚀", "⭐", "🌊"];
    const statuses: AIPrediction["status"][] = ["LIVE", "Pending", "Successful"];

    const title = titles[Math.floor(Math.random() * titles.length)];
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-100
    
    return {
      id: nextIdRef.current++,
      title,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      confidence,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date().toISOString(),
      category: categories[Math.floor(Math.random() * categories.length)],
      icon: icons[Math.floor(Math.random() * icons.length)],
      amount: `$${(Math.random() * 200 + 10).toFixed(1)}M`,
      accuracy: Math.floor(Math.random() * 30) + 70,
      isNew: true
    };
  }, []);

  // Add new predictions every 10-15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrediction = generateNewPrediction();
      
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Ignore audio errors in case user hasn't interacted yet
        });
      }
      
      setPredictions(prev => {
        const updated = prev.map(p => ({ ...p, isNew: false }));
        return [newPrediction, ...updated].slice(0, 8); // Keep only 8 predictions
      });
      
      // Update stats occasionally
      if (Math.random() > 0.7) {
        setStats(prev => ({
          accuracy: Math.min(95, prev.accuracy + Math.floor(Math.random() * 3)),
          activeSignals: Math.max(5, prev.activeSignals + Math.floor(Math.random() * 3) - 1),
          dataSources: prev.dataSources
        }));
      }
    }, Math.random() * 5000 + 10000); // 10-15 seconds
    
    return () => clearInterval(interval);
  }, [generateNewPrediction]);

  return (
    <div className="font-inter text-white bg-background min-h-screen">
      <Sidebar />
      <Header title="AI" highlight="Trends" />
      
      <main className="pl-16 lg:pl-64 pt-16">
        <div className="container mx-auto p-6 space-y-6 pb-20">
          {/* AI Prediction Stats with Animated Counters */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-[#191A2A] border-cyan-400/20 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-400 text-sm">Prediction Accuracy</h3>
                      <p className="mt-1 text-2xl font-orbitron font-bold">
                        <AnimatedCounter end={stats.accuracy} suffix="%" duration={2000} />
                      </p>
                      <p className="mt-1 text-xs text-gray-400">Based on 124 predictions</p>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <i className="ri-bar-chart-box-line text-xl text-cyan-400"></i>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-[#191A2A] border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-400 text-sm">Active Signals</h3>
                      <p className="mt-1 text-2xl font-orbitron font-bold">
                        <AnimatedCounter end={stats.activeSignals} duration={1500} />
                      </p>
                      <p className="mt-1 text-xs text-gray-400">5 bullish, 4 bearish</p>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <i className="ri-radar-line text-xl text-purple-500"></i>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="bg-[#191A2A] border-green-400/20 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-400 text-sm">Data Sources</h3>
                      <p className="mt-1 text-2xl font-orbitron font-bold">
                        <AnimatedCounter end={stats.dataSources} duration={1000} />
                      </p>
                      <p className="mt-1 text-xs text-gray-400">On-chain & social data</p>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center"
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <i className="ri-database-2-line text-xl text-green-400"></i>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          {/* AI Trend Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-[#191A2A] border-white/10">
              <CardHeader className="p-4 border-b border-white/5">
                <h3 className="font-orbitron text-lg">AI Trend Analysis</h3>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="market">
                  <TabsList className="bg-transparent mb-4">
                    <TabsTrigger value="market" className="bg-cyan-400/20 text-cyan-400" data-testid="tab-market">Market Sentiment</TabsTrigger>
                    <TabsTrigger value="whales" className="bg-white/5 text-gray-400 hover:bg-white/10" data-testid="tab-whales">Whale Behavior</TabsTrigger>
                    <TabsTrigger value="social" className="bg-white/5 text-gray-400 hover:bg-white/10" data-testid="tab-social">Social Signals</TabsTrigger>
                  </TabsList>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <MarketTrendChart />
                    </div>
                    <AIInsights />
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Live AI Predictions Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-[#191A2A] border-white/10">
              <CardHeader className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="font-orbitron text-lg mr-3">Live AI Predictions</h3>
                    <motion.div
                      className="w-3 h-3 bg-red-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-xs text-red-400 ml-2">LIVE</span>
                  </div>
                  <motion.span
                    className="text-xs text-gray-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Updates every 10-15 seconds
                  </motion.span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4 max-h-[600px] overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
                  <AnimatePresence mode="popLayout">
                    {predictions.map((prediction, index) => (
                      <PredictionCard
                        key={prediction.id}
                        prediction={prediction}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
 
type AIInsight = {
  id: number;
  title: string;
  description: string;
  icon: string;
  confidence: number;
  category: string;
  color: string;
  timestamp: string;
};

export default function AIInsights() {
  // Fetch AI insights
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/ai-insights/recent'],
    staleTime: 60000, // Refresh every minute
  });
  
  // Sample data for initial state if API hasn't loaded yet
  const sampleInsights: AIInsight[] = [
    {
      id: 1,
      title: "BTC Accumulation Alert",
      description: "AI detected unusual accumulation pattern among top 5 BTC whales. Historically, this pattern precedes a 12-15% price increase within 2 weeks.",
      icon: "ri-flashlight-line",
      confidence: 86,
      category: "Accumulation",
      color: "blue",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      title: "ETH Exchange Outflows",
      description: "Large ETH outflows detected from major exchanges. Supply shock possible as staking ratio increases simultaneously.",
      icon: "ri-radar-line",
      confidence: 78,
      category: "Exchange Activity",
      color: "purple",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      title: "DeFi Protocol Attention",
      description: "AI detected significant smart money movement into new DeFi protocol. TVL increased 215% in 48 hours with whale wallet participation.",
      icon: "ri-bubble-chart-line",
      confidence: 72,
      category: "DeFi",
      color: "green",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  const [displayInsights, setDisplayInsights] = useState<AIInsight[]>(sampleInsights);
  
  useEffect(() => {
    if (insights && Array.isArray(insights)) {
      setDisplayInsights(insights);
    }
  }, [insights]);
  
  function getTimeSince(timestamp: string): string {
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 7200) return `1 hour ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `Yesterday`;
  }
  
  function getColorClasses(color: string): { border: string, bg: string, text: string } {
    switch (color) {
      case 'blue':
        return {
          border: 'border-cyan-400/30',
          bg: 'from-cyan-400/10',
          text: 'text-cyan-400',
        };
      case 'purple':
        return {
          border: 'border-purple-500/30',
          bg: 'from-purple-500/10',
          text: 'text-purple-500',
        };
      case 'green':
        return {
          border: 'border-green-400/30',
          bg: 'from-green-400/10',
          text: 'text-green-400',
        };
      default:
        return {
          border: 'border-gray-400/30',
          bg: 'from-gray-400/10',
          text: 'text-gray-400',
        };
    }
  }
  
  return (
    <Card className="bg-[#191A2A] border-white/10 h-full">
      <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
        <h3 className="font-orbitron text-lg">AI Market Predictions</h3>
        <button className="text-gray-400 hover:text-white">
          <i className="ri-more-2-fill"></i>
        </button>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-white/20 bg-white/5 animate-pulse">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-white/10"></div>
                  </div>
                  <div className="ml-3 w-full">
                    <div className="h-4 w-40 bg-white/10 rounded"></div>
                    <div className="h-3 w-full bg-white/10 rounded mt-2"></div>
                    <div className="h-3 w-full bg-white/10 rounded mt-2"></div>
                    <div className="h-3 w-3/4 bg-white/10 rounded mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // AI insights list with slide-in animations
          <AnimatePresence mode="popLayout">
            {displayInsights.map((insight, index) => {
              const colorClasses = getColorClasses(insight.color);
              return (
                <motion.div 
                  key={insight.id}
                  layout
                  initial={{ 
                    opacity: 0, 
                    x: -60, 
                    scale: 0.9
                  }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 60, 
                    scale: 0.9,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut",
                    layout: { duration: 0.3 }
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 8,
                    transition: { duration: 0.2 }
                  }}
                  className={`p-3 rounded-lg border ${colorClasses.border} bg-gradient-to-r ${colorClasses.bg} to-transparent relative overflow-hidden cursor-pointer`}
                >
                  {/* Fresh AI insight glow effect for newest items */}
                  {index === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: [0, 0.8, 0.4, 0.8, 0],
                        scale: [0.8, 1.05, 1, 1.05, 0.8]
                      }}
                      transition={{ 
                        duration: 3, 
                        ease: "easeInOut",
                        delay: 0.5 
                      }}
                      className={`absolute inset-0 rounded-lg border-2 pointer-events-none ${
                        insight.color === 'blue' ? 'border-cyan-400/60' :
                        insight.color === 'purple' ? 'border-purple-500/60' :
                        'border-green-400/60'
                      }`}
                    />
                  )}
                  
                  {/* "Fresh AI Insight" indicator */}
                  {index === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-1 right-2"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-cyan-400 border border-cyan-400/30"
                      >
                        NEW
                      </motion.div>
                    </motion.div>
                  )}
                  
                  <div className="flex items-start">
                    <motion.div 
                      className="flex-shrink-0 mt-1"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    >
                      <div className={`w-8 h-8 rounded-full bg-${insight.color === 'blue' ? 'cyan-400' : insight.color}-400/20 flex items-center justify-center`}>
                        <motion.i 
                          className={`${insight.icon} ${colorClasses.text}`}
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                    <motion.div 
                      className="ml-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <motion.h4 
                        className={`text-sm font-medium ${colorClasses.text}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {insight.title}
                      </motion.h4>
                      <motion.p 
                        className="mt-1 text-xs text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {insight.description}
                      </motion.p>
                      <motion.div 
                        className="mt-2 text-xs text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <span>Confidence: <span className={colorClasses.text}>{insight.confidence}%</span></span>
                        <span className="ml-4">{getTimeSince(insight.timestamp)}</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

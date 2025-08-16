import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
 
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
  const [newInsightAlert, setNewInsightAlert] = useState(false);
  
  useEffect(() => {
    if (insights && Array.isArray(insights)) {
      setDisplayInsights(insights);
    }
  }, [insights]);
  
  // AI insight generator
  useEffect(() => {
    const interval = setInterval(() => {
      const insights = [
        {
          title: "DeFi TVL Surge Detected",
          description: "AI detected 340% TVL increase in emerging DeFi protocol. Smart money accumulation pattern identified.",
          icon: "ri-bubble-chart-line",
          confidence: Math.floor(Math.random() * 20) + 75,
          category: "DeFi Analysis",
          color: "green"
        },
        {
          title: "Whale Accumulation Signal",
          description: "Top 10 BTC whales have accumulated 2,450 BTC in the last 6 hours. Historical pattern suggests 8-12% price increase.",
          icon: "ri-flashlight-line", 
          confidence: Math.floor(Math.random() * 15) + 80,
          category: "Accumulation",
          color: "blue"
        },
        {
          title: "Exchange Flow Anomaly",
          description: "Unusual ETH outflow pattern detected from Binance and Coinbase. Potential institutional buying pressure.",
          icon: "ri-radar-line",
          confidence: Math.floor(Math.random() * 18) + 70,
          category: "Exchange Activity",
          color: "purple"
        }
      ];
      
      const randomInsight = insights[Math.floor(Math.random() * insights.length)];
      const newInsight: AIInsight = {
        id: Date.now(),
        ...randomInsight,
        timestamp: new Date().toISOString(),
      };
      
      setDisplayInsights(prev => [newInsight, ...prev.slice(0, 2)]); // Keep only 3 insights
      setNewInsightAlert(true);
      setTimeout(() => setNewInsightAlert(false), 3000);
    }, 12000 + Math.random() * 8000); // 12-20 seconds
    
    return () => clearInterval(interval);
  }, []);
  
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
    <Card className="bg-[#191A2A] border-white/10 h-full animate-[slideInLeft_0.8s_ease-out_0.4s] animate-fill-both">
      <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-orbitron text-lg">AI Market Predictions</h3>
          {newInsightAlert && (
            <div className="ml-2 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping mr-2"></div>
              <span className="text-xs text-purple-400 animate-pulse">Fresh Insight</span>
            </div>
          )}
        </div>
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
          // AI insights with slide-in animations
          displayInsights.map((insight, index) => {
            const colorClasses = getColorClasses(insight.color);
            return (
              <div 
                key={insight.id} 
                className={`p-3 rounded-lg border ${colorClasses.border} bg-gradient-to-r ${colorClasses.bg} to-transparent transition-all duration-500 hover:scale-[1.02] hover:translate-x-2 transform ${
                  index === 0 ? 'animate-[slideInLeft_0.6s_ease-out]' : ''
                } ${
                  index === 0 && newInsightAlert ? 'ring-2 ring-purple-500/50 shadow-purple-500/25 shadow-lg' : ''
                }`}
                style={{
                  animationDelay: `${index * 0.15}s`
                }}
              >
                {/* Fresh insight indicator */}
                {index === 0 && newInsightAlert && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 animate-pulse border border-purple-500/30">
                      FRESH
                    </span>
                  </div>
                )}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-full bg-${insight.color === 'blue' ? 'cyan-400' : insight.color}-400/20 flex items-center justify-center`}>
                      <i className={`${insight.icon} ${colorClasses.text}`}></i>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className={`text-sm font-medium ${colorClasses.text}`}>{insight.title}</h4>
                    <p className="mt-1 text-xs text-gray-300">{insight.description}</p>
                    <div className="mt-2 text-xs text-gray-400">
                      <span>Confidence: <span className={colorClasses.text}>{insight.confidence}%</span></span>
                      <span className="ml-4">{getTimeSince(insight.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

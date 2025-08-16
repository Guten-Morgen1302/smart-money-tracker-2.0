import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAddress, getColorForType } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query"; 
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import WalletMiniChart from "@/components/wallet-mini-chart";

type Wallet = {
  id: number;
  address: string;
  type: string;
  balance: string;
  monthChange: string;
  riskScore: number;
  aiRating: string;
  activityData: number[];
};

// Count-up animation hook
function useCountUp(end: number, duration: number = 1000, delay: number = 0) {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const isInView = useInView(countRef as any);
  
  useEffect(() => {
    if (!isInView) return;
    
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * end);
        
        setCount(currentCount);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(animate);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [end, duration, delay, isInView]);
  
  return { count, ref: countRef };
}

export default function TopWallets() {
  const [filter, setFilter] = useState("Smart Money");
  
  // Fetch wallets
  const { data: wallets, isLoading } = useQuery({
    queryKey: ['/api/wallets/top', filter],
    staleTime: 60000, // Refresh every minute
  });
  
  // Sample data for initial state if API hasn't loaded yet
  const sampleWallets: Wallet[] = [
    {
      id: 1,
      address: "0x7a250d5",
      type: "Smart Money",
      balance: "$145.2M",
      monthChange: "+12.5% MoM",
      riskScore: 82,
      aiRating: "Bullish",
      activityData: [3, 4, 5, 4, 6, 7, 8, 7, 9, 8, 10, 11, 12],
    },
    {
      id: 2,
      address: "0x9b32f81d",
      type: "Institution",
      balance: "$278.5M",
      monthChange: "+8.2% MoM",
      riskScore: 75,
      aiRating: "Bullish",
      activityData: [8, 7, 6, 8, 9, 8, 9, 10, 11, 10, 9, 10, 11],
    },
    {
      id: 3,
      address: "0x3f56d9e3",
      type: "Smart Money",
      balance: "$92.1M",
      monthChange: "+23.8% MoM",
      riskScore: 88,
      aiRating: "Bullish",
      activityData: [5, 6, 8, 10, 9, 11, 12, 14, 15, 16, 15, 17, 18],
    },
    {
      id: 4,
      address: "0x8c714fe7",
      type: "Risk Alert",
      balance: "$58.6M",
      monthChange: "-5.1% MoM",
      riskScore: 91,
      aiRating: "Bearish",
      activityData: [12, 10, 9, 8, 10, 8, 7, 6, 5, 6, 4, 3, 4],
    },
  ];
  
  const [displayWallets, setDisplayWallets] = useState<Wallet[]>(sampleWallets);
  
  useEffect(() => {
    if (wallets && Array.isArray(wallets)) {
      setDisplayWallets(wallets);
    } else {
      // Filter sample wallets based on the selected filter
      if (filter === "All") {
        setDisplayWallets(sampleWallets);
      } else {
        setDisplayWallets(sampleWallets.filter(wallet => wallet.type === filter));
      }
    }
  }, [wallets, filter]);
  
  function getIconColorClass(type: string): string {
    if (type === "Smart Money") return "bg-cyan-400/20 text-cyan-400";
    if (type === "Institution") return "bg-purple-500/20 text-purple-500";
    if (type === "Risk Alert") return "bg-pink-500/20 text-pink-500";
    return "bg-green-400/20 text-green-400";
  }
  
  return (
    <Card className="bg-[#191A2A] border-white/10">
      <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
        <h3 className="font-orbitron text-lg">Top Whale Wallets</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant={filter === "All" ? "secondary" : "ghost"} 
            size="sm" 
            className={filter === "All" ? "bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30" : "bg-white/5 text-gray-400 hover:bg-white/10"}
            onClick={() => setFilter("All")}
          >
            All
          </Button>
          <Button 
            variant={filter === "Smart Money" ? "secondary" : "ghost"} 
            size="sm" 
            className={filter === "Smart Money" ? "bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30" : "bg-white/5 text-gray-400 hover:bg-white/10"}
            onClick={() => setFilter("Smart Money")}
          >
            Smart Money
          </Button>
          <Button 
            variant={filter === "Risk Alert" ? "secondary" : "ghost"} 
            size="sm" 
            className={filter === "Risk Alert" ? "bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30" : "bg-white/5 text-gray-400 hover:bg-white/10"}
            onClick={() => setFilter("Risk Alert")}
          >
            High Risk
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-white/5">
                <th className="py-3 px-4 text-left">Wallet Address</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Balance</th>
                <th className="py-3 px-4 text-left">30d Activity</th>
                <th className="py-3 px-4 text-left">Risk Score</th>
                <th className="py-3 px-4 text-left">AI Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                // Skeleton loader
                [1, 2, 3, 4].map((i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-white/10"></div>
                        <div className="ml-2 h-4 w-24 bg-white/10 rounded"></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-20 bg-white/10 rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-16 bg-white/10 rounded"></div>
                      <div className="h-3 w-12 bg-white/10 rounded mt-1"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-8 bg-white/5 rounded"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full h-2 bg-white/10 rounded-full"></div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="h-4 w-16 bg-white/10 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {displayWallets.map((wallet, index) => {
                    const riskScoreCount = useCountUp(wallet.riskScore, 1200, index * 100);
                    
                    return (
                      <motion.tr 
                        key={wallet.id}
                        layout
                        initial={{ 
                          opacity: 0, 
                          x: -60, 
                          scale: 0.95
                        }}
                        animate={{ 
                          opacity: 1, 
                          x: 0, 
                          scale: 1
                        }}
                        exit={{ 
                          opacity: 0, 
                          x: 60, 
                          scale: 0.95,
                          transition: { duration: 0.3 }
                        }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.08,
                          ease: "easeOut",
                          layout: { duration: 0.3 }
                        }}
                        whileHover={{
                          scale: 1.01,
                          x: 8,
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          transition: { duration: 0.2 }
                        }}
                        className="cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <motion.div 
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 + index * 0.08 }}
                          >
                            <motion.div 
                              className={`w-6 h-6 rounded-full ${getIconColorClass(wallet.type)} flex items-center justify-center mr-2`}
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              <i className="ri-user-line text-xs"></i>
                            </motion.div>
                            <span className="text-sm">{formatAddress(wallet.address)}</span>
                          </motion.div>
                        </td>
                        <td className="py-3 px-4">
                          <motion.span 
                            className={`px-2 py-0.5 rounded-full text-xs ${getColorForType(wallet.type)}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.08, type: "spring", stiffness: 200 }}
                          >
                            {wallet.type}
                          </motion.span>
                        </td>
                        <td className="py-3 px-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.08 }}
                          >
                            <div className="text-sm font-medium">{wallet.balance}</div>
                            <motion.div 
                              className="text-xs text-gray-400"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.08 }}
                            >
                              {wallet.monthChange}
                            </motion.div>
                          </motion.div>
                        </td>
                        <td className="py-3 px-4">
                          <motion.div 
                            className="w-24 h-8 relative"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.08, type: "spring" }}
                          >
                            <WalletMiniChart data={wallet.activityData} walletType={wallet.type} />
                          </motion.div>
                        </td>
                        <td className="py-3 px-4">
                          <motion.div 
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 + index * 0.08 }}
                          >
                            <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
                              <motion.div 
                                className={`h-full rounded-full ${
                                  wallet.type === "Smart Money" ? "bg-cyan-400" : 
                                  wallet.type === "Institution" ? "bg-purple-500" : 
                                  wallet.type === "Risk Alert" ? "bg-pink-500" : 
                                  "bg-green-400"
                                }`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${wallet.riskScore}%` }}
                                transition={{ 
                                  delay: 0.8 + index * 0.08,
                                  duration: 1.2,
                                  ease: "easeOut"
                                }}
                              />
                            </div>
                            <motion.span 
                              className="text-xs ml-2"
                              ref={riskScoreCount.ref}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 + index * 0.08 }}
                            >
                              {riskScoreCount.count}
                            </motion.span>
                          </motion.div>
                        </td>
                        <td className="py-3 px-4">
                          <motion.span 
                            className={`px-2 py-0.5 rounded-full text-xs ${getColorForType(wallet.aiRating)}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.7 + index * 0.08, type: "spring", stiffness: 200 }}
                          >
                            {wallet.aiRating}
                          </motion.span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

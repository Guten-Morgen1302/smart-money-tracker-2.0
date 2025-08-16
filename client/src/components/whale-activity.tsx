import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { formatAddress, getColorForType, getIconForType } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

type Transaction = {
  id: number;
  type: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  asset: string;
  category: string;
  riskScore: number;
  timestamp: string;
};

export default function WhaleActivity() {
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions/recent'],
    staleTime: 10000, // Refresh every 10 seconds
  });
  
  // Sample data for initial state if API hasn't loaded yet
  const sampleTransactions: Transaction[] = [
    {
      id: 1,
      type: "Large Transfer",
      fromAddress: "0x7a25d7f96a4e1fe2",
      toAddress: "0x9b32f81d8ad1",
      amount: "245 BTC",
      asset: "BTC",
      category: "Exchange Outflow",
      riskScore: 72,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      type: "Whale Movement",
      fromAddress: "0x3f56d9e3",
      toAddress: "0x8c714fe7",
      amount: "12,450 ETH",
      asset: "ETH",
      category: "Validator Deposit",
      riskScore: 68,
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      type: "Smart Contract",
      fromAddress: "0x2a557fc3",
      toAddress: "Contract",
      amount: "1.2M USDC",
      asset: "USDC",
      category: "DeFi Interaction",
      riskScore: 45,
      timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: "Exchange Deposit",
      fromAddress: "0x9f882ad5",
      toAddress: "Binance",
      amount: "18,320 SOL",
      asset: "SOL",
      category: "Potential Sell",
      riskScore: 82,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];
  
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>(sampleTransactions);
  
  useEffect(() => {
    if (transactions && Array.isArray(transactions)) {
      setDisplayTransactions(transactions);
    }
  }, [transactions]);
  
  function getTimeSince(timestamp: string): string {
    const date = new Date(timestamp);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} sec ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
  
  function getBorderColor(category: string): string {
    if (category === "Exchange Outflow") return "border-cyan-400";
    if (category === "Validator Deposit") return "border-purple-500";
    if (category === "DeFi Interaction") return "border-green-400";
    if (category === "Potential Sell") return "border-pink-500";
    return "border-gray-400";
  }
  
  function getIconBgColor(category: string): string {
    if (category === "Exchange Outflow") return "bg-cyan-400/20";
    if (category === "Validator Deposit") return "bg-purple-500/20";
    if (category === "DeFi Interaction") return "bg-green-400/20";
    if (category === "Potential Sell") return "bg-pink-500/20";
    return "bg-gray-400/20";
  }
  
  function getIconColor(category: string): string {
    if (category === "Exchange Outflow") return "text-cyan-400";
    if (category === "Validator Deposit") return "text-purple-500";
    if (category === "DeFi Interaction") return "text-green-400";
    if (category === "Potential Sell") return "text-pink-500";
    return "text-gray-400";
  }
  
  return (
    <Card className="bg-[#191A2A] border-white/10 h-full">
      <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
        <h3 className="font-orbitron text-lg">Live Whale Activity</h3>
        <Button variant="link" size="sm" className="text-cyan-400 hover:text-cyan-300">
          See All
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          // Skeleton loader
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 border-l-2 border-white/20 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10"></div>
                    <div className="ml-3">
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                      <div className="h-3 w-48 bg-white/10 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-16 bg-white/10 rounded"></div>
                    <div className="h-3 w-12 bg-white/10 rounded mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Transaction list with live ticker animation
          <AnimatePresence mode="popLayout">
            {displayTransactions.map((transaction, index) => (
              <motion.div 
                key={transaction.id}
                layout
                initial={{ 
                  opacity: 0, 
                  y: 50, 
                  scale: 0.95,
                  x: index === 0 ? -20 : 0 // First item slides in from left slightly
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  x: 0
                }}
                exit={{ 
                  opacity: 0, 
                  y: -30, 
                  scale: 0.95,
                  transition: { duration: 0.3 }
                }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: "easeOut",
                  layout: { duration: 0.3 }
                }}
                whileHover={{
                  scale: 1.02,
                  x: 5,
                  transition: { duration: 0.2 }
                }}
                className={`bg-white/5 rounded-lg p-3 border-l-2 ${getBorderColor(transaction.category)} relative overflow-hidden cursor-pointer`}
              >
                {/* Live indicator for recent transactions */}
                {index === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`w-2 h-2 rounded-full ${getIconColor(transaction.category).replace('text-', 'bg-')}`}
                    />
                  </motion.div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <motion.div 
                      className={`w-8 h-8 rounded-full ${getIconBgColor(transaction.category)} flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i className={`${getIconForType(transaction.type)} ${getIconColor(transaction.category)}`}></i>
                    </motion.div>
                    <div className="ml-3">
                      <motion.div 
                        className="text-sm font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {transaction.type}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-400 flex items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="truncate w-24">{formatAddress(transaction.fromAddress)}</span>
                        <motion.i 
                          className="ri-arrow-right-line mx-1 text-xs"
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="truncate w-24">{formatAddress(transaction.toAddress)}</span>
                      </motion.div>
                    </div>
                  </div>
                  <motion.div 
                    className="text-right"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="text-sm font-orbitron">{transaction.amount}</div>
                    <div className="text-xs text-gray-400">{getTimeSince(transaction.timestamp)}</div>
                  </motion.div>
                </div>
                <motion.div 
                  className="mt-2 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <span className={`px-2 py-0.5 rounded-full ${getColorForType(transaction.category)}`}>
                    {transaction.category}
                  </span>
                  <span className="text-gray-400 ml-2">
                    Risk Score: <span className={getIconColor(transaction.category)}>{transaction.riskScore}/100</span>
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

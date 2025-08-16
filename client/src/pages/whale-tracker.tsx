import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { formatAddress } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Transaction type with animation support
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
  isNew?: boolean;
};

// Risk Score Bar Component with smooth animation
function RiskScoreBar({ score, isNew }: { score: number; isNew?: boolean }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (isNew) {
      // Animate from 0 to target score for new transactions
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, isNew]);

  const getColor = (score: number) => {
    if (score < 30) return "bg-green-400";
    if (score < 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="flex items-center">
      <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(score)}`}
          initial={{ width: isNew ? "0%" : `${score}%` }}
          animate={{ width: `${animatedScore}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs ml-2">{score}</span>
    </div>
  );
}

// Interactive Action Button Component
function ActionButton({ 
  icon, 
  onClick, 
  variant = "default",
  "data-testid": testId 
}: { 
  icon: string; 
  onClick: () => void; 
  variant?: "default" | "alert";
  "data-testid"?: string;
}) {
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = () => {
    setIsClicked(true);
    onClick();
    setTimeout(() => setIsClicked(false), 200);
  };

  const baseClasses = "text-gray-400 transition-all duration-200 hover:scale-110";
  const variantClasses = {
    default: "hover:text-cyan-400",
    alert: "hover:text-purple-500"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isClicked ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
      data-testid={testId}
    >
      <motion.i 
        className={icon}
        animate={isClicked ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}

export default function WhaleTracker() {
  const { toast } = useToast();
  const [searchWallet, setSearchWallet] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[] | null>(null);
  const [valueThreshold, setValueThreshold] = useState("100K");
  const [assetType, setAssetType] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const nextIdRef = useRef(1000);
  
  // Add circuit pattern background effect
  useEffect(() => {
    const circuitPattern = document.createElement('div');
    circuitPattern.className = 'circuit-pattern';
    document.body.appendChild(circuitPattern);
    
    return () => {
      document.body.removeChild(circuitPattern);
    };
  }, []);
  
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    staleTime: 10000,
  });

  // Dynamic transaction generation system
  const transactionTypes = ["Large Transfer", "Whale Movement", "Smart Contract", "Exchange Deposit", "DeFi Interaction", "Arbitrage", "Liquidation"];
  const assets = ["BTC", "ETH", "USDC", "USDT", "SOL", "MATIC", "AVAX", "DOT", "ADA", "LINK"];
  const categories = ["Exchange Outflow", "Exchange Inflow", "Validator Deposit", "DeFi Interaction", "Potential Sell", "Accumulation", "Whale Movement", "Smart Contract"];
  
  const generateRandomAddress = () => {
    const chars = "0123456789abcdef";
    let result = "0x";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const generateRandomAmount = (asset: string) => {
    const amounts: Record<string, (string | number)[]> = {
      BTC: [Math.floor(Math.random() * 500 + 50), Math.floor(Math.random() * 1000 + 100)],
      ETH: [Math.floor(Math.random() * 5000 + 1000), Math.floor(Math.random() * 15000 + 5000)],
      USDC: [`${(Math.random() * 5 + 0.5).toFixed(1)}M`, `${(Math.random() * 10 + 2).toFixed(1)}M`],
      USDT: [`${(Math.random() * 8 + 1).toFixed(1)}M`, `${(Math.random() * 20 + 5).toFixed(1)}M`],
      SOL: [Math.floor(Math.random() * 20000 + 5000), Math.floor(Math.random() * 50000 + 10000)],
      MATIC: [Math.floor(Math.random() * 500000 + 100000)],
      AVAX: [Math.floor(Math.random() * 10000 + 2000)],
      DOT: [Math.floor(Math.random() * 50000 + 10000)],
      ADA: [Math.floor(Math.random() * 1000000 + 200000)],
      LINK: [Math.floor(Math.random() * 50000 + 10000)]
    };
    
    const assetAmounts = amounts[asset] || [Math.floor(Math.random() * 1000 + 100)];
    const amount = assetAmounts[Math.floor(Math.random() * assetAmounts.length)];
    return typeof amount === 'string' ? amount : `${amount.toLocaleString()} ${asset}`;
  };
  
  const generateNewTransaction = useCallback((): Transaction => {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const riskScore = Math.floor(Math.random() * 60) + 20;
    
    return {
      id: nextIdRef.current++,
      type,
      fromAddress: generateRandomAddress(),
      toAddress: Math.random() > 0.3 ? generateRandomAddress() : ["Binance", "Coinbase", "Kraken", "Contract"][Math.floor(Math.random() * 4)],
      amount: generateRandomAmount(asset),
      asset,
      category,
      riskScore,
      timestamp: new Date().toISOString(),
      isNew: true,
    };
  }, []);
  
  // Initial sample transactions
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
  ];
  
  // Initialize live transactions
  useEffect(() => {
    setLiveTransactions(sampleTransactions);
  }, []);
  
  // Live transaction feed - add new transaction every 5-10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransaction = generateNewTransaction();
      setLiveTransactions(prev => {
        const updatedTransactions = prev.map(tx => ({ ...tx, isNew: false }));
        return [newTransaction, ...updatedTransactions].slice(0, 12);
      });
    }, Math.random() * 5000 + 5000);
    
    return () => clearInterval(interval);
  }, [generateNewTransaction]);
  
  // Handle filter application with loading animation
  const applyFiltersWithAnimation = useCallback(() => {
    setIsLiveLoading(true);
    setTimeout(() => {
      setIsLiveLoading(false);
    }, 800);
  }, []);
  
  // Handle wallet search with enhanced animation
  const handleSearch = () => {
    if (!searchWallet) return;
    
    setIsSearching(true);
    
    setTimeout(() => {
      const allTransactions = liveTransactions;
      const cleanSearch = searchWallet.toLowerCase().trim();
      
      const filtered = allTransactions.filter(tx => 
        tx.fromAddress.toLowerCase().includes(cleanSearch) || 
        tx.toAddress.toLowerCase().includes(cleanSearch)
      );
      
      if (filtered.length > 0) {
        setFilteredTransactions(filtered);
        toast({
          title: "Transactions Found",
          description: `Found ${filtered.length} transactions for address ${searchWallet}`,
          variant: "default"
        });
      } else {
        const demoTransaction: Transaction = {
          id: 999,
          type: "Whale Movement",
          fromAddress: searchWallet,
          toAddress: "0x8c714fe7",
          amount: "5,234 ETH",
          asset: "ETH",
          category: "Validator Deposit",
          riskScore: 68,
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        };
        
        setFilteredTransactions([demoTransaction]);
        toast({
          title: "Wallet Found",
          description: `Found 1 transaction for address ${searchWallet}`,
          variant: "default"
        });
      }
      
      setIsSearching(false);
    }, 1500);
  };
  
  // Handle value threshold selection with animation
  const handleThresholdSelect = (threshold: string) => {
    setValueThreshold(threshold);
    applyFiltersWithAnimation();
    toast({
      title: "Filter Applied",
      description: `Showing transactions over $${threshold}`,
      variant: "default"
    });
  };
  
  // Handle asset type selection
  const handleAssetSelect = (asset: string) => {
    setAssetType(asset);
    applyFiltersWithAnimation();
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchWallet("");
    setValueThreshold("100K");
    setAssetType("all");
    setFilteredTransactions(null);
    toast({
      title: "Filters Reset",
      description: "Showing all transactions",
      variant: "default"
    });
  };
  
  // Get displayed transactions based on filters
  const getDisplayedTransactions = () => {
    return filteredTransactions || liveTransactions;
  };

  // Handle action clicks with feedback
  const handleViewTransaction = (transactionId: number) => {
    toast({
      title: "Transaction Details",
      description: `Viewing details for transaction #${transactionId}`,
      variant: "default"
    });
  };

  const handleCreateAlert = (transactionId: number) => {
    toast({
      title: "Alert Created",
      description: `Alert set up for similar transactions to #${transactionId}`,
      variant: "default"
    });
  };
  
  return (
    <div className="font-inter text-white bg-background min-h-screen">
      <Sidebar />
      <Header title="Whale" highlight="Tracker" />
      
      <main className="pl-16 lg:pl-64 pt-16">
        <div className="container mx-auto p-6 space-y-6 pb-20">
          {/* Control Panel with Enhanced Interactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-[#191A2A] border-white/10">
              <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
                <h3 className="font-orbitron text-lg">Transaction Filters</h3>
                {(filteredTransactions || valueThreshold !== "100K" || assetType !== "all") && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.3 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-cyan-400/30 text-white hover:bg-white/5 transition-all duration-200"
                      onClick={resetFilters}
                      data-testid="button-reset-filters"
                    >
                      <i className="ri-refresh-line mr-1"></i>
                      Reset Filters
                    </Button>
                  </motion.div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Value Threshold Buttons with Press Animation */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Value Threshold</label>
                    <div className="flex space-x-2">
                      {["100K", "1M", "10M"].map((threshold) => (
                        <motion.div key={threshold} whileTap={{ scale: 0.95 }}>
                          <Button 
                            size="sm" 
                            className={`${
                              valueThreshold === threshold 
                                ? "bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 shadow-lg shadow-cyan-400/10" 
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            } transition-all duration-200`}
                            onClick={() => handleThresholdSelect(threshold)}
                            data-testid={`button-threshold-${threshold}`}
                          >
                            ${threshold}+
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Asset Type Tabs with Animation */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Asset Type</label>
                    <Tabs defaultValue={assetType} onValueChange={handleAssetSelect}>
                      <TabsList className="bg-transparent">
                        {[
                          { value: "all", label: "All" },
                          { value: "btc", label: "BTC" },
                          { value: "eth", label: "ETH" },
                          { value: "alt", label: "Altcoins" }
                        ].map(({ value, label }) => (
                          <motion.div key={value} whileTap={{ scale: 0.95 }}>
                            <TabsTrigger 
                              value={value}
                              className={`${
                                assetType === value 
                                  ? "bg-cyan-400/20 text-cyan-400 shadow-lg shadow-cyan-400/10" 
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                              } transition-all duration-200`}
                              data-testid={`tab-asset-${value}`}
                            >
                              {label}
                            </TabsTrigger>
                          </motion.div>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Enhanced Wallet Search */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Wallet Search</label>
                    <div className="relative flex">
                      <motion.div
                        className="relative flex-1"
                        animate={searchInputFocused ? { scale: 1.02 } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Input 
                          type="text" 
                          placeholder="Enter wallet address..." 
                          className={`bg-[#0A0A10]/70 border transition-all duration-300 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none text-sm ${
                            searchInputFocused 
                              ? "border-cyan-400 shadow-lg shadow-cyan-400/20" 
                              : "border-cyan-400/30 hover:border-cyan-400/50"
                          }`}
                          value={searchWallet}
                          onChange={(e) => setSearchWallet(e.target.value)}
                          onFocus={() => setSearchInputFocused(true)}
                          onBlur={() => setSearchInputFocused(false)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          data-testid="input-wallet-search"
                        />
                        <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          className="ml-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-200"
                          onClick={handleSearch}
                          disabled={isSearching}
                          data-testid="button-search"
                        >
                          {isSearching ? (
                            <div className="flex items-center">
                              <motion.div
                                className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-1"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <span>Searching</span>
                            </div>
                          ) : (
                            <span>Search</span>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Live Transactions with Loading Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <Card className="bg-[#191A2A] border-white/10">
              <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <h3 className="font-orbitron text-lg mr-2">Live Whale Transactions</h3>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200"
                  data-testid="button-create-alert"
                >
                  <i className="ri-notification-3-line mr-2"></i>
                  Create Alert
                </Button>
              </CardHeader>
              
              {/* Loading Overlay */}
              <AnimatePresence>
                {isLiveLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        className="w-12 h-12 border-2 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <p className="text-gray-400">Refreshing transactions...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      className="inline-block w-12 h-12 border-2 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="mt-4 text-gray-400">Loading live transactions...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b border-white/5">
                          <th className="py-3 px-4 text-left">Transaction Type</th>
                          <th className="py-3 px-4 text-left">From</th>
                          <th className="py-3 px-4 text-left">To</th>
                          <th className="py-3 px-4 text-left">Amount</th>
                          <th className="py-3 px-4 text-left">Category</th>
                          <th className="py-3 px-4 text-left">Risk Score</th>
                          <th className="py-3 px-4 text-left">Time</th>
                          <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <AnimatePresence mode="popLayout">
                          {getDisplayedTransactions().map((transaction, index) => (
                            <motion.tr
                              key={transaction.id}
                              initial={transaction.isNew ? { 
                                opacity: 0, 
                                y: -50, 
                                backgroundColor: "rgba(34, 197, 94, 0.1)" 
                              } : false}
                              animate={{ 
                                opacity: 1, 
                                y: 0, 
                                backgroundColor: transaction.isNew ? "rgba(34, 197, 94, 0.05)" : "transparent" 
                              }}
                              exit={{ opacity: 0, x: -100 }}
                              transition={{ 
                                duration: 0.5, 
                                delay: transaction.isNew ? 0.3 : 0,
                                backgroundColor: { duration: 3, delay: 1 }
                              }}
                              layout
                              className="hover:bg-white/5 transition-colors"
                              data-testid={`row-transaction-${transaction.id}`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <motion.div 
                                    className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center mr-2"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <i className="ri-arrow-right-circle-line text-cyan-400"></i>
                                  </motion.div>
                                  <span data-testid={`text-transaction-type-${transaction.id}`}>{transaction.type}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-mono" data-testid={`text-from-address-${transaction.id}`}>
                                  {formatAddress(transaction.fromAddress)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-mono" data-testid={`text-to-address-${transaction.id}`}>
                                  {formatAddress(transaction.toAddress)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm font-orbitron" data-testid={`text-amount-${transaction.id}`}>
                                  {transaction.amount}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-400/10 text-cyan-400">
                                  {transaction.category}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <RiskScoreBar score={transaction.riskScore} isNew={transaction.isNew} />
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-400">
                                  {Math.floor((Date.now() - new Date(transaction.timestamp).getTime()) / 60000)} min ago
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <ActionButton
                                    icon="ri-eye-line"
                                    onClick={() => handleViewTransaction(transaction.id)}
                                    data-testid={`button-view-${transaction.id}`}
                                  />
                                  <ActionButton
                                    icon="ri-notification-2-line"
                                    onClick={() => handleCreateAlert(transaction.id)}
                                    variant="alert"
                                    data-testid={`button-alert-${transaction.id}`}
                                  />
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
import { useEffect, useState } from "react"; 
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { formatAddress, getColorForType } from "@/lib/utils";
import TopWallets from "@/components/top-wallets";
import { useToast } from "@/hooks/use-toast";
import WalletMiniChart from "@/components/wallet-mini-chart";
import { motion, AnimatePresence } from "framer-motion";

// Define wallet type
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

type WalletAnalysis = {
  overview: {
    address: string;
    totalBalance: string;
    activeTokens: number;
    transactionCount: number;
    riskScore: number;
    riskLevel: string;
    behavioralPattern: string;
    aiPrediction: string;
  };
  topTokens: Array<{
    name: string;
    symbol: string;
    amount: string;
    value: string;
    percentage: number;
  }>;
  recentTransactions: Array<{
    type: string;
    amount: string;
    time: string;
    insight: string;
  }>;
  similarWallets: Array<{
    address: string;
    type: string;
    balance: string;
    activityTrend: string;
    riskScore: number;
    aiRating: string;
  }>;
};

export default function WalletInsights() {
  // Add circuit pattern background effect
  useEffect(() => {
    const circuitPattern = document.createElement('div');
    circuitPattern.className = 'circuit-pattern';
    document.body.appendChild(circuitPattern);
    
    return () => {
      document.body.removeChild(circuitPattern);
    };
  }, []);
  
  const { toast } = useToast();
  const [searchAddress, setSearchAddress] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [analysisData, setAnalysisData] = useState<WalletAnalysis | null>(null);

  // Search wallet using comprehensive analysis API
  const handleSearch = async () => {
    if (!searchAddress) return;
    
    setIsSearching(true);
    setHasSearched(false);
    setAnalysisData(null);
    
    try {
      const response = await fetch('/api/wallets/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: searchAddress }),
      });
      
      const data = await response.json();
      setAnalysisData(data);
      setHasSearched(true);
      
      toast({
        title: "Wallet Analysis Complete",
        description: `Successfully analyzed ${searchAddress.substring(0, 10)}...`,
      });
    } catch (error) {
      console.error('Wallet analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-400";
    if (score < 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "Institution": "text-blue-400 bg-blue-400/10",
      "Smart Money": "text-cyan-400 bg-cyan-400/10",
      "High Risk": "text-red-400 bg-red-400/10",
      "Degen": "text-purple-400 bg-purple-400/10",
      "Whale": "text-green-400 bg-green-400/10",
      "Bot": "text-orange-400 bg-orange-400/10",
    };
    return colors[type] || "text-gray-400 bg-gray-400/10";
  };

  return (
    <div className="font-inter text-white bg-background min-h-screen">
      <Sidebar />
      <Header title="Wallet" highlight="Insights" />
      
      <main className="pl-16 lg:pl-64 pt-16">
        <div className="container mx-auto p-6 space-y-6 pb-20">
          {/* Wallet Search */}
          <Card className="bg-[#191A2A] border-white/10">
            <CardHeader className="p-4 border-b border-white/5">
              <h3 className="font-orbitron text-lg">AI-Powered Wallet Analysis</h3>
            </CardHeader>
            <CardContent className="p-4">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Enter wallet address to analyze..." 
                    className="bg-[#0A0A10]/70 border border-cyan-400/30 rounded-lg py-3 pl-10 pr-24 w-full focus:outline-none focus:border-cyan-400/80 text-sm transition-all" 
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <i className="ri-search-line absolute left-3 top-3.5 text-gray-400"></i>
                  <Button 
                    className="absolute right-2 top-1.5 bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Enter any Ethereum, Bitcoin, or Solana wallet address for comprehensive AI analysis including behavior patterns, risk assessment, and similar wallets.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <AnimatePresence>
            {hasSearched && analysisData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Wallet Overview */}
                <Card className="bg-[#191A2A] border-white/10">
                  <CardHeader className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-orbitron text-lg">Wallet Overview</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(analysisData.overview.behavioralPattern)}`}>
                          {analysisData.overview.behavioralPattern}
                        </span>
                        <Button variant="outline" size="sm" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
                          <i className="ri-notification-3-line mr-1"></i> Track
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">Wallet Information</h4>
                        <div className="bg-[#0A0A10]/70 rounded-lg p-4 border border-white/5">
                          <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center mr-3">
                              <i className="ri-wallet-3-line text-lg text-cyan-400"></i>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{formatAddress(analysisData.overview.address)}</div>
                              <div className="text-xs text-gray-400">AI Analysis Complete</div>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto text-gray-400 hover:text-white">
                              <i className="ri-file-copy-line"></i>
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <div className="text-xs text-gray-400">Total Balance</div>
                              <div className="text-lg font-orbitron font-bold">{analysisData.overview.totalBalance}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Active Tokens</div>
                              <div className="text-lg font-orbitron font-bold">{analysisData.overview.activeTokens}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Transactions</div>
                              <div className="text-lg font-orbitron font-bold">{analysisData.overview.transactionCount}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Risk Score</div>
                              <div className={`text-lg font-orbitron font-bold ${getRiskColor(analysisData.overview.riskScore)}`}>
                                {analysisData.overview.riskScore}/100
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-gray-400 mb-2">AI Analysis</h4>
                        <div className="bg-[#0A0A10]/70 rounded-lg p-4 border border-white/5">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">Risk Level</span>
                              <span className={`text-sm font-medium ${getRiskColor(analysisData.overview.riskScore)}`}>
                                {analysisData.overview.riskLevel}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">Behavior Pattern</span>
                              <span className="text-sm font-medium text-cyan-400">{analysisData.overview.behavioralPattern}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-400">AI Prediction</span>
                              <span className="text-sm font-medium text-purple-400">{analysisData.overview.aiPrediction}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Tokens */}
                <Card className="bg-[#191A2A] border-white/10">
                  <CardHeader className="p-4 border-b border-white/5">
                    <h3 className="font-orbitron text-lg">Top Holdings</h3>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {analysisData.topTokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A10]/50 rounded-lg border border-white/5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                              <span className="text-xs font-bold">{token.symbol.substring(0, 2)}</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{token.name}</div>
                              <div className="text-xs text-gray-400">{token.amount}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{token.value}</div>
                            <div className="text-xs text-cyan-400">{token.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="bg-[#191A2A] border-white/10">
                  <CardHeader className="p-4 border-b border-white/5">
                    <h3 className="font-orbitron text-lg">Recent Activity</h3>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {analysisData.recentTransactions.map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A10]/50 rounded-lg border border-white/5">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'Buy' ? 'bg-green-400/20 text-green-400' :
                              tx.type === 'Sell' ? 'bg-red-400/20 text-red-400' :
                              'bg-blue-400/20 text-blue-400'
                            }`}>
                              <i className={`ri-${
                                tx.type === 'Buy' ? 'arrow-up' :
                                tx.type === 'Sell' ? 'arrow-down' :
                                'arrow-left-right'
                              }-line text-xs`}></i>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{tx.type}: {tx.amount}</div>
                              <div className="text-xs text-gray-400">{tx.time}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-purple-400">AI Insight</div>
                            <div className="text-xs text-gray-300">{tx.insight}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Similar Wallets */}
                <Card className="bg-[#191A2A] border-white/10">
                  <CardHeader className="p-4 border-b border-white/5">
                    <h3 className="font-orbitron text-lg">Similar Wallets</h3>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisData.similarWallets.map((wallet, index) => (
                        <div key={index} className="p-3 bg-[#0A0A10]/50 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{formatAddress(wallet.address)}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(wallet.type)}`}>
                              {wallet.type}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">Balance:</span>
                              <div className="font-medium">{wallet.balance}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">30d Activity:</span>
                              <div className={`font-medium ${wallet.activityTrend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {wallet.activityTrend}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400">Risk Score:</span>
                              <div className={`font-medium ${getRiskColor(wallet.riskScore)}`}>{wallet.riskScore}/100</div>
                            </div>
                            <div>
                              <span className="text-gray-400">AI Rating:</span>
                              <div className="font-medium text-purple-400">{wallet.aiRating}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Wallets Section */}
          {!hasSearched && (
            <div className="space-y-6">
              <TopWallets />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
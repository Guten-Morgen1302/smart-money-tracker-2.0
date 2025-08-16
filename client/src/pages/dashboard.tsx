import { useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header"; 
import StatsOverview from "@/components/stats-overview";
import MarketTrendChart from "@/components/market-trend-chart";
import WhaleActivity from "@/components/whale-activity";
import AIInsights from "@/components/ai-insights";
import TopWallets from "@/components/top-wallets";
import CryptoTopNews from "@/components/crypto-top-news";

export default function Dashboard() {
  // Add circuit pattern background effect
  useEffect(() => {
    const circuitPattern = document.createElement('div');
    circuitPattern.className = 'circuit-pattern';
    document.body.appendChild(circuitPattern);
    
    return () => {
      document.body.removeChild(circuitPattern);
    };
  }, []);
  
  return (
    <div className="font-inter text-white bg-background min-h-screen">
      <Sidebar />
      <Header title="Dashboard" highlight="Overview" />
      
      <main className="pl-16 lg:pl-64 pt-16">
        <div className="container mx-auto p-6 space-y-6 pb-20">
          {/* Stats Overview - Staggered reveal from top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <StatsOverview />
          </motion.div>
          
          {/* Charts and Whale Activity Section */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="lg:col-span-2">
              <MarketTrendChart />
            </div>
            <WhaleActivity />
          </motion.div>
          
          {/* AI Insights and Top Wallets Section */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <AIInsights />
            <div className="lg:col-span-2">
              <TopWallets />
            </div>
          </motion.div>
          
          {/* Crypto News Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          >
            <CryptoTopNews />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

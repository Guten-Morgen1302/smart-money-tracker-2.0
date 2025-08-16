import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type StatCardProps = {
  title: string; 
  value: string;
  label: string;
  labelValue: string;
  changePercentage: string;
  changeDirection: "up" | "down" | "neutral";
  color: "blue" | "purple" | "green" | "pink";
  count?: string;
  index: number;
};

function StatCard({
  title,
  value,
  label,
  labelValue,
  changePercentage,
  changeDirection,
  color,
  count,
  index
}: StatCardProps) {
  const [isGlowing, setIsGlowing] = useState(false);
  
  // Simulate value changes with neon pulse effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance to trigger glow
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 2000);
      }
    }, 8000 + Math.random() * 4000); // Random interval between 8-12 seconds
    
    return () => clearInterval(interval);
  }, []);
  const colorMap = {
    blue: {
      border: "border-cyan-400/20 hover:border-cyan-400/50",
      bg: "bg-cyan-400/10",
      text: "text-cyan-400",
    },
    purple: {
      border: "border-purple-500/20 hover:border-purple-500/50",
      bg: "bg-purple-500/10",
      text: "text-purple-500",
    },
    green: {
      border: "border-green-400/20 hover:border-green-400/50",
      bg: "bg-green-400/10",
      text: "text-green-400",
    },
    pink: {
      border: "border-pink-500/20 hover:border-pink-500/50",
      bg: "bg-pink-500/10",
      text: "text-pink-500",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "bg-[#191A2A] border rounded-lg p-4 relative overflow-hidden transition-all duration-300 cursor-pointer",
        colorMap[color].border,
        isGlowing && `shadow-2xl ${
          color === 'blue' ? 'shadow-cyan-400/50' :
          color === 'purple' ? 'shadow-purple-500/50' :
          color === 'green' ? 'shadow-green-400/50' :
          'shadow-pink-500/50'
        }`
      )}
    >
      {/* Neon pulse glow effect */}
      <AnimatePresence>
        {isGlowing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.6, 0.3, 0.6, 0],
              scale: [0.8, 1.05, 1, 1.05, 0.8]
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className={cn(
              "absolute inset-0 rounded-lg border-2 pointer-events-none",
              color === 'blue' ? 'border-cyan-400/60' :
              color === 'purple' ? 'border-purple-500/60' :
              color === 'green' ? 'border-green-400/60' :
              'border-pink-500/60'
            )}
          />
        )}
      </AnimatePresence>
      
      <motion.div 
        className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full", colorMap[color].bg)}
        animate={isGlowing ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{ duration: 2 }}
      />
      
      <div className="relative">
        <div className="flex items-center">
          <h3 className="text-gray-400 text-sm">{title}</h3>
          <motion.span 
            className={cn("ml-auto text-xs px-2 py-0.5 rounded-full", colorMap[color].bg, colorMap[color].text)}
            animate={isGlowing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 2 }}
          >
            {changeDirection === "up" ? "↑" : changeDirection === "down" ? "↓" : ""} {changePercentage}
          </motion.span>
        </div>
        <motion.p 
          className="mt-2 text-2xl font-orbitron font-bold"
          animate={isGlowing ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 2 }}
        >
          {value}
        </motion.p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span>{label}</span>
          <span className={cn("ml-auto", colorMap[color].text)}>{labelValue}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsOverview() {
  const statsData = [
    {
      title: "Market Activity",
      value: "High",
      label: "Whale transactions",
      labelValue: "+215 today",
      changePercentage: "12%",
      changeDirection: "up" as const,
      color: "blue" as const,
    },
    {
      title: "Tracked Wallets",
      value: "856",
      label: "High risk wallets",
      labelValue: "28 active",
      changePercentage: "3%",
      changeDirection: "up" as const,
      color: "purple" as const,
    },
    {
      title: "AI Predictions",
      value: "9 Signals",
      label: "Accuracy rate",
      labelValue: "89%",
      changePercentage: "5 new",
      changeDirection: "neutral" as const,
      color: "green" as const,
    },
    {
      title: "Custom Alerts",
      value: "12 Active",
      label: "Triggered today",
      labelValue: "3 alerts",
      changePercentage: "2",
      changeDirection: "up" as const,
      color: "pink" as const,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          index={index}
          {...stat}
        />
      ))}
    </div>
  );
}

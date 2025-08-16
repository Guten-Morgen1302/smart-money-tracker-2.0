import { cn } from "@/lib/utils";
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
};

function StatCard({
  title,
  value,
  label,
  labelValue,
  changePercentage,
  changeDirection,
  color,
  count
}: StatCardProps) {
  const [isGlowing, setIsGlowing] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(value);
  const [animatedLabel, setAnimatedLabel] = useState(labelValue);
  
  // Real-time animation effects
  useEffect(() => {
    const interval = setInterval(() => {
      // Random glow effect
      if (Math.random() > 0.8) {
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 2000);
      }
      
      // Animate numbers for certain cards
      if (title === "Tracked Wallets") {
        const baseNum = 856;
        const variation = Math.floor(Math.random() * 5) - 2;
        setAnimatedValue((baseNum + variation).toString());
      }
      
      if (title === "Market Activity" && labelValue.includes("today")) {
        const match = labelValue.match(/(\d+)/);
        if (match) {
          const baseNum = parseInt(match[1]);
          const variation = Math.floor(Math.random() * 10) - 5;
          setAnimatedLabel(`+${baseNum + variation} today`);
        }
      }
      
      if (title === "Custom Alerts" && labelValue.includes("alerts")) {
        const alerts = Math.floor(Math.random() * 2) + 3; // 3-4 alerts
        setAnimatedLabel(`${alerts} alerts`);
      }
    }, 3000 + Math.random() * 4000); // 3-7 seconds
    
    return () => clearInterval(interval);
  }, [title, labelValue]);
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
    <div className={cn(
      "bg-[#191A2A] border rounded-lg p-4 relative overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-translate-y-2 hover:shadow-2xl group",
      colorMap[color].border,
      "hover:shadow-cyan-400/20 hover:border-cyan-400/50"
    )}>
      {/* Live indicator */}
      {isGlowing && (
        <div className="absolute top-2 right-2">
          <div className={cn(
            "w-2 h-2 rounded-full animate-ping",
            color === 'blue' ? 'bg-cyan-400' :
            color === 'purple' ? 'bg-purple-500' :
            color === 'green' ? 'bg-green-400' :
            'bg-pink-500'
          )}></div>
        </div>
      )}
      
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full transition-all duration-300", colorMap[color].bg, isGlowing && "animate-pulse")}></div>
      <div className="relative">
        <div className="flex items-center">
          <h3 className="text-gray-400 text-sm">{title}</h3>
          <span className={cn(
            "ml-auto text-xs px-2 py-0.5 rounded-full transition-all duration-300", 
            colorMap[color].bg, 
            colorMap[color].text,
            isGlowing && "animate-bounce"
          )}>
            {changeDirection === "up" ? "↑" : changeDirection === "down" ? "↓" : ""} {changePercentage}
          </span>
        </div>
        <p className={cn(
          "mt-2 text-2xl font-orbitron font-bold transition-all duration-300",
          isGlowing && "scale-105"
        )}>
          {animatedValue}
        </p>
        <div className="mt-3 flex items-center text-xs text-gray-400">
          <span>{label}</span>
          <span className={cn(
            "ml-auto transition-all duration-300", 
            colorMap[color].text,
            isGlowing && "animate-pulse"
          )}>
            {animatedLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="animate-[fadeInUp_0.6s_ease-out] animation-delay-100">
        <StatCard
          title="Market Activity"
          value="High"
          label="Whale transactions"
          labelValue="+215 today"
          changePercentage="12%"
          changeDirection="up"
          color="blue"
        />
      </div>
      
      <div className="animate-[fadeInUp_0.6s_ease-out] animation-delay-200">
        <StatCard
          title="Tracked Wallets"
          value="856"
          label="High risk wallets"
          labelValue="28 active"
          changePercentage="3%"
          changeDirection="up"
          color="purple"
        />
      </div>
      
      <div className="animate-[fadeInUp_0.6s_ease-out] animation-delay-300">
        <StatCard
          title="AI Predictions"
          value="9 Signals"
          label="Accuracy rate"
          labelValue="89%"
          changePercentage="5 new"
          changeDirection="neutral"
          color="green"
        />
      </div>
      
      <div className="animate-[fadeInUp_0.6s_ease-out] animation-delay-400">
        <StatCard
          title="Custom Alerts"
          value="12 Active"
          label="Triggered today"
          labelValue="3 alerts"
          changePercentage="2"
          changeDirection="up"
          color="pink"
        />
      </div>
    </div>
  );
}

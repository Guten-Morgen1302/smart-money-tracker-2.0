import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"; 
import { useToast } from "@/hooks/use-toast";
import { web3Manager, WalletInfo, AVALANCHE_FUJI_CONFIG } from "@/lib/web3";

type HeaderProps = {
  title: string;
  highlight?: string;
};

export default function Header({ title, highlight }: HeaderProps) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [isOnWrongNetwork, setIsOnWrongNetwork] = useState(false);
  const { toast } = useToast();

  // Sample notifications
  const notifications = [
    {
      id: 1, 
      title: "Large BTC Transfer Detected", 
      description: "245 BTC transferred to exchange wallet",
      time: "2 min ago",
      read: false
    },
    {
      id: 2, 
      title: "Whale Wallet Alert", 
      description: "Wallet 0x7a25...1fe2 active after 3 months",
      time: "15 min ago",
      read: false
    },
    {
      id: 3, 
      title: "AI Prediction Update", 
      description: "New signal: ETH accumulation detected",
      time: "1 hour ago",
      read: true
    }
  ];

  // Check if user is connected and on correct network on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const currentWalletInfo = await web3Manager.getCurrentWalletInfo();
      if (currentWalletInfo) {
        setWalletInfo(currentWalletInfo);
        const isOnFuji = await web3Manager.isConnectedToAvalancheFuji();
        setIsOnWrongNetwork(!isOnFuji);
      }
    } catch (error) {
      console.log("No wallet connected");
    }
  };

  const connectWallet = async (walletType: "MetaMask" | "Core") => {
    setIsConnecting(true);
    
    try {
      const { hasMetaMask, hasCore } = web3Manager.isWalletInstalled();
      
      if (walletType === "MetaMask" && !hasMetaMask) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue",
          variant: "destructive"
        });
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      
      if (walletType === "Core" && !hasCore) {
        toast({
          title: "Core Wallet Not Found", 
          description: "Please install Core wallet to continue",
          variant: "destructive"
        });
        window.open("https://core.app/", "_blank");
        return;
      }

      const connectedWalletInfo = await web3Manager.connect();
      setWalletInfo(connectedWalletInfo);
      
      // Check if connected to Avalanche Fuji
      const isOnFuji = await web3Manager.isConnectedToAvalancheFuji();
      if (!isOnFuji) {
        setIsOnWrongNetwork(true);
        setShowNetworkDialog(true);
      }
      
      setShowConnectDialog(false);
      
      toast({
        title: `${connectedWalletInfo.walletType} Connected`,
        description: `Connected to ${web3Manager.formatAddress(connectedWalletInfo.address)}`,
        variant: "default"
      });
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToAvalancheFuji = async () => {
    try {
      await web3Manager.switchToAvalancheFuji();
      setIsOnWrongNetwork(false);
      setShowNetworkDialog(false);
      
      // Refresh wallet info
      const updatedWalletInfo = await web3Manager.getCurrentWalletInfo();
      if (updatedWalletInfo) {
        setWalletInfo(updatedWalletInfo);
      }
      
      toast({
        title: "Network Switched",
        description: "Successfully switched to Avalanche Fuji Testnet",
        variant: "default"
      });
    } catch (error: any) {
      console.error("Error switching network:", error);
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch to Avalanche Fuji",
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = () => {
    web3Manager.disconnect();
    setWalletInfo(null);
    setIsOnWrongNetwork(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
      variant: "default"
    });
  };

  return (
    <header className="fixed top-0 right-0 left-16 lg:left-64 z-10 h-16 glass-effect border-b border-white/5 px-4 flex items-center justify-between">
      <div>
        <h2 className="font-orbitron text-lg md:text-xl">
          {title} {highlight && <span className="text-cyan-400">{highlight}</span>}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:block relative">
          <Input 
            type="text" 
            placeholder="Search..." 
            className="bg-[#0A0A10]/70 border border-cyan-400/30 rounded-lg py-2 pl-10 pr-4 w-64 focus:outline-none focus:border-cyan-400/80 text-sm transition-all" 
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2 rounded-lg hover:bg-white/5 transition-all"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500"></span>
          </button>

          {/* Notifications Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#191A2A] border border-white/10 rounded-lg shadow-lg p-2 z-50">
              <div className="flex items-center justify-between p-2 border-b border-white/10">
                <h3 className="font-medium">Notifications</h3>
                <span className="text-xs text-cyan-400">{notifications.filter(n => !n.read).length} unread</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-2 hover:bg-white/5 rounded-lg my-1 ${!notification.read ? 'border-l-2 border-cyan-400' : ''} transition-all cursor-pointer`}
                  >
                    <div className="flex items-start">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notification.read ? 'bg-cyan-400/20 text-cyan-400' : 'bg-white/10 text-gray-400'}`}>
                        <i className="ri-notification-3-line"></i>
                      </div>
                      <div className="ml-2">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <p className="text-xs text-gray-400">{notification.description}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-white/10 text-center">
                <button className="text-sm text-cyan-400 hover:underline">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Connect Wallet Button */}
        {walletInfo ? (
          <div className="flex items-center space-x-2">
            {/* Network Warning */}
            {isOnWrongNetwork && (
              <Button 
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse"
                onClick={() => setShowNetworkDialog(true)}
                size="sm"
              >
                <i className="ri-error-warning-line mr-1"></i>
                <span className="text-xs">Wrong Network</span>
              </Button>
            )}
            
            {/* Connected Wallet */}
            <Button 
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-400 to-cyan-500 text-white"
              onClick={() => disconnectWallet()}
            >
              {walletInfo.walletType === "MetaMask" && <i className="ri-bear-smile-line mr-2"></i>}
              {walletInfo.walletType === "Core" && <i className="ri-snowflake-line mr-2"></i>}
              {walletInfo.walletType === "Unknown" && <i className="ri-wallet-3-line mr-2"></i>}
              <span className="font-mono text-sm">{web3Manager.formatAddress(walletInfo.address)}</span>
              <span className="text-xs opacity-80">({parseFloat(walletInfo.balance).toFixed(4)} AVAX)</span>
            </Button>
          </div>
        ) : (
          <Button 
            className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white"
            onClick={() => setShowConnectDialog(true)}
          >
            <i className="ri-wallet-3-line mr-2"></i>
            <span>Connect Wallet</span>
          </Button>
        )}
          

      </div>

      {/* Connect Wallet Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="bg-[#191A2A] border border-cyan-400/20 text-white">
          <DialogHeader>
            <DialogTitle>Connect Your Wallet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Connect your Web3 wallet to start tracking and analyzing blockchain data
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <p className="text-sm text-cyan-400/80">Choose your preferred wallet:</p>
              
              {/* MetaMask Option */}
              <Button
                className="flex items-center justify-between p-4 bg-[#0A0A10]/70 border border-cyan-400/20 hover:border-cyan-400/60 transition-all"
                onClick={() => connectWallet("MetaMask")}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center">
                    <i className="ri-bear-smile-line text-lg text-orange-400"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">MetaMask</h4>
                    <p className="text-xs text-gray-400">Most popular Ethereum wallet</p>
                  </div>
                </div>
                <i className="ri-arrow-right-line text-cyan-400"></i>
              </Button>

              {/* Core Wallet Option */}
              <Button
                className="flex items-center justify-between p-4 bg-[#0A0A10]/70 border border-cyan-400/20 hover:border-cyan-400/60 transition-all"
                onClick={() => connectWallet("Core")}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-400/20 flex items-center justify-center">
                    <i className="ri-snowflake-line text-lg text-red-400"></i>
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium">Core Wallet</h4>
                    <p className="text-xs text-gray-400">Official Avalanche wallet</p>
                  </div>
                </div>
                <i className="ri-arrow-right-line text-cyan-400"></i>
              </Button>

              {/* Avalanche Network Info */}
              <div className="bg-[#0A0A10] rounded-lg p-3 border border-cyan-400/20">
                <div className="flex items-center space-x-2 mb-2">
                  <i className="ri-snowflake-line text-cyan-400"></i>
                  <h4 className="text-sm font-medium text-cyan-400">Avalanche Fuji Testnet</h4>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li><i className="ri-check-line text-green-400 mr-1"></i> Chain ID: {AVALANCHE_FUJI_CONFIG.chainId}</li>
                  <li><i className="ri-check-line text-green-400 mr-1"></i> Native Currency: AVAX</li>
                  <li><i className="ri-check-line text-green-400 mr-1"></i> Explorer: testnet.snowtrace.io</li>
                </ul>
                <p className="text-xs text-cyan-400/70 mt-2">
                  <i className="ri-information-line mr-1"></i>
                  Network will be added automatically if not present
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            {isConnecting ? (
              <Button disabled className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white w-full">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                Connecting...
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowConnectDialog(false)}
                className="border-cyan-400/30 text-white hover:bg-white/5 w-full"
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Network Switch Dialog */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent className="bg-[#191A2A] border border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <i className="ri-error-warning-line text-yellow-400"></i>
              <span>Switch to Avalanche Fuji</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              You're connected to {walletInfo ? web3Manager.getNetworkName(walletInfo.chainId) : 'an unsupported network'}. 
              Switch to Avalanche Fuji Testnet to use all features.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-[#0A0A10] rounded-lg p-4 border border-yellow-400/20">
              <h4 className="text-sm font-medium text-yellow-400 mb-2">Avalanche Fuji Testnet Details:</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li><strong>Chain ID:</strong> {AVALANCHE_FUJI_CONFIG.chainId}</li>
                <li><strong>RPC URL:</strong> {AVALANCHE_FUJI_CONFIG.rpcUrls[0]}</li>
                <li><strong>Currency:</strong> {AVALANCHE_FUJI_CONFIG.nativeCurrency.name}</li>
                <li><strong>Explorer:</strong> {AVALANCHE_FUJI_CONFIG.blockExplorerUrls[0]}</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNetworkDialog(false)}
              className="border-yellow-400/30 text-white hover:bg-white/5 mr-2"
            >
              Later
            </Button>
            <Button 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
              onClick={switchToAvalancheFuji}
            >
              <i className="ri-refresh-line mr-2"></i>
              Switch Network
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

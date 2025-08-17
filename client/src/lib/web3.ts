import { ethers } from "ethers";

// Avalanche Fuji Testnet Configuration
export const AVALANCHE_FUJI_CONFIG = {
  chainId: 43113, // 0xA869 in hex
  chainName: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

// Ethereum types for better type safety
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
  walletType: "MetaMask" | "Core" | "Unknown";
}

export class Web3Manager {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private listenersAdded = false;

  constructor() {
    // Only setup listeners on first instantiation
    if (!this.listenersAdded) {
      this.setupEventListeners();
      this.listenersAdded = true;
    }
  }

  // Setup event listeners for account and network changes
  private setupEventListeners() {
    // Skip event listeners to prevent reload issues
    // We'll handle wallet changes through manual user actions instead
    console.log("Web3Manager initialized without automatic event listeners");
  }

  // Check if wallet is installed
  isWalletInstalled(): { hasMetaMask: boolean; hasCore: boolean } {
    const hasMetaMask = typeof window !== "undefined" && window.ethereum?.isMetaMask;
    const hasCore = typeof window !== "undefined" && window.ethereum?.isAvalanche;
    
    return { hasMetaMask, hasCore };
  }

  // Detect which wallet is being used
  getWalletType(): "MetaMask" | "Core" | "Unknown" {
    if (typeof window === "undefined" || !window.ethereum) return "Unknown";
    
    if (window.ethereum.isAvalanche) return "Core";
    if (window.ethereum.isMetaMask) return "MetaMask";
    
    return "Unknown";
  }

  // Connect to wallet
  async connect(): Promise<WalletInfo> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or Core wallet.");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      // Create provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Get current network
      const network = await this.provider.getNetwork();
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);

      const walletInfo: WalletInfo = {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        walletType: this.getWalletType(),
      };

      return walletInfo;
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      throw error;
    }
  }

  // Switch to Avalanche Fuji C-Chain
  async switchToAvalancheFuji(): Promise<boolean> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No wallet detected");
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${AVALANCHE_FUJI_CONFIG.chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask/Core
      if (switchError.code === 4902) {
        try {
          // Add the network
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${AVALANCHE_FUJI_CONFIG.chainId.toString(16)}`,
                chainName: AVALANCHE_FUJI_CONFIG.chainName,
                nativeCurrency: AVALANCHE_FUJI_CONFIG.nativeCurrency,
                rpcUrls: AVALANCHE_FUJI_CONFIG.rpcUrls,
                blockExplorerUrls: AVALANCHE_FUJI_CONFIG.blockExplorerUrls,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error adding Avalanche Fuji network:", addError);
          throw addError;
        }
      } else {
        console.error("Error switching to Avalanche Fuji:", switchError);
        throw switchError;
      }
    }
  }

  // Get current wallet info
  async getCurrentWalletInfo(): Promise<WalletInfo | null> {
    if (!this.provider || !this.signer) return null;

    try {
      const network = await this.provider.getNetwork();
      const address = await this.signer.getAddress();
      const balance = await this.provider.getBalance(address);

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        walletType: this.getWalletType(),
      };
    } catch (error) {
      console.error("Error getting wallet info:", error);
      return null;
    }
  }

  // Check if connected to Avalanche Fuji
  async isConnectedToAvalancheFuji(): Promise<boolean> {
    const walletInfo = await this.getCurrentWalletInfo();
    return walletInfo?.chainId === AVALANCHE_FUJI_CONFIG.chainId;
  }

  // Disconnect wallet
  disconnect() {
    this.provider = null;
    this.signer = null;
  }

  // Get current provider
  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  // Get current signer
  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  // Format address for display
  formatAddress(address: string): string {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Get network name
  getNetworkName(chainId: number): string {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet";
      case 5:
        return "Goerli Testnet";
      case 43114:
        return "Avalanche Mainnet";
      case 43113:
        return "Avalanche Fuji Testnet";
      case 56:
        return "BSC Mainnet";
      case 137:
        return "Polygon Mainnet";
      default:
        return `Chain ID ${chainId}`;
    }
  }
}

// Create singleton instance
export const web3Manager = new Web3Manager();
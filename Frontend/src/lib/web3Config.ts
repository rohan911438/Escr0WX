/**
 * Production-Grade Wagmi Configuration for EscrowX
 * Comprehensive wallet connection system with multi-wallet support
 */

import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Environment variables with validation
const requiredEnvVars = {
  chainId: import.meta.env.VITE_CHAIN_ID || '11155111',
  ethereumRpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://rpc.sepolia.org',
} as const;

// Warn if environment variables are missing (don't crash the app)
if (!import.meta.env.VITE_CHAIN_ID || !import.meta.env.VITE_ETHEREUM_RPC_URL) {
  console.warn('Missing environment variables. Using fallback values. Please set VITE_CHAIN_ID and VITE_ETHEREUM_RPC_URL for production.');
}

const chainId = parseInt(requiredEnvVars.chainId) as 11155111
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || ''

// RPC Configuration - Primary RPC from environment, with reliable fallbacks
const primaryRpcUrl = requiredEnvVars.ethereumRpcUrl;
const rpcFallbacks = [
  primaryRpcUrl,
  'https://rpc.sepolia.org',
  'https://ethereum-sepolia-rpc.publicnode.com', 
  'https://sepolia.gateway.tenderly.co',
  'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
  'https://rpc2.sepolia.org'
].filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

// Enhanced Sepolia chain configuration
export const sepoliaChain = {
  ...sepolia,
  rpcUrls: {
    default: { http: rpcFallbacks },
    public: { http: rpcFallbacks }
  }
}

// Wallet Connectors Configuration
export const connectors = [
  // Injected connector for browser extension wallets
  injected({
    shimDisconnect: true,
    // Target specific wallets for better UX
    target() {
      return {
        id: 'injected',
        name: 'Browser Wallet',
        provider: typeof window !== 'undefined' ? window.ethereum : undefined
      }
    }
  }),
  
  // Coinbase Wallet (extension)
  coinbaseWallet({
    appName: 'EscrowX',
    appLogoUrl: '/logo.png',
    preference: 'smartWalletOnly'
  }),
  
  // WalletConnect v2 as fallback
  ...(walletConnectProjectId ? [
    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: import.meta.env.VITE_APP_NAME || 'EscrowX',
        description: import.meta.env.VITE_APP_DESCRIPTION || 'Ethereum-native escrow protocol',
        url: import.meta.env.VITE_APP_URL || 'https://escrowx.app',
        icons: [import.meta.env.VITE_APP_ICON || '/logo.png']
      },
      showQrModal: true
    })
  ] : [])
]

// Main Wagmi Configuration
export const config = createConfig({
  chains: [sepoliaChain],
  connectors,
  transports: {
    [sepolia.id]: http(primaryRpcUrl, {
      batch: true,
      fetchOptions: {
        mode: 'cors'
      },
      retryCount: 5,
      retryDelay: 1000
    })
  },
  ssr: false, // Disable SSR for wallet connections
  multiInjectedProviderDiscovery: true, // Auto-detect multiple wallets
  syncConnectedChain: true
})

// Supported wallets with metadata
export interface WalletInfo {
  id: string
  name: string
  icon: string
  installed?: boolean
  downloadUrl?: string
  connector: string
}

export const SUPPORTED_WALLETS: Record<string, WalletInfo> = {
  metamask: {
    id: 'io.metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    downloadUrl: 'https://metamask.io/download/',
    connector: 'injected'
  },
  brave: {
    id: 'com.brave.wallet',
    name: 'Brave Wallet',
    icon: '/wallets/brave.svg',
    downloadUrl: 'https://brave.com/wallet/',
    connector: 'injected'
  },
  rabby: {
    id: 'io.rabby',
    name: 'Rabby',
    icon: '/wallets/rabby.svg',
    downloadUrl: 'https://rabby.io/',
    connector: 'injected'
  },
  coinbase: {
    id: 'com.coinbase.wallet',
    name: 'Coinbase Wallet',
    icon: '/wallets/coinbase.svg',
    downloadUrl: 'https://wallet.coinbase.com/',
    connector: 'coinbaseWallet'
  },
  walletconnect: {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '/wallets/walletconnect.svg',
    connector: 'walletConnect'
  }
}

// Chain configuration
export const supportedChains = [sepoliaChain]
export const defaultChain = sepoliaChain
export const SEPOLIA_CHAIN_ID = 11155111

// Utility functions
export const isCorrectNetwork = (chainId: number | undefined): boolean => {
  return chainId === SEPOLIA_CHAIN_ID
}

export const getExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx'): string => {
  return `https://sepolia.etherscan.io/${type}/${hash}`
}

export const formatAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export const getNetworkName = (chainId?: number): string => {
  switch (chainId) {
    case 1: return 'Ethereum Mainnet';
    case 5: return 'Goerli Testnet'; 
    case 11155111: return 'Sepolia Testnet';
    case 137: return 'Polygon';
    case 80001: return 'Polygon Mumbai';
    case 43114: return 'Avalanche';
    case 43113: return 'Avalanche Fuji';
    case 56: return 'BNB Smart Chain';
    case 97: return 'BNB Testnet';
    default: return `Unknown Network (${chainId})`;
  }
};

// Network switching utilities for Sepolia enforcement
export const switchToSepolia = async (): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('No wallet detected');
  }

  try {
    // Try to switch to Sepolia first
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
    });
    
    // Wait a bit for the switch to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (switchError: any) {
    console.log('Switch error:', switchError);
    
    // Error code 4902 means the chain hasn't been added to the wallet
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        // Add Sepolia network to wallet
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7', // 11155111 in hex
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: rpcFallbacks,
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              iconUrls: ['https://sepolia.etherscan.io/images/favicon.ico'],
            },
          ],
        });
        
        // Wait a bit for the add to complete, then try switching again
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Try switching again after adding
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
        
        return true;
      } catch (addError: any) {
        console.error('Failed to add Sepolia network:', addError);
        throw new Error('Failed to add Sepolia network. Please add it manually in your wallet.');
      }
    } else if (switchError.code === 4001) {
      // User rejected the request
      throw new Error('Network switch was rejected. Please manually switch to Sepolia in your wallet.');
    } else {
      console.error('Failed to switch to Sepolia:', switchError);
      throw new Error('Failed to switch network. Please manually switch to Sepolia in your wallet.');
    }
  }
}

// Check if wallet is connected to correct network
export const checkNetwork = async (): Promise<{ isCorrect: boolean; currentChainId?: number }> => {
  if (!window.ethereum) {
    return { isCorrect: false };
  }

  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainIdDecimal = parseInt(currentChainId, 16);
    return {
      isCorrect: chainIdDecimal === SEPOLIA_CHAIN_ID,
      currentChainId: chainIdDecimal
    };
  } catch (error) {
    console.error('Failed to check network:', error);
    return { isCorrect: false };
  }
}

// TypeScript module declaration
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

// Global window extension types for wallet detection
declare global {
  interface Window {
    ethereum?: any
    // Specific wallet objects for detection
    metamask?: any
    brave?: any
    rabby?: any
    coinbaseWalletExtension?: any
  }
}
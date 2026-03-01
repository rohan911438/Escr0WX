/**
 * Production-Grade Wallet Context for EscrowX
 * Manages wallet connection state, modal controls, and network management
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { SEPOLIA_CHAIN_ID, SUPPORTED_WALLETS } from '@/lib/web3Config'

interface WalletContextType {
  // Modal state
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  
  // Connection state
  isConnecting: boolean
  connectionError: string | null
  
  // Network state
  isCorrectNetwork: boolean
  switchToSepolia: () => void
  
  // Wallet detection
  availableWallets: Array<{
    id: string
    name: string
    icon: string
    installed: boolean
    connector: any
  }>
  
  // Actions
  connectWallet: (connectorId: string) => void
  disconnectWallet: () => void
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: React.ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Connection state
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  
  // Network state
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID
  
  // Detect available wallets
  const detectWalletInstallation = useCallback((walletId: string): boolean => {
    if (typeof window === 'undefined') return false
    
    switch (walletId) {
      case 'metamask':
        return Boolean(window.ethereum?.isMetaMask && !window.ethereum?.isBraveWallet)
      case 'brave':
        return Boolean(window.ethereum?.isBraveWallet)
      case 'rabby':
        return Boolean(window.ethereum?.isRabby)
      case 'coinbase':
        return Boolean(window.ethereum?.isCoinbaseWallet || window.coinbaseWalletExtension)
      default:
        return false
    }
  }, [])
  
  // Available wallets with installation status
  const availableWallets = React.useMemo(() => {
    return Object.entries(SUPPORTED_WALLETS).map(([key, wallet]) => {
      const connector = connectors.find(c => {
        if (wallet.connector === 'injected') return c.id === 'injected'
        if (wallet.connector === 'coinbaseWallet') return c.id === 'coinbaseWallet'
        if (wallet.connector === 'walletConnect') return c.id === 'walletConnect'
        return false
      })
      
      return {
        id: key,
        name: wallet.name,
        icon: wallet.icon,
        installed: detectWalletInstallation(key),
        connector
      }
    }).filter(w => w.connector) // Only include wallets with available connectors
  }, [connectors, detectWalletInstallation])
  
  // Modal controls
  const openModal = useCallback(() => {
    setIsModalOpen(true)
    setConnectionError(null)
  }, [])
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setConnectionError(null)
  }, [])
  
  // Connect wallet
  const connectWallet = useCallback(async (connectorId: string) => {
    const wallet = availableWallets.find(w => w.id === connectorId)
    if (!wallet?.connector) {
      setConnectionError('Wallet connector not found')
      return
    }
    
    setIsConnecting(true)
    setConnectionError(null)
    
    try {
      await connect({ connector: wallet.connector })
      closeModal()
    } catch (error: any) {
      console.error('Connection error:', error)
      
      // Handle specific error types
      if (error.code === 4001 || error.message?.includes('rejected')) {
        setConnectionError('Connection request was rejected')
      } else if (error.message?.includes('not installed')) {
        setConnectionError(`${wallet.name} is not installed`)
      } else {
        setConnectionError(error.message || 'Failed to connect wallet')
      }
    } finally {
      setIsConnecting(false)
    }
  }, [availableWallets, connect, closeModal])
  
  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      closeModal()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }, [disconnect, closeModal])
  
  // Switch to Sepolia
  const switchToSepolia = useCallback(async () => {
    if (!switchChain) return
    
    try {
      await switchChain({ chainId: SEPOLIA_CHAIN_ID })
    } catch (error: any) {
      console.error('Network switch error:', error)
      if (error.code === 4001) {
        setConnectionError('Network switch was rejected')
      } else {
        setConnectionError('Failed to switch to Sepolia network')
      }
    }
  }, [switchChain])
  
  // Clear error
  const clearError = useCallback(() => {
    setConnectionError(null)
  }, [])
  
  // Auto-close modal when connected
  useEffect(() => {
    if (isConnected && isModalOpen) {
      closeModal()
    }
  }, [isConnected, isModalOpen, closeModal])
  
  // Auto-prompt network switch on connection
  useEffect(() => {
    if (isConnected && !isCorrectNetwork && switchChain) {
      // Auto-prompt network switch after a brief delay
      const timer = setTimeout(() => {
        switchToSepolia()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isConnected, isCorrectNetwork, switchChain, switchToSepolia])
  
  const value: WalletContextType = {
    // Modal state
    isModalOpen,
    openModal,
    closeModal,
    
    // Connection state
    isConnecting,
    connectionError,
    
    // Network state
    isCorrectNetwork,
    switchToSepolia,
    
    // Wallet detection
    availableWallets,
    
    // Actions
    connectWallet,
    disconnectWallet,
    clearError
  }
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

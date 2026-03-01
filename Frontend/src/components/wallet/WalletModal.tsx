/**
 * Production-Grade Wallet Selection Modal for EscrowX
 * Dark themed modal with wallet icons, installation detection, and smooth animations
 */

'use client'

import React, { useEffect, useState } from 'react'
import { X, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { SUPPORTED_WALLETS } from '@/lib/web3Config'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { 
    availableWallets, 
    connectWallet, 
    isConnecting, 
    connectionError, 
    clearError 
  } = useWallet()
  
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null)
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConnectingWallet(null)
      clearError()
    }
  }, [isOpen, clearError])
  
  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  
  // Handle wallet connection
  const handleWalletConnect = async (walletId: string) => {
    setConnectingWallet(walletId)
    try {
      await connectWallet(walletId)
      // Modal will close automatically via WalletContext
    } catch (error) {
      // Error handling is done in WalletContext
    } finally {
      setConnectingWallet(null)
    }
  }
  
  // Get installation URL for wallets
  const getInstallUrl = (walletId: string): string => {
    const urls: Record<string, string> = {
      metamask: 'https://metamask.io/download/',
      brave: 'https://brave.com/download/',
      rabby: 'https://rabby.io/',
      coinbase: 'https://www.coinbase.com/wallet'
    }
    return urls[walletId] || '#'
  }
  
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose your preferred wallet to connect to EscrowX
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-150 p-1 hover:bg-gray-700/50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Connection error */}
          {connectionError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-400 font-medium">Connection Failed</p>
                  <p className="text-xs text-red-300 mt-1">{connectionError}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Wallet list */}
          <div className="space-y-3">
            {availableWallets.map((wallet) => {
              const isConnectingThis = connectingWallet === wallet.id
              const isCurrentlyConnecting = isConnecting && isConnectingThis
              
              return (
                <button
                  key={wallet.id}
                  onClick={() => wallet.installed ? handleWalletConnect(wallet.id) : window.open(getInstallUrl(wallet.id), '_blank')}
                  disabled={isConnecting}
                  className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Wallet icon */}
                      <div className="w-10 h-10 rounded-xl bg-white p-2 flex items-center justify-center">
                        <img 
                          src={wallet.icon} 
                          alt={wallet.name} 
                          className="w-6 h-6"
                        />
                      </div>
                      
                      {/* Wallet info */}
                      <div className="text-left">
                        <div className="text-sm font-medium text-white flex items-center gap-2">
                          {wallet.name}
                          {wallet.installed && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {wallet.installed ? 'Detected' : 'Not installed'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    <div className="flex items-center">
                      {isCurrentlyConnecting ? (
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-150" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Footer info */}
          <div className="mt-6 pt-4 border-t border-gray-700/50">
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-300">Sepolia Testnet Only</p>
                <p>This app only works on Sepolia testnet. You'll be prompted to switch networks after connecting.</p>
              </div>
            </div>
          </div>
          
          {/* WalletConnect fallback */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-900 px-2 text-gray-400">Or</span>
              </div>
            </div>
            
            <button
              onClick={() => handleWalletConnect('walletConnect')}
              disabled={isConnecting}
              className="mt-3 w-full p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded bg-gradient-to-r from-blue-400 to-blue-600" />
                <span className="text-sm font-medium text-blue-400">
                  {connectingWallet === 'walletConnect' ? 'Connecting...' : 'WalletConnect'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletModal
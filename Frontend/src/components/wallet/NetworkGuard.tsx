/**
 * Network Guard Component for EscrowX
 * Displays warning when user is on wrong network and provides easy switching
 */

'use client'

import React from 'react'
import { useAccount, useChainId } from 'wagmi'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { SEPOLIA_CHAIN_ID } from '@/lib/web3Config'

interface NetworkGuardProps {
  children: React.ReactNode
  showFullPageWarning?: boolean
}

export const NetworkGuard: React.FC<NetworkGuardProps> = ({ 
  children, 
  showFullPageWarning = false 
}) => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { isCorrectNetwork, switchToSepolia } = useWallet()
  
  // Don't show anything if wallet not connected
  if (!isConnected) {
    return <>{children}</>
  }
  
  // Show content if on correct network
  if (isCorrectNetwork) {
    return <>{children}</>
  }
  
  // Full page warning mode
  if (showFullPageWarning) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 border border-yellow-500/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Wrong Network</h2>
          
          <p className="text-gray-300 mb-2">
            EscrowX only works on Sepolia testnet.
          </p>
          
          <p className="text-sm text-gray-400 mb-8">
            You're currently connected to {getNetworkName(chainId)}. 
            Please switch to Sepolia to continue.
          </p>
          
          <button
            onClick={switchToSepolia}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Switch to Sepolia
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Don't have Sepolia ETH? Get some from the{' '}
            <a 
              href="https://sepoliafaucet.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              faucet
            </a>
          </p>
        </div>
      </div>
    )
  }
  
  // Inline banner mode
  return (
    <>
      <div className="bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-400">
                  Wrong Network Detected
                </p>
                <p className="text-xs text-yellow-300">
                  Switch to Sepolia testnet to use EscrowX features
                </p>
              </div>
            </div>
            
            <button
              onClick={switchToSepolia}
              className="bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Switch Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Blur content when on wrong network */}
      <div className={isCorrectNetwork ? '' : 'opacity-50 pointer-events-none'}>
        {children}
      </div>
    </>
  )
}

// Helper function to get network name
function getNetworkName(chainId: number): string {
  const names: Record<number, string> = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia',
    5: 'Goerli',
    137: 'Polygon',
    56: 'BSC',
    42161: 'Arbitrum',
    10: 'Optimism'
  }
  return names[chainId] || `Chain ${chainId}`
}

export default NetworkGuard
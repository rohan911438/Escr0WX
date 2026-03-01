/**
 * Production-Grade Wallet Connection Button for EscrowX
 * Main entry point for wallet connections with glow effects and dropdown
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAccount, useEnsName } from 'wagmi'
import { ChevronDown, AlertTriangle } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { truncateAddress } from '@/lib/utils'

export const WalletButton: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { 
    openModal, 
    disconnectWallet, 
    isCorrectNetwork, 
    switchToSepolia,
    connectionError,
    clearError
  } = useWallet()
  
  const { data: ensName } = useEnsName({ address })
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Handle connection error display
  useEffect(() => {
    if (connectionError) {
      const timer = setTimeout(clearError, 5000) // Auto-clear after 5 seconds
      return () => clearTimeout(timer)
    }
  }, [connectionError, clearError])
  
  // Not connected state
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={openModal}
          className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 blur transition-opacity duration-300" />
          
          {/* Button content */}
          <div className="relative flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Connect Wallet
          </div>
        </button>
        
        {/* Connection error display */}
        {connectionError && (
          <div className="absolute top-full mt-2 right-0 bg-red-500/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs z-50">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{connectionError}</span>
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // Connected state with network warning
  if (!isCorrectNetwork) {
    return (
      <div className="relative">
        <button
          onClick={switchToSepolia}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Switch to Sepolia
        </button>
      </div>
    )
  }
  
  // Connected and correct network
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3"
      >
        {/* Connection indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          
          {/* Display ENS or truncated address */}
          <span className="text-sm">
            {ensName || truncateAddress(address!)}
          </span>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Account info */}
          <div className="px-4 py-3 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {ensName ? ensName[0].toUpperCase() : address![2].toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  {ensName || 'Connected Wallet'}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  {truncateAddress(address!, 6)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Network info */}
          <div className="px-4 py-2 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Network</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-sm text-white">Sepolia</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                // Copy address to clipboard
                navigator.clipboard.writeText(address!)
                setIsDropdownOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-150"
            >
              Copy Address
            </button>
            
            <button
              onClick={() => {
                // Open in Etherscan
                window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')
                setIsDropdownOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-150"
            >
              View on Etherscan
            </button>
            
            <hr className="my-2 border-gray-700/50" />
            
            <button
              onClick={() => {
                disconnectWallet()
                setIsDropdownOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-150"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
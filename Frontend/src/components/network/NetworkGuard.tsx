/**
 * Network Validation Component
 * Ensures users are connected to Sepolia testnet for EscrowX
 */

import React from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Network } from 'lucide-react'
import { NETWORK_CONFIG } from '@/lib/contracts'

export const NetworkGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  // Check if user is connected and on correct network
  const isCorrectNetwork = chainId === NETWORK_CONFIG.chainId
  const shouldShowNetworkPrompt = isConnected && !isCorrectNetwork

  const handleSwitchNetwork = () => {
    switchChain({ chainId: NETWORK_CONFIG.chainId })
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Network className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">Wallet Not Connected</h3>
          <p className="text-muted-foreground">
            Please connect your wallet to use EscrowX
          </p>
        </div>
      </div>
    )
  }

  if (shouldShowNetworkPrompt) {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Wrong Network Detected</AlertTitle>
          <AlertDescription className="mt-2">
            EscrowX runs on Sepolia Testnet. Please switch your network to continue.
            <div className="mt-4 space-y-2">
              <div className="text-sm">
                <strong>Current Network:</strong> Chain ID {chainId}
              </div>
              <div className="text-sm">
                <strong>Required Network:</strong> {NETWORK_CONFIG.name} (Chain ID {NETWORK_CONFIG.chainId})
              </div>
              <div className="text-sm">
                <strong>Contract Address:</strong> 
                <a 
                  href={`${NETWORK_CONFIG.blockExplorer}/address/${NETWORK_CONFIG.chainId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:underline"
                >
                  View on {NETWORK_CONFIG.name} Explorer
                </a>
              </div>
            </div>
            <Button 
              onClick={handleSwitchNetwork}
              disabled={isPending}
              className="mt-4 w-full sm:w-auto"
            >
              {isPending ? 'Switching...' : `Switch to ${NETWORK_CONFIG.name}`}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div>
      {/* Success indicator for correct network */}
      <div className="bg-green-50 border-l-4 border-green-400 p-2 mb-4">
        <div className="flex items-center">
          <Network className="h-4 w-4 text-green-400 mr-2" />
          <p className="text-sm text-green-700">
            Connected to {NETWORK_CONFIG.name} ✓
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default NetworkGuard
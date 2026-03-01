/**
 * Quick Token Setup Helper for EscrowX Testing
 * Helps users get USDC tokens for real transactions
 */

'use client'

import React, { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { TOKEN_ADDRESSES } from '@/lib/contracts'

// USDC Contract ABI (minimal for balance and approve)
const USDC_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
]

export const TokenSetupHelper: React.FC = () => {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)
  
  // Check USDC balance
  const { data: usdcBalance } = useReadContract({
    address: TOKEN_ADDRESSES.USDC as `0x${string}`,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address }
  })
  
  const hasUSDC = usdcBalance && BigInt(usdcBalance.toString()) > 0n
  
  const copyAddress = async (addr: string) => {
    await navigator.clipboard.writeText(addr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const addTokenToWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: TOKEN_ADDRESSES.USDC,
              symbol: 'USDC',
              decimals: 6,
            },
          },
        })
      } catch (error) {
        console.error('Failed to add token:', error)
      }
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💰 Token Setup for Real Transactions
        </CardTitle>
        <CardDescription>
          Get USDC tokens to test real wallet transactions on Sepolia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Balance Check */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Your USDC Balance</h3>
            <p className="text-sm text-gray-600">
              {hasUSDC ? 
                `✅ ${(Number(usdcBalance) / 1e6).toFixed(2)} USDC` : 
                '❌ No USDC tokens found'
              }
            </p>
          </div>
          {!hasUSDC && <AlertCircle className="w-5 h-5 text-yellow-500" />}
          {hasUSDC && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>
        
        {/* Get USDC Steps */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">🚀 Get USDC for Testing:</h3>
          
          {/* Step 1: Faucet */}
          <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Step 1: Get USDC from Faucet</h4>
            <p className="text-blue-700 text-sm mb-2">
              Visit Circle's Sepolia USDC faucet to get test tokens
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://faucet.circle.com/', '_blank')}
            >
              Open USDC Faucet <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {/* Step 2: Add Token */}
          <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Step 2: Add USDC to MetaMask</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-mono">
                <span className="text-green-700">Address:</span>
                <span className="bg-white px-2 py-1 rounded">{TOKEN_ADDRESSES.USDC}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyAddress(TOKEN_ADDRESSES.USDC)}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addTokenToWallet}
              >
                Add USDC to Wallet
              </Button>
            </div>
          </div>
          
          {/* Step 3: Test */}
          <div className="border border-purple-200 bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900">Step 3: Test Real Transactions</h4>
            <p className="text-purple-700 text-sm mb-2">
              Once you have USDC, you can test real contract interactions
            </p>
            <div className="space-y-1 text-sm text-purple-600">
              <p>• Create real escrow listings</p>
              <p>• Approve USDC spending</p>
              <p>• Lock funds in smart contract</p>
              <p>• Pay real gas fees in Sepolia ETH</p>
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            onClick={() => window.open('https://sepolia.etherscan.io/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', '_blank')}
          >
            View USDC on Etherscan <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('https://sepoliafaucet.com/', '_blank')}
          >
            Get Sepolia ETH <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        {hasUSDC && (
          <div className="bg-green-100 border border-green-300 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Ready for Real Transactions!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              You have USDC tokens. Go to the Create Listing page to test real wallet transactions.
            </p>
          </div>
        )}
        
      </CardContent>
    </Card>
  )
}

export default TokenSetupHelper
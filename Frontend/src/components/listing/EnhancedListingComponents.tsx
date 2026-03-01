/**
 * Enhanced Listing Component with Direct Smart Contract Integration
 * Demonstrates proper wagmi usage with transaction handling
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Package, 
  User, 
  Clock, 
  CheckCircle,
  XCircle,
  Upload,
  Eye
} from 'lucide-react'
import { formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'
import {
  useCreateListing,
  useFulfillListing,
  useSubmitProof,
  useVerifyAndRelease,
  useCancelListing,
  useListing,
  useListingPermissions,
  useContractEventListeners,
  type Listing
} from '@/hooks/useContracts'
import { TransactionStatus, TransactionButton } from '@/components/transaction/TransactionStatus'
import { LISTING_STATUS, getListingStatusText, TOKEN_ADDRESSES } from '@/lib/contracts'
import NetworkGuard from '@/components/network/NetworkGuard'

// Create Listing Form Component
export const CreateListingForm: React.FC = () => {
  const [amount, setAmount] = useState('')
  const [premium, setPremium] = useState('')
  const [description, setDescription] = useState('')
  
  const { address } = useAccount()
  const createListingMutation = useCreateListing()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !premium) return
    
    try {
      await createListingMutation.createListing({
        tokenAddress: TOKEN_ADDRESSES.ETH,
        amount: parseEther(amount),
        premium: parseEther(premium)
      })
      
      // Reset form on successful submission
      setAmount('')
      setPremium('')
      setDescription('')
    } catch (error) {
      console.error('Failed to create listing:', error)
    }
  }

  return (
    <NetworkGuard>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Listing
          </CardTitle>
          <CardDescription>
            Create an escrow-backed listing on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Base Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="premium">Premium (ETH)</Label>
                <Input
                  id="premium"
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what you're offering..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            {amount && premium && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Base Amount:</span>
                    <span>{amount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Premium:</span>
                    <span>{premium} ETH</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Locked:</span>
                    <span>{(parseFloat(amount) + parseFloat(premium)).toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>
            )}
            
            <TransactionButton
              onClick={() => {}}
              isPending={createListingMutation.isPending}
              isConfirming={createListingMutation.isConfirming}
              isConfirmed={createListingMutation.isConfirmed}
              disabled={!amount || !premium || !address}
              size="lg"
            >
              Create Listing
            </TransactionButton>
            
            <TransactionStatus
              hash={createListingMutation.hash}
              isPending={createListingMutation.isPending}
              isConfirming={createListingMutation.isConfirming}
              isConfirmed={createListingMutation.isConfirmed}
            />
          </form>
        </CardContent>
      </Card>
    </NetworkGuard>
  )
}

// Listing Display Component
interface ListingCardProps {
  listingId: number
}

export const ListingCard: React.FC<ListingCardProps> = ({ listingId }) => {
  const [proofData, setProofData] = useState('')
  
  const { data: listing, isLoading } = useListing(listingId)
  const { address } = useAccount()
  
  const fulfillMutation = useFulfillListing()
  const submitProofMutation = useSubmitProof()
  const verifyMutation = useVerifyAndRelease()
  const cancelMutation = useCancelListing()
  
  const permissions = useListingPermissions(listing)

  // Enable contract event listeners
  useContractEventListeners()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!listing) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">Listing not found</p>
        </CardContent>
      </Card>
    )
  }

  const handleFulfill = () => {
    fulfillMutation.fulfillListing(listingId)
  }

  const handleSubmitProof = () => {
    if (!proofData.trim()) return
    
    // Create proof hash from the data
    const encoder = new TextEncoder()
    const data = encoder.encode(proofData)
    
    // Simple hash (in production, use proper hash function)
    const hash = '0x' + Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').slice(0, 64).padEnd(64, '0')
    
    submitProofMutation.submitProof({
      listingId,
      proofHash: hash as `0x${string}`
    })
  }

  const handleVerify = () => {
    verifyMutation.verifyAndRelease(listingId)
  }

  const handleCancel = () => {
    cancelMutation.cancelListing(listingId)
  }

  return (
    <NetworkGuard>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Listing #{listing.listingId.toString()}
              </CardTitle>
              <CardDescription>
                Created {new Date(Number(listing.createdAt) * 1000).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge 
              variant={
                listing.status === LISTING_STATUS.OPEN ? 'default' :
                listing.status === LISTING_STATUS.FULFILLED ? 'secondary' :
                listing.status === LISTING_STATUS.PROOF_SUBMITTED ? 'outline' :
                listing.status === LISTING_STATUS.RELEASED ? 'default' :
                'destructive'
              }
            >
              {getListingStatusText(listing.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Listing Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Creator
              </div>
              <p className="font-mono text-xs break-all">
                {listing.creator === address ? 'You' : listing.creator}
              </p>
            </div>
            
            {listing.fulfiller !== '0x0000000000000000000000000000000000000000' && (
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CheckCircle className="h-4 w-4" />
                  Fulfiller
                </div>
                <p className="font-mono text-xs break-all">
                  {listing.fulfiller === address ? 'You' : listing.fulfiller}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Base Amount</p> 
                <p className="font-semibold">{formatEther(listing.amount)} ETH</p>
              </div>
              <div>
                <p className="text-muted-foreground">Premium</p>
                <p className="font-semibold">{formatEther(listing.premium)} ETH</p>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Locked</span>
              <span className="font-bold text-lg">{formatEther(listing.totalAmount)} ETH</span>
            </div>
          </div>
          
          {/* Actions based on status and permissions */}
          <div className="space-y-3">
            {permissions.canFulfill && (
              <div>
                <TransactionButton
                  onClick={handleFulfill}
                  isPending={fulfillMutation.isPending}
                  isConfirming={fulfillMutation.isConfirming}
                  isConfirmed={fulfillMutation.isConfirmed}
                  size="lg"
                  className="w-full"
                >
                  Fulfill Listing
                </TransactionButton>
                <TransactionStatus
                  hash={fulfillMutation.hash}
                  isPending={fulfillMutation.isPending}
                  isConfirming={fulfillMutation.isConfirming}
                  isConfirmed={fulfillMutation.isConfirmed}
                />
              </div>
            )}
            
            {permissions.canSubmitProof && (
              <div className="space-y-2">
                <Label htmlFor="proof">Submit Delivery Proof</Label>
                <Textarea
                  id="proof"
                  placeholder="Enter proof of delivery..."
                  value={proofData}
                  onChange={(e) => setProofData(e.target.value)}
                  rows={3}
                />
                <TransactionButton
                  onClick={handleSubmitProof}
                  isPending={submitProofMutation.isPending}
                  isConfirming={submitProofMutation.isConfirming}
                  isConfirmed={submitProofMutation.isConfirmed}
                  disabled={!proofData.trim()}
                  size="lg"
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Proof
                </TransactionButton>
                <TransactionStatus
                  hash={submitProofMutation.hash}
                  isPending={submitProofMutation.isPending}
                  isConfirming={submitProofMutation.isConfirming}
                  isConfirmed={submitProofMutation.isConfirmed}
                />
              </div>
            )}
            
            {permissions.canVerify && (
              <div>
                <TransactionButton
                  onClick={handleVerify}
                  isPending={verifyMutation.isPending}
                  isConfirming={verifyMutation.isConfirming}
                  isConfirmed={verifyMutation.isConfirmed}
                  size="lg"
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Verify & Release Funds
                </TransactionButton>
                <TransactionStatus
                  hash={verifyMutation.hash}
                  isPending={verifyMutation.isPending}
                  isConfirming={verifyMutation.isConfirming}
                  isConfirmed={verifyMutation.isConfirmed}
                />
              </div>
            )}
            
            {permissions.canCancel && (
              <div>
                <TransactionButton
                  onClick={handleCancel}
                  isPending={cancelMutation.isPending}
                  isConfirming={cancelMutation.isConfirming}
                  isConfirmed={cancelMutation.isConfirmed}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                >
                  Cancel Listing
                </TransactionButton>
                <TransactionStatus
                  hash={cancelMutation.hash}
                  isPending={cancelMutation.isPending}
                  isConfirming={cancelMutation.isConfirming}
                  isConfirmed={cancelMutation.isConfirmed}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </NetworkGuard>
  )
}

export { CreateListingForm, ListingCard }
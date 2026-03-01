/**
 * EscrowX Contract Hooks using wagmi 
 * Direct smart contract integration with transaction handling
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useAccount,
  useWatchContractEvent
} from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { 
  escrowContractConfig, 
  LISTING_STATUS, 
  ESCROW_CONTRACT_ADDRESS,
  TOKEN_ADDRESSES 
} from '@/lib/contracts'

// Types
export interface Listing {
  listingId: bigint
  creator: string
  fulfiller: string
  token: string
  amount: bigint
  premium: bigint
  totalAmount: bigint
  proofHash: string
  status: number
  createdAt: bigint
}

// =================== READ HOOKS ===================

export const useListingCount = () => {
  return useReadContract({
    ...escrowContractConfig,
    functionName: 'getListingCount',
    query: {
      staleTime: 30_000, // 30 seconds
    }
  })
}

export const useListing = (listingId: number | undefined) => {
  return useReadContract({
    ...escrowContractConfig,
    functionName: 'getListing',
    args: listingId !== undefined ? [BigInt(listingId)] : undefined,
    query: {
      enabled: listingId !== undefined && listingId > 0,
      staleTime: 30_000,
    }
  })
}

export const useUserListings = (userAddress?: string) => {
  const { address } = useAccount()
  const targetAddress = userAddress || address

  return useReadContract({
    ...escrowContractConfig,
    functionName: 'getUserListings',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
      staleTime: 30_000,
    }
  })
}

export const useUserFulfillments = (userAddress?: string) => {
  const { address } = useAccount()
  const targetAddress = userAddress || address

  return useReadContract({
    ...escrowContractConfig,
    functionName: 'getUserFulfillments', 
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress,
      staleTime: 30_000,
    }
  })
}

export const useAllListings = (offset = 0, limit = 20) => {
  return useReadContract({
    ...escrowContractConfig,
    functionName: 'getAllListings',
    args: [BigInt(offset), BigInt(limit)],
    query: {
      staleTime: 30_000,
    }
  })
}

// =================== WRITE HOOKS ===================

export const useCreateListing = () => {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const createListing = async ({ 
    tokenAddress, 
    amount, 
    premium 
  }: { 
    tokenAddress: string
    amount: bigint
    premium: bigint 
  }) => {
    try {
      writeContract({
        ...escrowContractConfig,
        functionName: 'createListing',
        args: [tokenAddress, amount, premium],
        value: tokenAddress === TOKEN_ADDRESSES.ETH ? amount + premium : 0n,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to create listing"
      })
    }
  }

  // Invalidate queries when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['listingCount'] })
      queryClient.invalidateQueries({ queryKey: ['userListings'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
      toast({
        title: "Success!",
        description: "Listing created successfully"
      })
    }
  }, [isConfirmed, queryClient, toast])

  return {
    createListing,
    hash,
    isPending,
    isConfirming,
    isConfirmed
  }
}

export const useFulfillListing = () => {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const fulfillListing = async (listingId: number) => {
    try {
      writeContract({
        ...escrowContractConfig,
        functionName: 'fulfillListing',
        args: [BigInt(listingId)],
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to fulfill listing"
      })
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['listing'] })
      queryClient.invalidateQueries({ queryKey: ['userFulfillments'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
      toast({
        title: "Success!",
        description: "Listing fulfilled successfully"
      })
    }
  }, [isConfirmed, queryClient, toast])

  return {
    fulfillListing,
    hash,
    isPending,
    isConfirming,
    isConfirmed
  }
}

export const useSubmitProof = () => {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const submitProof = async ({ 
    listingId, 
    proofHash 
  }: { 
    listingId: number
    proofHash: string 
  }) => {
    try {
      writeContract({
        ...escrowContractConfig,
        functionName: 'submitProof',
        args: [BigInt(listingId), proofHash as `0x${string}`],
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to submit proof"
      })
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['listing'] })
      toast({
        title: "Success!",
        description: "Proof submitted successfully"
      })
    }
  }, [isConfirmed, queryClient, toast])

  return {
    submitProof,
    hash,
    isPending,
    isConfirming,
    isConfirmed
  }
}

export const useVerifyAndRelease = () => {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const verifyAndRelease = async (listingId: number) => {
    try {
      writeContract({
        ...escrowContractConfig,
        functionName: 'verifyAndRelease',
        args: [BigInt(listingId)],
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to verify and release funds"
      })
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['listing'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
      toast({
        title: "Success!",
        description: "Funds released successfully"
      })
    }
  }, [isConfirmed, queryClient, toast])

  return {
    verifyAndRelease,
    hash,
    isPending,
    isConfirming,
    isConfirmed
  }
}

export const useCancelListing = () => {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({
      hash,
    })

  const cancelListing = async (listingId: number) => {
    try {
      writeContract({
        ...escrowContractConfig,
        functionName: 'cancelListing',
        args: [BigInt(listingId)],
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed", 
        description: error instanceof Error ? error.message : "Failed to cancel listing"
      })
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      queryClient.invalidateQueries({ queryKey: ['listing'] })
      queryClient.invalidateQueries({ queryKey: ['userListings'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
      toast({
        title: "Success!",
        description: "Listing cancelled successfully"
      })
    }
  }, [isConfirmed, queryClient, toast])

  return {
    cancelListing,
    hash,
    isPending,
    isConfirming,
    isConfirmed
  }
}

// =================== EVENT LISTENING HOOKS ===================

export const useContractEventListeners = () => {
  const queryClient = useQueryClient()
  
  // Listen for ListingCreated events
  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ListingCreated',
    onLogs(logs) {
      console.log('ListingCreated events:', logs)
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['listingCount'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
      queryClient.invalidateQueries({ queryKey: ['userListings'] })
    },
  })

  // Listen for ListingFulfilled events
  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ListingFulfilled',
    onLogs(logs) {
      console.log('ListingFulfilled events:', logs)
      // Invalidate specific listing and fulfillment queries
      logs.forEach((log) => {
        const listingId = log.args.listingId
        if (listingId) {
          queryClient.invalidateQueries({ queryKey: ['listing', Number(listingId)] })
        }
      })
      queryClient.invalidateQueries({ queryKey: ['userFulfillments'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
    },
  })

  // Listen for ProofSubmitted events
  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ProofSubmitted',
    onLogs(logs) {
      console.log('ProofSubmitted events:', logs)
      logs.forEach((log) => {
        const listingId = log.args.listingId
        if (listingId) {
          queryClient.invalidateQueries({ queryKey: ['listing', Number(listingId)] })
        }
      })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
    },
  })

  // Listen for FundsReleased events
  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'FundsReleased',
    onLogs(logs) {
      console.log('FundsReleased events:', logs)
      logs.forEach((log) => {
        const listingId = log.args.listingId
        if (listingId) {
          queryClient.invalidateQueries({ queryKey: ['listing', Number(listingId)] })
        }
      })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
    },
  })

  // Listen for ListingCancelled events
  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ListingCancelled',
    onLogs(logs) {
      console.log('ListingCancelled events:', logs)
      logs.forEach((log) => {
        const listingId = log.args.listingId
        if (listingId) {
          queryClient.invalidateQueries({ queryKey: ['listing', Number(listingId)] })
        }
      })
      queryClient.invalidateQueries({ queryKey: ['userListings'] })
      queryClient.invalidateQueries({ queryKey: ['allListings'] })
    },
  })
}

// =================== UTILITY HOOKS ===================

export const useTransactionStatus = (hash: `0x${string}` | undefined) => {
  return useWaitForTransactionReceipt({
    hash,
  })
}

// Helper hook to check if user can perform actions on a listing
export const useListingPermissions = (listing?: Listing) => {
  const { address } = useAccount()
  
  if (!listing || !address) {
    return {
      canFulfill: false,
      canSubmitProof: false, 
      canCancel: false,
      canVerify: false
    }
  }

  const isCreator = listing.creator.toLowerCase() === address.toLowerCase()
  const isFulfiller = listing.fulfiller.toLowerCase() === address.toLowerCase()
  
  return {
    canFulfill: listing.status === LISTING_STATUS.OPEN && !isCreator,
    canSubmitProof: listing.status === LISTING_STATUS.FULFILLED && isFulfiller,
    canCancel: listing.status === LISTING_STATUS.OPEN && isCreator,
    canVerify: listing.status === LISTING_STATUS.PROOF_SUBMITTED // Only contract owner can verify in production
  }
}
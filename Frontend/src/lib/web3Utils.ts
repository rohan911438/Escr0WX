/**
 * Web3 Utilities for Contract Interactions
 * Type-safe contract interaction helpers using ethers and wagmi
 */

import { ethers } from 'ethers'
import { 
  CONTRACT_ADDRESSES, 
  TREASURY_ABI, 
  EVVM_MANAGER_ABI,
  LISTING_STATUS 
} from './contracts'

// Types for contract interactions
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

export interface Balance {
  available: bigint
  locked: bigint
  total: bigint
}

export interface TreasuryInfo {
  feeRate: bigint
  accumulatedFees: bigint
}

// Contract interaction utilities
export class ContractUtils {
  private provider: ethers.Provider
  private signer?: ethers.Signer

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider
    this.signer = signer
  }

  // Get Treasury contract instance
  getTreasuryContract(withSigner = false) {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.TREASURY,
      TREASURY_ABI,
      withSigner && this.signer ? this.signer : this.provider
    )
  }

  // Get EVVM Manager contract instance
  getEVVMManagerContract(withSigner = false) {
    return new ethers.Contract(
      CONTRACT_ADDRESSES.EVVM_MANAGER,
      EVVM_MANAGER_ABI,
      withSigner && this.signer ? this.signer : this.provider
    )
  }

  // Treasury contract read functions
  async getListing(listingId: number): Promise<Listing | null> {
    try {
      const contract = this.getTreasuryContract()
      const result = await contract.getListing(listingId)
      
      return {
        listingId: result.listingId,
        creator: result.creator,
        fulfiller: result.fulfiller,
        token: result.token,
        amount: result.amount,
        premium: result.premium,
        totalAmount: result.totalAmount,
        proofHash: result.proofHash,
        status: Number(result.status),
        createdAt: result.createdAt
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
      return null
    }
  }

  async getListingCount(): Promise<number> {
    try {
      const contract = this.getTreasuryContract()
      const count = await contract.getListingCount()
      return Number(count)
    } catch (error) {
      console.error('Error fetching listing count:', error)
      return 0
    }
  }

  async getUserListings(userAddress: string): Promise<number[]> {
    try {
      const contract = this.getTreasuryContract()
      const listings = await contract.getUserListings(userAddress)
      return listings.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('Error fetching user listings:', error)
      return []
    }
  }

  async getUserFulfillments(userAddress: string): Promise<number[]> {
    try {
      const contract = this.getTreasuryContract()
      const fulfillments = await contract.getUserFulfillments(userAddress)
      return fulfillments.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('Error fetching user fulfillments:', error)
      return []
    }
  }

  async getTreasuryInfo(tokenAddress: string): Promise<TreasuryInfo | null> {
    try {
      const contract = this.getTreasuryContract()
      const result = await contract.getTreasuryInfo(tokenAddress)
      
      return {
        feeRate: result.feeRate,
        accumulatedFees: result.accumulatedFees
      }
    } catch (error) {
      console.error('Error fetching treasury info:', error)
      return null
    }
  }

  // Treasury contract write functions (require signer)
  async createListing(
    tokenAddress: string, 
    amount: bigint, 
    premium: bigint
  ): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getTreasuryContract(true)
      const tx = await contract.createListing(tokenAddress, amount, premium)
      return tx
    } catch (error) {
      console.error('Error creating listing:', error)
      return null
    }
  }

  async fulfillListing(listingId: number): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getTreasuryContract(true)
      const tx = await contract.fulfillListing(listingId)
      return tx
    } catch (error) {
      console.error('Error fulfilling listing:', error)
      return null
    }
  }

  async submitProof(
    listingId: number, 
    proofHash: string
  ): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getTreasuryContract(true)
      const tx = await contract.submitProof(listingId, proofHash)
      return tx
    } catch (error) {
      console.error('Error submitting proof:', error)
      return null
    }
  }

  async verifyAndRelease(listingId: number): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getTreasuryContract(true)
      const tx = await contract.verifyAndRelease(listingId)
      return tx
    } catch (error) {
      console.error('Error verifying and releasing funds:', error)
      return null
    }
  }

  async cancelListing(listingId: number): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getTreasuryContract(true)
      const tx = await contract.cancelListing(listingId)
      return tx
    } catch (error) {
      console.error('Error cancelling listing:', error)
      return null
    }
  }

  // EVVM Manager functions
  async getBalance(userAddress: string, tokenAddress: string): Promise<Balance | null> {
    try {
      const contract = this.getEVVMManagerContract()
      const result = await contract.getBalance(userAddress, tokenAddress)
      
      return {
        available: result.available,
        locked: result.locked,
        total: result.total
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
      return null
    }
  }

  async hasSufficientBalance(
    userAddress: string, 
    tokenAddress: string, 
    amount: bigint
  ): Promise<boolean> {
    try {
      const contract = this.getEVVMManagerContract()
      return await contract.hasSufficientBalance(userAddress, tokenAddress, amount)
    } catch (error) {
      console.error('Error checking balance:', error)
      return false
    }
  }

  async deposit(
    tokenAddress: string, 
    amount: bigint, 
    ethValue?: bigint
  ): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getEVVMManagerContract(true)
      const tx = await contract.deposit(tokenAddress, amount, {
        value: ethValue || 0n
      })
      return tx
    } catch (error) {
      console.error('Error depositing funds:', error)
      return null
    }
  }

  async withdraw(
    tokenAddress: string, 
    amount: bigint
  ): Promise<ethers.TransactionResponse | null> {
    if (!this.signer) {
      throw new Error('Signer required for write operations')
    }

    try {
      const contract = this.getEVVMManagerContract(true)
      const tx = await contract.withdraw(tokenAddress, amount)
      return tx
    } catch (error) {
      console.error('Error withdrawing funds:', error)
      return null
    }
  }
}

// Utility functions
export const formatEther = (value: bigint): string => {
  return ethers.formatEther(value)
}

export const parseEther = (value: string): bigint => {
  return ethers.parseEther(value)
}

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address)
}

// Transaction status helpers
export const waitForTransaction = async (
  provider: ethers.Provider,
  txHash: string,
  confirmations = 1
): Promise<ethers.TransactionReceipt | null> => {
  try {
    return await provider.waitForTransaction(txHash, confirmations)
  } catch (error) {
    console.error('Error waiting for transaction:', error)
    return null
  }
}
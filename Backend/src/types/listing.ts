import { z } from 'zod';

// Listing status enum
export enum ListingStatus {
  OPEN = 'OPEN',
  FULFILLED = 'FULFILLED',
  PROOF_PENDING = 'PROOF_PENDING', 
  VERIFIED = 'VERIFIED',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED'
}

// Listing interface
export interface Listing {
  id: number;
  listingId: string;
  creatorAddress: string;
  fulfillerAddress?: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  deliveryTime: number; // in hours
  category?: string;
  status: ListingStatus;
  encryptedCredentials?: string;
  proofHash?: string;
  contractTxHash?: string;
  blockchainListingId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create listing data
export interface CreateListingData {
  listingId: string;
  creatorAddress: string;
  title: string;
  description: string;
  price: string;
  currency?: string;
  deliveryTime: number;
  category?: string;
  status?: ListingStatus;
  blockchainListingId?: number;
  contractTxHash?: string;
}

// Update listing data
export interface UpdateListingData {
  status?: ListingStatus;
  fulfillerAddress?: string;
  encryptedCredentials?: string;
  proofHash?: string;
  blockchainListingId?: number;
}

// Listing filters
export interface ListingFilters {
  status?: ListingStatus;
  category?: string;
  creatorAddress?: string;
  fulfillerAddress?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

// Zod schemas for validation
export const CreateListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  price: z.string().regex(/^\d+(\.\d{1,18})?$/, 'Invalid price format'),
  currency: z.string().default('ETH'),
  deliveryTime: z.number().int().min(1).max(8760), // max 1 year in hours
  category: z.string().min(1).max(50).optional(),
});

export const UpdateListingSchema = z.object({
  status: z.nativeEnum(ListingStatus).optional(),
  fulfillerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  encryptedCredentials: z.string().optional(),
  proofHash: z.string().optional(),
});

export const ListingFiltersSchema = z.object({
  status: z.nativeEnum(ListingStatus).optional(),
  category: z.string().optional(),
  creatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  fulfillerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Delivery credentials interface (before encryption)
export interface DeliveryCredentials {
  type: 'email' | 'url' | 'api_key' | 'access_token' | 'custom';
  value: string;
  additionalInfo?: Record<string, any>;
}
import { z } from 'zod';

// User interface
export interface User {
  id: number;
  walletAddress: string;
  nonce: number;
  totalListings: number;
  totalPurchases: number;
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create user data
export interface CreateUserData {
  walletAddress: string;
  nonce?: number;
}

// Update user data
export interface UpdateUserData {
  nonce?: number;
  totalListings?: number;
  totalPurchases?: number;
  reputationScore?: number;
}

// Zod schemas for validation
export const CreateUserSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  nonce: z.number().int().min(0).optional(),
});

export const UpdateUserSchema = z.object({
  nonce: z.number().int().min(0).optional(),
  totalListings: z.number().int().min(0).optional(),
  totalPurchases: z.number().int().min(0).optional(),
  reputationScore: z.number().min(0).max(5).optional(),
});

export const WalletAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// User stats interface
export interface UserStats {
  totalListings: number;
  totalPurchases: number;
  completedDeals: number;
  reputationScore: number;
  totalVolume: string;
}
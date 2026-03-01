import { z } from 'zod';

// Standard API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
  };
}

// Error types
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
}).transform((data) => ({
  ...data,
  offset: (data.page - 1) * data.limit,
}));

// Environment configuration
export interface Config {
  port: number;
  nodeEnv: string;
  ethRpcUrl: string;
  contractAddress: string;
  privateKey?: string;
  chainId: number;
  databasePath: string;
  jwtSecret: string;
  encryptionKey: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  reconcileIntervalMs: number;
  blockConfirmationCount: number;
  // Solana configuration
  solanaRpc: string;
  solanaProgramId: string;
  solanaPrivateKey: string;
  solanaEnabled: boolean;
}

// Dashboard stats
export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  completedDeals: number;
  totalVolume: string;
  reputationScore: number;
}

// Escrow timeline entry
export interface TimelineEntry {
  id: string;
  timestamp: Date;
  event: string;
  description: string;
  transactionHash?: string;
  status: 'completed' | 'pending' | 'failed';
}
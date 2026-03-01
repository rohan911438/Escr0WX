import { z } from 'zod';

// Auth challenge interface
export interface AuthChallenge {
  id: number;
  walletAddress: string;
  challenge: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// Create challenge data
export interface CreateChallengeData {
  walletAddress: string;
  challenge: string;
  expiresAt: Date;
}

// Auth request interfaces
export interface AuthChallengeRequest {
  walletAddress: string;
}

export interface AuthVerifyRequest {
  walletAddress: string;
  challenge: string;
  signature: string;
}

// Auth response interfaces
export interface AuthChallengeResponse {
  challenge: string;
  expiresAt: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  token?: string;
  user?: {
    walletAddress: string;
    nonce: number;
  };
}

// Zod schemas
export const AuthChallengeRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

export const AuthVerifyRequestSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  challenge: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
});
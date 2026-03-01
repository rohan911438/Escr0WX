import { z } from 'zod';

// Proof status enum
export enum ProofStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

// Proof interface
export interface Proof {
  id: number;
  listingId: string;
  submitterAddress: string;
  proofHash: string;
  proofData: string;
  deliveryNotes?: string;
  status: ProofStatus;
  verificationTxHash?: string;
  createdAt: Date;
  verifiedAt?: Date;
}

// Create proof data
export interface CreateProofData {
  listingId: string;
  submitterAddress: string;
  proofHash: string;
  proofData: string;
  deliveryNotes?: string;
  status?: ProofStatus;
}

// Update proof data
export interface UpdateProofData {
  status?: ProofStatus;
  verificationTxHash?: string;
}

// Proof submission data (from API)
export interface ProofSubmissionData {
  proofType: 'image' | 'document' | 'url' | 'text';
  proofContent: string; // base64 encoded or URL or text
  deliveryNotes?: string;
  metadata?: Record<string, any>;
}

// Zod schemas for validation
export const CreateProofSchema = z.object({
  listingId: z.string().min(1),
  proofType: z.enum(['image', 'document', 'url', 'text']),
  proofContent: z.string().min(1),
  deliveryNotes: z.string().max(1000).optional(),
  metadata: z.record(z.any()).optional(),
});

export const UpdateProofSchema = z.object({
  status: z.nativeEnum(ProofStatus).optional(),
  verificationTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
});
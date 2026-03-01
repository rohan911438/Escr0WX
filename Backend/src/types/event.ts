import { z } from 'zod';

// Blockchain event interface
export interface BlockchainEvent {
  id: number;
  eventName: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  listingId?: string;
  userAddress?: string;
  eventData: Record<string, any>;
  processed: boolean;
  solanaTxSignature?: string;
  solanaAccountPubkey?: string;
  createdAt: Date;
}

// Create event data
export interface CreateEventData {
  eventName: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  listingId?: string;
  userAddress?: string;
  eventData: Record<string, any>;
  solanaTxSignature?: string;
  solanaAccountPubkey?: string;
}

// Event types that we listen for
export enum EventType {
  LISTING_CREATED = 'ListingCreated',
  FUNDS_LOCKED = 'FundsLocked',
  PROOF_SUBMITTED = 'ProofSubmitted',
  FUNDS_RELEASED = 'FundsReleased',
  DISPUTE_RAISED = 'DisputeRaised',
  DISPUTE_RESOLVED = 'DisputeResolved'
}

// Event data structures for different event types
export interface ListingCreatedEvent {
  listingId: number;
  creator: string;
  price: string;
  deliveryTime: number;
}

export interface FundsLockedEvent {
  listingId: number;
  fulfiller: string;
  amount: string;
}

export interface ProofSubmittedEvent {
  listingId: number;
  submitter: string;
  proofHash: string;
}

export interface FundsReleasedEvent {
  listingId: number;
  creator: string;
  fulfiller: string;
  amount: string;
}

// Zod schemas
export const CreateEventSchema = z.object({
  eventName: z.string().min(1),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  blockNumber: z.number().int().positive(),
  blockHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  listingId: z.string().optional(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  eventData: z.record(z.any()),
});
/**
 * Simplified Repositories using In-Memory Storage
 */

import { simpleStorage } from './SimpleStorage';
import { generateId } from '@/utils/helpers';

export class UserRepository {
  async getOrCreate(walletAddress: string): Promise<any> {
    return simpleStorage.getOrCreateUser(walletAddress);
  }

  async findByWallet(walletAddress: string): Promise<any> {
    return simpleStorage.findUserByWallet(walletAddress);
  }

  async update(walletAddress: string, updates: any): Promise<any> {
    return simpleStorage.updateUser(walletAddress, updates);
  }

  async incrementNonce(walletAddress: string): Promise<any> {
    return simpleStorage.incrementNonce(walletAddress);
  }
}

export class ListingRepository {
  async create(data: any): Promise<any> {
    return simpleStorage.createListing(data);
  }

  async findByListingId(listingId: string): Promise<any> {
    return simpleStorage.findListingById(listingId);
  }

  async update(listingId: string, updates: any): Promise<any> {
    return simpleStorage.updateListing(listingId, updates);
  }

  async findAll(filters: any = {}): Promise<any[]> {
    return simpleStorage.findAllListings(filters);
  }
}

export class AuthRepository {
  async createChallenge(data: any): Promise<any> {
    return simpleStorage.createChallenge(data);
  }

  async findValidChallenge(walletAddress: string, challenge: string): Promise<any> {
    return simpleStorage.findValidChallenge(walletAddress, challenge);
  }

  async markChallengeAsUsed(challengeId: number): Promise<any> {
    return simpleStorage.markChallengeAsUsed(challengeId);
  }
}

export class ProofRepository {
  async findByListingId(listingId: string): Promise<any[]> {
    // Mock implementation - return empty array for now
    return [];
  }
}

// Mock implementations for other repositories
export class EventRepository {
  async create(data: any): Promise<any> {
    return { id: 1, ...data };
  }
}
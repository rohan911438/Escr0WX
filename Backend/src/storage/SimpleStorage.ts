/**
 * Simple In-Memory Storage for Development
 * 
 * This provides a simple storage implementation that doesn't require
 * complex database setup, allowing the API to run immediately.
 */

interface User {
  walletAddress: string;
  nonce: number;
  totalListings: number;
  totalPurchases: number;
  reputationScore: number;
  createdAt: Date;
}

interface Listing {
  id: number;
  listingId: string;
  creatorAddress: string;
  fulfillerAddress?: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  deliveryTime: number;
  category?: string;
  status: 'OPEN' | 'FULFILLED' | 'PROOF_PENDING' | 'VERIFIED' | 'RELEASED' | 'DISPUTED';
  createdAt: Date;
  updatedAt: Date;
}

interface AuthChallenge {
  id: number;
  walletAddress: string;
  challenge: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

class SimpleStorage {
  private users: Map<string, User> = new Map();
  private listings: Map<string, Listing> = new Map();
  private challenges: Map<string, AuthChallenge> = new Map();
  private nextId = 1;

  // User methods
  async getOrCreateUser(walletAddress: string): Promise<User> {
    let user = this.users.get(walletAddress);
    if (!user) {
      user = {
        walletAddress,
        nonce: Math.floor(Math.random() * 1000000),
        totalListings: 0,
        totalPurchases: 0,
        reputationScore: 0,
        createdAt: new Date()
      };
      this.users.set(walletAddress, user);
    }
    return user;
  }

  async findUserByWallet(walletAddress: string): Promise<User | null> {
    return this.users.get(walletAddress) || null;
  }

  async updateUser(walletAddress: string, updates: Partial<User>): Promise<User> {
    const user = await this.getOrCreateUser(walletAddress);
    Object.assign(user, updates);
    this.users.set(walletAddress, user);
    return user;
  }

  async incrementNonce(walletAddress: string): Promise<void> {
    const user = await this.getOrCreateUser(walletAddress);
    user.nonce += 1;
    this.users.set(walletAddress, user);
  }

  // Listing methods
  async createListing(data: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>): Promise<Listing> {
    const listing: Listing = {
      ...data,
      id: this.nextId++,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.listings.set(listing.listingId, listing);
    return listing;
  }

  async findListingById(listingId: string): Promise<Listing | null> {
    return this.listings.get(listingId) || null;
  }

  async updateListing(listingId: string, updates: Partial<Listing>): Promise<Listing | null> {
    const listing = this.listings.get(listingId);
    if (!listing) return null;
    
    Object.assign(listing, updates, { updatedAt: new Date() });
    this.listings.set(listingId, listing);
    return listing;
  }

  async findAllListings(filters: any = {}): Promise<Listing[]> {
    let results = Array.from(this.listings.values());
    
    // Apply filters
    if (filters.status) {
      results = results.filter(l => l.status === filters.status);
    }
    if (filters.creatorAddress) {
      results = results.filter(l => l.creatorAddress === filters.creatorAddress);
    }
    if (filters.fulfillerAddress) {
      results = results.filter(l => l.fulfillerAddress === filters.fulfillerAddress);
    }
    if (filters.category) {
      results = results.filter(l => l.category === filters.category);
    }

    // Sort by creation date (newest first)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (filters.offset !== undefined) {
      results = results.slice(filters.offset);
    }
    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  // Auth challenge methods
  async createChallenge(data: Omit<AuthChallenge, 'id' | 'used' | 'createdAt'>): Promise<AuthChallenge> {
    const challenge: AuthChallenge = {
      ...data,
      id: this.nextId++,
      used: false,
      createdAt: new Date()
    };
    
    // Store by wallet address for easy lookup
    this.challenges.set(`${data.walletAddress}:${data.challenge}`, challenge);
    return challenge;
  }

  async findValidChallenge(walletAddress: string, challengeText: string): Promise<AuthChallenge | null> {
    const key = `${walletAddress}:${challengeText}`;
    const challenge = this.challenges.get(key);
    
    if (!challenge || challenge.used || challenge.expiresAt < new Date()) {
      return null;
    }
    
    return challenge;
  }

  async markChallengeAsUsed(challengeId: number): Promise<void> {
    // Find and mark challenge as used
    for (const [key, challenge] of this.challenges.entries()) {
      if (challenge.id === challengeId) {
        challenge.used = true;
        this.challenges.set(key, challenge);
        break;
      }
    }
  }

  // Cleanup old challenges (call periodically)
  cleanup(): void {
    const now = new Date();
    for (const [key, challenge] of this.challenges.entries()) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(key);
      }
    }
  }
}

export const simpleStorage = new SimpleStorage();

// Cleanup every 5 minutes
setInterval(() => simpleStorage.cleanup(), 5 * 60 * 1000);
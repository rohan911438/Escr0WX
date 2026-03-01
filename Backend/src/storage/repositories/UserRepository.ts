import { getDatabase, PromiseDatabase } from '../database';
import { User, CreateUserData, UpdateUserData } from '@/types/user';
import { logger } from '@/utils/logger';

export class UserRepository {
  private db: PromiseDatabase;

  constructor() {
    this.db = getDatabase();
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const result = await this.db.run(`
        INSERT INTO users (wallet_address, nonce)
        VALUES (?, ?)
      `, [userData.walletAddress, userData.nonce || 0]);
      
      return this.findById(result.lastID);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.db.get(`
      SELECT * FROM users WHERE id = ?
    `, [id]);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return this.mapToUser(user);
  }

  async findByWallet(walletAddress: string): Promise<User | null> {
    const user = await this.db.get(`
      SELECT * FROM users WHERE wallet_address = ?
    `, [walletAddress]);
    
    return user ? this.mapToUser(user) : null;
  }

  async update(walletAddress: string, userData: UpdateUserData): Promise<User> {
    try {
      const fields = [];
      const values = [];
      
      if (userData.nonce !== undefined) {
        fields.push('nonce = ?');
        values.push(userData.nonce);
      }
      
      if (userData.totalListings !== undefined) {
        fields.push('total_listings = ?');
        values.push(userData.totalListings);
      }
      
      if (userData.totalPurchases !== undefined) {
        fields.push('total_purchases = ?');
        values.push(userData.totalPurchases);
      }
      
      if (userData.reputationScore !== undefined) {
        fields.push('reputation_score = ?');
        values.push(userData.reputationScore);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(walletAddress);
      
      await this.db.run(`
        UPDATE users SET ${fields.join(', ')}
        WHERE wallet_address = ?
      `, values);
      
      const updatedUser = await this.findByWallet(walletAddress);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      
      return updatedUser;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async incrementNonce(walletAddress: string): Promise<number> {
    await this.db.run(`
      UPDATE users SET nonce = nonce + 1, updated_at = CURRENT_TIMESTAMP
      WHERE wallet_address = ?
    `, [walletAddress]);
    
    const user = await this.findByWallet(walletAddress);
    return user?.nonce || 0;
  }

  async getOrCreate(walletAddress: string): Promise<User> {
    let user = await this.findByWallet(walletAddress);
    
    if (!user) {
      user = await this.create({ walletAddress });
    }
    
    return user;
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      walletAddress: row.wallet_address,
      nonce: row.nonce,
      totalListings: row.total_listings,
      totalPurchases: row.total_purchases,
      reputationScore: row.reputation_score,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
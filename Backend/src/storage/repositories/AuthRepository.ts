import { getDatabase } from '../database';
import { AuthChallenge, CreateChallengeData } from '@/types/auth';
import { logger } from '@/utils/logger';

export class AuthRepository {
  private db = getDatabase();

  async createChallenge(challengeData: CreateChallengeData): Promise<AuthChallenge> {
    try {
      // Clean up expired challenges first
      await this.cleanupExpiredChallenges();
      
      const result = await this.db.run(`
        INSERT INTO auth_challenges (wallet_address, challenge, expires_at)
        VALUES (?, ?, ?)
      `, [
        challengeData.walletAddress,
        challengeData.challenge,
        challengeData.expiresAt.toISOString()
      ]);
      
      return this.findById(result.lastID);
    } catch (error) {
      logger.error('Error creating challenge:', error);
      throw new Error('Failed to create challenge');
    }
  }

  async findById(id: number): Promise<AuthChallenge> {
    const challenge = await this.db.get(`
      SELECT * FROM auth_challenges WHERE id = ?
    `, [id]) as any;
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    return this.mapToChallenge(challenge);
  }

  async findValidChallenge(walletAddress: string, challenge: string): Promise<AuthChallenge | null> {
    const challengeRow = await this.db.get(`
      SELECT * FROM auth_challenges 
      WHERE wallet_address = ? AND challenge = ? AND used = FALSE AND expires_at > datetime('now')
    `, [walletAddress, challenge]) as any;
    
    return challengeRow ? this.mapToChallenge(challengeRow) : null;
  }

  async markChallengeAsUsed(id: number): Promise<void> {
    await this.db.run(`
      UPDATE auth_challenges SET used = TRUE WHERE id = ?
    `, [id]);
  }

  async cleanupExpiredChallenges(): Promise<void> {
    const result = await this.db.run(`
      DELETE FROM auth_challenges WHERE expires_at <= datetime('now')
    `);
    
    if (result.changes > 0) {
      logger.info(`Cleaned up ${result.changes} expired challenges`);
    }
  }

  private mapToChallenge(row: any): AuthChallenge {
    return {
      id: row.id,
      walletAddress: row.wallet_address,
      challenge: row.challenge,
      expiresAt: new Date(row.expires_at),
      used: row.used,
      createdAt: new Date(row.created_at),
    };
  }
}
import { AuthRepository, EventRepository } from '@/storage';
import { getDatabase } from '@/storage/database';
import { logger } from '@/utils/logger';

export class CleanupService {
  private authRepository: AuthRepository;
  private eventRepository: EventRepository;
  
  constructor() {
    this.authRepository = new AuthRepository();
    this.eventRepository = new EventRepository();
  }

  async runCleanup(): Promise<void> {
    try {
      logger.info('Starting scheduled cleanup...');
      
      // Clean up expired auth challenges
      await this.cleanupExpiredChallenges();
      
      // Clean up old processed events (keep last 30 days)
      await this.cleanupOldEvents();
      
      // Clean up temporary files if any
      await this.cleanupTempFiles();
      
      logger.info('Scheduled cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  private async cleanupExpiredChallenges(): Promise<void> {
    try {
      await this.authRepository.cleanupExpiredChallenges();
      logger.info('Expired auth challenges cleaned up');
    } catch (error) {
      logger.error('Error cleaning up auth challenges:', error);
    }
  }

  private async cleanupOldEvents(): Promise<void> {
    try {
      const db = getDatabase();
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const stmt = db.prepare(`
        DELETE FROM events 
        WHERE processed = TRUE AND created_at < ?
      `);
      
      const result = stmt.run(thirtyDaysAgo.toISOString());
      
      if (result.changes > 0) {
        logger.info(`Cleaned up ${result.changes} old events`);
      }
    } catch (error) {
      logger.error('Error cleaning up old events:', error);
    }
  }

  private async cleanupTempFiles(): Promise<void> {
    try {
      // Implement if you have temporary files to clean up
      // For example, uploaded proof files that are older than X days
      logger.debug('Temporary file cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up temp files:', error);
    }
  }

  async optimizeDatabase(): Promise<void> {
    try {
      logger.info('Starting database optimization...');
      
      const db = getDatabase();
      
      // Vacuum the database to reclaim space
      db.exec('VACUUM');
      
      // Analyze tables for query optimization
      db.exec('ANALYZE');
      
      // Update statistics
      const stats = db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM listings) as total_listings,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM events) as total_events,
          (SELECT COUNT(*) FROM proofs) as total_proofs
      `).get();
      
      logger.info('Database optimization completed', stats);
    } catch (error) {
      logger.error('Error optimizing database:', error);
    }
  }

  async getStorageStats(): Promise<{
    databaseSize: string;
    tableStats: Record<string, number>;
  }> {
    try {
      const db = getDatabase();
      
      // Get database file size
      const sizeResult = db.prepare('PRAGMA page_size').get() as { page_size: number };
      const pageCountResult = db.prepare('PRAGMA page_count').get() as { page_count: number };
      
      const databaseSizeBytes = sizeResult.page_size * pageCountResult.page_count;
      const databaseSizeMB = (databaseSizeBytes / (1024 * 1024)).toFixed(2);
      
      // Get table row counts
      const tables = ['listings', 'users', 'events', 'proofs', 'auth_challenges'];
      const tableStats: Record<string, number> = {};
      
      for (const table of tables) {
        try {
          const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
          tableStats[table] = result.count;
        } catch (error) {
          logger.warn(`Error getting stats for table ${table}:`, error);
          tableStats[table] = 0;
        }
      }
      
      return {
        databaseSize: `${databaseSizeMB} MB`,
        tableStats
      };
    } catch (error) {
      logger.error('Error getting storage stats:', error);
      return {
        databaseSize: 'Unknown',
        tableStats: {}
      };
    }
  }
}
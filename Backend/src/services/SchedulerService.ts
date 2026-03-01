import { CronJob } from 'cron';
import { logger } from '@/utils/logger';
import { BlockchainService } from '@/blockchain';
import { EventRepository, ListingRepository, AuthRepository } from '@/storage';
import { ReconciliationService } from './ReconciliationService';
import { CleanupService } from './CleanupService';

export class SchedulerService {
  private jobs: Map<string, CronJob> = new Map();
  private reconciliationService: ReconciliationService;
  private cleanupService: CleanupService;
  private isRunning = false;
  
  constructor(
    private blockchainService: BlockchainService,
    private config: {
      reconcileIntervalMs: number;
    }
  ) {
    this.reconciliationService = new ReconciliationService(blockchainService);
    this.cleanupService = new CleanupService();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Scheduler already running');
      return;
    }

    try {
      // Blockchain reconciliation job - every 30 seconds
      this.scheduleJob(
        'blockchain-reconciliation',
        '*/30 * * * * *', // Every 30 seconds
        () => this.reconciliationService.reconcileBlockchainState()
      );

      // Event processing job - every 10 seconds
      this.scheduleJob(
        'event-processing',
        '*/10 * * * * *', // Every 10 seconds
        () => this.reconciliationService.processUnprocessedEvents()
      );

      // Cleanup job - every hour
      this.scheduleJob(
        'cleanup',
        '0 */1 * * *', // Every hour
        () => this.cleanupService.runCleanup()
      )

      // Database optimization - daily at 2 AM
      this.scheduleJob(
        'database-optimization',
        '0 2 * * *', // Daily at 2 AM
        () => this.cleanupService.optimizeDatabase()
      );

      // Health check job - every 5 minutes
      this.scheduleJob(
        'health-check',
        '*/5 * * * *', // Every 5 minutes
        () => this.performHealthCheck()
      );

      this.isRunning = true;
      logger.info('Background jobs scheduler started');
    } catch (error) {
      logger.error('Error starting scheduler:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Stop all cron jobs
      for (const [name, job] of this.jobs) {
        job.stop();
        logger.info(`Stopped job: ${name}`);
      }
      
      this.jobs.clear();
      this.isRunning = false;
      
      logger.info('Background jobs scheduler stopped');
    } catch (error) {
      logger.error('Error stopping scheduler:', error);
    }
  }

  private scheduleJob(name: string, cronPattern: string, jobFunction: () => Promise<void>): void {
    try {
      const job = new CronJob(
        cronPattern,
        async () => {
          try {
            await jobFunction();
          } catch (error) {
            logger.error(`Error in scheduled job '${name}':`, error);
          }
        },
        null,
        true, // Start immediately
        'UTC'
      );

      this.jobs.set(name, job);
      logger.info(`Scheduled job '${name}' with pattern: ${cronPattern}`);
    } catch (error) {
      logger.error(`Error scheduling job '${name}':`, error);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      logger.info('Performing system health check...');
      
      // Check blockchain connection
      const currentBlock = await this.blockchainService.getCurrentBlock();
      logger.info(`Current block: ${currentBlock}`);
      
      // Check database connectivity
      const stats = await new ListingRepository().getStats();
      logger.info(`Database stats: ${JSON.stringify(stats)}`);
      
      // Check for any stuck transactions or stale data
      await this.reconciliationService.checkForStaleData();
      
      logger.info('Health check completed successfully');
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }

  getJobStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    for (const [name, job] of this.jobs) {
      status[name] = job.running;
    }
    
    return status;
  }
}
import { BlockchainService } from '@/blockchain';
import { EventRepository, ListingRepository } from '@/storage';
import { logger } from '@/utils/logger';
import { ListingStatus } from '@/types/listing';
import { retryWithBackoff } from '@/utils/helpers';

export class ReconciliationService {
  private eventRepository: EventRepository;
  private listingRepository: ListingRepository;
  private isReconciling = false;
  
  constructor(private blockchainService: BlockchainService) {
    this.eventRepository = new EventRepository();
    this.listingRepository = new ListingRepository();
  }

  async reconcileBlockchainState(): Promise<void> {
    if (this.isReconciling) {
      logger.debug('Reconciliation already in progress, skipping...');
      return;
    }

    this.isReconciling = true;
    
    try {
      logger.debug('Starting blockchain state reconciliation...');
      
      // Get the last processed block
      const lastProcessedBlock = await this.eventRepository.getLastProcessedBlock();
      const currentBlock = await this.blockchainService.getCurrentBlock();
      
      if (lastProcessedBlock >= currentBlock) {
        logger.debug('No new blocks to process');
        return;
      }
      
      logger.info(`Reconciling blocks ${lastProcessedBlock + 1} to ${currentBlock}`);
      
      // Process new events in chunks to avoid overwhelming the system
      const chunkSize = 100;
      for (let start = lastProcessedBlock + 1; start <= currentBlock; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, currentBlock);
        await this.processBlockRange(start, end);
      }
      
      logger.info('Blockchain reconciliation completed');
    } catch (error) {
      logger.error('Error during blockchain reconciliation:', error);
    } finally {
      this.isReconciling = false;
    }
  }

  private async processBlockRange(fromBlock: number, toBlock: number): Promise<void> {
    try {
      // This would typically fetch and process events from the blockchain
      // For now, we'll just update the last processed block
      // In a real implementation, you'd call the blockchain service to get events
      
      logger.debug(`Processing block range: ${fromBlock} - ${toBlock}`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      logger.error(`Error processing block range ${fromBlock}-${toBlock}:`, error);
      throw error;
    }
  }

  async processUnprocessedEvents(): Promise<void> {
    try {
      const unprocessedEvents = await this.eventRepository.findUnprocessed();
      
      if (unprocessedEvents.length === 0) {
        return;
      }
      
      logger.info(`Processing ${unprocessedEvents.length} unprocessed events`);
      
      for (const event of unprocessedEvents) {
        try {
          await this.processEvent(event);
          await this.eventRepository.markAsProcessed(event.id);
        } catch (error) {
          logger.error(`Error processing event ${event.id}:`, error);
        }
      }
      
      logger.info('Finished processing unprocessed events');
    } catch (error) {
      logger.error('Error processing unprocessed events:', error);
    }
  }

  private async processEvent(event: any): Promise<void> {
    try {
      switch (event.eventName) {
        case 'ListingCreated':
          await this.handleListingCreatedEvent(event);
          break;
          
        case 'FundsLocked':
          await this.handleFundsLockedEvent(event);
          break;
          
        case 'ProofSubmitted':
          await this.handleProofSubmittedEvent(event);
          break;
          
        case 'FundsReleased':
          await this.handleFundsReleasedEvent(event);
          break;
          
        default:
          logger.warn(`Unknown event type: ${event.eventName}`);
      }
    } catch (error) {
      logger.error(`Error processing ${event.eventName} event:`, error);
      throw error;
    }
  }

  private async handleListingCreatedEvent(event: any): Promise<void> {
    const eventData = event.eventData;
    
    // Update listing with blockchain ID if it exists
    if (event.listingId) {
      const listing = await this.listingRepository.findByListingId(event.listingId);
      if (listing) {
        await this.listingRepository.update(event.listingId, {
          blockchainListingId: parseInt(eventData.listingId),
          status: ListingStatus.OPEN
        });
      }
    }
  }

  private async handleFundsLockedEvent(event: any): Promise<void> {
    const eventData = event.eventData;
    
    if (event.listingId) {
      const listing = await this.listingRepository.findByListingId(event.listingId);
      if (listing) {
        await this.listingRepository.update(event.listingId, {
          status: ListingStatus.FULFILLED,
          fulfillerAddress: eventData.fulfiller
        });
      }
    }
  }

  private async handleProofSubmittedEvent(event: any): Promise<void> {
    const eventData = event.eventData;
    
    if (event.listingId) {
      const listing = await this.listingRepository.findByListingId(event.listingId);
      if (listing) {
        await this.listingRepository.update(event.listingId, {
          status: ListingStatus.PROOF_PENDING,
          proofHash: eventData.proofHash
        });
      }
    }
  }

  private async handleFundsReleasedEvent(event: any): Promise<void> {
    if (event.listingId) {
      const listing = await this.listingRepository.findByListingId(event.listingId);
      if (listing) {
        await this.listingRepository.update(event.listingId, {
          status: ListingStatus.RELEASED
        });
      }
    }
  }

  async checkForStaleData(): Promise<void> {
    try {
      logger.debug('Checking for stale data...');
      
      // Check for listings stuck in transitional states
      const staleListings = await this.listingRepository.findAll({
        status: ListingStatus.PROOF_PENDING
      });
      
      const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();
      
      for (const listing of staleListings) {
        const timeSinceUpdate = now - listing.updatedAt.getTime();
        
        if (timeSinceUpdate > staleThreshold) {
          logger.warn(`Stale listing detected: ${listing.listingId} (${timeSinceUpdate}ms old)`);
          
          // Optionally, you could implement automatic state correction here
          // For example, reverting to previous state or flagging for manual review
        }
      }
      
      logger.debug('Stale data check completed');
    } catch (error) {
      logger.error('Error checking for stale data:', error);
    }
  }

  async syncListingWithContract(listingId: string): Promise<void> {
    try {
      const listing = await this.listingRepository.findByListingId(listingId);
      
      if (!listing?.blockchainListingId) {
        logger.warn(`No blockchain ID for listing: ${listingId}`);
        return;
      }
      
      // Get current state from contract
      const contractListing = await retryWithBackoff(
        () => this.blockchainService.getContractListing(listing.blockchainListingId!)
      );
      
      // Compare and update if necessary
      if (this.shouldUpdateListing(listing, contractListing)) {
        await this.updateListingFromContract(listing.listingId, contractListing);
        logger.info(`Synchronized listing ${listingId} with contract`);
      }
    } catch (error) {
      logger.error(`Error syncing listing ${listingId} with contract:`, error);
    }
  }

  private shouldUpdateListing(dbListing: any, contractListing: any): boolean {
    // Implement logic to determine if update is needed
    // This could check status, proof hash, etc.
    return dbListing.proofHash !== contractListing.proofHash ||
           this.mapContractStatus(contractListing.status) !== dbListing.status;
  }

  private async updateListingFromContract(listingId: string, contractListing: any): Promise<void> {
    await this.listingRepository.update(listingId, {
      status: this.mapContractStatus(contractListing.status),
      proofHash: contractListing.proofHash || undefined,
      fulfillerAddress: contractListing.fulfiller !== '0x0000000000000000000000000000000000000000' 
        ? contractListing.fulfiller 
        : undefined
    });
  }

  private mapContractStatus(contractStatus: number): ListingStatus {
    // Map contract status enum to our status enum
    switch (contractStatus) {
      case 0: return ListingStatus.OPEN;
      case 1: return ListingStatus.FULFILLED;
      case 2: return ListingStatus.PROOF_PENDING;
      case 3: return ListingStatus.VERIFIED;
      case 4: return ListingStatus.RELEASED;
      case 5: return ListingStatus.DISPUTED;
      default: return ListingStatus.OPEN;
    }
  }
}
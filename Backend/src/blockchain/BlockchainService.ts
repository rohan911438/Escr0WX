import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ABI } from './ContractABI';
import { EventRepository, ListingRepository } from '@/storage';
import { logger } from '@/utils/logger';
import { EventType, CreateEventData } from '@/types/event';
import { ListingStatus } from '@/types/listing';
import { solanaAuditService } from '@/solana/solanaService';
import { config } from '@/config';

/**
 * Blockchain Service - Event Indexing Only
 * 
 * This service is responsible for:
 * 1. Listening to EscrowX contract events
 * 2. Indexing events in the database
 * 3. Syncing contract state with local storage
 * 
 * It does NOT execute any blockchain transactions - those are handled by the frontend.
 */
export class BlockchainService {
  private provider!: ethers.JsonRpcProvider;  // Definite assignment assertion
  private contract!: ethers.Contract;
  private eventRepository: EventRepository;
  private listingRepository: ListingRepository;
  private isListening: boolean = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private blockPollingInterval: NodeJS.Timeout | undefined;
  
  constructor(
    private config: {
      rpcUrl: string;
      contractAddress: string;
      privateKey?: string;
      chainId: number;
      confirmationBlocks: number;
    }
  ) {
    this.eventRepository = new EventRepository();
    this.listingRepository = new ListingRepository();
    this.initializeProvider();
    this.initializeContract();
  }

  private initializeProvider(): void {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      
      // Test the connection
      this.provider.getNetwork().then(() => {
        logger.info('Blockchain provider connected successfully');
      }).catch((error) => {
        logger.error('Failed to connect to blockchain provider:', error);
      });
      
      logger.info('Blockchain provider initialized');
    } catch (error) {
      logger.error('Failed to initialize blockchain provider:', error);
      throw error;
    }
  }

  private initializeContract(): void {
    try {
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        ESCROW_CONTRACT_ABI,
        this.provider
      );
      
      logger.info(`Contract initialized at address: ${this.config.contractAddress}`);
    } catch (error) {
      logger.error('Failed to initialize contract:', error);
      throw error;
    }
  }

  async startEventListening(): Promise<void> {
    if (this.isListening) {
      logger.warn('Event listening already active');
      return;
    }

    try {
      // Get the last processed block to resume from
      const fromBlock = await this.getLastProcessedBlock();
      logger.info(`Starting event listening from block: ${fromBlock}`);

      // Start polling for new blocks and events
      await this.startEventPolling(fromBlock);
      
      this.isListening = true;
      this.reconnectAttempts = 0;
      logger.info('Event listening started successfully with block polling');
    } catch (error) {
      logger.error('Failed to start event listening:', error);
      throw error;
    }
  }

  async stopEventListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      // Clear polling interval
      if (this.blockPollingInterval) {
        clearInterval(this.blockPollingInterval);
        this.blockPollingInterval = undefined;
      }
      
      this.isListening = false;
      logger.info('Event listening stopped');
    } catch (error) {
      logger.error('Error stopping event listening:', error);
    }
  }

  private async startEventPolling(fromBlock: number): Promise<void> {
    let lastProcessedBlock = fromBlock;
    
    // Poll for new blocks every 15 seconds
    this.blockPollingInterval = setInterval(async () => {
      try {
        const currentBlock = await this.provider.getBlockNumber();
        
        if (currentBlock > lastProcessedBlock) {
          logger.info(`Processing blocks ${lastProcessedBlock + 1} to ${currentBlock}`);
          
          // Process events in the new blocks
          for (let blockNumber = lastProcessedBlock + 1; blockNumber <= currentBlock; blockNumber++) {
            await this.processEventChunk(blockNumber, blockNumber);
          }
          
          lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        logger.error('Error during block polling:', error);
      }
    }, 15000); // Poll every 15 seconds
  }



  private async processEventChunk(fromBlock: number, toBlock: number): Promise<void> {
    try {
      // Get all events for this block range
      const filter = {
        address: this.config.contractAddress,
        fromBlock,
        toBlock
      };
      
      const logs = await this.provider.getLogs(filter);
      
      for (const log of logs) {
        try {
          const parsedLog = this.contract.interface.parseLog(log);
          if (parsedLog) {
            await this.processEvent(parsedLog, log);
          }
        } catch (parseError) {
          logger.warn('Failed to parse log:', parseError);
        }
      }
    } catch (error) {
      logger.error(`Error processing events for blocks ${fromBlock}-${toBlock}:`, error);
    }
  }

  private async processEvent(parsedLog: ethers.LogDescription, log: ethers.Log): Promise<void> {
    try {
      const eventData: CreateEventData = {
        eventName: parsedLog.name,
        contractAddress: log.address,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        eventData: Object.fromEntries(
          parsedLog.fragment.inputs.map((input, index) => [
            input.name,
            parsedLog.args[index].toString()
          ])
        )
      };

      // Store event in database
      await this.eventRepository.create(eventData);
    } catch (error) {
      logger.error('Error processing event:', error);
    }
  }

  private async handleListingCreatedEvent(data: any): Promise<void> {
    try {
      logger.info(`ListingCreated event: Listing ${data.listingId} by ${data.creator}`);
      
      // Store event and sync local state
      const eventData: CreateEventData = {
        eventName: 'ListingCreated',
        contractAddress: this.config.contractAddress,
        transactionHash: data.event.transactionHash,
        blockNumber: data.event.blockNumber,
        blockHash: data.event.blockHash,
        eventData: {
          listingId: data.listingId,
          creator: data.creator,
          token: data.token,
          amount: data.amount,
          premium: data.premium,
          totalAmount: data.totalAmount
        }
      };
      
      // Store Ethereum event first (critical path)
      const storedEvent = await this.eventRepository.create(eventData);
      
      // Write to Solana audit ledger (non-blocking)
      if (config.solanaEnabled) {
        this.writeSolanaLifecycleRecord(data, storedEvent).catch(error => {
          logger.error('Solana audit write failed (non-critical):', error);
        });
      }
    } catch (error) {
      logger.error('Error handling ListingCreated event:', error);
    }
  }

  private async handleListingFulfilledEvent(data: any): Promise<void> {
    try {
      logger.info(`ListingFulfilled event: Listing ${data.listingId} by ${data.fulfiller}`);
      
      const eventData: CreateEventData = {
        eventName: 'ListingFulfilled',
        contractAddress: this.config.contractAddress,
        transactionHash: data.event.transactionHash,
        blockNumber: data.event.blockNumber,
        blockHash: data.event.blockHash,
        eventData: {
          listingId: data.listingId,
          fulfiller: data.fulfiller
        }
      };
      
      await this.eventRepository.create(eventData);
    } catch (error) {
      logger.error('Error handling ListingFulfilled event:', error);
    }
  }

  private async handleProofSubmittedEvent(data: any): Promise<void> {
    try {
      logger.info(`ProofSubmitted event: Listing ${data.listingId} by ${data.fulfiller}`);
      
      const eventData: CreateEventData = {
        eventName: 'ProofSubmitted', 
        contractAddress: this.config.contractAddress,
        transactionHash: data.event.transactionHash,
        blockNumber: data.event.blockNumber,
        blockHash: data.event.blockHash,
        eventData: {
          listingId: data.listingId,
          fulfiller: data.fulfiller,
          proofHash: data.proofHash
        }
      };
      
      // Store Ethereum event first (critical path)
      const storedEvent = await this.eventRepository.create(eventData);
      
      // Write to Solana audit ledger (non-blocking)
      if (config.solanaEnabled) {
        this.writeSolanaDisputeRecord(data, storedEvent).catch(error => {
          logger.error('Solana audit write failed (non-critical):', error);
        });
      }
    } catch (error) {
      logger.error('Error handling ProofSubmitted event:', error);
    }
  }

  private async handleFundsReleasedEvent(data: any): Promise<void> {
    try {
      logger.info(`FundsReleased event: Listing ${data.listingId}, amount ${data.amount}`);
      
      const eventData: CreateEventData = {
        eventName: 'FundsReleased',
        contractAddress: this.config.contractAddress,
        transactionHash: data.event.transactionHash,
        blockNumber: data.event.blockNumber,
        blockHash: data.event.blockHash,
        eventData: {
          listingId: data.listingId,
          fulfiller: data.fulfiller,
          amount: data.amount
        }
      };
      
      // Store Ethereum event first (critical path)
      const storedEvent = await this.eventRepository.create(eventData);
      
      // Write to Solana audit ledger (non-blocking)
      if (config.solanaEnabled) {
        this.writeSolanaLifecycleRecord(data, storedEvent).catch(error => {
          logger.error('Solana audit write failed (non-critical):', error);
        });
      }
    } catch (error) {
      logger.error('Error handling FundsReleased event:', error);
    }
  }

  private async handleListingCancelledEvent(data: any): Promise<void> {
    try {
      logger.info(`ListingCancelled event: Listing ${data.listingId} by ${data.creator}`);
      
      const eventData: CreateEventData = {
        eventName: 'ListingCancelled',
        contractAddress: this.config.contractAddress,
        transactionHash: data.event.transactionHash,
        blockNumber: data.event.blockNumber,
        blockHash: data.event.blockHash,
        eventData: {
          listingId: data.listingId,
          creator: data.creator,
          refundAmount: data.refundAmount
        }
      };
      
      await this.eventRepository.create(eventData);
    } catch (error) {
      logger.error('Error handling ListingCancelled event:', error);
    }
  }

  private async getLastProcessedBlock(): Promise<number> {
    try {
      const lastBlock = await this.eventRepository.getLastProcessedBlock();
      return lastBlock || 0;
    } catch (error) {
      logger.error('Error getting last processed block:', error);
      return 0;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    
    logger.info(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.stopEventListening();
        this.initializeProvider();
        this.initializeContract();
        await this.startEventListening();
      } catch (error) {
        logger.error('Reconnection failed:', error);
        await this.handleReconnect();
      }
    }, delay);
  }

  // Read-only contract query methods (no transaction execution)
  async getContractListing(listingId: number): Promise<any> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      const contract = this.contract; // Local reference to avoid undefined issues
      const listing = await contract.getListing(listingId);
      return {
        listingId: listing.listingId.toString(),
        creator: listing.creator,
        fulfiller: listing.fulfiller,
        token: listing.token,
        amount: listing.amount.toString(),
        premium: listing.premium.toString(),
        totalAmount: listing.totalAmount.toString(),
        proofHash: listing.proofHash,
        status: listing.status,
        createdAt: listing.createdAt.toString()
      };
    } catch (error) {
      logger.error(`Error getting contract listing ${listingId}:`, error);
      throw error;
    }
  }

  async getListingCount(): Promise<number> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      const contract = this.contract; // Local reference to avoid undefined issues
      const count = await contract.getListingCount();
      return parseInt(count.toString());
    } catch (error) {
      logger.error('Error getting listing count:', error);
      throw error;
    }
  }
  
  async getContractVersion(): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }
      const contract = this.contract; // Local reference to avoid undefined issues
      return await contract.getVersion();
    } catch (error) {
      logger.error('Error getting contract version:', error);
      throw error;
    }
  }

  async getCurrentBlock(): Promise<number> {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting current block:', error);
      throw error;
    }
  }

  // Solana Audit Integration (non-blocking)
  private async writeSolanaLifecycleRecord(eventData: any, storedEvent: any): Promise<void> {
    try {
      const result = await solanaAuditService.writeLifecycleRecord({
        listingId: parseInt(eventData.listingId.toString()),
        ethTxHash: eventData.event.transactionHash,
        actor: eventData.creator || eventData.fulfiller,
        amount: parseInt(eventData.amount?.toString() || eventData.totalAmount?.toString() || '0')
      });

      if (result.success && result.txSignature && result.accountPubkey) {
        // Update the stored event with Solana transaction info
        await this.eventRepository.updateSolanaTransaction(
          eventData.event.transactionHash,
          storedEvent.eventName,
          result.txSignature,
          result.accountPubkey
        );
        
        logger.info('✅ Solana lifecycle audit record created', {
          listingId: eventData.listingId,
          ethTxHash: eventData.event.transactionHash,
          solanaTxSignature: result.txSignature,
          solanaExplorer: `https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`
        });
      } else {
        logger.warn('⚠️ Solana lifecycle audit failed', {
          listingId: eventData.listingId,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('❌ Solana lifecycle audit error:', {
        listingId: eventData.listingId,
        error: error.message
      });
    }
  }

  private async writeSolanaDisputeRecord(eventData: any, storedEvent: any): Promise<void> {
    try {
      const result = await solanaAuditService.writeDisputeRecord({
        listingId: parseInt(eventData.listingId.toString()),
        ethTxHash: eventData.event.transactionHash,
        actor: eventData.fulfiller,
        proofHash: eventData.proofHash
      });

      if (result.success && result.txSignature && result.accountPubkey) {
        // Update the stored event with Solana transaction info
        await this.eventRepository.updateSolanaTransaction(
          eventData.event.transactionHash,
          storedEvent.eventName,  
          result.txSignature,
          result.accountPubkey
        );
        
        logger.info('✅ Solana dispute audit record created', {
          listingId: eventData.listingId,
          ethTxHash: eventData.event.transactionHash,
          solanaTxSignature: result.txSignature,
          solanaExplorer: `https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`
        });
      } else {
        logger.warn('⚠️ Solana dispute audit failed', {
          listingId: eventData.listingId,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('❌ Solana dispute audit error:', {
        listingId: eventData.listingId,
        error: error.message
      });
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.stopEventListening();
    
    if (this.blockPollingInterval) {
      clearInterval(this.blockPollingInterval);
      this.blockPollingInterval = undefined;
    }
    
    // JsonRpcProvider doesn't need explicit cleanup like WebSocketProvider
    logger.info('Blockchain service cleanup completed');
  }
}
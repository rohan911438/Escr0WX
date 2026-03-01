import { getDatabase } from '../database';
import { BlockchainEvent, CreateEventData } from '@/types/event';
import { logger } from '@/utils/logger';

export class EventRepository {
  private db = getDatabase();

  async create(eventData: CreateEventData): Promise<BlockchainEvent> {
    try {
      const result = await this.db.run(`
        INSERT INTO events (
          event_name, contract_address, transaction_hash, block_number,
          block_hash, listing_id, user_address, event_data, solana_tx_signature, solana_account_pubkey
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        eventData.eventName,
        eventData.contractAddress,
        eventData.transactionHash,
        eventData.blockNumber,
        eventData.blockHash,
        eventData.listingId,
        eventData.userAddress,
        JSON.stringify(eventData.eventData),
        eventData.solanaTxSignature || null,
        eventData.solanaAccountPubkey || null
      ]);
      
      return this.findById(result.lastID as number);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        logger.warn('Duplicate event ignored:', eventData.transactionHash);
        // Return existing event
        return this.findByTxHash(eventData.transactionHash, eventData.eventName)!;
      }
      logger.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  async findById(id: number): Promise<BlockchainEvent> {
    const event = await this.db.get(`
      SELECT * FROM events WHERE id = ?
    `, [id]) as any;
    if (!event) {
      throw new Error('Event not found');
    }
    
    return this.mapToEvent(event);
  }

  async findByTxHash(txHash: string, eventName: string): Promise<BlockchainEvent | null> {
    const event = await this.db.get(`
      SELECT * FROM events WHERE transaction_hash = ? AND event_name = ?
    `, [txHash, eventName]) as any;
    return event ? this.mapToEvent(event) : null;
  }

  async findByListingId(listingId: string): Promise<BlockchainEvent[]> {
    const events = await this.db.all(`
      SELECT * FROM events WHERE listing_id = ? ORDER BY block_number ASC
    `, [listingId]) as any[];
    return events.map(this.mapToEvent);
  }

  async findUnprocessed(): Promise<BlockchainEvent[]> {
    const events = await this.db.all(`
      SELECT * FROM events WHERE processed = FALSE ORDER BY block_number ASC
    `) as any[];
    return events.map(this.mapToEvent);
  }

  async markAsProcessed(id: number): Promise<void> {
    await this.db.run(`
      UPDATE events SET processed = TRUE WHERE id = ?
    `, [id]);
  }

  async getLastProcessedBlock(): Promise<number> {
    const result = await this.db.get(`
      SELECT MAX(block_number) as last_block FROM events WHERE processed = TRUE
    `) as any;
    return result?.last_block || 0;
  }

  async findByBlockRange(fromBlock: number, toBlock: number): Promise<BlockchainEvent[]> {
    const events = await this.db.all(`
      SELECT * FROM events 
      WHERE block_number >= ? AND block_number <= ?
      ORDER BY block_number ASC
    `, [fromBlock, toBlock]) as any[];
    return events.map(this.mapToEvent);
  }

  async updateSolanaTransaction(txHash: string, eventName: string, solanaTxSignature: string, solanaAccountPubkey: string): Promise<void> {
    try {
      await this.db.run(`
        UPDATE events 
        SET solana_tx_signature = ?, solana_account_pubkey = ?
        WHERE transaction_hash = ? AND event_name = ?
      `, [solanaTxSignature, solanaAccountPubkey, txHash, eventName]);
      
      logger.info('Updated event with Solana transaction data', {
        ethTxHash: txHash,
        eventName,
        solanaTxSignature,
        solanaAccountPubkey
      });
    } catch (error) {
      logger.error('Error updating event with Solana transaction:', error);
    }
  }

  private mapToEvent(row: any): BlockchainEvent {
    return {
      id: row.id,
      eventName: row.event_name,
      contractAddress: row.contract_address,
      transactionHash: row.transaction_hash,
      blockNumber: row.block_number,
      blockHash: row.block_hash,
      listingId: row.listing_id,
      userAddress: row.user_address,
      eventData: JSON.parse(row.event_data),
      processed: row.processed,
      solanaTxSignature: row.solana_tx_signature,
      solanaAccountPubkey: row.solana_account_pubkey,
      createdAt: new Date(row.created_at),
    };
  }
}
import { getDatabase } from '../database';
import { Listing, CreateListingData, UpdateListingData, ListingStatus, ListingFilters } from '@/types/listing';
import { logger } from '@/utils/logger';

export class ListingRepository {
  private db = getDatabase();

  async create(listingData: CreateListingData): Promise<Listing> {
    try {
      const result = await this.db.run(`
        INSERT INTO listings (
          listing_id, creator_address, title, description, price, currency,
          delivery_time, category, status, blockchain_listing_id, contract_tx_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        listingData.listingId,
        listingData.creatorAddress,
        listingData.title,
        listingData.description,
        listingData.price,
        listingData.currency || 'ETH',
        listingData.deliveryTime,
        listingData.category,
        listingData.status || ListingStatus.OPEN,
        listingData.blockchainListingId,
        listingData.contractTxHash
      ]);
      
      return this.findById(result.lastID);
    } catch (error) {
      logger.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  }

  async findById(id: number): Promise<Listing> {
    const listing = await this.db.get(`
      SELECT * FROM listings WHERE id = ?
    `, [id]) as any;
    
    if (!listing) {
      throw new Error('Listing not found');
    }
    
    return this.mapToListing(listing);
  }

  async findByListingId(listingId: string): Promise<Listing | null> {
    const listing = await this.db.get(`
      SELECT * FROM listings WHERE listing_id = ?
    `, [listingId]) as any;
    
    return listing ? this.mapToListing(listing) : null;
  }

  async findByBlockchainId(blockchainId: number): Promise<Listing | null> {
    const listing = await this.db.get(`
      SELECT * FROM listings WHERE blockchain_listing_id = ?
    `, [blockchainId]) as any;
    
    return listing ? this.mapToListing(listing) : null;
  }

  async findAll(filters: ListingFilters = {}): Promise<Listing[]> {
    let query = 'SELECT * FROM listings WHERE 1=1';
    const params: any[] = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters.creatorAddress) {
      query += ' AND creator_address = ?';
      params.push(filters.creatorAddress);
    }
    
    if (filters.fulfillerAddress) {
      query += ' AND fulfiller_address = ?';
      params.push(filters.fulfillerAddress);
    }
    
    if (filters.minPrice) {
      query += ' AND CAST(price as REAL) >= ?';
      params.push(filters.minPrice);
    }
    
    if (filters.maxPrice) {
      query += ' AND CAST(price as REAL) <= ?';
      params.push(filters.maxPrice);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }
    
    const listings = await this.db.all(query, params) as any[];
    
    return listings.map(this.mapToListing);
  }

  async update(listingId: string, updateData: UpdateListingData): Promise<Listing> {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.status) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      
      if (updateData.fulfillerAddress) {
        fields.push('fulfiller_address = ?');
        values.push(updateData.fulfillerAddress);
      }
      
      if (updateData.encryptedCredentials) {
        fields.push('encrypted_credentials = ?');
        values.push(updateData.encryptedCredentials);
      }
      
      if (updateData.proofHash) {
        fields.push('proof_hash = ?');
        values.push(updateData.proofHash);
      }
      
      if (updateData.blockchainListingId) {
        fields.push('blockchain_listing_id = ?');
        values.push(updateData.blockchainListingId);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(listingId);
      
      await this.db.run(`
        UPDATE listings SET ${fields.join(', ')}
        WHERE listing_id = ?
      `, values);
      
      const updatedListing = await this.findByListingId(listingId);
      if (!updatedListing) {
        throw new Error('Listing not found after update');
      }
      
      return updatedListing;
    } catch (error) {
      logger.error('Error updating listing:', error);
      throw new Error('Failed to update listing');
    }
  }

  async getStats(): Promise<{
    total: number;
    open: number;
    fulfilled: number;
    completed: number;
  }> {
    return await this.db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'FULFILLED' THEN 1 ELSE 0 END) as fulfilled,
        SUM(CASE WHEN status IN ('VERIFIED', 'RELEASED') THEN 1 ELSE 0 END) as completed
      FROM listings
    `) as any;
  }

  private mapToListing(row: any): Listing {
    return {
      id: row.id,
      listingId: row.listing_id,
      creatorAddress: row.creator_address,
      fulfillerAddress: row.fulfiller_address,
      title: row.title,
      description: row.description,
      price: row.price,
      currency: row.currency,
      deliveryTime: row.delivery_time,
      category: row.category,
      status: row.status as ListingStatus,
      encryptedCredentials: row.encrypted_credentials,
      proofHash: row.proof_hash,
      contractTxHash: row.contract_tx_hash,
      blockchainListingId: row.blockchain_listing_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
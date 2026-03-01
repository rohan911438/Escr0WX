import { getDatabase } from '../database';
import { Proof, CreateProofData, UpdateProofData, ProofStatus } from '@/types/proof';
import { logger } from '@/utils/logger';

export class ProofRepository {
  private db = getDatabase();

  async create(proofData: CreateProofData): Promise<Proof> {
    try {
      const result = await this.db.run(`
        INSERT INTO proofs (
          listing_id, submitter_address, proof_hash, proof_data, delivery_notes, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        proofData.listingId,
        proofData.submitterAddress,
        proofData.proofHash,
        proofData.proofData,
        proofData.deliveryNotes,
        proofData.status || ProofStatus.PENDING
      ]);
      
      return this.findById(result.lastID);
    } catch (error) {
      logger.error('Error creating proof:', error);
      throw new Error('Failed to create proof');
    }
  }

  async findById(id: number): Promise<Proof> {
    const proof = await this.db.get(`
      SELECT * FROM proofs WHERE id = ?
    `, [id]) as any;
    
    if (!proof) {
      throw new Error('Proof not found');
    }
    
    return this.mapToProof(proof);
  }

  async findByListingId(listingId: string): Promise<Proof[]> {
    const proofs = await this.db.all(`
      SELECT * FROM proofs WHERE listing_id = ? ORDER BY created_at DESC
    `, [listingId]) as any[];
    
    return proofs.map(this.mapToProof);
  }

  async findByProofHash(proofHash: string): Promise<Proof | null> {
    const proof = await this.db.get(`
      SELECT * FROM proofs WHERE proof_hash = ?
    `, [proofHash]) as any;
    
    return proof ? this.mapToProof(proof) : null;
  }

  async update(id: number, updateData: UpdateProofData): Promise<Proof> {
    try {
      const fields = [];
      const values = [];
      
      if (updateData.status) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      
      if (updateData.verificationTxHash) {
        fields.push('verification_tx_hash = ?');
        values.push(updateData.verificationTxHash);
      }
      
      if (updateData.status === ProofStatus.VERIFIED) {
        fields.push('verified_at = CURRENT_TIMESTAMP');
      }
      
      values.push(id);
      
      await this.db.run(`
        UPDATE proofs SET ${fields.join(', ')}
        WHERE id = ?
      `, values);
      
      return this.findById(id);
    } catch (error) {
      logger.error('Error updating proof:', error);
      throw new Error('Failed to update proof');
    }
  }

  async findPendingProofs(): Promise<Proof[]> {
    const proofs = await this.db.all(`
      SELECT * FROM proofs WHERE status = ? ORDER BY created_at ASC
    `, [ProofStatus.PENDING]) as any[];
    
    return proofs.map(this.mapToProof);
  }

  private mapToProof(row: any): Proof {
    return {
      id: row.id,
      listingId: row.listing_id,
      submitterAddress: row.submitter_address,
      proofHash: row.proof_hash,
      proofData: row.proof_data,
      deliveryNotes: row.delivery_notes,
      status: row.status as ProofStatus,
      verificationTxHash: row.verification_tx_hash,
      createdAt: new Date(row.created_at),
      verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
    };
  }
}
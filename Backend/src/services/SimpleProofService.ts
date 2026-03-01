/**
 * Simplified ProofService for development
 */

import { logger } from '@/utils/logger';

export class ProofService {
  async processProofSubmission(data: any) {
    logger.info(`Mock proof submission for listing ${data.listingId}`);
    
    // Return a mock proof object
    return {
      id: Math.floor(Math.random() * 10000),
      listingId: data.listingId,
      submitterAddress: data.submitterAddress,
      proofHash: `proof_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date(),
      verifiedAt: null
    };
  }
}
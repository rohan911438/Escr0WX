import crypto from 'crypto';
import { ProofRepository, ListingRepository } from '@/storage';
import { CreateProofData, ProofSubmissionData, ProofStatus } from '@/types/proof';
import { ListingStatus } from '@/types/listing';
import { logger } from '@/utils/logger';
import { hashData } from '@/utils/helpers';
import { EncryptionService } from './EncryptionService';

export class ProofService {
  private proofRepository: ProofRepository;
  private listingRepository: ListingRepository;
  private encryptionService: EncryptionService;
  
  constructor() {
    this.proofRepository = new ProofRepository();
    this.listingRepository = new ListingRepository();
    this.encryptionService = new EncryptionService();
  }

  async processProofSubmission(data: {
    listingId: string;
    submitterAddress: string;
    proofType: string;
    proofContent: string;
    deliveryNotes?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    try {
      // Validate proof content based on type
      await this.validateProofContent(data.proofType, data.proofContent);
      
      // Generate proof hash
      const proofData = {
        type: data.proofType,
        content: data.proofContent,
        timestamp: new Date().toISOString(),
        metadata: data.metadata || {}
      };
      
      const proofDataString = JSON.stringify(proofData);
      const proofHash = hashData(proofDataString);
      
      // Encrypt sensitive proof data
      const encryptedProofData = this.encryptionService.encrypt(proofDataString);
      
      // Create proof record
      const createProofData: CreateProofData = {
        listingId: data.listingId,
        submitterAddress: data.submitterAddress,
        proofHash,
        proofData: encryptedProofData,
        deliveryNotes: data.deliveryNotes,
        status: ProofStatus.PENDING
      };
      
      const proof = await this.proofRepository.create(createProofData);
      
      // Update listing status
      await this.listingRepository.update(data.listingId, {
        status: ListingStatus.PROOF_PENDING,
        proofHash
      });
      
      logger.info(`Proof submitted for listing ${data.listingId}: ${proofHash}`);
      
      return proof;
    } catch (error) {
      logger.error('Error processing proof submission:', error);
      throw error;
    }
  }

  async validateProofContent(proofType: string, content: string): Promise<void> {
    switch (proofType) {
      case 'image':
        await this.validateImageProof(content);
        break;
        
      case 'document':
        await this.validateDocumentProof(content);
        break;
        
      case 'url':
        await this.validateUrlProof(content);
        break;
        
      case 'text':
        await this.validateTextProof(content);
        break;
        
      default:
        throw new Error('Invalid proof type');
    }
  }

  private async validateImageProof(content: string): Promise<void> {
    // Validate base64 image format
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (!base64Regex.test(content)) {
      throw new Error('Invalid image format. Must be base64 encoded image.');
    }
    
    // Check size (max 5MB)
    const sizeInBytes = (content.length * 3) / 4;
    if (sizeInBytes > 5 * 1024 * 1024) {
      throw new Error('Image too large. Maximum size is 5MB.');
    }
  }

  private async validateDocumentProof(content: string): Promise<void> {
    // Validate base64 document format
    const base64Regex = /^data:(application\/pdf|text\/plain|application\/msword);base64,/;
    if (!base64Regex.test(content)) {
      throw new Error('Invalid document format. Supported: PDF, TXT, DOC.');
    }
    
    // Check size (max 10MB)
    const sizeInBytes = (content.length * 3) / 4;
    if (sizeInBytes > 10 * 1024 * 1024) {
      throw new Error('Document too large. Maximum size is 10MB.');
    }
  }

  private async validateUrlProof(content: string): Promise<void> {
    try {
      const url = new URL(content);
      
      // Only allow HTTPS URLs
      if (url.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed');
      }
      
      // Basic domain validation (can be extended)
      if (url.hostname.length < 3) {
        throw new Error('Invalid URL hostname');
      }
    } catch (error) {
      throw new Error('Invalid URL format');
    }
  }

  private async validateTextProof(content: string): Promise<void> {
    if (content.length < 10) {
      throw new Error('Text proof must be at least 10 characters long');
    }
    
    if (content.length > 2000) {
      throw new Error('Text proof must not exceed 2000 characters');
    }
  }

  async verifyProof(proofId: number, isVerified: boolean): Promise<void> {
    try {
      const proof = await this.proofRepository.findById(proofId);
      
      const newStatus = isVerified ? ProofStatus.VERIFIED : ProofStatus.REJECTED;
      await this.proofRepository.update(proofId, { status: newStatus });
      
      // Update listing status if proof is verified
      if (isVerified) {
        await this.listingRepository.update(proof.listingId, {
          status: ListingStatus.VERIFIED
        });
      }
      
      logger.info(`Proof ${proofId} ${isVerified ? 'verified' : 'rejected'}`);
    } catch (error) {
      logger.error('Error verifying proof:', error);
      throw error;
    }
  }

  async getDecryptedProofData(proofId: number): Promise<any> {
    try {
      const proof = await this.proofRepository.findById(proofId);
      const decryptedData = this.encryptionService.decrypt(proof.proofData);
      return JSON.parse(decryptedData);
    } catch (error) {
      logger.error('Error decrypting proof data:', error);
      throw error;
    }
  }
}
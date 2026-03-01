import { Request, Response } from 'express';
import { ListingRepository, UserRepository, ProofRepository } from '@/storage';
import { CreateListingSchema, ListingFiltersSchema, UpdateListingSchema } from '@/types/listing';
import { CreateProofSchema } from '@/types/proof';
import { ApiResponse, ErrorCode } from '@/types/common';
import { logger } from '@/utils/logger';
import { generateId } from '@/utils/helpers';
import { EncryptionService } from '@/services/EncryptionService';
import { ProofService } from '@/services/ProofService';

export class ListingController {
  private listingRepository: ListingRepository;
  private userRepository: UserRepository;
  private proofRepository: ProofRepository;
  private encryptionService: EncryptionService;
  private proofService: ProofService;

  constructor() {
    this.listingRepository = new ListingRepository();
    this.userRepository = new UserRepository();
    this.proofRepository = new ProofRepository();
    this.encryptionService = new EncryptionService();
    this.proofService = new ProofService();
  }

  async createListing(req: Request, res: Response): Promise<void> {
    try {
      const userAddress = req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({
          success: false,
          error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' }
        } as ApiResponse);
        return;
      }

      const validatedData = CreateListingSchema.parse(req.body);
      
      // Ensure user exists
      const user = await this.userRepository.getOrCreate(userAddress);
      
      // Generate unique listing ID
      const listingId = generateId();
      
      // Create listing
      const listing = await this.listingRepository.create({
        listingId,
        creatorAddress: userAddress,
        ...validatedData
      });
      
      // Update user stats
      await this.userRepository.update(userAddress, {
        totalListings: user.totalListings + 1
      });
      
      logger.info(`Listing created: ${listingId} by ${userAddress}`);
      
      res.status(201).json({
        success: true,
        data: listing
      } as ApiResponse);
    } catch (error) {
      logger.error('Error creating listing:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid input data',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to create listing' }
      } as ApiResponse);
    }
  }

  async getListings(req: Request, res: Response): Promise<void> {
    try {
      const filters = ListingFiltersSchema.parse(req.query);
      
      const listings = await this.listingRepository.findAll(filters);
      
      // Calculate pagination meta
      const total = await this.listingRepository.findAll({ ...filters, limit: undefined, offset: undefined });
      const hasNext = (filters.offset + filters.limit) < total.length;
      
      res.json({
        success: true,
        data: listings,
        meta: {
          page: Math.floor(filters.offset / filters.limit) + 1,
          limit: filters.limit,
          total: total.length,
          hasNext
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting listings:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid query parameters',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch listings' }
      } as ApiResponse);
    }
  }

  async getListingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const listing = await this.listingRepository.findByListingId(id);
      
      if (!listing) {
        res.status(404).json({
          success: false,
          error: { code: ErrorCode.NOT_FOUND, message: 'Listing not found' }
        } as ApiResponse);
        return;
      }
      
      // Get associated proofs
      const proofs = await this.proofRepository.findByListingId(id);
      
      res.json({
        success: true,
        data: {
          ...listing,
          proofs: proofs.map(proof => ({
            ...proof,
            proofData: undefined // Don't expose proof data in get requests
          }))
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting listing by ID:', error);
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch listing' }
      } as ApiResponse);
    }
  }

  async submitProof(req: Request, res: Response): Promise<void> {
    try {
      const userAddress = req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({
          success: false,
          error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' }
        } as ApiResponse);
        return;
      }

      const { id: listingId } = req.params;
      const validatedData = CreateProofSchema.parse(req.body);
      
      // Check if listing exists and user can submit proof
      const listing = await this.listingRepository.findByListingId(listingId);
      if (!listing) {
        res.status(404).json({
          success: false,
          error: { code: ErrorCode.NOT_FOUND, message: 'Listing not found' }
        } as ApiResponse);
        return;
      }
      
      // Only the fulfiller can submit proof
      if (listing.fulfillerAddress !== userAddress) {
        res.status(403).json({
          success: false,
          error: { code: ErrorCode.FORBIDDEN, message: 'Only the fulfiller can submit proof' }
        } as ApiResponse);
        return;
      }
      
      // Process and store proof
      const proof = await this.proofService.processProofSubmission({
        listingId,
        submitterAddress: userAddress,
        ...validatedData
      });
      
      logger.info(`Proof submitted for listing ${listingId} by ${userAddress}`);
      
      res.status(201).json({
        success: true,
        data: {
          ...proof,
          proofData: undefined // Don't return sensitive proof data
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error submitting proof:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid proof data',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to submit proof' }
      } as ApiResponse);
    }
  }

  async updateListing(req: Request, res: Response): Promise<void> {
    try {
      const userAddress = req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({
          success: false,
          error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' }
        } as ApiResponse);
        return;
      }

      const { id: listingId } = req.params;
      const validatedData = UpdateListingSchema.parse(req.body);
      
      const listing = await this.listingRepository.findByListingId(listingId);
      if (!listing) {
        res.status(404).json({
          success: false,
          error: { code: ErrorCode.NOT_FOUND, message: 'Listing not found' }
        } as ApiResponse);
        return;
      }
      
      // Only the creator can update the listing
      if (listing.creatorAddress !== userAddress) {
        res.status(403).json({
          success: false,
          error: { code: ErrorCode.FORBIDDEN, message: 'Only the creator can update this listing' }
        } as ApiResponse);
        return;
      }
      
      const updatedListing = await this.listingRepository.update(listingId, validatedData);
      
      res.json({
        success: true,
        data: updatedListing
      } as ApiResponse);
    } catch (error) {
      logger.error('Error updating listing:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid update data',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to update listing' }
      } as ApiResponse);
    }
  }
}
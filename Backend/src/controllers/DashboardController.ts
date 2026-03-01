import { Request, Response } from 'express';
import { ListingRepository, UserRepository } from '@/storage';
import { ApiResponse, ErrorCode, DashboardStats } from '@/types/common';
import { PaginationSchema } from '@/types/common';
import { logger } from '@/utils/logger';

export class DashboardController {
  private listingRepository: ListingRepository;
  private userRepository: UserRepository;

  constructor() {
    this.listingRepository = new ListingRepository();
    this.userRepository = new UserRepository();
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userAddress = req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({
          success: false,
          error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' }
        } as ApiResponse);
        return;
      }

      const user = await this.userRepository.findByWallet(userAddress);
      if (!user) {
        res.status(404).json({
          success: false,
          error: { code: ErrorCode.NOT_FOUND, message: 'User not found' }
        } as ApiResponse);
        return;
      }

      // Get user's listings
      const userListings = await this.listingRepository.findAll({
        creatorAddress: userAddress
      });
      
      // Get user's purchases (listings they fulfilled)
      const userPurchases = await this.listingRepository.findAll({
        fulfillerAddress: userAddress
      });
      
      // Calculate completion rate and volume
      const completedListings = userListings.filter(
        listing => listing.status === 'VERIFIED' || listing.status === 'RELEASED'
      );
      
      const completedPurchases = userPurchases.filter(
        listing => listing.status === 'VERIFIED' || listing.status === 'RELEASED'
      );
      
      const totalVolume = [...completedListings, ...completedPurchases]
        .reduce((sum, listing) => sum + parseFloat(listing.price), 0)
        .toFixed(4);
      
      const stats: DashboardStats = {
        totalListings: userListings.length,
        activeListings: userListings.filter(
          listing => listing.status === 'OPEN' || listing.status === 'FULFILLED' || listing.status === 'PROOF_PENDING'
        ).length,
        completedDeals: completedListings.length + completedPurchases.length,
        totalVolume: `${totalVolume}`,
        reputationScore: user.reputationScore
      };
      
      res.json({
        success: true,
        data: stats
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch dashboard stats' }
      } as ApiResponse);
    }
  }

  async getUserListings(req: Request, res: Response): Promise<void> {
    try {
      const userAddress = req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({
          success: false,
          error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' }
        } as ApiResponse);
        return;
      }

      const pagination = PaginationSchema.parse(req.query);
      
      const listings = await this.listingRepository.findAll({
        creatorAddress: userAddress,
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      // Get total count for pagination
      const allUserListings = await this.listingRepository.findAll({
        creatorAddress: userAddress
      });
      
      const hasNext = (pagination.offset + pagination.limit) < allUserListings.length;
      
      res.json({
        success: true,
        data: listings,
        meta: {
          page: pagination.page,
          limit: pagination.limit,
          total: allUserListings.length,
          hasNext
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user listings:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid pagination parameters',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch user listings' }
      } as ApiResponse);
    }
  }

  async getUserPurchases(req: Request, res: Response): Promise<void> {
    try {
      const userAddress = req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({
          success: false,
          error: { code: ErrorCode.UNAUTHORIZED, message: 'Authentication required' }
        } as ApiResponse);
        return;
      }

      const pagination = PaginationSchema.parse(req.query);
      
      const purchases = await this.listingRepository.findAll({
        fulfillerAddress: userAddress,
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      // Get total count for pagination
      const allUserPurchases = await this.listingRepository.findAll({
        fulfillerAddress: userAddress
      });
      
      const hasNext = (pagination.offset + pagination.limit) < allUserPurchases.length;
      
      res.json({
        success: true,
        data: purchases,
        meta: {
          page: pagination.page,
          limit: pagination.limit,
          total: allUserPurchases.length,
          hasNext
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user purchases:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid pagination parameters',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch user purchases' }
      } as ApiResponse);
    }
  }
}
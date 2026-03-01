import { Request, Response } from 'express';
import { AuthRepository, UserRepository } from '@/storage';
import { AuthChallengeRequestSchema, AuthVerifyRequestSchema } from '@/types/auth';
import { ApiResponse, ErrorCode } from '@/types/common';
import { AuthService } from '@/services/AuthService';
import { logger } from '@/utils/logger';

export class AuthController {
  private authRepository: AuthRepository;
  private userRepository: UserRepository;
  private authService: AuthService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
  }

  async generateChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress } = AuthChallengeRequestSchema.parse(req.body);
      
      // Generate challenge for this wallet
      const challenge = await this.authService.generateChallenge(walletAddress);
      
      res.json({
        success: true,
        data: {
          challenge: challenge.challenge,
          expiresAt: challenge.expiresAt.toISOString()
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error generating auth challenge:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid request data',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to generate challenge' }
      } as ApiResponse);
    }
  }

  async verifySignature(req: Request, res: Response): Promise<void> {
    try {
      const { walletAddress, challenge, signature } = AuthVerifyRequestSchema.parse(req.body);
      
      // Verify the signature
      const verificationResult = await this.authService.verifySignature({
        walletAddress,
        challenge,
        signature
      });
      
      if (!verificationResult.success) {
        res.status(401).json({
          success: false,
          error: {
            code: ErrorCode.UNAUTHORIZED,
            message: verificationResult.error || 'Invalid signature'
          }
        } as ApiResponse);
        return;
      }
      
      // Ensure user exists in database
      const user = await this.userRepository.getOrCreate(walletAddress);
      
      // Generate JWT token
      const token = await this.authService.generateJWT({
        walletAddress: user.walletAddress,
        nonce: user.nonce
      });
      
      logger.info(`User authenticated: ${walletAddress}`);
      
      res.json({
        success: true,
        data: {
          token,
          user: {
            walletAddress: user.walletAddress,
            nonce: user.nonce,
            reputationScore: user.reputationScore
          }
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error verifying signature:', error);
      
      if (error.name === 'ZodError') {
        res.status(400).json({
          success: false,
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Invalid verification data',
            details: error.errors
          }
        } as ApiResponse);
        return;
      }
      
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to verify signature' }
      } as ApiResponse);
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
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
      
      res.json({
        success: true,
        data: {
          walletAddress: user.walletAddress,
          totalListings: user.totalListings,
          totalPurchases: user.totalPurchases,
          reputationScore: user.reputationScore,
          joinedAt: user.createdAt
        }
      } as ApiResponse);
    } catch (error) {
      logger.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Failed to fetch profile' }
      } as ApiResponse);
    }
  }
}
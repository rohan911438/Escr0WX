import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { AuthRepository, UserRepository } from '@/storage';
import { AuthChallenge, CreateChallengeData, AuthVerifyRequest } from '@/types/auth';
import { generateChallenge } from '@/utils/helpers';
import { logger } from '@/utils/logger';

export class AuthService {
  private authRepository: AuthRepository;
  private userRepository: UserRepository;
  
  constructor() {
    this.authRepository = new AuthRepository();
    this.userRepository = new UserRepository();
  }

  async generateChallenge(walletAddress: string): Promise<AuthChallenge> {
    try {
      const challenge = generateChallenge();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      const challengeData: CreateChallengeData = {
        walletAddress,
        challenge,
        expiresAt
      };
      
      return await this.authRepository.createChallenge(challengeData);
    } catch (error) {
      logger.error('Error generating challenge:', error);
      throw error;
    }
  }

  async verifySignature(request: AuthVerifyRequest): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { walletAddress, challenge, signature } = request;
      
      // Find and validate challenge
      const storedChallenge = await this.authRepository.findValidChallenge(
        walletAddress,
        challenge
      );
      
      if (!storedChallenge) {
        return { success: false, error: 'Invalid or expired challenge' };
      }
      
      // Verify the signature
      const isValidSignature = await this.verifyEthereumSignature(
        challenge,
        signature,
        walletAddress
      );
      
      if (!isValidSignature) {
        return { success: false, error: 'Invalid signature' };
      }
      
      // Mark challenge as used
      await this.authRepository.markChallengeAsUsed(storedChallenge.id);
      
      // Update user nonce
      const user = await this.userRepository.getOrCreate(walletAddress);
      await this.userRepository.incrementNonce(walletAddress);
      
      logger.info(`Signature verified for wallet: ${walletAddress}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error verifying signature:', error);
      return { success: false, error: 'Signature verification failed' };
    }
  }

  private async verifyEthereumSignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<boolean> {
    try {
      // Recover the address from signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      // Compare addresses (case-insensitive)
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      logger.error('Error in signature verification:', error);
      return false;
    }
  }

  async generateJWT(payload: {
    walletAddress: string;
    nonce: number;
  }): Promise<string> {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable not set');
      }
      
      const token = jwt.sign(
        {
          walletAddress: payload.walletAddress,
          nonce: payload.nonce,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '24h',
          issuer: 'escrowx-backend',
          audience: 'escrowx-frontend'
        }
      );
      
      return token;
    } catch (error) {
      logger.error('Error generating JWT:', error);
      throw error;
    }
  }

  async verifyJWT(token: string): Promise<any> {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable not set');
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'escrowx-backend',
        audience: 'escrowx-frontend'
      });
      
      return decoded;
    } catch (error) {
      logger.error('Error verifying JWT:', error);
      throw error;
    }
  }
}
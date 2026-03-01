import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse, ErrorCode } from '@/types/common';
import { logger } from '@/utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        walletAddress: string;
        nonce: number;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authorization header missing or invalid format'
        }
      } as ApiResponse);
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET environment variable not set');
      res.status(500).json({
        success: false,
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Server configuration error'
        }
      } as ApiResponse);
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    if (!decoded.walletAddress) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Invalid token payload'
        }
      } as ApiResponse);
      return;
    }
    
    req.user = {
      walletAddress: decoded.walletAddress,
      nonce: decoded.nonce || 0
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Token expired'
        }
      } as ApiResponse);
      return;
    }
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Invalid token'
        }
      } as ApiResponse);
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Authentication failed'
      }
    } as ApiResponse);
  }
};
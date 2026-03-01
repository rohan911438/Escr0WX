import rateLimit from 'express-rate-limit';
import { ApiResponse, ErrorCode } from '@/types/common';

// Configure rate limiting
export const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later'
    }
  } as ApiResponse,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use IP address or user wallet if authenticated
    return req.user?.walletAddress || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded. Please try again later.'
      }
    } as ApiResponse);
  }
});

// Stricter rate limiting for authentication endpoints
export const authRateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: 10, // Only 10 auth attempts per window
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many authentication attempts, please try again later'
    }
  } as ApiResponse,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ErrorCode.RATE_LIMIT_EXCEEDED,
        message: 'Rate limit exceeded for authentication. Please try again later.'
      }
    } as ApiResponse);
  }
});
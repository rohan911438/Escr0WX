import { Router } from 'express';
import listingRoutes from './listingRoutes';
import dashboardRoutes from './dashboardRoutes';
import authRoutes from './authRoutes';
import { ApiResponse } from '@/types/common';
import { solanaAuditService } from '@/solana/solanaService';
import { config } from '@/config';

const router = Router();

// Health check endpoint  
router.get('/health', async (req, res) => {
  try {
    const healthData: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      solana: {
        enabled: config.solanaEnabled
      }
    };

    // Check Solana status if enabled
    if (config.solanaEnabled) {
      try {
        const [solanaHealthy, walletBalance] = await Promise.all([
          solanaAuditService.healthCheck(),
          solanaAuditService.getWalletBalance()
        ]);
        
        healthData.solana = {
          enabled: true,
          healthy: solanaHealthy,
          programId: config.solanaProgramId,
          walletBalance: walletBalance,
          network: 'devnet'
        };
      } catch (error) {
        healthData.solana = {
          enabled: true,
          healthy: false,
          error: 'Solana connection failed'
        };
      }
    }

    res.json({
      success: true,
      data: healthData
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed'
      }
    } as ApiResponse);
  }
});

// API routes
router.use('/listings', listingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'API endpoint not found'
    }
  } as ApiResponse);
});

export default router;
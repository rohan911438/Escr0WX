import dotenv from 'dotenv';
import { Config } from '@/types/common';
import { logger } from '@/utils/logger';

// Load environment variables
dotenv.config();

/**
 * Validate and load environment configuration
 */
export const loadConfig = (): Config => {
  const requiredEnvVars = [
    'ETH_RPC_URL',
    'CONTRACT_ADDRESS', 
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];
  
  // Solana is optional - only validate if SOLANA_ENABLED is true
  const solanaEnabled = process.env.SOLANA_ENABLED === 'true';
  if (solanaEnabled) {
    requiredEnvVars.push('SOLANA_PRIVATE_KEY', 'SOLANA_PROGRAM_ID');
  }
  
  // Check for required environment variables
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  // Validate encryption key length
  if (process.env.ENCRYPTION_KEY!.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }
  
  // Validate Solana private key format if enabled
  if (solanaEnabled) {
    try {
      const privateKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY!);
      if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
        throw new Error('SOLANA_PRIVATE_KEY must be a 64-element JSON array');
      }
    } catch (error) {
      throw new Error('SOLANA_PRIVATE_KEY must be valid JSON array format');
    }
  }
  
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(process.env.CONTRACT_ADDRESS!)) {
    throw new Error('CONTRACT_ADDRESS must be a valid Ethereum address');
  }
  
  const config: Config = {
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    ethRpcUrl: process.env.ETH_RPC_URL!,
    contractAddress: process.env.CONTRACT_ADDRESS!,
    privateKey: process.env.PRIVATE_KEY || undefined,
    chainId: parseInt(process.env.CHAIN_ID || '11155111'), // Sepolia default
    databasePath: process.env.DATABASE_PATH || './data/escrowx.db',
    jwtSecret: process.env.JWT_SECRET!,
    encryptionKey: process.env.ENCRYPTION_KEY!,
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    reconcileIntervalMs: parseInt(process.env.RECONCILE_INTERVAL_MS || '30000'),
    blockConfirmationCount: parseInt(process.env.BLOCK_CONFIRMATION_COUNT || '3'),
    // Solana configuration
    solanaEnabled: process.env.SOLANA_ENABLED === 'true',
    solanaRpc: process.env.SOLANA_RPC || 'https://api.devnet.solana.com',
    solanaProgramId: process.env.SOLANA_PROGRAM_ID || '6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj',
    solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || '[]'
  };
  
  // Log configuration (excluding sensitive data)
  logger.info('Configuration loaded:', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    chainId: config.chainId,
    databasePath: config.databasePath,
    rateLimitWindowMs: config.rateLimitWindowMs,
    rateLimitMaxRequests: config.rateLimitMaxRequests,
    reconcileIntervalMs: config.reconcileIntervalMs,
    blockConfirmationCount: config.blockConfirmationCount,
    hasPrivateKey: !!config.privateKey,
    solanaEnabled: config.solanaEnabled,
    solanaRpc: config.solanaRpc,
    solanaProgramId: config.solanaProgramId,
    hasSolanaPrivateKey: config.solanaPrivateKey !== '[]'
  });
  
  return config;
};

// Export singleton config
export const config = loadConfig();
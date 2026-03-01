/**
 * Simple EscrowX Backend - Minimal API for onchain transactions
 * No JWT, no event indexing, no complex features
 */

import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';

const app = express();
const PORT = process.env.PORT || 3001;

// Contract configuration
const CONTRACT_ADDRESS = "0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615";
const RPC_URL = "https://rpc.sepolia.org"; // Simple public RPC

// Basic middleware
app.use(cors());
app.use(express.json());

// Basic logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      contract: CONTRACT_ADDRESS,
      network: 'sepolia'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Simple EscrowX Backend',
      version: '1.0.0',
      status: 'healthy',
      contract: CONTRACT_ADDRESS,
      endpoints: [
        'GET / - This endpoint',
        'GET /health - Health check',
        'GET /api/contract/address - Get contract address',
        'GET /api/contract/network - Get network info'
      ]
    }
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      contract: CONTRACT_ADDRESS
    }
  });
});

// Contract info endpoints
app.get('/api/contract/address', (req, res) => {
  res.json({
    success: true,
    data: {
      address: CONTRACT_ADDRESS,
      network: 'sepolia',
      chainId: 11155111
    }
  });
});

app.get('/api/contract/network', (req, res) => {
  res.json({
    success: true,
    data: {
      network: 'sepolia',
      chainId: 11155111,
      rpcUrl: RPC_URL,
      contractAddress: CONTRACT_ADDRESS
    }
  });
});

// Simple contract interaction endpoint (optional - for read-only operations)
app.get('/api/contract/info', async (req, res) => {
  try {
    // Optional: You can add basic contract read operations here if needed
    // For now, just return contract info
    res.json({
      success: true,
      data: {
        contractAddress: CONTRACT_ADDRESS,
        network: 'sepolia',
        chainId: 11155111,
        note: 'All transactions should be done from frontend using wagmi'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get contract info',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// Simple listings endpoint (mock data for now)
app.get('/api/listings', (req, res) => {
  res.json({
    success: true,
    data: {
      listings: [],
      total: 0,
      note: 'Listings are managed by smart contract. Use frontend to interact.'
    }
  });
});

// Catch-all 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.originalUrl
    }
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Simple EscrowX Backend Started!');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Contract: ${CONTRACT_ADDRESS}`);
  console.log(`✅ Network: Sepolia (Chain ID: 11155111)`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`  GET http://localhost:${PORT}/`);
  console.log(`  GET http://localhost:${PORT}/health`);
  console.log(`  GET http://localhost:${PORT}/api/health`);
  console.log(`  GET http://localhost:${PORT}/api/contract/address`);
  console.log(`  GET http://localhost:${PORT}/api/contract/network`);
  console.log(`  GET http://localhost:${PORT}/api/listings`);
  console.log('');
  console.log('Note: All blockchain transactions are handled by frontend using wagmi.');
  console.log('This backend is just a simple API server without complex features.');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
# EscrowX Solana Integration Guide

This document explains how to integrate the Solana audit ledger with the existing EscrowX backend and frontend.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Ethereum       │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (Smart         │
│                 │    │                 │    │   Contracts)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Solana Audit Ledger                         │
│              (Append-only event logging)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Backend Integration

### 1. Install Solana Dependencies

```bash
cd Backend
npm install @solana/web3.js @coral-xyz/anchor
```

### 2. Create Solana Service

Create `src/services/SolanaAuditService.ts`:

```typescript
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { logger } from '../utils/logger';

interface AuditRecord {
  listingId: number;
  recordType: 0 | 1; // 0 = Lifecycle, 1 = Dispute
  ethTxHash: string;
  actor: string;
  amount?: number;
  proofHash?: string;
  timestamp: Date;
  solanaAccount: string;
}

export class SolanaAuditService {
  private connection: Connection;
  private program: anchor.Program;
  private wallet: anchor.Wallet;
  
  constructor() {
    // Initialize Solana connection (Devnet for development)
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    // Load wallet from environment or file
    const keypair = this.loadWallet();
    this.wallet = new anchor.Wallet(keypair);
    
    // Initialize program
    const provider = new anchor.AnchorProvider(this.connection, this.wallet, {});
    this.program = new anchor.Program(IDL, PROGRAM_ID, provider);
  }
  
  private loadWallet(): Keypair {
    try {
      // Load from environment variable (base64 encoded)
      if (process.env.SOLANA_PRIVATE_KEY) {
        const secretKey = Buffer.from(process.env.SOLANA_PRIVATE_KEY, 'base64');
        return Keypair.fromSecretKey(secretKey);
      }
      
      // Fallback to file (for development)
      const fs = require('fs');
      const keypairFile = fs.readFileSync(
        process.env.SOLANA_KEYPAIR_PATH || '~/.config/solana/id.json'
      );
      return Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairFile.toString())));
    } catch (error) {
      logger.error('Failed to load Solana wallet:', error);
      throw new Error('Solana wallet configuration required');
    }
  }
  
  /**
   * Log a lifecycle event to Solana audit ledger
   */
  async logLifecycleEvent(
    listingId: number,
    ethTxHash: string,
    actor: string,
    amount: number
  ): Promise<AuditRecord> {
    try {
      const escrowAccount = Keypair.generate();
      const actorPubkey = new PublicKey(actor);
      
      const signature = await this.program.methods
        .writeLifecycleRecord(
          new anchor.BN(listingId),
          ethTxHash,
          actorPubkey,
          new anchor.BN(amount)
        )
        .accounts({
          escrowRecord: escrowAccount.publicKey,
          signer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([escrowAccount])
        .rpc();
      
      logger.info(`Lifecycle event logged to Solana: ${signature}`);
      
      return {
        listingId,
        recordType: 0,
        ethTxHash,
        actor,
        amount,
        timestamp: new Date(),
        solanaAccount: escrowAccount.publicKey.toString(),
      };
    } catch (error) {
      logger.error('Failed to log lifecycle event to Solana:', error);
      throw error;
    }
  }
  
  /**
   * Log a dispute event to Solana audit ledger
   */
  async logDisputeEvent(
    listingId: number,
    ethTxHash: string,
    actor: string,
    proofHash: string
  ): Promise<AuditRecord> {
    try {
      const escrowAccount = Keypair.generate();
      const actorPubkey = new PublicKey(actor);
      
      const signature = await this.program.methods
        .writeDisputeRecord(
          new anchor.BN(listingId),
          ethTxHash,
          actorPubkey,
          proofHash
        )
        .accounts({
          escrowRecord: escrowAccount.publicKey,
          signer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([escrowAccount])
        .rpc();
      
      logger.info(`Dispute event logged to Solana: ${signature}`);
      
      return {
        listingId,
        recordType: 1,
        ethTxHash,
        actor,
        proofHash,
        timestamp: new Date(),
        solanaAccount: escrowAccount.publicKey.toString(),
      };
    } catch (error) {
      logger.error('Failed to log dispute event to Solana:', error);
      throw error;
    }
  }
  
  /**
   * Fetch all audit records for a listing
   */
  async getAuditTrail(listingId: number): Promise<AuditRecord[]> {
    try {
      const accounts = await this.program.account.escrowRecord.all();
      
      return accounts
        .filter(account => account.account.listingId.toNumber() === listingId)
        .map(account => ({
          listingId: account.account.listingId.toNumber(),
          recordType: account.account.recordType as 0 | 1,
          ethTxHash: account.account.ethTxHash,
          actor: account.account.actor.toString(),
          amount: account.account.amount.toNumber(),
          proofHash: account.account.proofHash,
          timestamp: new Date(account.account.timestamp.toNumber() * 1000),
          solanaAccount: account.publicKey.toString(),
        }))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      logger.error('Failed to fetch audit trail from Solana:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const solanaAuditService = new SolanaAuditService();
```

### 3. Integrate with Existing Controllers

Update `src/controllers/ListingController.ts`:

```typescript
import { solanaAuditService } from '../services/SolanaAuditService';

export class ListingController {
  // ... existing methods
  
  async createListing(req: Request, res: Response) {
    try {
      // ... existing listing creation logic
      
      // Log to Solana audit ledger
      await solanaAuditService.logLifecycleEvent(
        listing.id,
        req.body.ethTxHash,
        req.user.solanaAddress, // User's Solana public key
        listing.amount
      );
      
      res.json({ success: true, listing, auditLogged: true });
    } catch (error) {
      // ... error handling
    }
  }
  
  async getAuditTrail(req: Request, res: Response) {
    try {
      const { listingId } = req.params;
      const auditRecords = await solanaAuditService.getAuditTrail(
        parseInt(listingId)
      );
      
      res.json({ auditRecords });
    } catch (error) {
      logger.error('Failed to fetch audit trail:', error);
      res.status(500).json({ error: 'Failed to fetch audit trail' });
    }
  }
}
```

### 4. Add Environment Variables

Update `.env`:

```env
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=<base64-encoded-private-key>
SOLANA_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## 🖥️ Frontend Integration

### 1. Install Solana Wallet Dependencies

```bash
cd Frontend
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

### 2. Create Solana Context

Create `src/contexts/SolanaContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

interface SolanaContextType {
  connection: Connection;
  isConnected: boolean;
  publicKey: PublicKey | null;
  fetchAuditTrail: (listingId: number) => Promise<AuditRecord[]>;
}

const SolanaContext = createContext<SolanaContextType | null>(null);

export const SolanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [connection] = useState(
    new Connection(import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com')
  );

  const fetchAuditTrail = async (listingId: number) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/audit-trail`);
      return response.json();
    } catch (error) {
      console.error('Failed to fetch audit trail:', error);
      return [];
    }
  };

  return (
    <SolanaContext.Provider value={{
      connection,
      isConnected: connected,
      publicKey,
      fetchAuditTrail,
    }}>
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error('useSolana must be used within SolanaProvider');
  }
  return context;
};
```

### 3. Create Audit Trail Component

Create `src/components/audit/AuditTrail.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useSolana } from '../../contexts/SolanaContext';

interface AuditTrailProps {
  listingId: number;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ listingId }) => {
  const { fetchAuditTrail } = useSolana();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditTrail = async () => {
      try {
        const auditRecords = await fetchAuditTrail(listingId);
        setRecords(auditRecords);
      } catch (error) {
        console.error('Failed to load audit trail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditTrail();
  }, [listingId, fetchAuditTrail]);

  if (loading) {
    return <div>Loading audit trail...</div>;
  }

  return (
    <div className="audit-trail">
      <h3>Audit Trail</h3>
      <div className="audit-records">
        {records.map((record, index) => (
          <div key={index} className="audit-record">
            <div className="record-type">
              {record.recordType === 0 ? '📋 Lifecycle' : '🚨 Dispute'}
            </div>
            <div className="record-details">
              <p><strong>ETH TX:</strong> {record.ethTxHash}</p>
              <p><strong>Actor:</strong> {record.actor}</p>
              <p><strong>Timestamp:</strong> {new Date(record.timestamp).toLocaleString()}</p>
              {record.amount && <p><strong>Amount:</strong> {record.amount} wei</p>}
              {record.proofHash && <p><strong>Proof:</strong> {record.proofHash}</p>}
              <p><strong>Solana Account:</strong> 
                <a 
                  href={`https://explorer.solana.com/address/${record.solanaAccount}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {record.solanaAccount}
                </a>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔄 Event Flow Examples

### Lifecycle Event Flow
1. User creates escrow on Ethereum
2. Frontend calls backend API
3. Backend processes escrow creation
4. Backend automatically logs to Solana audit ledger
5. Solana record provides immutable audit trail

### Dispute Event Flow
1. Dispute raised on Ethereum
2. IPFS proof uploaded
3. Backend logs dispute to Solana with proof hash
4. Immutable dispute record created
5. Frontend displays complete audit trail

## 📊 Monitoring and Analytics

### Backend Monitoring
```typescript
// Add Solana audit logging to existing monitoring
export const auditMetrics = {
  async logSolanaEvent(type: 'lifecycle' | 'dispute', success: boolean) {
    // Log to your existing metrics system
    logger.info(`Solana audit ${type}: ${success ? 'success' : 'failed'}`);
  }
};
```

### Frontend Analytics
```typescript
// Track Solana audit trail usage
const trackAuditTrailView = (listingId: number) => {
  // Your analytics implementation
  analytics.track('audit_trail_viewed', { listingId });
};
```

## 🎯 Benefits

1. **Immutable Audit Trail**: All escrow events permanently recorded on Solana
2. **Low Cost**: Solana transactions cost ~$0.001 vs Ethereum's high gas fees
3. **High Speed**: Near-instant confirmation of audit records
4. **Transparency**: Public blockchain provides verifiable audit trail
5. **Dispute Resolution**: Timestamped evidence for dispute handling
6. **Cross-Chain**: Ethereum for settlements, Solana for logging

## 🔒 Security Considerations

1. **Private Key Management**: Use secure key storage in production
2. **RPC Endpoints**: Use reliable Solana RPC providers
3. **Error Handling**: Graceful handling of Solana network issues
4. **Backup Strategy**: Consider multiple RPC endpoints
5. **Monitoring**: Alert on failed audit logging attempts

This integration provides a robust, cost-effective audit trail for your EscrowX platform while maintaining the existing Ethereum-based escrow functionality.
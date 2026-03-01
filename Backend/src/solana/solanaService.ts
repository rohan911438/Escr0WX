import { Connection, PublicKey, Keypair, SystemProgram, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN, web3 } from '@project-serum/anchor';
import { EscrowXAuditProgram, EscrowXAuditIDL } from './idl';
import { logger } from '../utils/logger';

interface AuditWriteResult {
  success: boolean;
  txSignature?: string;
  accountPubkey?: string;
  error?: string;
}

interface LifecycleRecordData {
  listingId: number;
  ethTxHash: string;
  actor: string;
  amount: number;
}

interface DisputeRecordData {
  listingId: number;
  ethTxHash: string;
  actor: string;
  proofHash: string;
}

class SolanaAuditService {
  private connection: Connection;
  private program: Program<EscrowXAuditProgram>;
  private provider: AnchorProvider;
  private wallet: Wallet;
  private programId: PublicKey;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection(): void {
    try {
      // Initialize Solana connection (Devnet)
      const rpcUrl = process.env.SOLANA_RPC || clusterApiUrl('devnet');
      this.connection = new Connection(rpcUrl, 'confirmed');

      // Load backend wallet keypair
      const privateKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY || '[]');
      if (privateKeyArray.length !== 64) {
        throw new Error('Invalid SOLANA_PRIVATE_KEY format. Expected 64-element array.');
      }

      const secretKey = Uint8Array.from(privateKeyArray);
      const keypair = Keypair.fromSecretKey(secretKey);
      this.wallet = new Wallet(keypair);

      // Create AnchorProvider
      this.provider = new AnchorProvider(this.connection, this.wallet, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      });

      // Initialize program
      this.programId = new PublicKey(process.env.SOLANA_PROGRAM_ID || '6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj');
      this.program = new Program(EscrowXAuditIDL as EscrowXAuditProgram, this.programId, this.provider);

      logger.info('✅ Solana Audit Service initialized', {
        programId: this.programId.toString(),
        wallet: this.wallet.publicKey.toString(),
        rpc: rpcUrl
      });
    } catch (error) {
      logger.error('❌ Failed to initialize Solana Audit Service:', error);
      throw error;
    }
  }

  /**
   * Write a lifecycle record to Solana audit ledger
   */
  async writeLifecycleRecord(data: LifecycleRecordData): Promise<AuditWriteResult> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`📝 Writing lifecycle record (attempt ${attempt}/${maxRetries})`, {
          listingId: data.listingId,
          ethTxHash: data.ethTxHash,
          actor: data.actor,
          amount: data.amount
        });

        // Generate new keypair for EscrowRecord account
        const escrowAccount = Keypair.generate();

        // Convert actor string to PublicKey
        const actorPubkey = new PublicKey(data.actor);

        // Call Anchor instruction
        const txSignature = await this.program.methods
          .writeLifecycleRecord(
            new BN(data.listingId),
            data.ethTxHash,
            actorPubkey,
            new BN(data.amount)
          )
          .accounts({
            escrowRecord: escrowAccount.publicKey,
            signer: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([escrowAccount])
          .rpc();

        // Confirm transaction
        await this.connection.confirmTransaction(txSignature, 'confirmed');

        logger.info('✅ Lifecycle record written to Solana', {
          listingId: data.listingId,
          txSignature,
          accountPubkey: escrowAccount.publicKey.toString(),
          explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
        });

        return {
          success: true,
          txSignature,
          accountPubkey: escrowAccount.publicKey.toString()
        };

      } catch (error) {
        lastError = error;
        logger.warn(`⚠️ Attempt ${attempt} failed for lifecycle record:`, {
          listingId: data.listingId,
          error: error.message
        });

        if (attempt === maxRetries) {
          logger.error('❌ All attempts failed for lifecycle record:', {
            listingId: data.listingId,
            error: error.message
          });
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error'
    };
  }

  /**
   * Write a dispute record to Solana audit ledger
   */
  async writeDisputeRecord(data: DisputeRecordData): Promise<AuditWriteResult> {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`🚨 Writing dispute record (attempt ${attempt}/${maxRetries})`, {
          listingId: data.listingId,
          ethTxHash: data.ethTxHash,
          actor: data.actor,
          proofHash: data.proofHash
        });

        // Generate new keypair for EscrowRecord account
        const escrowAccount = Keypair.generate();

        // Convert actor string to PublicKey
        const actorPubkey = new PublicKey(data.actor);

        // Call Anchor instruction
        const txSignature = await this.program.methods
          .writeDisputeRecord(
            new BN(data.listingId),
            data.ethTxHash,
            actorPubkey,
            data.proofHash
          )
          .accounts({
            escrowRecord: escrowAccount.publicKey,
            signer: this.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([escrowAccount])
          .rpc();

        // Confirm transaction
        await this.connection.confirmTransaction(txSignature, 'confirmed');

        logger.info('✅ Dispute record written to Solana', {
          listingId: data.listingId,
          txSignature,
          accountPubkey: escrowAccount.publicKey.toString(),
          explorerUrl: `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
        });

        return {
          success: true,
          txSignature,
          accountPubkey: escrowAccount.publicKey.toString()
        };

      } catch (error) {
        lastError = error;
        logger.warn(`⚠️ Attempt ${attempt} failed for dispute record:`, {
          listingId: data.listingId,
          error: error.message
        });

        if (attempt === maxRetries) {
          logger.error('❌ All attempts failed for dispute record:', {
            listingId: data.listingId,
            error: error.message
          });
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error'
    };
  }

  /**
   * Get wallet balance (for monitoring)
   */
  async getWalletBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / web3.LAMPORTS_PER_SOL;
    } catch (error) {
      logger.error('Failed to get wallet balance:', error);
      return 0;
    }
  }

  /**
   * Health check for Solana connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      const balance = await this.getWalletBalance();
      
      logger.info('Solana health check:', {
        version: version['solana-core'],
        walletBalance: balance,
        programId: this.programId.toString()
      });

      return true;
    } catch (error) {
      logger.error('Solana health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const solanaAuditService = new SolanaAuditService();
export { SolanaAuditService };
export type { AuditWriteResult, LifecycleRecordData, DisputeRecordData };
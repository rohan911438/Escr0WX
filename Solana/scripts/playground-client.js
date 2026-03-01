// EscrowX Audit Ledger - Simple Client for Solana Playground
// Browser-compatible version without Node.js dependencies

import * as anchor from "@coral-xyz/anchor";
import { SystemProgram, Keypair, PublicKey } from "@solana/web3.js";

// Simple client class for interacting with EscrowX Audit program
class EscrowXAuditClient {
  constructor() {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    
    this.program = anchor.workspace.EscrowxAudit;
    this.provider = provider;
    this.wallet = provider.wallet;
  }

  /**
   * Write a lifecycle record to the audit ledger
   */
  async writeLifecycleRecord(listingId, ethTxHash, actor, amount) {
    const escrowAccount = Keypair.generate();

    try {
      const signature = await this.program.methods
        .writeLifecycleRecord(
          new anchor.BN(listingId),
          ethTxHash,
          actor,
          new anchor.BN(amount)
        )
        .accounts({
          escrowRecord: escrowAccount.publicKey,
          signer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([escrowAccount])
        .rpc();

      console.log(`✅ Lifecycle record created: ${signature}`);
      return { 
        signature, 
        accountPubkey: escrowAccount.publicKey,
        explorer: `https://explorer.solana.com/address/${escrowAccount.publicKey}?cluster=devnet`
      };
    } catch (error) {
      console.error("❌ Error creating lifecycle record:", error);
      throw error;
    }
  }

  /**
   * Write a dispute record to the audit ledger
   */
  async writeDisputeRecord(listingId, ethTxHash, actor, proofHash) {
    const escrowAccount = Keypair.generate();

    try {
      const signature = await this.program.methods
        .writeDisputeRecord(
          new anchor.BN(listingId),
          ethTxHash,
          actor,
          proofHash
        )
        .accounts({
          escrowRecord: escrowAccount.publicKey,
          signer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([escrowAccount])
        .rpc();

      console.log(`✅ Dispute record created: ${signature}`);
      return { 
        signature, 
        accountPubkey: escrowAccount.publicKey,
        explorer: `https://explorer.solana.com/address/${escrowAccount.publicKey}?cluster=devnet`
      };
    } catch (error) {
      console.error("❌ Error creating dispute record:", error);
      throw error;
    }
  }

  /**
   * Fetch an escrow record by account address
   */
  async fetchRecord(accountPubkey) {
    try {
      const record = await this.program.account.escrowRecord.fetch(accountPubkey);
      return {
        listingId: record.listingId.toNumber(),
        recordType: record.recordType,
        ethTxHash: record.ethTxHash,
        actor: record.actor.toString(),
        amount: record.amount.toNumber(),
        proofHash: record.proofHash,
        timestamp: new Date(record.timestamp.toNumber() * 1000),
        account: accountPubkey.toString(),
        explorer: `https://explorer.solana.com/address/${accountPubkey}?cluster=devnet`
      };
    } catch (error) {
      console.error("❌ Error fetching record:", error);
      throw error;
    }
  }

  /**
   * Get wallet info
   */
  async getWalletInfo() {
    const balance = await this.provider.connection.getBalance(this.wallet.publicKey);
    return {
      publicKey: this.wallet.publicKey.toString(),
      balance: balance / anchor.web3.LAMPORTS_PER_SOL,
      explorer: `https://explorer.solana.com/address/${this.wallet.publicKey}?cluster=devnet`
    };
  }
}

// Example usage functions for Solana Playground

/**
 * Demo function - create sample records
 */
async function runDemo() {
  console.log("🚀 Starting EscrowX Audit Demo...");
  
  const client = new EscrowXAuditClient();
  
  // Show wallet info
  const walletInfo = await client.getWalletInfo();
  console.log("👤 Wallet:", walletInfo.publicKey);
  console.log("💰 Balance:", walletInfo.balance, "SOL");
  console.log("🔗 Explorer:", walletInfo.explorer);
  
  if (walletInfo.balance < 0.1) {
    console.log("⚠️  Low balance! Please airdrop some SOL: solana airdrop 2");
    return;
  }

  try {
    // Create lifecycle record
    console.log("\n📝 Creating Lifecycle Record...");
    const lifecycleResult = await client.writeLifecycleRecord(
      42, // listing_id
      "0x1234567890abcdef1234567890abcdef12345678", // eth_tx_hash
      client.wallet.publicKey, // actor
      1500000 // amount (0.0015 ETH in wei)
    );
    
    console.log("Account:", lifecycleResult.accountPubkey.toString());
    console.log("Explorer:", lifecycleResult.explorer);

    // Create dispute record
    console.log("\n🚨 Creating Dispute Record...");
    const disputeResult = await client.writeDisputeRecord(
      42, // listing_id
      "0xabcdef1234567890abcdef1234567890abcdef12", // eth_tx_hash
      client.wallet.publicKey, // actor
      "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o" // proof_hash
    );
    
    console.log("Account:", disputeResult.accountPubkey.toString());
    console.log("Explorer:", disputeResult.explorer);

    // Fetch and display records
    console.log("\n📊 Fetching Records...");
    
    const lifecycleRecord = await client.fetchRecord(lifecycleResult.accountPubkey);
    const disputeRecord = await client.fetchRecord(disputeResult.accountPubkey);
    
    console.log("\n📋 Lifecycle Record:");
    console.log("  Type:", lifecycleRecord.recordType === 0 ? "Lifecycle" : "Dispute");
    console.log("  Listing ID:", lifecycleRecord.listingId);
    console.log("  ETH TX:", lifecycleRecord.ethTxHash);
    console.log("  Actor:", lifecycleRecord.actor);
    console.log("  Amount:", lifecycleRecord.amount, "wei");
    console.log("  Time:", lifecycleRecord.timestamp.toISOString());
    
    console.log("\n🚨 Dispute Record:");
    console.log("  Type:", disputeRecord.recordType === 0 ? "Lifecycle" : "Dispute"); 
    console.log("  Listing ID:", disputeRecord.listingId);
    console.log("  ETH TX:", disputeRecord.ethTxHash);
    console.log("  Actor:", disputeRecord.actor);
    console.log("  Proof:", disputeRecord.proofHash);
    console.log("  Time:", disputeRecord.timestamp.toISOString());
    
    console.log("\n🎉 Demo completed successfully!");
    console.log("💡 Both records are permanently stored on Solana blockchain");
    
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

/**
 * Quick test function
 */
async function quickTest() {
  console.log("⚡ Running Quick Test...");
  
  const client = new EscrowXAuditClient();
  const walletInfo = await client.getWalletInfo();
  
  console.log("Wallet:", walletInfo.publicKey);
  console.log("Balance:", walletInfo.balance, "SOL");
  
  // Create one record
  const result = await client.writeLifecycleRecord(
    999,
    "0xtest123",
    client.wallet.publicKey,
    100000
  );
  
  console.log("✅ Record created:", result.accountPubkey.toString());
  console.log("🔗", result.explorer);
}

// Expose functions globally for easy use in Solana Playground console
globalThis.EscrowXAuditClient = EscrowXAuditClient;
globalThis.runDemo = runDemo;
globalThis.quickTest = quickTest;

// Auto-run demo
console.log("🎯 EscrowX Audit Client loaded!");
console.log("📝 Available functions:");
console.log("  - runDemo() - Full demonstration");
console.log("  - quickTest() - Quick single record test");
console.log("  - new EscrowXAuditClient() - Manual client usage");

// Uncomment to auto-run demo
// runDemo();
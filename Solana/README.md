# EscrowX Solana Audit Ledger

A Solana program using Anchor framework that acts as an append-only audit ledger for Ethereum-based escrow events. This program provides tamper-resistant cross-chain audit logging and dispute resolution capabilities.

## 🏗️ Architecture

The program stores structured records of escrow lifecycle events and disputes on Solana's high-speed, low-cost blockchain while Ethereum remains the settlement layer.

### Program Structure

- **Program ID**: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS`
- **Single Account Type**: `EscrowRecord`
- **Two Instructions**: `write_lifecycle_record` and `write_dispute_record`

## 📊 EscrowRecord Structure

```rust
pub struct EscrowRecord {
    pub listing_id: u64,        // Unique identifier for the escrow
    pub record_type: u8,        // 0 = Lifecycle, 1 = Dispute
    pub eth_tx_hash: String,    // Ethereum transaction hash (max 100 chars)
    pub actor: Pubkey,          // Solana public key of the actor
    pub amount: u64,            // Amount in wei (for lifecycle records)
    pub proof_hash: Option<String>, // IPFS/proof hash (max 100 chars)
    pub timestamp: i64,         // Unix timestamp (auto-set)
}
```

## 🚀 Deployment Instructions

### Method 1: Solana Playground (Recommended for Testing)

1. **Open Solana Playground**
   - Go to [https://beta.solpg.io/](https://beta.solpg.io/)
   - Connect your wallet or create a new one

2. **Import Program**
   - Create a new Anchor project
   - Replace the contents of `lib.rs` with the code from `programs/escrowx-audit/src/lib.rs`
   - Update `Anchor.toml` and `Cargo.toml` as needed

3. **Build and Deploy**
   ```bash
   # Build the program
   anchor build
   
   # Deploy to Devnet
   anchor deploy --provider.cluster devnet
   ```

4. **Fund Your Wallet**
   ```bash
   # Airdrop SOL for testing
   solana airdrop 2 --url devnet
   ```

### Method 2: Local Development

1. **Prerequisites**
   - Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
   - Install Solana CLI: `sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"`
   - Install Anchor: `npm install -g @coral-xyz/anchor-cli`

2. **Setup**
   ```bash
   # Configure Solana CLI for Devnet
   solana config set --url devnet
   
   # Generate a new keypair (if needed)
   solana-keygen new
   
   # Airdrop SOL
   solana airdrop 2
   ```

3. **Build and Deploy**
   ```bash
   cd Solana
   anchor build
   anchor deploy
   ```

## 🧪 Testing

### Manual Testing in Solana Playground

1. **Test Lifecycle Record**
   ```javascript
   // In Solana Playground client
   const lifecycleAccount = anchor.web3.Keypair.generate();
   
   await pg.program.methods
     .writeLifecycleRecord(
       new anchor.BN(1),                                        // listing_id
       "0x1234567890abcdef1234567890abcdef12345678",            // eth_tx_hash
       pg.wallet.publicKey,                                     // actor
       new anchor.BN(1000000)                                   // amount
     )
     .accounts({
       escrowRecord: lifecycleAccount.publicKey,
       signer: pg.wallet.publicKey,
       systemProgram: anchor.web3.SystemProgram.programId,
     })
     .signers([lifecycleAccount])
     .rpc();
   ```

2. **Test Dispute Record**
   ```javascript
   const disputeAccount = anchor.web3.Keypair.generate();
   
   await pg.program.methods
     .writeDisputeRecord(
       new anchor.BN(1),                                        // listing_id
       "0xabcdef1234567890abcdef1234567890abcdef12",            // eth_tx_hash
       pg.wallet.publicKey,                                     // actor
       "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o"       // proof_hash
     )
     .accounts({
       escrowRecord: disputeAccount.publicKey,
       signer: pg.wallet.publicKey,
       systemProgram: anchor.web3.SystemProgram.programId,
     })
     .signers([disputeAccount])
     .rpc();
   ```

3. **Verify Records**
   ```javascript
   // Fetch lifecycle record
   const lifecycleRecord = await pg.program.account.escrowRecord.fetch(
     lifecycleAccount.publicKey
   );
   console.log("Lifecycle Record:", lifecycleRecord);
   
   // Fetch dispute record
   const disputeRecord = await pg.program.account.escrowRecord.fetch(
     disputeAccount.publicKey
   );
   console.log("Dispute Record:", disputeRecord);
   ```

### Automated Testing Script

Use the provided test script:

```bash
# Copy the test script to Solana Playground
cp scripts/test-playground.js [Playground-Client-Directory]/client.js

# Run in Solana Playground console
testEscrowXAudit();
```

## 🔒 Security Features

- **Append-Only**: No update or delete instructions - records are immutable
- **Signer Required**: All operations require valid signature
- **No Overwrites**: Each record creates a new account
- **Input Validation**: String length validation (max 100 chars)
- **No Admin Logic**: Fully decentralized operation
- **No Token Operations**: Focus purely on data storage

## 📝 Usage Examples

### Lifecycle Event Logging
```rust
// When an Ethereum escrow is created/updated
write_lifecycle_record {
    listing_id: 123,
    eth_tx_hash: "0x...",
    actor: buyer_pubkey,
    amount: 1000000, // 0.001 ETH in wei
}
```

### Dispute Recording
```rust
// When a dispute is raised
write_dispute_record {
    listing_id: 123,
    eth_tx_hash: "0x...",
    actor: arbitrator_pubkey,
    proof_hash: "QmIPFSHash...", // IPFS hash of dispute evidence
}
```

## 🌐 Cross-Chain Integration

This Solana program integrates with the EscrowX Ethereum ecosystem:

1. **Ethereum Layer**: Handles actual escrow logic and fund management
2. **Solana Layer**: Provides fast, cheap audit logging and dispute resolution
3. **Frontend**: Queries both chains for comprehensive escrow status
4. **Backend**: Monitors Ethereum events and writes corresponding Solana records

## 💰 Cost Analysis

- **Account Creation**: ~0.001 SOL per record
- **Transaction Fee**: ~0.000005 SOL per instruction
- **Total Cost per Record**: ~0.001005 SOL
- **At Current Prices**: Less than $0.10 per audit record

## 🔧 Development Notes

### Account Space Calculation
```rust
// EscrowRecord::LEN = 274 bytes total
// - Discriminator: 8 bytes
// - listing_id: 8 bytes  
// - record_type: 1 byte
// - eth_tx_hash: 104 bytes (4 + 100)
// - actor: 32 bytes
// - amount: 8 bytes
// - proof_hash: 105 bytes (1 + 4 + 100)
// - timestamp: 8 bytes
```

### Error Handling
The program includes custom error codes:
- `EthTxHashTooLong`: Ethereum transaction hash exceeds 100 characters
- `ProofHashTooLong`: Proof hash exceeds 100 characters

## 📚 Additional Resources

- [Anchor Framework Documentation](https://book.anchor-lang.com/)
- [Solana Program Library](https://spl.solana.com/)
- [Solana Playground](https://beta.solpg.io/)
- [EscrowX Main Repository](../README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly on Devnet
4. Submit a pull request

## 📄 License

This program is part of the EscrowX project. See main LICENSE file for details.
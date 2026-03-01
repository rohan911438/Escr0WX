# EscrowX

**Trust-Minimized Crypto-to-Physical Escrow**  
**Ethereum Settlement + Solana Audit Layer**

<img width="1920" height="1080" alt="Screenshot (93)" src="https://github.com/user-attachments/assets/29519ba4-e84e-452f-b4e3-bb154a677e51" />


EscrowX is a cross-chain escrow primitive that separates value settlement from behavioral logging in crypto-to-physical commerce. Ethereum secures USDC settlement through immutable smart contracts, while Solana provides high-throughput, low-cost audit trail storage. This architecture eliminates custodial risk while maintaining tamper-resistant dispute records and scalable transaction logging.

Built by **Rohan Kumar** from **Team BROTHERHOOD**.

## Problem Statement: The Crypto-to-Physical Commerce Crisis

### The Fundamental Trust Problem

Crypto-to-physical commerce sits at the intersection of two incompatible trust models: **immutable blockchain settlement** and **mutable real-world delivery**. This creates a fundamental trust gap that existing solutions fail to address comprehensively.

### Critical Market Failures

#### 1. Custodial Risk and Single Points of Failure
- **Traditional Escrow Services** (Escrow.com, PayPal, centralized exchanges) control private keys and can freeze funds arbitrarily
- **Regulatory Risk**: Centralized services face shutdown risks, regulatory compliance costs, and geographic restrictions
- **Counterparty Risk**: Users must trust a third party with both cryptocurrency custody and dispute resolution

#### 2. Opaque Verification and Settlement Systems
- **Black Box Operations**: Existing platforms provide no cryptographic proof of delivery verification logic
- **Manipulatable Records**: Traditional systems allow post-hoc editing of transaction histories and dispute records
- **No Auditability**: Users cannot independently verify that escrow logic was executed correctly

#### 3. Economic Inefficiencies in Blockchain Architecture
- **Monolithic Gas Costs**: Storing metadata on Ethereum costs $50-200 per transaction during high congestion
- **Over-Engineering**: Using Ethereum's expensive consensus for simple audit logging wastes resources
- **Poor User Experience**: High fees prevent frequent status updates, leaving users in information blackouts

#### 4. Inadequate Dispute Resolution Infrastructure
- **Centralized Arbitration**: Human arbitrators introduce bias, delays, and inconsistent decisions
- **No Cross-Chain Evidence**: Disputes cannot reference immutable evidence stored across multiple blockchains
- **Temporal Manipulation**: Existing systems allow evidence tampering between incident occurrence and dispute filing

#### 5. Scalability and Interoperability Limitations
- **Single-Chain Architecture**: Most solutions are locked to one blockchain, limiting user choice and network effects
- **Throughput Bottlenecks**: Ethereum-only solutions cannot handle high-frequency commerce at scale
- **Integration Barriers**: APIs and interfaces vary wildly between platforms, preventing ecosystem growth

### The Missing Solution

**There is no modular cross-chain escrow architecture that separates high-security settlement from high-throughput behavioral logging while maintaining cryptographic auditability across both layers.**

Existing solutions force users to choose between:
- **Security OR Scalability** (not both)
- **Decentralization OR User Experience** (not both)
- **Immutability OR Cost Efficiency** (not both)

**EscrowX eliminates these trade-offs through purposeful cross-chain architecture.**

## Solution Overview

EscrowX implements a dual-layer architecture where USDC value is locked in Ethereum smart contracts while transaction lifecycle and dispute events are logged to Solana's high-performance blockchain. The backend service acts as a cross-chain bridge, listening to Ethereum events and asynchronously writing audit records to Solana without blocking settlement operations.

```
         User
          ↓
   Ethereum Escrow Contract
          ↓
   Backend Event Listener
          ↓
   Solana Audit Program
```

## Architecture Deep Dive

### Ethereum Layer

**Network:** Sepolia Testnet  
**Contract Address:** `0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615`  
**Token:** USDC (ERC-20)  
**Explorer:** [View on Etherscan](https://sepolia.etherscan.io/address/0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615)

**Key Functions:**
- `createListing()` - Initialize escrow with USDC lock
- `fulfillListing()` - Claim fulfillment rights
- `submitProof()` - Provide delivery verification
- `releaseFunds()` - Execute settlement to fulfiller

**State Machine:**
```
OPEN → FULFILLED → PROOF_SUBMITTED → RELEASED
```

The Ethereum layer handles all value custody and enforces escrow lifecycle through deterministic state transitions. Critical settlement logic remains on Ethereum for maximum security guarantees.

### Backend Layer

**Framework:** Node.js with TypeScript  
**Event Monitoring:** Real-time Ethereum block listening  
**Cross-chain Logic:** Asynchronous Solana integration  
**Error Isolation:** Solana failures do not affect Ethereum operations

The backend operates as a stateless event processor that bridges Ethereum settlement events to Solana audit logging. Solana integration is intentionally asynchronous and non-blocking to ensure Ethereum settlement remains unaffected by cross-chain latency or failures.

### Solana Layer

**Network:** Devnet  
**Program ID:** `6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj`  
**Deployer:** `FUaf11NppCyRCCQtHAEaG8Q11KQnE8SJzbebrWnc6P1M`  
**Explorer:** [View on Solana Explorer](https://explorer.solana.com/address/6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj?cluster=devnet)

**Purpose:**
- Immutable lifecycle event logging
- Tamper-resistant dispute record storage  
- Low-cost, high-throughput metadata persistence
- Append-only audit trail with cryptographic integrity
- No fund custody or settlement logic

## Market Comparison: EscrowX vs Existing Solutions

### Traditional Centralized Escrow

| Solution | Trust Model | Settlement | Audit Trail | Dispute Resolution | Cost | Limitations |
|----------|-------------|------------|-------------|-------------------|------|-------------|
| **Escrow.com** | Centralized | Fiat only | Private database | Human arbitrators | 0.89% - 3.25% | Geographic restrictions, regulatory risk |
| **PayPal Buyer Protection** | Centralized | Fiat + limited crypto | Internal logs | PayPal decision | 2.9% + $0.30 | Account freezing, limited crypto support |
| **LocalBitcoins Escrow** | Centralized | Bitcoin only | Centralized DB | Human moderators | 1% | Single crypto, reputation manipulation |

### Blockchain-Based Escrow

| Solution | Architecture | Settlement Chains | Audit System | Proof Verification | Cross-Chain |
|----------|-------------|------------------|--------------|------------------|-------------|
| **OpenBazaar** | P2P + Escrow | Bitcoin only | Bitcoin blockchain | Manual dispute | ❌ No |
| **Particl Marketplace** | Decentralized | Particl only | Particl chain | Ring signatures | ❌ No |
| **Origin Protocol** | Ethereum DApp | Ethereum only | Ethereum events | IPFS + Ethereum | ❌ No |
| **Request Network** | Payment protocol | Multi-chain | Individual chains | No escrow logic | Limited |
| **🚀 EscrowX** | **Cross-Chain Modular** | **Ethereum (USDC)** | **Solana append-only** | **ZK-ready adapter** | **✅ Yes** |

### Key Differentiators

#### EscrowX Advantages

1. **Separation of Concerns Architecture**
   - **Settlement Security**: Ethereum's battle-tested consensus protects USDC custody
   - **Behavioral Logging**: Solana's high throughput enables comprehensive audit trails
   - **Cost Optimization**: Users pay Ethereum gas only for value transfer, not metadata storage

2. **Tamper-Resistant Cross-Chain Auditing**
   - **Immutable Records**: Solana's append-only structure prevents historical manipulation
   - **Cross-Chain Verification**: Disputes can reference evidence from both chains
   - **Independent Validation**: Anyone can verify complete transaction history

3. **Modular Verification System**
   - **Pluggable Proofs**: ZKVerifierAdapter supports multiple proof systems
   - **Future-Proof**: Easy integration of new verification methods (ZK-SNARKs, IoT sensors)
   - **Demo-Ready**: MockVerifier enables immediate testing and demonstrations

4. **Economic Efficiency**
   - **Layer-Appropriate Costs**: ~$1 Ethereum settlement + ~$0.0001 Solana logging
   - **Scalable Operations**: Frequent status updates don't impact settlement costs
   - **No Platform Fees**: Pure protocol approach eliminates rent extraction

#### Competitive Landscape Gaps Filled

- **Multi-Chain Native**: First escrow designed for cross-chain from the ground up
- **Modular Architecture**: Separate concerns enable independent optimization
- **Cryptographic Auditability**: Complete transaction history verifiable by anyone
- **ZK-Ready Infrastructure**: Future-proof verification system architecture
- **Developer-Friendly**: Complete APIs for both settlement and audit layers

## Cross-Chain Design Philosophy

| Layer | Ethereum | Solana |
|-------|----------|--------|
| Settlement | ✅ Yes | ❌ No |
| USDC Locking | ✅ Yes | ❌ No |
| State Machine | ✅ Yes | ❌ No |
| Audit Logging | Limited (expensive) | ✅ Yes |
| Dispute Log | Event-based | Append-only |
| Cost per Write | High ($1-50) | Low ($0.0001) |
| Throughput | Moderate (15 TPS) | High (65,000 TPS) |
| Finality | 12-15 minutes | 2-4 seconds |
| Security Model | Proof of Stake | Proof of History + PoS |

**"Ethereum secures value. Solana secures behavior."**

This intentional separation allows each blockchain to optimize for its core strengths while creating a unified user experience that's more secure, scalable, and cost-effective than any single-chain solution.

## Complete Contract Deployment Table

### Ethereum Layer (Sepolia Testnet)

| Contract Name | Address | Role | Gas Used | Status | Explorer |
|---------------|---------|------|----------|--------|----------|
| **Treasury** | `0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615` | Main escrow logic, USDC locking, state machine | 3,961,601 | ✅ **LIVE** | [View Contract](https://sepolia.etherscan.io/address/0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615) |
| **EVVMManager** | `0x653EE2ea054252c71878e4F382A5810C199F0285` | Advanced balance management, async operations | 3,699,056 | ✅ Ready | [View Contract](https://sepolia.etherscan.io/address/0x653EE2ea054252c71878e4F382A5810C199F0285) |
| **ZKVerifierAdapter** | `0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c` | Pluggable proof verification system | 3,412,796 | ✅ Ready | [View Contract](https://sepolia.etherscan.io/address/0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c) |
| **MockVerifier** | `0x31C33e2a433363E294d488A538C8F7fc110046B9` | Demo verification for hackathons | 2,174,098 | ✅ Demo Only | [View Contract](https://sepolia.etherscan.io/address/0x31C33e2a433363E294d488A538C8F7fc110046B9) |

<img width="1920" height="1080" alt="Screenshot (91)" src="https://github.com/user-attachments/assets/15cca519-b59c-40c2-972b-5badf91bb2a7" />



**Total Deployment Cost:** 13,247,551 gas (~$42 at 25 gwei)

### Supported ERC-20 Tokens (Sepolia)

| Token | Address | Purpose | Decimals |
|-------|---------|---------|----------|
| **USDC** | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Primary settlement token | 6 |
| **USDT** | `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06` | Alternative settlement token | 6 |

### Solana Layer (Devnet)

| Component | Address | Role | Network | Status |
|-----------|---------|------|---------|--------|
| **Audit Program** | `6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj` | Immutable lifecycle & dispute logging | Devnet | ✅ **LIVE** |
| **Deployer Wallet** | `FUaf11NppCyRCCQtHAEaG8Q11KQnE8SJzbebrWnc6P1M` | Program upgrade authority | Devnet | ✅ Verified |
| **Record Type** | N/A | Lifecycle Events (Type 0) | - | Active |
| **Record Type** | N/A | Dispute Events (Type 1) | - | Active |

<img width="1920" height="1080" alt="Screenshot (92)" src="https://github.com/user-attachments/assets/bfb414c5-c1cf-4818-b8ba-232c293bed02" />


### Network Information

| Layer | Network | Chain ID | RPC Endpoint | Block Explorer |
|-------|---------|-----------|--------------|----------------|
| **Ethereum** | Sepolia Testnet | 11155111 | https://rpc.sepolia.org | [Etherscan](https://sepolia.etherscan.io) |
| **Solana** | Devnet | N/A | https://api.devnet.solana.com | [Solana Explorer](https://explorer.solana.com/?cluster=devnet) |

## End-to-End Workflow

1. **Connect MetaMask** and ensure Sepolia network selection
2. **Create Listing** → USDC locked in Ethereum escrow contract
3. **Fulfill Listing** → Determine delivery fulfiller
4. **Submit Proof** → Cryptographic delivery verification
5. **Release Funds** → Automated USDC transfer to fulfiller
6. **Audit Logging** → All lifecycle and dispute events mirrored to Solana

**Note:** End users interact exclusively with Ethereum contracts. Solana integration operates transparently through the backend service.

## Security Considerations

- **Value Security:** Ethereum handles all USDC custody with battle-tested smart contract security
- **Metadata Integrity:** Solana provides tamper-resistant audit logs with cryptographic verification
- **Key Management:** No private keys exposed in client applications
- **Failure Isolation:** Backend isolates cross-chain failures to prevent settlement disruption
- **Immutable Records:** Append-only logging prevents historical transaction tampering

## Future Improvements

- **On-chain ZK Proof Verification:** Integrate privacy-preserving delivery confirmation
- **Automated Dispute Resolution:** Implement algorithmic dispute adjudication
- **Reputation Scoring Engine:** Cross-chain reputation system for participants
- **Mainnet Deployment:** Production deployment with enhanced security audits
- **Cross-chain Analytics Dashboard:** Real-time visualization of cross-chain escrow metrics

## How to Run Locally

```bash
# Clone repository
git clone https://github.com/rohan911438/EscrowX.git
cd EscrowX

# Frontend setup
cd Frontend
npm install
npm run dev

# Backend setup (separate terminal)
cd ../Backend
npm install
npm run dev

# Environment configuration
cp .env.example .env
# Configure required variables:
# - ETH_RPC_URL (Sepolia RPC endpoint)
# - CONTRACT_ADDRESS (deployed contract)
# - SOLANA_RPC (Solana devnet endpoint)
# - SOLANA_PROGRAM_ID (deployed program ID)
```

### Environment Variables Template

```bash
# Ethereum Configuration
ETH_RPC_URL=https://rpc.sepolia.org
CONTRACT_ADDRESS=0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615
CHAIN_ID=11155111

# Solana Configuration
SOLANA_ENABLED=true
SOLANA_RPC=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Live Links

- **Frontend:** [EscrowX Application](https://escrowx-frontend.netlify.app)
- **Backend API:** [API Documentation](https://escrowx-backend.vercel.app/api)
- **Ethereum Explorer:** [Contract on Etherscan](https://sepolia.etherscan.io/address/0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615)
- **Solana Explorer:** [Program on Solana](https://explorer.solana.com/address/6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj?cluster=devnet)
- **Demo Video:** [System Architecture Walkthrough](https://youtube.com/watch?v=demo)
- **Technical Presentation:** [Cross-chain Escrow Architecture](https://docs.google.com/presentation/d/presentation-id)

---

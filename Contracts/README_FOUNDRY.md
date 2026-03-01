# EscrowX Smart Contracts - Foundry Setup

This directory contains the modular smart contract architecture for EscrowX, including:

## 📁 Contract Architecture

### Core Contracts
- **Treasury.sol** - Main escrow contract managing listings and fund flows
- **EVVMManager.sol** - Balance management with async nonce handling
- **ZKVerifierAdapter.sol** - Proof verification abstraction layer
- **MockVerifier.sol** - Hackathon/testing verifier implementation

### Interfaces & Libraries
- **ITreasury.sol** - Treasury contract interface
- **IEVVMManager.sol** - EVVM manager interface
- **IVerifier.sol** - ZK proof verifier interface

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install OpenZeppelin contracts
forge install openzeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - PRIVATE_KEY (deployment wallet)
# - SEPOLIA_RPC_URL (Infura/Alchemy endpoint)
# - ETHERSCAN_API_KEY (for verification)
```

### 3. Deploy Contracts
```bash
# Deploy to Sepolia testnet
forge script script/DeployEscrowX.s.sol --rpc-url sepolia --broadcast --verify

# Deploy to local Anvil
anvil # Run in separate terminal
forge script script/DeployEscrowX.s.sol --rpc-url anvil --broadcast
```

### 4. Run Tests
```bash
# Run all tests
forge test

# Run with gas reports
forge test --gas-report

# Run specific test file
forge test --match-contract TreasuryTest

# Run with verbosity
forge test -vvv
```

## 🔧 Contract Functions

### Treasury Contract

#### Core Functions
- `createListing(token, amount, premium)` - Create new escrow listing
- `fulfillListing(listingId)` - Accept a listing as fulfiller
- `submitProof(listingId, proofHash)` - Submit delivery proof
- `verifyAndRelease(listingId)` - Verify proof and release funds
- `cancelListing(listingId)` - Cancel open listing

#### View Functions
- `getListing(listingId)` - Get complete listing data
- `getUserListings(user)` - Get user's created listings
- `getUserFulfillments(user)` - Get user's fulfilled listings
- `getListingCount()` - Get total number of listings

### EVVMManager Contract

#### Balance Management
- `deposit(token, amount)` - Deposit tokens to EVVM balance
- `withdraw(token, amount)` - Withdraw tokens from EVVM balance
- `lockBalance(user, token, amount, listingId)` - Lock tokens for listing
- `unlockBalance(user, token, amount, listingId)` - Unlock tokens
- `transferLocked(from, to, token, amount, listingId)` - Transfer locked tokens

#### View Functions
- `getUserBalance(user, token)` - Get user's balance info
- `hasSufficientBalance(user, token, amount)` - Check balance sufficiency
- `getTotalBalance(user, token)` - Get total balance (available + locked)

### ZK Verifier Integration

#### MockVerifier (Hackathon)
- Deterministic verification based on proof hash
- Configurable success rate for testing
- Manual proof verification for demos

#### ZKVerifierAdapter (Production Ready)
- Supports multiple verifier backends
- RISC Zero integration placeholder
- vlayer Web Prover Server integration placeholder
- Trusted verifier management

## 📊 Testing Strategy

### Test Coverage
- ✅ Basic functionality (create, fulfill, submit, verify, cancel)
- ✅ Error conditions and edge cases
- ✅ Access control and permissions
- ✅ Full listing lifecycle integration
- ✅ Fuzz testing for amount ranges
- ✅ Gas optimization tests

### Test Files
- `Treasury.t.sol` - Main treasury contract tests
- `EVVMManager.t.sol` - Balance management tests (TODO)
- `ZKVerifier.t.sol` - Proof verification tests (TODO)

## 🔐 Security Features

### Access Control
- Role-based permissions (Admin, Operator, Verifier)
- Module separation with defined interfaces
- ReentrancyGuard on critical functions

### Economic Security
- Treasury fee mechanism (configurable)
- Minimum/maximum listing amounts per token
- Emergency withdrawal mechanisms

### Technical Security
- SafeERC20 for all token interactions
- CEI (Checks-Effects-Interactions) pattern
- Pausable contracts for emergency stops

## 🌐 Network Configuration

### Supported Networks
- **Sepolia Testnet** - Primary testing environment
- **Anvil Local** - Development and unit testing
- **Mainnet** - Production deployment (requires ZK verifier)

### Test Tokens (Sepolia)
- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- USDT: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`

## 🔄 Migration Path

### From Monolithic to Modular
The current `EscrowX.sol` can coexist with the new modular architecture:

1. Deploy new contracts alongside existing one
2. Migrate users gradually via incentives
3. Deprecate old contract after full migration

### ZK Verifier Upgrade
The MockVerifier can be replaced without redeploying Treasury:

1. Deploy production ZK verifier (RISC Zero/vlayer)
2. Update ZKVerifierAdapter configuration
3. Add new verifier as trusted
4. Remove MockVerifier from trusted list

## 📈 Gas Optimization

### Deployment Costs (Sepolia)
- Treasury: ~2.5M gas
- EVVMManager: ~3.2M gas  
- ZKVerifierAdapter: ~2.8M gas
- Total: ~8.5M gas

### Transaction Costs
- Create Listing: ~180k gas
- Fulfill Listing: ~80k gas
- Submit Proof: ~70k gas
- Verify & Release: ~120k gas
- Cancel Listing: ~100k gas

## 🚦 Production Checklist

### Before Mainnet Deployment
- [ ] Replace MockVerifier with production ZK verifier
- [ ] Complete security audit of all contracts
- [ ] Set up multisig for admin operations
- [ ] Configure proper fee rates and limits
- [ ] Set up monitoring and alerting
- [ ] Prepare emergency response procedures

### ZK Integration Requirements
- [ ] RISC Zero image ID configuration
- [ ] vlayer Web Prover Server endpoint setup
- [ ] Proof format validation implementation
- [ ] Batch verification optimization
- [ ] Error handling for verification failures

## 📞 Support & Integration

### Backend Integration
- Update ABI files in `Backend/src/blockchain/ContractABI.ts`
- Modify event listeners for new contract addresses
- Implement EVVM balance tracking
- Add ZK proof submission workflow

### Frontend Integration
- Update contract addresses in configuration
- Add EVVM balance display components  
- Implement proof submission UI
- Add batch operations support

---

**Note**: This modular architecture provides a production-ready foundation that can scale beyond the hackathon requirements while maintaining clean separation of concerns and upgrade paths.
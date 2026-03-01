# EscrowX Smart Contract Suite

A production-ready modular Solidity smart contract suite implementing a decentralized escrow system for crypto-to-physical goods purchases with advanced balance management and ZK proof verification.

## 📊 Deployment Status & Addresses

### Sepolia Testnet (Current Deployment)
```
Treasury Contract:      0x[TO_BE_FILLED_AFTER_DEPLOYMENT]
EVVMManager Contract:   0x[TO_BE_FILLED_AFTER_DEPLOYMENT] 
MockVerifier Contract:  0x[TO_BE_FILLED_AFTER_DEPLOYMENT]
ZKVerifierAdapter:      0x[TO_BE_FILLED_AFTER_DEPLOYMENT]

Network ID: 11155111
Block Explorer: https://sepolia.etherscan.io/
```

### Local Development (Anvil)
```
Treasury Contract:      0x[LOCAL_DEPLOYMENT_ADDRESS]
EVVMManager Contract:   0x[LOCAL_DEPLOYMENT_ADDRESS]
MockVerifier Contract:  0x[LOCAL_DEPLOYMENT_ADDRESS] 
ZKVerifierAdapter:      0x[LOCAL_DEPLOYMENT_ADDRESS]
```

### Supported Test Tokens (Sepolia)
```
USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
USDT: 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06
```

## Overview

EscrowX has evolved into a **modular, production-grade smart contract architecture** that enables secure escrow transactions between creators (buyers) and fulfillers (sellers) for physical goods purchased with cryptocurrency. 

### 🏗️ Modular Architecture Benefits

- **Treasury.sol**: Core escrow logic with ERC20 token support
- **EVVMManager.sol**: Advanced balance management with async operations  
- **ZKVerifierAdapter.sol**: Pluggable proof verification system
- **MockVerifier.sol**: Hackathon-ready verification for demos
- **Complete Interfaces**: Production-ready contract interfaces

## Features

### Core Escrow Features
- **Multi-Token Support**: ERC20 tokens (USDC, USDT, etc.)
- **Secure Escrow**: Locks tokens until delivery is confirmed
- **Role-Based Access**: Clear separation between creators and fulfillers
- **Complete Lifecycle**: From listing creation to fund release
- **State Management**: Comprehensive status tracking

### Advanced Features  
- **EVVM Balance Management**: Separate deposit/escrow layer
- **Async Nonce Handling**: Track all operations with unique IDs
- **ZK Proof Integration**: Ready for RISC Zero and vlayer integration
- **Treasury Fees**: Configurable fee mechanism
- **Emergency Controls**: Pause, emergency withdrawal, admin controls

### Security Features
- **OpenZeppelin Libraries**: Battle-tested security components
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Access Control**: Role-based permissions (Admin, Operator, Verifier)
- **SafeERC20**: Secure token transfer handling
- **Pausable**: Emergency stop functionality

## Contract Architecture

### Listing Status Flow
```
OPEN → FULFILLED → PROOF_SUBMITTED → VERIFIED → RELEASED
  ↓                                               
CANCELLED                                         
```

### Modular Components

1. **Treasury Contract**: Main escrow logic with multi-token support
2. **EVVMManager Contract**: Balance management with async operations
3. **ZKVerifierAdapter Contract**: Pluggable proof verification system
4. **MockVerifier Contract**: Demo/testing verification implementation
5. **Interface Layer**: Complete contract interfaces for integration

## 🚀 Quick Deployment

### Prerequisites
- Foundry toolkit installed
- Private key and RPC endpoint configured
- Etherscan API key (for verification)

### One-Command Deployment
```bash
# Deploy all contracts to Sepolia testnet
forge script script/DeployEscrowX.s.sol --rpc-url sepolia --broadcast --verify
```

### Detailed Deployment Guide
📖 **See [CONTRACTS.md](CONTRACTS.md) for comprehensive deployment instructions**

The deployment guide covers:
- ✅ Exact deployment order (critical for success)
- ✅ Contract addresses for integration
- ✅ Required ABI files for backend/frontend  
- ✅ Environment configuration
- ✅ Post-deployment configuration steps
- ✅ Testing and verification commands

## 🔧 Development Setup

### Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Install Dependencies
```bash
forge install openzeppelin/openzeppelin-contracts
forge install foundry-rs/forge-std
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env with your private key, RPC URLs, and API keys
```
   - Ensure compiler version is set to `^0.8.20`
   - Install OpenZeppelin contracts via Remix plugin manager

### Deployment

#### Using Remix IDE (Recommended for Hackathon)

1. Open Remix IDE and import `EscrowX.sol`
2. Navigate to the "Solidity Compiler" tab
3. Set compiler version to `0.8.20` or higher
4. Compile the contract
5. Go to "Deploy & Run Transactions" tab
6. Select "Injected Provider - MetaMask" for Sepolia deployment
7. Deploy the contract (no constructor parameters required)

#### Using Hardhat

1. Configure Hardhat for Sepolia in `hardhat.config.js`
2. Deploy with:
```bash
npm run deploy:sepolia
```

## Usage Examples

### Creating a Listing

```solidity
// Approve USDC spending first
IERC20(usdcAddress).approve(escrowXAddress, totalAmount);

// Create listing
uint256 listingId = escrowX.createListing(
    usdcAddress,  // USDC contract address
    1000000,      // 1 USDC base amount (6 decimals)
    100000,       // 0.1 USDC premium (6 decimals)
);
```

### Fulfilling a Listing

```solidity
escrowX.fulfillListing(listingId);
```

### Submitting Proof

```solidity
bytes32 proofHash = keccak256(abi.encodePacked("delivery_proof_data"));
escrowX.submitProof(listingId, proofHash);
```

### Releasing Funds (Owner Only)

```solidity
escrowX.verifyAndRelease(listingId);
```

## Contract Functions

### Core Functions

- `createListing(address token, uint256 amount, uint256 premium)`: Create new escrow listing
- `fulfillListing(uint256 listingId)`: Accept a listing as fulfiller  
- `submitProof(uint256 listingId, bytes32 proofHash)`: Submit delivery proof
- `verifyAndRelease(uint256 listingId)`: Verify and release funds (owner only)
- `cancelListing(uint256 listingId)`: Cancel open listing

### View Functions

- `getListing(uint256 listingId)`: Get complete listing information
- `getUserListings(address user)`: Get user's created listings
- `getUserFulfillments(address user)`: Get user's fulfilled listings  
- `getListingCount()`: Get total number of listings
- `getListingBasicInfo(uint256 listingId)`: Get gas-optimized listing info
- `getAllListings(uint256 offset, uint256 limit)`: Get paginated listings

## Security Considerations

- **Reentrancy Protection**: All state-changing functions use `nonReentrant` modifier
- **Safe Transfers**: ERC20 transfers use OpenZeppelin's `SafeERC20`
- **Access Control**: Functions restricted to appropriate roles
- **State Validation**: Comprehensive status checks prevent invalid transitions
- **Integer Overflow**: Safe math operations prevent overflow attacks

## Testing

The contract includes comprehensive security measures suitable for production:

- OpenZeppelin's battle-tested libraries
- Reentrancy protection on all external calls
- Proper state transitions and validations
- Safe ERC20 token handling
- Access control mechanisms

## Network Compatibility

- **Primary**: Ethereum Sepolia Testnet
- **Future**: Ethereum Mainnet
- **Requirements**: EVM-compatible chains with OpenZeppelin support

## Gas Optimization

The contract implements several gas optimization techniques:

- Struct packing for storage efficiency
- Batch operations where possible
- View functions for read-only operations
- Efficient pagination for large datasets

## Future Enhancements

1. **ZK Integration**: Replace owner verification with ZK proof verification
2. **Dispute Resolution**: Implement arbitration mechanism
3. **Multi-Token Support**: Extend beyond USDC to other ERC20 tokens
4. **Mobile Integration**: API endpoints for mobile applications
5. **Analytics**: Enhanced tracking and reporting features

## License

MIT License - see LICENSE file for details

## Security Audit

⚠️ **Note**: This contract should undergo professional security audit before mainnet deployment.

## Support

For questions and support, please refer to the project documentation or create an issue in the repository.
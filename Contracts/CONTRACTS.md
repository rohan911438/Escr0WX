# EscrowX Smart Contracts Deployment Guide

## � CRITICAL: Deployment Order

**YOU MUST DEPLOY IN THIS EXACT ORDER** - Each contract depends on addresses from previous steps.

### Option A: All-in-One Deployment (Recommended)
```bash
# This script handles everything automatically in the right order
forge script script/DeployEscrowX.s.sol --rpc-url sepolia --broadcast --verify
```

### Option B: Manual Step-by-Step Deployment
```bash
# 1. EVVMManager (no dependencies)
forge create contracts/EVVMManager.sol:EVVMManager --constructor-args $ADMIN_ADDRESS $ADMIN_ADDRESS

# 2. MockVerifier (no dependencies)  
forge create contracts/MockVerifier.sol:MockVerifier

# 3. ZKVerifierAdapter (needs MockVerifier address)
forge create contracts/ZKVerifierAdapter.sol:ZKVerifierAdapter --constructor-args $MOCK_VERIFIER_ADDRESS "Mock_Hackathon_v1.0"

# 4. Treasury (needs EVVMManager + ZKVerifier addresses)
forge create contracts/Treasury.sol:Treasury --constructor-args $ADMIN_ADDRESS $EVVM_MANAGER_ADDRESS $ZK_VERIFIER_ADDRESS

# 5. Configure contracts (grant roles, set up tokens)
# See configuration section below
```

## ❌ WRONG DEPLOYMENT ORDER WILL FAIL

If you try to deploy Treasury first, it will fail because it needs the addresses of EVVMManager and ZKVerifierAdapter in its constructor.

---

## 📝 Deployed Contract Addresses

### Sepolia Testnet
```
Treasury Contract: 0x[TO_BE_FILLED_AFTER_DEPLOYMENT]
EVVMManager Contract: 0x653EE2ea054252c71878e4F382A5810C199F0285
MockVerifier Contract: 0x31C33e2a433363E294d488A538C8F7fc110046B9
ZKVerifierAdapter Contract: 0x[TO_BE_FILLED_AFTER_DEPLOYMENT]
```

### Local Development (Anvil)
```
Treasury Contract: 0x[LOCAL_DEPLOYMENT_ADDRESS]
EVVMManager Contract: 0x[LOCAL_DEPLOYMENT_ADDRESS]
MockVerifier Contract: 0x[LOCAL_DEPLOYMENT_ADDRESS]
ZKVerifierAdapter Contract: 0x[LOCAL_DEPLOYMENT_ADDRESS]
```

### Mainnet (Production)
```
Treasury Contract: NOT_DEPLOYED_YET
EVVMManager Contract: NOT_DEPLOYED_YET
ZKVerifierAdapter Contract: NOT_DEPLOYED_YET
ProductionVerifier Contract: NOT_DEPLOYED_YET
```

---

## 🔗 System Integration Requirements

### 1. Backend Integration (`Backend/src/blockchain/`)

#### Update Contract Configuration
```typescript
// Backend/src/config/contracts.ts
export const CONTRACT_ADDRESSES = {
  sepolia: {
    treasury: "0x[TREASURY_ADDRESS]",
    evvmManager: "0x[EVVM_MANAGER_ADDRESS]", 
    zkVerifier: "0x[ZK_VERIFIER_ADDRESS]",
    mockVerifier: "0x[MOCK_VERIFIER_ADDRESS]"
  },
  anvil: {
    treasury: "0x[LOCAL_TREASURY_ADDRESS]",
    evvmManager: "0x[LOCAL_EVVM_MANAGER_ADDRESS]",
    zkVerifier: "0x[LOCAL_ZK_VERIFIER_ADDRESS]", 
    mockVerifier: "0x[LOCAL_MOCK_VERIFIER_ADDRESS]"
  }
};

export const SUPPORTED_TOKENS = {
  sepolia: {
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"
  }
};
```

#### Required ABI Files
```typescript
// Already updated in Backend/src/blockchain/ContractABI.ts
import { 
  TREASURY_CONTRACT_ABI,
  EVVM_MANAGER_ABI,
  ESCROW_CONTRACT_ABI // For backward compatibility
} from './ContractABI';
```

#### Update BlockchainService.ts
```typescript
// Backend/src/blockchain/BlockchainService.ts
// Update to use multiple contracts instead of single EscrowX contract

class BlockchainService {
  private treasuryContract: ethers.Contract;
  private evvmContract: ethers.Contract;
  
  constructor(config) {
    // Initialize both contracts
    this.treasuryContract = new ethers.Contract(
      config.treasuryAddress, 
      TREASURY_CONTRACT_ABI, 
      this.provider
    );
    
    this.evvmContract = new ethers.Contract(
      config.evvmAddress,
      EVVM_MANAGER_ABI,
      this.provider
    );
  }
}
```

### 2. Frontend Integration (`Frontend/src/`)

#### Update Contract Configuration
```typescript
// Frontend/src/lib/contracts.ts
export const CONTRACTS = {
  treasury: {
    address: "0x[TREASURY_ADDRESS]",
    abi: TREASURY_CONTRACT_ABI
  },
  evvmManager: {
    address: "0x[EVVM_MANAGER_ADDRESS]", 
    abi: EVVM_MANAGER_ABI
  }
};
```

#### Update API Integration
```typescript
// Frontend/src/lib/api.ts
// Add new endpoints for EVVM balance management
export interface EVVMBalance {
  available: string;
  locked: string; 
  pending: string;
}

export const evvmAPI = {
  getBalance: (user: string, token: string) => Promise<EVVMBalance>,
  deposit: (token: string, amount: string) => Promise<number>, // returns nonce
  withdraw: (token: string, amount: string) => Promise<number>
};
```

### 3. Environment Configuration

#### Update `.env` files
```bash
# Backend/.env
TREASURY_CONTRACT_ADDRESS=0x[TREASURY_ADDRESS]
EVVM_MANAGER_ADDRESS=0x[EVVM_MANAGER_ADDRESS]
ZK_VERIFIER_ADDRESS=0x[ZK_VERIFIER_ADDRESS]

# Supported tokens
SEPOLIA_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
SEPOLIA_USDT_ADDRESS=0x7169D38820dfd117C3FA1f22a697dBA58d90BA06

# Frontend/.env
VITE_TREASURY_CONTRACT_ADDRESS=0x[TREASURY_ADDRESS]
VITE_EVVM_MANAGER_ADDRESS=0x[EVVM_MANAGER_ADDRESS]
VITE_NETWORK_ID=11155111
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

---

## 🎯 Contract Specific Integration Points

### Treasury Contract
**Primary Use**: Main escrow functionality
- **Functions to integrate**: `createListing`, `fulfillListing`, `submitProof`, `verifyAndRelease`, `cancelListing`
- **Events to monitor**: `ListingCreated`, `ListingFulfilled`, `ProofSubmitted`, `FundsReleased`, `ListingCancelled`
- **Critical for**: All core escrow operations

### EVVMManager Contract 
**Primary Use**: Balance management and deposits
- **Functions to integrate**: `deposit`, `withdraw`, `getUserBalance`, `hasSufficientBalance`
- **Events to monitor**: `BalanceDeposited`, `BalanceWithdrawn`, `BalanceLocked`, `AsyncOperationCompleted`
- **Critical for**: User balance tracking, deposit/withdrawal flows

### ZKVerifierAdapter Contract
**Primary Use**: Proof verification (future production)
- **Functions to integrate**: `verifyProof`, `isProofVerified`
- **Events to monitor**: `ProofVerified`, `VerifierUpdated`
- **Critical for**: Production ZK proof verification

### MockVerifier Contract
**Primary Use**: Hackathon/demo proof verification
- **Functions to integrate**: `verifyProof`, `setMockParameters`
- **Events to monitor**: `ProofVerified`, `MockParametersUpdated`  
- **Critical for**: Demo and testing scenarios

---

## ⚙️ Post-Deployment Configuration

### 1. Token Setup (Run after deployment)
```bash
# Set up USDC support
cast send $EVVM_MANAGER_ADDRESS "setSupportedToken(address,bool)" $SEPOLIA_USDC true --private-key $PRIVATE_KEY

# Set Treasury limits for USDC (min: 1 USDC, max: 1M USDC)
cast send $TREASURY_ADDRESS "setListingLimits(address,uint256,uint256)" $SEPOLIA_USDC 1000000 1000000000000 --private-key $PRIVATE_KEY
```

### 2. Role Configuration (Automatic in deployment script)
```bash
# Grant Treasury role to Treasury contract
cast send $EVVM_MANAGER_ADDRESS "grantRole(bytes32,address)" $(cast keccak256 "TREASURY_ROLE") $TREASURY_ADDRESS --private-key $PRIVATE_KEY

# Add Treasury as trusted verifier
cast send $ZK_VERIFIER_ADDRESS "addTrustedVerifier(address)" $TREASURY_ADDRESS --private-key $PRIVATE_KEY
```

### 3. Fee Configuration
```bash
# Set treasury fee rate to 2.5% (250 basis points)
cast send $TREASURY_ADDRESS "setTreasuryFeeRate(uint256)" 250 --private-key $PRIVATE_KEY
```

---

## 🧪 Testing & Verification

### Contract Verification Commands
```bash
# Verify Treasury
forge verify-contract --chain-id 11155111 --constructor-args $(cast abi-encode "constructor(address,address,address)" $ADMIN_ADDRESS $EVVM_MANAGER_ADDRESS $ZK_VERIFIER_ADDRESS) $TREASURY_ADDRESS contracts/Treasury.sol:Treasury --etherscan-api-key $ETHERSCAN_API_KEY

# Verify EVVMManager  
forge verify-contract --chain-id 11155111 --constructor-args $(cast abi-encode "constructor(address,address)" $ADMIN_ADDRESS $ADMIN_ADDRESS) $EVVM_MANAGER_ADDRESS contracts/EVVMManager.sol:EVVMManager --etherscan-api-key $ETHERSCAN_API_KEY
```

### Integration Tests
```bash
# Test contract deployment
forge test --match-contract DeploymentTest

# Test end-to-end functionality
forge test --match-contract IntegrationTest

# Test with mainnet fork
forge test --fork-url https://eth-mainnet.g.alchemy.com/v2/$MAINNET_RPC_URL
```

---

## 🚨 Critical Integration Checklist

### Before Going Live
- [ ] All contracts deployed and verified on Etherscan
- [ ] Backend updated with correct contract addresses and ABIs
- [ ] Frontend updated with contract addresses and network configuration
- [ ] Environment variables configured in all services
- [ ] Event listeners updated for new event signatures
- [ ] EVVM balance integration added to user dashboard
- [ ] Token support configured (USDC, USDT)
- [ ] Fee rates and limits configured appropriately
- [ ] Admin roles assigned to correct addresses
- [ ] Integration tests passing end-to-end
- [ ] Mock verifier configured for demo (100% success rate)

### Demo Preparation
- [ ] MockVerifier set to 100% success rate: `setMockParameters(100, true)`
- [ ] Test tokens available for demo accounts
- [ ] All contract functions tested on Sepolia
- [ ] Event monitoring confirmed working
- [ ] User flows tested: deposit → create listing → fulfill → submit proof → release

---

## 📞 Quick Reference

### Key Contracts Summary
| Contract | Purpose | Integration Priority |
|----------|---------|---------------------|
| **Treasury** | Main escrow logic | 🔴 CRITICAL |
| **EVVMManager** | Balance management | 🔴 CRITICAL |
| **ZKVerifierAdapter** | Proof verification | 🟡 IMPORTANT |
| **MockVerifier** | Demo verification | 🟢 DEMO ONLY |

### Network Information
- **Sepolia Chain ID**: 11155111
- **Sepolia RPC**: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
- **Block Explorer**: https://sepolia.etherscan.io/

---

**🎯 Next Steps**: 
1. Run the deployment script: `forge script script/DeployEscrowX.s.sol --rpc-url sepolia --broadcast --verify`
2. Update this file with the actual deployed addresses
3. Update backend and frontend configurations with new addresses
4. Test end-to-end functionality on Sepolia
5. Prepare demo with MockVerifier at 100% success rate
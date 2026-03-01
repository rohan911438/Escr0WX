# 🚀 EscrowX Deployment Quick Reference

## ✅ Deployment Status (Sepolia Testnet) - **COMPLETE!**

- [x] **EVVMManager** ✅ [`0x653EE2ea054252c71878e4F382A5810C199F0285`](https://sepolia.etherscan.io/address/0x653EE2ea054252c71878e4F382A5810C199F0285) 
  - **Deployed**: Block 10348735, TX [`0x63dc...73bf`](https://sepolia.etherscan.io/tx/0x63dc6b344062c92c19785a60e6689853de9be81d2adcdeb42673eb163fb573bf)
  - **Gas Used**: 3,699,056
  - **Status**: ✅ Production ready
- [x] **MockVerifier** ✅ [`0x31C33e2a433363E294d488A538C8F7fc110046B9`](https://sepolia.etherscan.io/address/0x31C33e2a433363E294d488A538C8F7fc110046B9)
  - **Deployed**: Block 10348771, TX [`0x0266...23e9`](https://sepolia.etherscan.io/tx/0x026690b436761ec8d5be7fb704352f5e728cb763d74655cee7ac1ff5bcc823e9)
  - **Gas Used**: 2,174,098  
  - **Status**: ✅ Production ready
- [x] **ZKVerifierAdapter** ✅ [`0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c`](https://sepolia.etherscan.io/address/0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c)
  - **Deployed**: Block 10348816, TX [`0x5d23...ee45`](https://sepolia.etherscan.io/tx/0x5d2337e98d5848e45d956504450529146d758b06fbcaad970f8eb39b6cf0ee45)
  - **Gas Used**: 3,412,796
  - **Status**: ✅ Production ready 
- [x] **Treasury** ✅ [`0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615`](https://sepolia.etherscan.io/address/0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615)
  - **Deployed**: Block 10348852, TX [`0x761a...cb6b`](https://sepolia.etherscan.io/tx/0x761a56efd6678039efc3784375462a0a5ee9ade9c25439fc07d9409ee9c7cb6b)
  - **Gas Used**: 3,961,601
  - **Status**: ✅ **LIVE - Ready for use!**

### 🎉 **Total Deployment Cost: 13,247,551 gas**

## ⚡ TL;DR - Deploy Everything at Once
```bash
forge script script/DeployEscrowX.s.sol --rpc-url sepolia --broadcast --verify
```

## 📋 Step-by-Step Deployment Order

### 1️⃣ Deploy EVVMManager (Independent)
```bash
# Deploys balance management contract
# No dependencies required
```

### 2️⃣ Deploy MockVerifier (Independent) 
```bash
# Deploys hackathon-ready proof verifier
# No dependencies required
```

### 3️⃣ Deploy ZKVerifierAdapter (Needs MockVerifier address)
```bash
# Deploys proof verification adapter
# Requires: MockVerifier address from step 2
```

### 4️⃣ Deploy Treasury (Needs EVVMManager + ZKVerifier addresses)
```bash  
# Deploys main escrow contract
# Requires: EVVMManager address from step 1
#          ZKVerifierAdapter address from step 3
```

### 5️⃣ Configure Contracts (Needs all addresses)
```bash
# Grant roles between contracts
# Set up supported tokens (USDC, USDT)
# Configure fee rates and limits
```

## 🏗 What You Need After Deployment

### For Backend Integration
```typescript
// ✅ UPDATE THESE FILES WITH NEW ADDRESSES:
Backend/src/blockchain/ContractABI.ts         ✅ ALREADY UPDATED
Backend/src/config/contracts.ts               📋 NEEDS ALL 4 CONTRACT ADDRESSES  
Backend/src/blockchain/BlockchainService.ts  📋 UPDATE FOR MULTI-CONTRACTS
```

### For Frontend Integration  
```typescript
// ✅ UPDATE THESE FILES WITH NEW ADDRESSES:
Frontend/src/lib/contracts.ts                 📋 ADD ALL 4 CONTRACT ADDRESSES
Frontend/src/lib/api.ts                       📋 INTEGRATE EVVM + TREASURY
Frontend/.env                                 📋 ADD ALL CONTRACT ADDRESSES (see below)
```

### Environment Variables - **READY TO USE!**
```bash
# ✅ All addresses available - update your .env files:
TREASURY_CONTRACT_ADDRESS=0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615
EVVM_MANAGER_ADDRESS=0x653EE2ea054252c71878e4F382A5810C199F0285  
ZK_VERIFIER_ADDRESS=0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c
MOCK_VERIFIER_ADDRESS=0x31C33e2a433363E294d488A538C8F7fc110046B9
```

## 🎯 Critical Integration Points

| Component | What It Does | Integration Priority |
|-----------|--------------|---------------------|
| **Treasury** | Main escrow (create/fulfill/release) | 🔴 CRITICAL |
| **EVVMManager** | User balance management | 🔴 CRITICAL |
| **ZKVerifier** | Proof verification | 🟡 IMPORTANT |
| **MockVerifier** | Demo verification | 🟢 DEMO ONLY |

## 📝 After Deployment Checklist

### Immediate (Required for Basic Function)
- [ ] Update contract addresses in backend config
- [ ] Update contract addresses in frontend config  
- [ ] Update environment variables
- [ ] Test basic contract calls (getListing, getBalance)

### For Full Integration (Required for Production)
- [ ] Add EVVM balance display to frontend
- [ ] Update event listeners for new event signatures
- [ ] Add deposit/withdraw flows to frontend
- [ ] Test complete user journey end-to-end
- [ ] Configure MockVerifier for 100% success rate

### For Demo Ready
- [x] Deploy to Sepolia testnet ✅ **COMPLETE**
- [x] Verify all contracts on Etherscan ⏳ **IN PROGRESS**
- [ ] Test with small amounts first
- [ ] Prepare demo accounts with test tokens
- [ ] Set MockVerifier to always succeed for demos

🎊 **EscrowX is now live on Sepolia testnet and ready for integration!**

## ⚠️ Common Gotchas

1. **Deploy in the right order** - Treasury needs the other contract addresses
2. **Grant roles after deployment** - Contracts need permissions to interact  
3. **Test on Sepolia first** - Don't go straight to mainnet
4. **Update ABIs** - Backend/frontend need new contract interfaces
5. **Configure supported tokens** - Set up USDC/USDT after deployment

---

📖 **Full Details**: See [CONTRACTS.md](CONTRACTS.md) for comprehensive deployment guide
/**
 * EscrowX Real Transaction Testing Guide
 * How to get tokens and test real wallet transactions
 */

# 🚀 Real Wallet Testing for EscrowX

## ⚠️ **Current Issue**
Your EscrowX contract uses **ERC20 tokens** (USDC) but your wallet only has **Sepolia ETH**.

## 💡 **Solutions for Real Testing**

### 🔥 **Option 1: Get Sepolia USDC (Easiest)**

1. **Get USDC from Sepolia Faucet:**
   - Visit: https://faucet.circle.com/
   - Request Sepolia USDC tokens
   - Use address: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

2. **Add USDC to MetaMask:**
   ```
   Token Address: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
   Symbol: USDC
   Decimals: 6
   ```

### 🛠️ **Option 2: Deploy Mock USDC Contract**

```solidity
// Simple ERC20 token for testing
contract MockUSDC {
    function mint(address to, uint256 amount) public {
        // Mint test tokens
    }
}
```

### ⚡ **Option 3: Use ETH Wrapper (Quick Fix)**

Create an ETH-based version of your contract:

```solidity
// ETH-based escrow (no tokens needed)
function createListingETH() public payable {
    require(msg.value > 0, "ETH required");
    // Use msg.value instead of token transfer
}
```

## 🧪 **Testing Steps After Getting USDC**

1. **Check Balance:**
   - Open MetaMask
   - Make sure you see USDC tokens

2. **Test Transaction:**
   - Go to: http://localhost:8080/test
   - Try "Create Listing" 
   - Should now use real USDC tokens

3. **Approve Tokens:**
   - First transaction: Approve contract to spend USDC
   - Second transaction: Create actual listing

## 🎯 **What You'll See With Real Transactions**

- ✅ **MetaMask popup** for token approval
- ✅ **Gas fee estimation** in ETH
- ✅ **Transaction confirmation** on Etherscan
- ✅ **Real token balance changes**

## 🔧 **Quick Test Commands**

```javascript
// Check if you have tokens
const balance = await usdcContract.balanceOf('your-address')

// Approve contract to spend
await usdcContract.approve(contractAddress, amount)

// Create listing (real transaction)
await escrowContract.createListing(token, amount, premium)
```

## 💰 **Costs**
- **Gas fees**: ~0.001-0.01 Sepolia ETH per transaction
- **USDC**: Free from faucets (test tokens)
- **Total**: Just gas fees in Sepolia ETH

**Ready to get USDC tokens and try real transactions?**
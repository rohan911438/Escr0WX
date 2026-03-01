# EscrowX Remix IDE Deployment Guide

This guide walks you through deploying the EscrowX smart contract using Remix IDE on Ethereum Sepolia testnet.

## Prerequisites

1. **MetaMask Wallet**: Install [MetaMask](https://metamask.io/) browser extension
2. **Sepolia ETH**: Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. **Test USDC**: Deploy or get Sepolia USDC for testing (optional for initial deployment)

## Step-by-Step Deployment

### 1. Setup Remix IDE

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new workspace or use the default workspace
3. In the file explorer, create a new folder called `contracts`

### 2. Import Contract Files

1. **Upload EscrowX.sol**:
   - Right-click in the file explorer
   - Select "New File"
   - Name it `EscrowX.sol`
   - Copy and paste the EscrowX contract code

2. **Install OpenZeppelin Dependencies**:
   - Go to the "File Explorer" tab
   - Click on the "Plugin Manager" (plug icon)
   - Search for and activate "OpenZeppelin Contracts"
   - Or manually import by adding this at the top of your contract:
   ```solidity
   import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/token/ERC20/IERC20.sol";
   import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/token/ERC20/utils/SafeERC20.sol";
   import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/access/Ownable.sol";
   import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.1/contracts/utils/ReentrancyGuard.sol";
   ```

### 3. Compile the Contract

1. Click on the "Solidity Compiler" tab (Solidity logo)
2. Set compiler version to `0.8.20` or higher
3. Ensure "Auto compile" is checked
4. Click "Compile EscrowX.sol"
5. Verify successful compilation (green checkmark)

### 4. Configure MetaMask for Sepolia

1. Open MetaMask
2. Click network dropdown (usually shows "Ethereum Mainnet")
3. Select "Sepolia test network"
   - If not visible, add it manually:
     - Network Name: Sepolia
     - New RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
     - Chain ID: 11155111
     - Currency Symbol: ETH
     - Block Explorer: `https://sepolia.etherscan.io`

### 5. Deploy Contract

1. **Go to Deploy Tab**:
   - Click "Deploy & Run Transactions" tab (Ethereum logo)

2. **Configure Environment**:
   - Environment: Select "Injected Provider - MetaMask"
   - Account: Your MetaMask address should appear
   - Gas Limit: Leave default (usually auto-calculated)

3. **Select Contract**:
   - Contract dropdown should show "EscrowX"
   - Make sure it's selected

4. **Deploy**:
   - Click the orange "Deploy" button
   - MetaMask will prompt for transaction confirmation
   - Confirm the transaction (pay gas fee)
   - Wait for confirmation

### 6. Verify Deployment

1. **Check Deployed Contracts**:
   - After deployment, contract appears under "Deployed Contracts"
   - Note down the contract address

2. **Test Basic Functions**:
   ```javascript
   // Test getListingCount (should return 0)
   getListingCount()
   
   // Test getVersion (should return "1.0.0")  
   getVersion()
   ```

3. **View on Etherscan**:
   - Copy contract address
   - Go to [Sepolia Etherscan](https://sepolia.etherscan.io)
   - Paste address to view on blockchain

### 7. Verify Contract on Etherscan (Optional)

1. Go to your contract on Sepolia Etherscan
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Fill verification form:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20
   - License: MIT
   - Paste contract source code

## Testing the Contract

### Deploy Test USDC (Optional)

If you need a test USDC token:

1. Create `MockERC20.sol` in Remix
2. Deploy with parameters:
   - name: "USD Coin"
   - symbol: "USDC"  
   - decimals: 6
   - initialSupply: 1000000000000 (1M USDC with 6 decimals)

### Test Full Workflow

1. **Create Listing**:
   ```javascript
   // First approve USDC spending
   // Then call createListing
   createListing("USDC_ADDRESS", "1000000", "100000") // 1 USDC + 0.1 USDC premium
   ```

2. **Fulfill Listing**:
   ```javascript
   fulfillListing(1) // Use different account
   ```

3. **Submit Proof**:
   ```javascript
   submitProof(1, "0x1234...") // Fulfiller submits proof hash
   ```

4. **Release Funds**:
   ```javascript
   verifyAndRelease(1) // Owner releases funds
   ```

## Important Contract Addresses

After deployment, save these addresses:

- **EscrowX Contract**: `YOUR_DEPLOYED_ADDRESS`
- **Test USDC** (if deployed): `YOUR_USDC_ADDRESS`
- **Deployer Address**: `YOUR_WALLET_ADDRESS`

## Common Issues & Solutions

### 1. Compilation Errors
- Ensure compiler version is 0.8.20+
- Check OpenZeppelin imports are correct
- Verify contract syntax

### 2. Deployment Failures  
- Insufficient ETH for gas fees
- Wrong network selected
- MetaMask not connected

### 3. Transaction Reverts
- Check function requirements
- Ensure proper token approvals
- Verify correct listing status

## Gas Costs (Approximate)

- **Deploy Contract**: ~2.5M gas (~$50-100 on mainnet)
- **Create Listing**: ~150K gas
- **Fulfill Listing**: ~80K gas  
- **Submit Proof**: ~70K gas
- **Release Funds**: ~90K gas

## Next Steps

1. **Frontend Integration**: Use the deployed contract address in your dApp
2. **Security Audit**: Have contract audited before mainnet deployment
3. **Monitoring**: Set up event monitoring for contract interactions
4. **Documentation**: Update README with deployed contract details

## Support Resources

- [Remix IDE Documentation](https://remix-ide.readthedocs.io/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Etherscan API](https://docs.etherscan.io/)

## Security Reminders

⚠️ **Important**: 
- Never share your private keys
- Use testnet for development/testing
- Get security audit before mainnet deployment
- Keep deployment details secure
- Test thoroughly before production use
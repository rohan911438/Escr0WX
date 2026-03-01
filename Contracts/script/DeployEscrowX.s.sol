// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/Treasury.sol";
import "../contracts/EVVMManager.sol";
import "../contracts/MockVerifier.sol";
import "../contracts/ZKVerifierAdapter.sol";

/**
 * @title DeployEscrowX
 * @dev Foundry deployment script for EscrowX protocol
 * Deploys all contracts in the correct order with proper configuration
 */
contract DeployEscrowX is Script {
    
    // ============ DEPLOYMENT ADDRESSES ============
    
    Treasury public treasury;
    EVVMManager public evvmManager;
    MockVerifier public mockVerifier;
    ZKVerifierAdapter public zkVerifierAdapter;
    
    // ============ CONFIGURATION ============
    
    // Default configuration values (can be overridden by environment variables)
    uint256 public constant DEFAULT_TREASURY_FEE_RATE = 250; // 2.5%
    uint256 public constant DEFAULT_MIN_LISTING_AMOUNT = 1e6; // 1 USDC
    uint256 public constant DEFAULT_MAX_LISTING_AMOUNT = 1e12; // 1M USDC
    
    // Common test tokens on Sepolia (add more as needed)
    address public constant SEPOLIA_USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address public constant SEPOLIA_USDT = 0x7169D38820dfd117C3FA1f22a697dBA58d90BA06;
    
    // ============ EVENTS ============
    
    event ContractDeployed(string name, address addr, uint256 gasUsed);
    event DeploymentCompleted(address treasury, address evvmManager, address zkVerifier);
    
    function run() external {
        // Load configuration from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 treasuryFeeRate = vm.envOr("TREASURY_FEE_RATE", DEFAULT_TREASURY_FEE_RATE);
        
        // Start broadcast
        vm.startBroadcast(deployerPrivateKey);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deploying EscrowX contracts with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        // Deploy contracts in correct order
        _deployEVVMManager(deployer);
        _deployMockVerifier();
        _deployZKVerifierAdapter();
        _deployTreasury(deployer, treasuryFeeRate);
        
        // Configure contracts
        _configureContracts();
        
        // Setup test tokens (if on testnet)
        if (block.chainid == 11155111) { // Sepolia
            _setupTestTokens();
        }
        
        vm.stopBroadcast();
        
        // Log deployment results
        _logDeploymentResults();
        
        emit DeploymentCompleted(address(treasury), address(evvmManager), address(zkVerifierAdapter));
    }
    
    function _deployEVVMManager(address admin) internal {
        console.log("Deploying EVVMManager...");
        
        uint256 gasBefore = gasleft();
        evvmManager = new EVVMManager(admin, admin); // Treasury address will be set later
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("EVVMManager deployed at:", address(evvmManager));
        emit ContractDeployed("EVVMManager", address(evvmManager), gasUsed);
    }
    
    function _deployMockVerifier() internal {
        console.log("Deploying MockVerifier...");
        
        uint256 gasBefore = gasleft();
        mockVerifier = new MockVerifier();
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("MockVerifier deployed at:", address(mockVerifier));
        emit ContractDeployed("MockVerifier", address(mockVerifier), gasUsed);
    }
    
    function _deployZKVerifierAdapter() internal {
        console.log("Deploying ZKVerifierAdapter...");
        
        uint256 gasBefore = gasleft();
        zkVerifierAdapter = new ZKVerifierAdapter(
            address(mockVerifier),
            "Mock_Hackathon_v1.0"
        );
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("ZKVerifierAdapter deployed at:", address(zkVerifierAdapter));
        emit ContractDeployed("ZKVerifierAdapter", address(zkVerifierAdapter), gasUsed);
    }
    
    function _deployTreasury(address admin, uint256 treasuryFeeRate) internal {
        console.log("Deploying Treasury...");
        
        uint256 gasBefore = gasleft();
        treasury = new Treasury(
            admin,
            address(evvmManager),
            address(zkVerifierAdapter)
        );
        uint256 gasUsed = gasBefore - gasleft();
        
        // Set treasury fee rate
        treasury.setTreasuryFeeRate(treasuryFeeRate);
        
        console.log("Treasury deployed at:", address(treasury));
        console.log("Treasury fee rate set to:", treasuryFeeRate, "basis points");
        emit ContractDeployed("Treasury", address(treasury), gasUsed);
    }
    
    function _configureContracts() internal {
        console.log("Configuring contracts...");
        
        // Grant Treasury role to Treasury contract in EVVMManager
        evvmManager.grantRole(evvmManager.TREASURY_ROLE(), address(treasury));
        console.log("Treasury role granted to Treasury contract");
        
        // Add treasury as trusted verifier in ZKVerifierAdapter
        zkVerifierAdapter.addTrustedVerifier(address(treasury));
        console.log("Treasury added as trusted verifier");
        
        console.log("Contract configuration completed");
    }
    
    function _setupTestTokens() internal {
        console.log("Setting up test tokens for Sepolia...");
        
        uint256 minAmount = vm.envOr("MIN_LISTING_AMOUNT", DEFAULT_MIN_LISTING_AMOUNT);
        uint256 maxAmount = vm.envOr("MAX_LISTING_AMOUNT", DEFAULT_MAX_LISTING_AMOUNT);
        
        // Configure USDC
        if (SEPOLIA_USDC != address(0)) {
            treasury.setListingLimits(SEPOLIA_USDC, minAmount, maxAmount);
            evvmManager.setSupportedToken(SEPOLIA_USDC, true);
            console.log("USDC configured - Min:", minAmount, "Max:", maxAmount);
        }
        
        // Configure USDT
        if (SEPOLIA_USDT != address(0)) {
            treasury.setListingLimits(SEPOLIA_USDT, minAmount, maxAmount);
            evvmManager.setSupportedToken(SEPOLIA_USDT, true);
            console.log("USDT configured - Min:", minAmount, "Max:", maxAmount);
        }
        
        console.log("Test token setup completed");
    }
    
    function _logDeploymentResults() internal view {
        console.log("\n=== EscrowX Deployment Summary ===");
        console.log("Network:", _getNetworkName());
        console.log("Treasury:", address(treasury));
        console.log("EVVMManager:", address(evvmManager));
        console.log("MockVerifier:", address(mockVerifier));
        console.log("ZKVerifierAdapter:", address(zkVerifierAdapter));
        
        // Log contract verification commands
        console.log("\n=== Verification Commands ===");
        console.log("Treasury:");
        console.log(string.concat(
            "forge verify-contract --chain-id ", vm.toString(block.chainid),
            " --constructor-args $(cast abi-encode \"constructor(address,address,address)\" ",
            vm.toString(treasury.owner()), " ",
            vm.toString(address(evvmManager)), " ",
            vm.toString(address(zkVerifierAdapter)),
            ") ", vm.toString(address(treasury)), " contracts/Treasury.sol:Treasury"
        ));
        
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contracts on Etherscan using the commands above");
        console.log("2. Update frontend configuration with new contract addresses");
        console.log("3. Update backend ABI files with new contract interfaces");
        console.log("4. Test contract functionality using Foundry forge test");
        console.log("5. For production: Replace MockVerifier with actual ZK verifier");
    }
    
    function _getNetworkName() internal view returns (string memory) {
        if (block.chainid == 1) return "Mainnet";
        if (block.chainid == 11155111) return "Sepolia";
        if (block.chainid == 31337) return "Anvil";
        return string.concat("Unknown (", vm.toString(block.chainid), ")");
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Get deployment addresses (for testing and integration)
     */
    function getDeploymentAddresses() external view returns (
        address treasuryAddr,
        address evvmManagerAddr,
        address mockVerifierAddr,
        address zkVerifierAdapterAddr
    ) {
        return (
            address(treasury),
            address(evvmManager),
            address(mockVerifier),
            address(zkVerifierAdapter)
        );
    }
}
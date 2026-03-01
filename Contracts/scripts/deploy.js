const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Starting EscrowX deployment...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy the EscrowX contract
    console.log("\n📦 Deploying EscrowX contract...");
    const EscrowX = await ethers.getContractFactory("EscrowX");
    const escrowX = await EscrowX.deploy();
    
    // Wait for deployment
    await escrowX.waitForDeployment();
    const contractAddress = await escrowX.getAddress();
    
    console.log("✅ EscrowX deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔍 Transaction hash:", escrowX.deploymentTransaction().hash);

    // Verify contract version
    try {
        const version = await escrowX.getVersion();
        console.log("📊 Contract version:", version);
    } catch (error) {
        console.log("⚠️  Could not retrieve contract version");
    }

    // Get listing count (should be 0 for new deployment)
    try {
        const listingCount = await escrowX.getListingCount();
        console.log("📋 Initial listing count:", listingCount.toString());
    } catch (error) {
        console.log("⚠️  Could not retrieve listing count");
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Verify the contract on Etherscan (if on mainnet/testnet)");
    console.log("2. Test contract functionality with sample transactions");
    console.log("3. Integrate with your frontend application");
    
    // For Sepolia testnet, provide verification command
    if (network.name === "sepolia") {
        console.log("\n🔍 To verify on Etherscan, run:");
        console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
    }

    return {
        contract: escrowX,
        address: contractAddress,
        deployer: deployer.address
    };
}

// Execute deployment
main()
    .then((result) => {
        console.log("\n✨ Deployment successful!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
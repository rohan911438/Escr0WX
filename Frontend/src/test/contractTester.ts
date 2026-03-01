/**
 * EscrowX Smart Contract Testing Suite
 * 
 * PHASE 1 - Contract Testing for State Machine Integrity
 * This script validates the deployed EscrowX contract on Sepolia testnet
 */

import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI, LISTING_STATUS } from '../lib/contract';

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  txHash?: string;
  gasUsed?: number;
}

interface TestAccount {
  address: string;
  signer: ethers.Signer;
  name: string;
}

class EscrowXContractTester {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private accountA: TestAccount; // Creator
  private accountB: TestAccount; // Fulfiller
  private owner: TestAccount;    // Contract owner
  private results: TestResult[] = [];

  constructor() {
    // Initialize provider (you'll need to set up your RPC URL)
    this.provider = new ethers.JsonRpcProvider("YOUR_SEPOLIA_RPC_URL");
    this.contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_CONTRACT_ABI, this.provider);
  }

  // Setup test accounts (you'll need to provide private keys for testing)
  async initializeTestAccounts() {
    // WARNING: Use test accounts only with test funds!
    const privateKeyA = "YOUR_TEST_PRIVATE_KEY_A";
    const privateKeyB = "YOUR_TEST_PRIVATE_KEY_B"; 
    const privateKeyOwner = "YOUR_OWNER_PRIVATE_KEY";

    this.accountA = {
      signer: new ethers.Wallet(privateKeyA, this.provider),
      address: new ethers.Wallet(privateKeyA).address,
      name: "Account A (Creator)"
    };

    this.accountB = {
      signer: new ethers.Wallet(privateKeyB, this.provider),
      address: new ethers.Wallet(privateKeyB).address,
      name: "Account B (Fulfiller)"
    };

    this.owner = {
      signer: new ethers.Wallet(privateKeyOwner, this.provider),
      address: new ethers.Wallet(privateKeyOwner).address,
      name: "Owner Account"
    };

    console.log("🔑 Test accounts initialized:");
    console.log(`   Creator: ${this.accountA.address}`);
    console.log(`   Fulfiller: ${this.accountB.address}`);
    console.log(`   Owner: ${this.owner.address}`);
  }

  // Helper method to add test result
  private addResult(testName: string, success: boolean, error?: string, txHash?: string, gasUsed?: number) {
    this.results.push({ testName, success, error, txHash, gasUsed });
  }

  // 1. Test: Contract Basic Info
  async testContractBasics() {
    try {
      console.log("\n🧪 Testing contract basics...");
      
      const version = await this.contract.getVersion();
      console.log(`   Contract version: ${version}`);
      
      const listingCount = await this.contract.getListingCount();
      console.log(`   Total listings: ${listingCount}`);

      this.addResult("Contract Basics", true);
    } catch (error) {
      this.addResult("Contract Basics", false, error.message);
    }
  }

  // 2. Test: Create Listing (Account A)
  async testCreateListing() {
    try {
      console.log("\n🧪 Testing listing creation...");
      
      const contractWithSigner = this.contract.connect(this.accountA.signer);
      const tokenAddress = "0x0000000000000000000000000000000000000000"; // ETH
      const amount = ethers.parseEther("0.1");
      const premium = ethers.parseEther("0.01");

      const tx = await contractWithSigner.createListing(tokenAddress, amount, premium);
      const receipt = await tx.wait();
      
      console.log(`   ✅ Listing created - TX: ${tx.hash}`);
      console.log(`   Gas used: ${receipt.gasUsed}`);
      
      // Get the listing ID from event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'ListingCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const listingId = parsed.args.listingId;
        console.log(`   Listing ID: ${listingId}`);
        
        // Verify listing state
        const listing = await this.contract.getListing(listingId);
        if (listing.status === LISTING_STATUS.OPEN) {
          console.log("   ✅ Listing status is OPEN");
        }
        
        this.addResult("Create Listing", true, undefined, tx.hash, Number(receipt.gasUsed));
        return Number(listingId);
      }
    } catch (error) {
      this.addResult("Create Listing", false, error.message);
    }
    return null;
  }

  // 3. Test: Fulfill Listing (Account B)
  async testFulfillListing(listingId: number) {
    if (!listingId) return false;

    try {
      console.log(`\n🧪 Testing listing fulfillment (ID: ${listingId})...`);
      
      const contractWithSigner = this.contract.connect(this.accountB.signer);
      const tx = await contractWithSigner.fulfillListing(listingId);
      const receipt = await tx.wait();
      
      console.log(`   ✅ Listing fulfilled - TX: ${tx.hash}`);
      
      // Verify listing state
      const listing = await this.contract.getListing(listingId);
      if (listing.status === LISTING_STATUS.FULFILLED && listing.fulfiller === this.accountB.address) {
        console.log("   ✅ Listing status is FULFILLED");
        console.log(`   ✅ Fulfiller assigned: ${listing.fulfiller}`);
      }
      
      this.addResult("Fulfill Listing", true, undefined, tx.hash, Number(receipt.gasUsed));
      return true;
    } catch (error) {
      this.addResult("Fulfill Listing", false, error.message);
      return false;
    }
  }

  // 4. Test: Submit Proof (Account B)
  async testSubmitProof(listingId: number) {
    if (!listingId) return false;

    try {
      console.log(`\n🧪 Testing proof submission (ID: ${listingId})...`);
      
      const contractWithSigner = this.contract.connect(this.accountB.signer);
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("Delivery proof data"));
      
      const tx = await contractWithSigner.submitProof(listingId, proofHash);
      const receipt = await tx.wait();
      
      console.log(`   ✅ Proof submitted - TX: ${tx.hash}`);
      console.log(`   Proof hash: ${proofHash}`);
      
      // Verify listing state
      const listing = await this.contract.getListing(listingId);
      if (listing.status === LISTING_STATUS.PROOF_SUBMITTED && listing.proofHash === proofHash) {
        console.log("   ✅ Listing status is PROOF_SUBMITTED");
        console.log("   ✅ Proof hash matches");
      }
      
      this.addResult("Submit Proof", true, undefined, tx.hash, Number(receipt.gasUsed));
      return true;
    } catch (error) {
      this.addResult("Submit Proof", false, error.message);
      return false;
    }
  }

  // 5. Test: Verify and Release (Owner)
  async testVerifyAndRelease(listingId: number) {
    if (!listingId) return false;

    try {
      console.log(`\n🧪 Testing verification and release (ID: ${listingId})...`);
      
      const contractWithSigner = this.contract.connect(this.owner.signer);
      
      // Get fulfiller balance before
      const fulfillerBalanceBefore = await this.provider.getBalance(this.accountB.address);
      
      const tx = await contractWithSigner.verifyAndRelease(listingId);
      const receipt = await tx.wait();
      
      console.log(`   ✅ Funds released - TX: ${tx.hash}`);
      
      // Verify listing state
      const listing = await this.contract.getListing(listingId);
      if (listing.status === LISTING_STATUS.RELEASED) {
        console.log("   ✅ Listing status is RELEASED");
      }
      
      // Check balance change (if using ETH)
      const fulfillerBalanceAfter = await this.provider.getBalance(this.accountB.address);
      const balanceIncrease = fulfillerBalanceAfter - fulfillerBalanceBefore;
      if (balanceIncrease > 0) {
        console.log(`   ✅ Fulfiller balance increased by ${ethers.formatEther(balanceIncrease)} ETH`);
      }
      
      this.addResult("Verify and Release", true, undefined, tx.hash, Number(receipt.gasUsed));
      return true;
    } catch (error) {
      this.addResult("Verify and Release", false, error.message);
      return false;
    }
  }

  // EDGE CASE TESTS

  // Test: Try fulfilling twice (should fail)
  async testDoubleFulfill(listingId: number) {
    try {
      console.log(`\n🧪 Testing double fulfill (should fail)...`);
      
      const contractWithSigner = this.contract.connect(this.accountB.signer);
      await contractWithSigner.fulfillListing(listingId);
      
      this.addResult("Double Fulfill Prevention", false, "Should have reverted but didn't");
    } catch (error) {
      console.log("   ✅ Double fulfill correctly prevented");
      this.addResult("Double Fulfill Prevention", true);
    }
  }

  // Test: Try submitting proof before fulfill (should fail)
  async testProofBeforeFulfill() {
    try {
      console.log(`\n🧪 Testing proof submission before fulfill (should fail)...`);
      
      // Create a new listing
      const contractWithSigner = this.contract.connect(this.accountA.signer);
      const tx = await contractWithSigner.createListing(
        "0x0000000000000000000000000000000000000000",
        ethers.parseEther("0.05"),
        ethers.parseEther("0.005")
      );
      const receipt = await tx.wait();
      
      // Get listing ID
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'ListingCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const listingId = parsed.args.listingId;
        
        // Try to submit proof without fulfilling first
        const contractWithSignerB = this.contract.connect(this.accountB.signer);
        const proofHash = ethers.keccak256(ethers.toUtf8Bytes("Invalid proof"));
        
        await contractWithSignerB.submitProof(listingId, proofHash);
        this.addResult("Proof Before Fulfill Prevention", false, "Should have reverted but didn't");
      }
    } catch (error) {
      console.log("   ✅ Proof before fulfill correctly prevented"); 
      this.addResult("Proof Before Fulfill Prevention", true);
    }
  }

  // Test: Try release without proof (should fail) 
  async testReleaseWithoutProof() {
    try {
      console.log(`\n🧪 Testing release without proof (should fail)...`);
      
      // Create and fulfill a listing but don't submit proof
      const contractWithSignerA = this.contract.connect(this.accountA.signer);
      let tx = await contractWithSignerA.createListing(
        "0x0000000000000000000000000000000000000000",
        ethers.parseEther("0.05"),
        ethers.parseEther("0.005")
      );
      let receipt = await tx.wait();
      
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed.name === 'ListingCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const listingId = parsed.args.listingId;
        
        // Fulfill it
        const contractWithSignerB = this.contract.connect(this.accountB.signer);
        await contractWithSignerB.fulfillListing(listingId);
        
        // Try to release without proof
        const contractWithOwner = this.contract.connect(this.owner.signer);
        await contractWithOwner.verifyAndRelease(listingId);
        
        this.addResult("Release Without Proof Prevention", false, "Should have reverted but didn't");
      }
    } catch (error) {
      console.log("   ✅ Release without proof correctly prevented");
      this.addResult("Release Without Proof Prevention", true);
    }
  }

  // Test: Non-owner trying to verify and release (should fail)
  async testNonOwnerRelease(listingId: number) {
    try {
      console.log(`\n🧪 Testing non-owner release (should fail)...`);
      
      const contractWithSigner = this.contract.connect(this.accountA.signer);
      await contractWithSigner.verifyAndRelease(listingId);
      
      this.addResult("Non-Owner Release Prevention", false, "Should have reverted but didn't");
    } catch (error) {
      console.log("   ✅ Non-owner release correctly prevented");
      this.addResult("Non-Owner Release Prevention", true);
    }
  }

  // Run all tests
  async runFullTestSuite() {
    console.log("🚀 Starting EscrowX Contract Test Suite");
    console.log(`📍 Contract Address: ${ESCROW_CONTRACT_ADDRESS}`);
    console.log(`🌐 Network: Sepolia Testnet`);
    
    await this.initializeTestAccounts();
    
    // Basic tests
    await this.testContractBasics();
    
    // Happy path flow
    const listingId = await this.testCreateListing();
    if (listingId) {
      const fulfilled = await this.testFulfillListing(listingId);
      if (fulfilled) {
        const proofSubmitted = await this.testSubmitProof(listingId);
        if (proofSubmitted) {
          await this.testVerifyAndRelease(listingId);
          
          // Edge cases
          await this.testDoubleFulfill(listingId);
          await this.testNonOwnerRelease(listingId);
        }
      }
    }
    
    // More edge cases
    await this.testProofBeforeFulfill();
    await this.testReleaseWithoutProof();
    
    // Print results
    this.printResults();
  }

  // Print test results
  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));
    
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total:  ${this.results.length}`);
    
    console.log("\nDetailed Results:");
    this.results.forEach(result => {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.testName}`);
      if (result.error) console.log(`     Error: ${result.error}`);
      if (result.txHash) console.log(`     TX: ${result.txHash}`);
      if (result.gasUsed) console.log(`     Gas: ${result.gasUsed.toLocaleString()}`);
    });
    
    if (failed === 0) {
      console.log("\n🎉 All tests passed! Contract state machine is working correctly.");
      console.log("✅ Ready for frontend integration!");
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Please review contract implementation.`);
    }
  }
}

// Export for use
export { EscrowXContractTester, TestResult };

// Example usage (commented out):
// async function runTests() {
//   const tester = new EscrowXContractTester();
//   await tester.runFullTestSuite();
// }
// runTests().catch(console.error);
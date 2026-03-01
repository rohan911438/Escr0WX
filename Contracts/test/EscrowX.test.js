const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowX Contract", function () {
    let escrowX;
    let mockUSDC;
    let owner;
    let creator;
    let fulfiller;
    let otherUser;

    const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC (6 decimals)
    const BASE_AMOUNT = ethers.parseUnits("100", 6); // 100 USDC
    const PREMIUM = ethers.parseUnits("10", 6); // 10 USDC
    const TOTAL_AMOUNT = BASE_AMOUNT + PREMIUM;

    beforeEach(async function () {
        // Get signers
        [owner, creator, fulfiller, otherUser] = await ethers.getSigners();

        // Deploy mock USDC token for testing
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6, INITIAL_SUPPLY);
        await mockUSDC.waitForDeployment();

        // Deploy EscrowX contract
        const EscrowX = await ethers.getContractFactory("EscrowX");
        escrowX = await EscrowX.deploy();
        await escrowX.waitForDeployment();

        // Transfer USDC to creator for testing
        await mockUSDC.transfer(creator.address, ethers.parseUnits("10000", 6));
        
        // Approve EscrowX contract to spend creator's USDC
        await mockUSDC.connect(creator).approve(await escrowX.getAddress(), TOTAL_AMOUNT);
    });

    describe("Deployment", function () {
        it("Should deploy with correct initial state", async function () {
            expect(await escrowX.getListingCount()).to.equal(0);
            expect(await escrowX.owner()).to.equal(owner.address);
            expect(await escrowX.getVersion()).to.equal("1.0.0");
        });
    });

    describe("Creating Listings", function () {
        it("Should create a listing successfully", async function () {
            const tx = await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT,
                PREMIUM
            );

            // Check event emission
            await expect(tx)
                .to.emit(escrowX, "ListingCreated")
                .withArgs(1, creator.address, await mockUSDC.getAddress(), BASE_AMOUNT, PREMIUM, TOTAL_AMOUNT);

            // Check listing details
            const listing = await escrowX.getListing(1);
            expect(listing.listingId).to.equal(1);
            expect(listing.creator).to.equal(creator.address);
            expect(listing.token).to.equal(await mockUSDC.getAddress());
            expect(listing.amount).to.equal(BASE_AMOUNT);
            expect(listing.premium).to.equal(PREMIUM);
            expect(listing.totalAmount).to.equal(TOTAL_AMOUNT);
            expect(listing.status).to.equal(0); // OPEN

            // Check token transfer
            expect(await mockUSDC.balanceOf(await escrowX.getAddress())).to.equal(TOTAL_AMOUNT);
        });

        it("Should reject invalid parameters", async function () {
            // Invalid token address
            await expect(
                escrowX.connect(creator).createListing(ethers.ZeroAddress, BASE_AMOUNT, PREMIUM)
            ).to.be.revertedWith("EscrowX: Invalid token address");

            // Zero amount
            await expect(
                escrowX.connect(creator).createListing(await mockUSDC.getAddress(), 0, PREMIUM)
            ).to.be.revertedWith("EscrowX: Amount must be greater than zero");
        });
    });

    describe("Fulfilling Listings", function () {
        beforeEach(async function () {
            // Create a listing first
            await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT,
                PREMIUM
            );
        });

        it("Should fulfill a listing successfully", async function () {
            const tx = await escrowX.connect(fulfiller).fulfillListing(1);

            // Check event emission
            await expect(tx)
                .to.emit(escrowX, "ListingFulfilled")
                .withArgs(1, fulfiller.address);

            // Check listing status
            const listing = await escrowX.getListing(1);
            expect(listing.fulfiller).to.equal(fulfiller.address);
            expect(listing.status).to.equal(1); // FULFILLED
        });

        it("Should reject creator fulfilling own listing", async function () {
            await expect(
                escrowX.connect(creator).fulfillListing(1)
            ).to.be.revertedWith("EscrowX: Creator cannot fulfill own listing");
        });
    });

    describe("Proof Submission", function () {
        const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof_of_delivery"));

        beforeEach(async function () {
            // Create and fulfill a listing
            await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT,
                PREMIUM
            );
            await escrowX.connect(fulfiller).fulfillListing(1);
        });

        it("Should submit proof successfully", async function () {
            const tx = await escrowX.connect(fulfiller).submitProof(1, proofHash);

            // Check event emission
            await expect(tx)
                .to.emit(escrowX, "ProofSubmitted")
                .withArgs(1, fulfiller.address, proofHash);

            // Check listing status
            const listing = await escrowX.getListing(1);
            expect(listing.proofHash).to.equal(proofHash);
            expect(listing.status).to.equal(2); // PROOF_SUBMITTED
        });

        it("Should reject proof from non-fulfiller", async function () {
            await expect(
                escrowX.connect(otherUser).submitProof(1, proofHash)
            ).to.be.revertedWith("EscrowX: Only fulfiller can perform this action");
        });
    });

    describe("Fund Release", function () {
        const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof_of_delivery"));

        beforeEach(async function () {
            // Create, fulfill, and submit proof
            await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT,
                PREMIUM
            );
            await escrowX.connect(fulfiller).fulfillListing(1);
            await escrowX.connect(fulfiller).submitProof(1, proofHash);
        });

        it("Should release funds successfully", async function () {
            const initialBalance = await mockUSDC.balanceOf(fulfiller.address);
            
            const tx = await escrowX.connect(owner).verifyAndRelease(1);

            // Check event emission
            await expect(tx)
                .to.emit(escrowX, "FundsReleased")
                .withArgs(1, fulfiller.address, TOTAL_AMOUNT);

            // Check fund transfer
            const finalBalance = await mockUSDC.balanceOf(fulfiller.address);
            expect(finalBalance - initialBalance).to.equal(TOTAL_AMOUNT);

            // Check listing status
            const listing = await escrowX.getListing(1);
            expect(listing.status).to.equal(4); // RELEASED
        });

        it("Should only allow owner to release funds", async function () {
            await expect(
                escrowX.connect(fulfiller).verifyAndRelease(1)
            ).to.be.revertedWithCustomError(escrowX, "OwnableUnauthorizedAccount");
        });
    });

    describe("Cancellation", function () {
        beforeEach(async function () {
            // Create a listing
            await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT,
                PREMIUM
            );
        });

        it("Should cancel listing successfully", async function () {
            const initialBalance = await mockUSDC.balanceOf(creator.address);
            
            const tx = await escrowX.connect(creator).cancelListing(1);

            // Check event emission
            await expect(tx)
                .to.emit(escrowX, "ListingCancelled")
                .withArgs(1, creator.address, TOTAL_AMOUNT);

            // Check refund
            const finalBalance = await mockUSDC.balanceOf(creator.address);
            expect(finalBalance - initialBalance).to.equal(TOTAL_AMOUNT);

            // Check listing status
            const listing = await escrowX.getListing(1);
            expect(listing.status).to.equal(6); // CANCELLED
        });

        it("Should reject cancellation by non-creator", async function () {
            await expect(
                escrowX.connect(fulfiller).cancelListing(1)
            ).to.be.revertedWith("EscrowX: Only creator can perform this action");
        });

        it("Should reject cancellation after fulfillment", async function () {
            await escrowX.connect(fulfiller).fulfillListing(1);
            
            await expect(
                escrowX.connect(creator).cancelListing(1)
            ).to.be.revertedWith("EscrowX: Invalid listing status");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            // Create multiple listings for testing
            await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT,
                PREMIUM
            );
            
            // Need more USDC approval for second listing
            await mockUSDC.connect(creator).approve(await escrowX.getAddress(), TOTAL_AMOUNT);
            await escrowX.connect(creator).createListing(
                await mockUSDC.getAddress(),
                BASE_AMOUNT * 2n,
                PREMIUM
            );
        });

        it("Should return correct listing count", async function () {
            expect(await escrowX.getListingCount()).to.equal(2);
        });

        it("Should return user listings", async function () {
            const userListings = await escrowX.getUserListings(creator.address);
            expect(userListings.length).to.equal(2);
            expect(userListings[0]).to.equal(1);
            expect(userListings[1]).to.equal(2);
        });

        it("Should return basic listing info", async function () {
            const [creatorAddr, fulfillerAddr, token, totalAmount, status, createdAt] = 
                await escrowX.getListingBasicInfo(1);
            
            expect(creatorAddr).to.equal(creator.address);
            expect(fulfillerAddr).to.equal(ethers.ZeroAddress);
            expect(token).to.equal(await mockUSDC.getAddress());
            expect(totalAmount).to.equal(TOTAL_AMOUNT);
            expect(status).to.equal(0); // OPEN
        });
    });
});

// Mock ERC20 contract for testing
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimalsValue;
        _mint(msg.sender, initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
`;
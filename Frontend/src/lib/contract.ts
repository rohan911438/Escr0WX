/**
 * EscrowX Smart Contract Configuration for Sepolia Testnet
 * Updated to use the deployed EscrowX contract with proper ABI
 */

// DEPLOYED CONTRACT ADDRESS - The actual EscrowX contract address should be here
// Based on deployment info, using Treasury address as the main escrow contract
export const ESCROW_CONTRACT_ADDRESS = "0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615";

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/", // Update with your RPC URL
  blockExplorer: "https://sepolia.etherscan.io"
} as const;

// Complete EscrowX Contract ABI based on EscrowX.sol
export const ESCROW_CONTRACT_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "listingId", "type": "uint256" },
      { "indexed": true, "name": "creator", "type": "address" },
      { "indexed": true, "name": "token", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "premium", "type": "uint256" },
      { "indexed": false, "name": "totalAmount", "type": "uint256" }
    ],
    "name": "ListingCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "listingId", "type": "uint256" },
      { "indexed": true, "name": "fulfiller", "type": "address" }
    ],
    "name": "ListingFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "listingId", "type": "uint256" },
      { "indexed": true, "name": "fulfiller", "type": "address" },
      { "indexed": false, "name": "proofHash", "type": "bytes32" }
    ],
    "name": "ProofSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "listingId", "type": "uint256" },
      { "indexed": true, "name": "fulfiller", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "listingId", "type": "uint256" },
      { "indexed": true, "name": "creator", "type": "address" },
      { "indexed": false, "name": "refundAmount", "type": "uint256" }
    ],
    "name": "ListingCancelled",
    "type": "event"
  },

  // Core Functions
  {
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "premium", "type": "uint256" }
    ],
    "name": "createListing",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "fulfillListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "listingId", "type": "uint256" },
      { "name": "proofHash", "type": "bytes32" }
    ],
    "name": "submitProof",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "verifyAndRelease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },

  // View Functions
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "getListing",
    "outputs": [{
      "components": [
        { "name": "listingId", "type": "uint256" },
        { "name": "creator", "type": "address" },
        { "name": "fulfiller", "type": "address" },
        { "name": "token", "type": "address" },
        { "name": "amount", "type": "uint256" },
        { "name": "premium", "type": "uint256" },
        { "name": "totalAmount", "type": "uint256" },
        { "name": "proofHash", "type": "bytes32" },
        { "name": "status", "type": "uint8" },
        { "name": "createdAt", "type": "uint256" }
      ],
      "name": "",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getListingCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getUserListings",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getUserFulfillments",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "name": "getListingBasicInfo",
    "outputs": [
      { "name": "creator", "type": "address" },
      { "name": "fulfiller", "type": "address" },
      { "name": "token", "type": "address" },
      { "name": "totalAmount", "type": "uint256" },
      { "name": "status", "type": "uint8" },
      { "name": "createdAt", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "offset", "type": "uint256" },
      { "name": "limit", "type": "uint256" }
    ],
    "name": "getAllListings",
    "outputs": [{
      "components": [
        { "name": "listingId", "type": "uint256" },
        { "name": "creator", "type": "address" },
        { "name": "fulfiller", "type": "address" },
        { "name": "token", "type": "address" },
        { "name": "amount", "type": "uint256" },
        { "name": "premium", "type": "uint256" },
        { "name": "totalAmount", "type": "uint256" },
        { "name": "proofHash", "type": "bytes32" },
        { "name": "status", "type": "uint8" },
        { "name": "createdAt", "type": "uint256" }
      ],
      "name": "listings",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getVersion",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "pure",
    "type": "function"
  }
] as const;

// Listing Status Enum (matches Solidity contract)
export const LISTING_STATUS = {
  OPEN: 0,
  FULFILLED: 1,
  PROOF_SUBMITTED: 2,
  VERIFIED: 3,
  RELEASED: 4,
  DISPUTED: 5,
  CANCELLED: 6
} as const;

// Utility function to get status text
export const getListingStatusText = (status: number): string => {
  const statusMap = {
    [LISTING_STATUS.OPEN]: "Open",
    [LISTING_STATUS.FULFILLED]: "Fulfilled", 
    [LISTING_STATUS.PROOF_SUBMITTED]: "Proof Submitted",
    [LISTING_STATUS.VERIFIED]: "Verified",
    [LISTING_STATUS.RELEASED]: "Released",
    [LISTING_STATUS.CANCELLED]: "Cancelled",
    [LISTING_STATUS.DISPUTED]: "Disputed"
  };
  return statusMap[status] || "Unknown";
};

// Common token addresses on Sepolia (for testing)
export const TOKEN_ADDRESSES = {
  ETH: "0x0000000000000000000000000000000000000000", // Native ETH placeholder
  // Add actual Sepolia testnet token addresses when available
} as const;

export default {
  ESCROW_CONTRACT_ADDRESS,
  ESCROW_CONTRACT_ABI,
  NETWORK_CONFIG,
  LISTING_STATUS,
  TOKEN_ADDRESSES
};
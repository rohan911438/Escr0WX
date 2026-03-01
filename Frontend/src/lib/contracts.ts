/**
 * Contract Configuration for EscrowX
 * Uses environment variables for production deployment
 */

// Environment variable validation with fallbacks
const requiredEnvVars = {
  CONTRACT_ADDRESS: import.meta.env.VITE_CONTRACT_ADDRESS || "0x9dE8472Ef25Fc12380FC889bd8f337a5De5A6615",
  CHAIN_ID: import.meta.env.VITE_CHAIN_ID || "11155111",
  ETHEREUM_RPC_URL: import.meta.env.VITE_ETHEREUM_RPC_URL || "https://rpc.sepolia.org",
} as const;

// Warn if environment variables are missing (don't crash the app)
if (!import.meta.env.VITE_CONTRACT_ADDRESS || !import.meta.env.VITE_CHAIN_ID || !import.meta.env.VITE_ETHEREUM_RPC_URL) {
  console.warn('Missing contract environment variables. Using fallback values. Please set VITE_CONTRACT_ADDRESS, VITE_CHAIN_ID, and VITE_ETHEREUM_RPC_URL for production.');
}

// Main EscrowX Contract Address from environment
export const ESCROW_CONTRACT_ADDRESS = requiredEnvVars.CONTRACT_ADDRESS as `0x${string}`;

// Legacy contract addresses (keeping for reference, can be moved to env if needed)
export const CONTRACT_ADDRESSES = {
  ESCROW: ESCROW_CONTRACT_ADDRESS,
  EVVM_MANAGER: "0x653EE2ea054252c71878e4F382A5810C199F0285",
  ZK_VERIFIER_ADAPTER: "0x2DdE400Dca7d02F337f6f21124C0Bf108096DD1c",
  MOCK_VERIFIER: "0x31C33e2a433363E294d488A538C8F7fc110046B9"
} as const;

// Token Addresses (using environment variables)
export const TOKEN_ADDRESSES = {
  USDC: (import.meta.env.VITE_USDC_TOKEN_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238") as `0x${string}`,
} as const;

// Network Configuration from environment variables
export const NETWORK_CONFIG = {
  chainId: parseInt(requiredEnvVars.CHAIN_ID as string) as 11155111,
  name: "Sepolia",
  rpcUrl: requiredEnvVars.ETHEREUM_RPC_URL as string,
  blockExplorer: "https://sepolia.etherscan.io"
} as const;

// EscrowX Contract ABI - Complete interface
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
// Listing Status Enum (matches EscrowX.sol)
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

// Wagmi contract config for the EscrowX contract
export const escrowContractConfig = {
  address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
  abi: ESCROW_CONTRACT_ABI,
} as const;

// Standard ERC20 ABI (for USDC and other tokens)
export const ERC20_ABI = [
  {
    "type": "function",
    "name": "name",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}]
  },
  {
    "type": "function",
    "name": "symbol",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "string"}]
  },
  {
    "type": "function",
    "name": "decimals",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8"}]
  },
  {
    "type": "function",
    "name": "totalSupply",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "stateMutability": "view",
    "inputs": [{"name": "owner", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "type": "function",
    "name": "transfer",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}]
  },
  {
    "type": "function",
    "name": "allowance",
    "stateMutability": "view",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}]
  },
  {
    "type": "function",
    "name": "approve",
    "stateMutability": "nonpayable",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}]
  },
  {
    "type": "function",
    "name": "transferFrom",
    "stateMutability": "nonpayable", 
    "inputs": [
      {"name": "from", "type": "address"},
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}]
  },
  {
    "type": "event",
    "name": "Transfer",
    "anonymous": false,
    "inputs": [
      {"name": "from", "type": "address", "indexed": true},
      {"name": "to", "type": "address", "indexed": true},
      {"name": "value", "type": "uint256", "indexed": false}
    ]
  },
  {
    "type": "event",
    "name": "Approval",
    "anonymous": false,
    "inputs": [
      {"name": "owner", "type": "address", "indexed": true},
      {"name": "spender", "type": "address", "indexed": true},
      {"name": "value", "type": "uint256", "indexed": false}
    ]
  }
] as const;

// Wagmi contract config for USDC token
export const usdcContractConfig = {
  address: TOKEN_ADDRESSES.USDC as `0x${string}`,
  abi: ERC20_ABI,
} as const;

// TypeScript types for smart contract data
export interface EscrowListing {
  listingId: bigint;
  creator: string;
  fulfiller: string;
  token: string;
  amount: bigint;
  premium: bigint;
  totalAmount: bigint;
  proofHash: string;
  status: number;
  createdAt: bigint;
}

export interface ListingDisplayData {
  id: string;
  title: string;
  amount: string;
  premium: string;
  totalAmount: string;
  status: string;
  statusColor: string;
  createdAt: Date;
  tokenSymbol: string;
}
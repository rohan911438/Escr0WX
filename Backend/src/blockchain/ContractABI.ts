// Treasury Contract ABI - Updated for modular EscrowX architecture
export const TREASURY_CONTRACT_ABI = [
  // Events
  {
    "type": "event",
    "name": "ListingCreated",
    "inputs": [
      { "name": "listingId", "type": "uint256", "indexed": true },
      { "name": "creator", "type": "address", "indexed": true },
      { "name": "token", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "premium", "type": "uint256", "indexed": false },
      { "name": "totalAmount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ListingFulfilled",
    "inputs": [
      { "name": "listingId", "type": "uint256", "indexed": true },
      { "name": "fulfiller", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "ProofSubmitted",
    "inputs": [
      { "name": "listingId", "type": "uint256", "indexed": true },
      { "name": "fulfiller", "type": "address", "indexed": true },
      { "name": "proofHash", "type": "bytes32", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "FundsReleased",
    "inputs": [
      { "name": "listingId", "type": "uint256", "indexed": true },
      { "name": "fulfiller", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ListingCancelled",
    "inputs": [
      { "name": "listingId", "type": "uint256", "indexed": true },
      { "name": "creator", "type": "address", "indexed": true },
      { "name": "refundAmount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "EVVMManagerUpdated",
    "inputs": [
      { "name": "oldManager", "type": "address", "indexed": true },
      { "name": "newManager", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "ZKVerifierUpdated",
    "inputs": [
      { "name": "oldVerifier", "type": "address", "indexed": true },
      { "name": "newVerifier", "type": "address", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "TreasuryFeeUpdated",
    "inputs": [
      { "name": "oldRate", "type": "uint256", "indexed": false },
      { "name": "newRate", "type": "uint256", "indexed": false }
    ]
  },

  // Core Functions
  {
    "type": "function",
    "name": "createListing",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "premium", "type": "uint256" }
    ],
    "outputs": [{ "name": "listingId", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "fulfillListing",
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitProof",
    "inputs": [
      { "name": "listingId", "type": "uint256" },
      { "name": "proofHash", "type": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyAndRelease",
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancelListing",
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },

  // View Functions
  {
    "type": "function",
    "name": "getListing",
    "inputs": [{ "name": "listingId", "type": "uint256" }],
    "outputs": [
      {
        "name": "listing",
        "type": "tuple",
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
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserListings",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "listingIds", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getUserFulfillments",
    "inputs": [{ "name": "user", "type": "address" }],
    "outputs": [{ "name": "listingIds", "type": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getListingCount",
    "inputs": [],
    "outputs": [{ "name": "count", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTreasuryInfo",
    "inputs": [{ "name": "token", "type": "address" }],
    "outputs": [
      { "name": "feeRate", "type": "uint256" },
      { "name": "accumulatedFees", "type": "uint256" }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getListingLimits",
    "inputs": [{ "name": "token", "type": "address" }],
    "outputs": [
      { "name": "minAmount", "type": "uint256" },
      { "name": "maxAmount", "type": "uint256" }
    ],
    "stateMutability": "view"
  },

  // Admin Functions
  {
    "type": "function",
    "name": "setEVVMManager",
    "inputs": [{ "name": "newManager", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setZKVerifier",
    "inputs": [{ "name": "newVerifier", "type": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setTreasuryFeeRate",
    "inputs": [{ "name": "newRate", "type": "uint256" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setListingLimits",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "minAmount", "type": "uint256" },
      { "name": "maxAmount", "type": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "pause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "unpause",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// EVVM Manager Contract ABI
export const EVVM_MANAGER_ABI = [
  // Events
  {
    "type": "event",
    "name": "BalanceDeposited",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "token", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "nonce", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "BalanceWithdrawn",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "token", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "nonce", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "BalanceLocked",
    "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "token", "type": "address", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "listingId", "type": "uint256", "indexed": false },
      { "name": "nonce", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "AsyncOperationCompleted",
    "inputs": [
      { "name": "nonce", "type": "uint256", "indexed": true },
      { "name": "user", "type": "address", "indexed": true },
      { "name": "operationType", "type": "uint8", "indexed": false },
      { "name": "success", "type": "bool", "indexed": false }
    ]
  },

  // Functions
  {
    "type": "function",
    "name": "deposit",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "nonce", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdraw",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "nonce", "type": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getUserBalance",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" }
    ],
    "outputs": [
      {
        "name": "balance",
        "type": "tuple",
        "components": [
          { "name": "available", "type": "uint256" },
          { "name": "locked", "type": "uint256" },
          { "name": "pending", "type": "uint256" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasSufficientBalance",
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "sufficient", "type": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setSupportedToken",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "supported", "type": "bool" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

// For backward compatibility, export as ESCROW_CONTRACT_ABI 
export const ESCROW_CONTRACT_ABI = TREASURY_CONTRACT_ABI;
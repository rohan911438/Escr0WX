// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITreasury
 * @dev Interface for the Treasury contract that manages escrow operations
 */
interface ITreasury {
    
    // ============ ENUMS ============
    
    enum ListingStatus {
        OPEN,           // 0 - Listing created, waiting for fulfiller
        FULFILLED,      // 1 - Fulfiller assigned, waiting for proof submission
        PROOF_SUBMITTED,// 2 - Proof submitted by fulfiller, waiting for verification
        VERIFIED,       // 3 - Proof verified, ready for fund release
        RELEASED,       // 4 - Funds released to fulfiller
        DISPUTED,       // 5 - Listing disputed (future implementation)
        CANCELLED       // 6 - Listing cancelled by creator
    }
    
    // ============ STRUCTS ============
    
    struct Listing {
        uint256 listingId;          // Unique identifier for the listing
        address creator;            // Address of the listing creator
        address fulfiller;          // Address of the assigned fulfiller
        address token;              // ERC20 token contract address
        uint256 amount;             // Base amount in tokens
        uint256 premium;            // Premium amount for the fulfiller
        uint256 totalAmount;        // Total locked amount (amount + premium)
        bytes32 proofHash;          // Hash of delivery proof
        ListingStatus status;       // Current status of the listing
        uint256 createdAt;          // Timestamp when listing was created
    }
    
    // ============ EVENTS ============
    
    event ListingCreated(
        uint256 indexed listingId,
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 premium,
        uint256 totalAmount
    );
    
    event ListingFulfilled(
        uint256 indexed listingId,
        address indexed fulfiller
    );
    
    event ProofSubmitted(
        uint256 indexed listingId,
        address indexed fulfiller,
        bytes32 proofHash
    );
    
    event FundsReleased(
        uint256 indexed listingId,
        address indexed fulfiller,
        uint256 amount
    );
    
    event ListingCancelled(
        uint256 indexed listingId,
        address indexed creator,
        uint256 refundAmount
    );
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Creates a new escrow listing
     * @param token The ERC20 token contract address
     * @param amount The base amount to be escrowed
     * @param premium The premium amount for the fulfiller
     * @return listingId The unique ID of the created listing
     */
    function createListing(
        address token,
        uint256 amount,
        uint256 premium
    ) external returns (uint256 listingId);
    
    /**
     * @dev Fulfills an open listing by assigning the caller as fulfiller
     * @param listingId The ID of the listing to fulfill
     */
    function fulfillListing(uint256 listingId) external;
    
    /**
     * @dev Submits proof of delivery for a fulfilled listing
     * @param listingId The ID of the listing
     * @param proofHash The hash of the delivery proof
     */
    function submitProof(uint256 listingId, bytes32 proofHash) external;
    
    /**
     * @dev Verifies proof and releases funds to fulfiller
     * @param listingId The ID of the listing to verify and release
     */
    function verifyAndRelease(uint256 listingId) external;
    
    /**
     * @dev Cancels an open listing and refunds creator
     * @param listingId The ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external;
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets complete information about a listing
     * @param listingId The ID of the listing
     * @return The Listing struct containing all listing information
     */
    function getListing(uint256 listingId) external view returns (Listing memory);
    
    /**
     * @dev Gets all listing IDs created by a user
     * @param user The address of the user
     * @return Array of listing IDs created by the user
     */
    function getUserListings(address user) external view returns (uint256[] memory);
    
    /**
     * @dev Gets all listing IDs fulfilled by a user
     * @param user The address of the user
     * @return Array of listing IDs fulfilled by the user
     */
    function getUserFulfillments(address user) external view returns (uint256[] memory);
    
    /**
     * @dev Gets the total number of listings created
     * @return The total listing count
     */
    function getListingCount() external view returns (uint256);
}
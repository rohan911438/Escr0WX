// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EscrowX
 * @dev Decentralized escrow system for crypto-to-physical goods purchases
 * @notice This contract enables secure escrow transactions between creators and fulfillers
 * Compatible with Ethereum Sepolia testnet
 */
contract EscrowX is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ ENUMS ============

    /**
     * @dev Enum representing the status of a listing
     */
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

    /**
     * @dev Struct representing an escrow listing
     */
    struct Listing {
        uint256 listingId;          // Unique identifier for the listing
        address creator;            // Address of the listing creator
        address fulfiller;          // Address of the assigned fulfiller
        address token;              // ERC20 token contract address (e.g., USDC)
        uint256 amount;             // Base amount in tokens
        uint256 premium;            // Premium amount for the fulfiller
        uint256 totalAmount;        // Total locked amount (amount + premium)
        bytes32 proofHash;          // Hash of delivery proof
        ListingStatus status;       // Current status of the listing
        uint256 createdAt;          // Timestamp when listing was created
    }

    // ============ STATE VARIABLES ============

    /// @dev Counter for generating unique listing IDs
    uint256 private _listingCounter;
    
    /// @dev Mapping from listing ID to Listing struct
    mapping(uint256 => Listing) private _listings;
    
    /// @dev Mapping from user address to array of listing IDs they created
    mapping(address => uint256[]) private _userListings;
    
    /// @dev Mapping from user address to array of listing IDs they fulfilled
    mapping(address => uint256[]) private _userFulfillments;

    // ============ EVENTS ============

    /**
     * @dev Emitted when a new listing is created
     */
    event ListingCreated(
        uint256 indexed listingId,
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 premium,
        uint256 totalAmount
    );

    /**
     * @dev Emitted when a listing is fulfilled by a fulfiller
     */
    event ListingFulfilled(
        uint256 indexed listingId,
        address indexed fulfiller
    );

    /**
     * @dev Emitted when proof of delivery is submitted
     */
    event ProofSubmitted(
        uint256 indexed listingId,
        address indexed fulfiller,
        bytes32 proofHash
    );

    /**
     * @dev Emitted when funds are released to the fulfiller
     */
    event FundsReleased(
        uint256 indexed listingId,
        address indexed fulfiller,
        uint256 amount
    );

    /**
     * @dev Emitted when a listing is cancelled
     */
    event ListingCancelled(
        uint256 indexed listingId,
        address indexed creator,
        uint256 refundAmount
    );

    // ============ MODIFIERS ============

    /**
     * @dev Modifier to check if listing exists
     */
    modifier listingExists(uint256 listingId) {
        require(listingId > 0 && listingId <= _listingCounter, "EscrowX: Listing does not exist");
        _;
    }

    /**
     * @dev Modifier to check if caller is the creator of the listing
     */
    modifier onlyCreator(uint256 listingId) {
        require(_listings[listingId].creator == msg.sender, "EscrowX: Only creator can perform this action");
        _;
    }

    /**
     * @dev Modifier to check if caller is the fulfiller of the listing
     */
    modifier onlyFulfiller(uint256 listingId) {
        require(_listings[listingId].fulfiller == msg.sender, "EscrowX: Only fulfiller can perform this action");
        _;
    }

    /**
     * @dev Modifier to check if listing has specific status
     */
    modifier hasStatus(uint256 listingId, ListingStatus expectedStatus) {
        require(_listings[listingId].status == expectedStatus, "EscrowX: Invalid listing status");
        _;
    }

    // ============ CONSTRUCTOR ============

    /**
     * @dev Constructor sets the contract deployer as the initial owner
     */
    constructor() Ownable(msg.sender) {}

    // ============ CORE FUNCTIONS ============

    /**
     * @dev Creates a new escrow listing
     * @param token The ERC20 token contract address (e.g., USDC)
     * @param amount The base amount to be escrowed
     * @param premium The premium amount for the fulfiller
     * @return listingId The unique ID of the created listing
     */
    function createListing(
        address token,
        uint256 amount,
        uint256 premium
    ) external nonReentrant returns (uint256) {
        require(token != address(0), "EscrowX: Invalid token address");
        require(amount > 0, "EscrowX: Amount must be greater than zero");
        require(premium >= 0, "EscrowX: Premium cannot be negative");

        uint256 totalAmount = amount + premium;
        require(totalAmount >= amount, "EscrowX: Integer overflow in total amount");

        // Increment listing counter
        _listingCounter++;
        uint256 listingId = _listingCounter;

        // Create new listing
        _listings[listingId] = Listing({
            listingId: listingId,
            creator: msg.sender,
            fulfiller: address(0),
            token: token,
            amount: amount,
            premium: premium,
            totalAmount: totalAmount,
            proofHash: bytes32(0),
            status: ListingStatus.OPEN,
            createdAt: block.timestamp
        });

        // Add to creator's listings
        _userListings[msg.sender].push(listingId);

        // Transfer tokens from creator to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);

        emit ListingCreated(listingId, msg.sender, token, amount, premium, totalAmount);

        return listingId;
    }

    /**
     * @dev Fulfills an open listing by assigning the caller as fulfiller
     * @param listingId The ID of the listing to fulfill
     */
    function fulfillListing(uint256 listingId)
        external
        listingExists(listingId)
        hasStatus(listingId, ListingStatus.OPEN)
    {
        Listing storage listing = _listings[listingId];
        require(listing.creator != msg.sender, "EscrowX: Creator cannot fulfill own listing");

        // Assign fulfiller and update status
        listing.fulfiller = msg.sender;
        listing.status = ListingStatus.FULFILLED;

        // Add to fulfiller's fulfillments
        _userFulfillments[msg.sender].push(listingId);

        emit ListingFulfilled(listingId, msg.sender);
    }

    /**
     * @dev Submits proof of delivery for a fulfilled listing
     * @param listingId The ID of the listing
     * @param proofHash The hash of the delivery proof
     */
    function submitProof(uint256 listingId, bytes32 proofHash)
        external
        listingExists(listingId)
        onlyFulfiller(listingId)
        hasStatus(listingId, ListingStatus.FULFILLED)
    {
        require(proofHash != bytes32(0), "EscrowX: Invalid proof hash");

        Listing storage listing = _listings[listingId];
        listing.proofHash = proofHash;
        listing.status = ListingStatus.PROOF_SUBMITTED;

        emit ProofSubmitted(listingId, msg.sender, proofHash);
    }

    /**
     * @dev Verifies proof and releases funds to fulfiller
     * Note: In production, this would integrate with ZK verification system
     * For hackathon, owner verification simulates the ZK proof verification
     * @param listingId The ID of the listing to verify and release
     */
    function verifyAndRelease(uint256 listingId)
        external
        onlyOwner
        listingExists(listingId)
        hasStatus(listingId, ListingStatus.PROOF_SUBMITTED)
        nonReentrant
    {
        Listing storage listing = _listings[listingId];
        
        // Update status to verified first (CEI pattern)
        listing.status = ListingStatus.VERIFIED;
        
        // Release funds to fulfiller
        IERC20(listing.token).safeTransfer(listing.fulfiller, listing.totalAmount);
        
        // Update final status
        listing.status = ListingStatus.RELEASED;

        emit FundsReleased(listingId, listing.fulfiller, listing.totalAmount);
    }

    /**
     * @dev Cancels an open listing and refunds creator
     * @param listingId The ID of the listing to cancel
     */
    function cancelListing(uint256 listingId)
        external
        listingExists(listingId)
        onlyCreator(listingId)
        hasStatus(listingId, ListingStatus.OPEN)
        nonReentrant
    {
        Listing storage listing = _listings[listingId];
        
        // Update status first (CEI pattern)
        listing.status = ListingStatus.CANCELLED;
        
        // Refund tokens to creator
        IERC20(listing.token).safeTransfer(listing.creator, listing.totalAmount);

        emit ListingCancelled(listingId, listing.creator, listing.totalAmount);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Gets complete information about a listing
     * @param listingId The ID of the listing
     * @return The Listing struct containing all listing information
     */
    function getListing(uint256 listingId)
        external
        view
        listingExists(listingId)
        returns (Listing memory)
    {
        return _listings[listingId];
    }

    /**
     * @dev Gets all listing IDs created by a user
     * @param user The address of the user
     * @return Array of listing IDs created by the user
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return _userListings[user];
    }

    /**
     * @dev Gets all listing IDs fulfilled by a user
     * @param user The address of the user
     * @return Array of listing IDs fulfilled by the user
     */
    function getUserFulfillments(address user) external view returns (uint256[] memory) {
        return _userFulfillments[user];
    }

    /**
     * @dev Gets the total number of listings created
     * @return The total listing count
     */
    function getListingCount() external view returns (uint256) {
        return _listingCounter;
    }

    /**
     * @dev Gets basic listing information (gas optimized for frontend)
     * @param listingId The ID of the listing
     * @return creator The creator address
     * @return fulfiller The fulfiller address (zero address if not fulfilled)
     * @return token The token contract address
     * @return totalAmount The total escrowed amount
     * @return status The current listing status
     * @return createdAt The creation timestamp
     */
    function getListingBasicInfo(uint256 listingId)
        external
        view
        listingExists(listingId)
        returns (
            address creator,
            address fulfiller,
            address token,
            uint256 totalAmount,
            ListingStatus status,
            uint256 createdAt
        )
    {
        Listing memory listing = _listings[listingId];
        return (
            listing.creator,
            listing.fulfiller,
            listing.token,
            listing.totalAmount,
            listing.status,
            listing.createdAt
        );
    }

    /**
     * @dev Gets all listings with pagination
     * @param offset Starting index for pagination
     * @param limit Maximum number of listings to return
     * @return listings Array of Listing structs
     */
    function getAllListings(uint256 offset, uint256 limit)
        external
        view
        returns (Listing[] memory listings)
    {
        require(offset < _listingCounter, "EscrowX: Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > _listingCounter) {
            end = _listingCounter;
        }
        
        listings = new Listing[](end - offset);
        
        for (uint256 i = offset; i < end; i++) {
            listings[i - offset] = _listings[i + 1]; // listingIds start from 1
        }
        
        return listings;
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Emergency function to pause contract (future implementation)
     * @notice This function is reserved for future security enhancements
     */
    function emergencyPause() external onlyOwner {
        // Future implementation for emergency pause functionality
        // This would integrate with OpenZeppelin's Pausable contract
        revert("EscrowX: Emergency pause not implemented yet");
    }

    /**
     * @dev Gets contract version for upgrades tracking
     * @return Version string
     */
    function getVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    // ============ FALLBACK FUNCTIONS ============

    /**
     * @dev Fallback function to reject direct Ether transfers
     */
    receive() external payable {
        revert("EscrowX: Contract does not accept Ether");
    }

    /**
     * @dev Fallback function to reject calls to non-existent functions
     */
    fallback() external payable {
        revert("EscrowX: Function does not exist");
    }
}
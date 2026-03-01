// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IEVVMManager.sol";
import "./interfaces/IVerifier.sol";

/**
 * @title Treasury
 * @dev Modular Treasury contract for EscrowX that manages escrow operations
 * Integrates with EVVMManager for balance management and ZKVerifierAdapter for proof verification
 */
contract Treasury is ITreasury, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ CONSTANTS ============
    
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // ============ STATE VARIABLES ============
    
    /// @dev Counter for generating unique listing IDs
    uint256 private _listingCounter;
    
    /// @dev Mapping from listing ID to Listing struct
    mapping(uint256 => Listing) private _listings;
    
    /// @dev Mapping from user address to array of listing IDs they created
    mapping(address => uint256[]) private _userListings;
    
    /// @dev Mapping from user address to array of listing IDs they fulfilled
    mapping(address => uint256[]) private _userFulfillments;
    
    /// @dev EVVM Manager contract for balance management
    IEVVMManager public evvmManager;
    
    /// @dev ZK Verifier contract for proof verification
    IVerifier public zkVerifier;
    
    /// @dev Treasury fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public treasuryFeeRate = 250; // 2.5%
    
    /// @dev Accumulated treasury fees by token
    mapping(address => uint256) public treasuryFees;
    
    /// @dev Minimum listing amount per token
    mapping(address => uint256) public minListingAmount;
    
    /// @dev Maximum listing amount per token
    mapping(address => uint256) public maxListingAmount;
    
    // ============ EVENTS ============
    
    event EVVMManagerUpdated(address indexed oldManager, address indexed newManager);
    event ZKVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
    event TreasuryFeeUpdated(uint256 oldRate, uint256 newRate);
    event ListingLimitsUpdated(address indexed token, uint256 minAmount, uint256 maxAmount);
    event FeeWithdrawn(address indexed token, address indexed to, uint256 amount);
    
    // ============ MODIFIERS ============
    
    modifier listingExists(uint256 listingId) {
        require(listingId > 0 && listingId <= _listingCounter, "Treasury: Listing does not exist");
        _;
    }
    
    modifier onlyCreator(uint256 listingId) {
        require(_listings[listingId].creator == msg.sender, "Treasury: Only creator can perform this action");
        _;
    }
    
    modifier onlyFulfiller(uint256 listingId) {
        require(_listings[listingId].fulfiller == msg.sender, "Treasury: Only fulfiller can perform this action");
        _;
    }
    
    modifier hasStatus(uint256 listingId, ListingStatus expectedStatus) {
        require(_listings[listingId].status == expectedStatus, "Treasury: Invalid listing status");
        _;
    }
    
    modifier validAmount(address token, uint256 amount) {
        require(amount >= minListingAmount[token], "Treasury: Amount below minimum");
        require(maxListingAmount[token] == 0 || amount <= maxListingAmount[token], "Treasury: Amount above maximum");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address admin,
        address evvmManagerAddress,
        address zkVerifierAddress
    ) {
        require(admin != address(0), "Treasury: Invalid admin address");
        require(evvmManagerAddress != address(0), "Treasury: Invalid EVVM manager address");
        require(zkVerifierAddress != address(0), "Treasury: Invalid ZK verifier address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
        _grantRole(VERIFIER_ROLE, admin);
        
        evvmManager = IEVVMManager(evvmManagerAddress);
        zkVerifier = IVerifier(zkVerifierAddress);
        
        _listingCounter = 0;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Creates a new escrow listing with EVVM integration
     */
    function createListing(
        address token,
        uint256 amount,
        uint256 premium
    ) external override nonReentrant whenNotPaused validAmount(token, amount) returns (uint256 listingId) {
        require(token != address(0), "Treasury: Invalid token address");
        require(amount > 0, "Treasury: Amount must be greater than zero");
        require(premium >= 0, "Treasury: Premium cannot be negative");
        
        uint256 totalAmount = amount + premium;
        require(totalAmount >= amount, "Treasury: Integer overflow in total amount");
        
        // Calculate treasury fee
        uint256 treasuryFee = (totalAmount * treasuryFeeRate) / 10000;
        uint256 netAmount = totalAmount + treasuryFee;
        
        // Check if user has sufficient balance in EVVM
        require(
            evvmManager.hasSufficientBalance(msg.sender, token, netAmount),
            "Treasury: Insufficient EVVM balance"
        );
        
        // Increment listing counter
        _listingCounter++;
        listingId = _listingCounter;
        
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
        
        // Lock funds in EVVM
        evvmManager.lockBalance(msg.sender, token, netAmount, listingId);
        
        // Update treasury fees
        treasuryFees[token] += treasuryFee;
        
        emit ListingCreated(listingId, msg.sender, token, amount, premium, totalAmount);
        
        return listingId;
    }
    
    /**
     * @dev Fulfills an open listing by assigning the caller as fulfiller
     */
    function fulfillListing(uint256 listingId)
        external
        override
        listingExists(listingId)
        hasStatus(listingId, ListingStatus.OPEN)
        whenNotPaused
    {
        Listing storage listing = _listings[listingId];
        require(listing.creator != msg.sender, "Treasury: Creator cannot fulfill own listing");
        
        // Assign fulfiller and update status
        listing.fulfiller = msg.sender;
        listing.status = ListingStatus.FULFILLED;
        
        // Add to fulfiller's fulfillments
        _userFulfillments[msg.sender].push(listingId);
        
        emit ListingFulfilled(listingId, msg.sender);
    }
    
    /**
     * @dev Submits proof of delivery for a fulfilled listing
     */
    function submitProof(uint256 listingId, bytes32 proofHash)
        external
        override
        listingExists(listingId)
        onlyFulfiller(listingId)
        hasStatus(listingId, ListingStatus.FULFILLED)
        whenNotPaused
    {
        require(proofHash != bytes32(0), "Treasury: Invalid proof hash");
        
        Listing storage listing = _listings[listingId];
        listing.proofHash = proofHash;
        listing.status = ListingStatus.PROOF_SUBMITTED;
        
        emit ProofSubmitted(listingId, msg.sender, proofHash);
    }
    
    /**
     * @dev Verifies proof using ZK verifier and releases funds to fulfiller
     */
    function verifyAndRelease(uint256 listingId)
        external
        override
        listingExists(listingId)
        hasStatus(listingId, ListingStatus.PROOF_SUBMITTED)
        nonReentrant
        whenNotPaused
    {
        Listing storage listing = _listings[listingId];
        
        // Only verifier role or fulfiller can initiate verification
        require(
            hasRole(VERIFIER_ROLE, msg.sender) || msg.sender == listing.fulfiller,
            "Treasury: Not authorized to verify"
        );
        
        // TODO: Integrate with actual ZK proof verification
        // For now, we'll use a simplified approach
        bool isVerified = _verifyProofHash(listing.proofHash);
        
        if (isVerified) {
            // Update status to verified first (CEI pattern)
            listing.status = ListingStatus.VERIFIED;
            
            // Transfer the full amount to fulfiller (treasury fee is tracked separately)
            evvmManager.transferLocked(
                listing.creator,
                listing.fulfiller,
                listing.token,
                listing.totalAmount,
                listingId
            );
            
            // Treasury fee remains tracked in treasuryFees mapping for later withdrawal
            
            // Update final status
            listing.status = ListingStatus.RELEASED;
            
            emit FundsReleased(listingId, listing.fulfiller, listing.totalAmount);
        } else {
            revert("Treasury: Proof verification failed");
        }
    }
    
    /**
     * @dev Cancels an open listing and refunds creator
     */
    function cancelListing(uint256 listingId)
        external
        override
        listingExists(listingId)
        onlyCreator(listingId)
        hasStatus(listingId, ListingStatus.OPEN)
        nonReentrant
        whenNotPaused
    {
        Listing storage listing = _listings[listingId];
        
        // Update status first (CEI pattern)
        listing.status = ListingStatus.CANCELLED;
        
        // Calculate amounts
        uint256 treasuryFee = (listing.totalAmount * treasuryFeeRate) / 10000;
        uint256 totalLocked = listing.totalAmount + treasuryFee;
        
        // Unlock funds in EVVM (back to creator's available balance)
        evvmManager.unlockBalance(listing.creator, listing.token, totalLocked, listingId);
        
        // Reduce treasury fees since listing was cancelled
        treasuryFees[listing.token] -= treasuryFee;
        
        emit ListingCancelled(listingId, listing.creator, listing.totalAmount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets complete information about a listing
     */
    function getListing(uint256 listingId)
        external
        view
        override
        listingExists(listingId)
        returns (Listing memory)
    {
        return _listings[listingId];
    }
    
    /**
     * @dev Gets all listing IDs created by a user
     */
    function getUserListings(address user) external view override returns (uint256[] memory) {
        return _userListings[user];
    }
    
    /**
     * @dev Gets all listing IDs fulfilled by a user
     */
    function getUserFulfillments(address user) external view override returns (uint256[] memory) {
        return _userFulfillments[user];
    }
    
    /**
     * @dev Gets the total number of listings created
     */
    function getListingCount() external view override returns (uint256) {
        return _listingCounter;
    }
    
    /**
     * @dev Gets treasury fee rate and accumulated fees for a token
     */
    function getTreasuryInfo(address token) external view returns (uint256 feeRate, uint256 accumulatedFees) {
        return (treasuryFeeRate, treasuryFees[token]);
    }
    
    /**
     * @dev Gets listing limits for a token
     */
    function getListingLimits(address token) external view returns (uint256 minAmount, uint256 maxAmount) {
        return (minListingAmount[token], maxListingAmount[token]);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Updates the EVVM Manager contract
     */
    function setEVVMManager(address newManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newManager != address(0), "Treasury: Invalid EVVM manager address");
        
        address oldManager = address(evvmManager);
        evvmManager = IEVVMManager(newManager);
        
        emit EVVMManagerUpdated(oldManager, newManager);
    }
    
    /**
     * @dev Updates the ZK Verifier contract
     */
    function setZKVerifier(address newVerifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newVerifier != address(0), "Treasury: Invalid ZK verifier address");
        
        address oldVerifier = address(zkVerifier);
        zkVerifier = IVerifier(newVerifier);
        
        emit ZKVerifierUpdated(oldVerifier, newVerifier);
    }
    
    /**
     * @dev Updates the treasury fee rate
     */
    function setTreasuryFeeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newRate <= 1000, "Treasury: Fee rate cannot exceed 10%");
        
        uint256 oldRate = treasuryFeeRate;
        treasuryFeeRate = newRate;
        
        emit TreasuryFeeUpdated(oldRate, newRate);
    }
    
    /**
     * @dev Sets listing limits for a token
     */
    function setListingLimits(
        address token,
        uint256 minAmount,
        uint256 maxAmount
    ) external onlyRole(OPERATOR_ROLE) {
        require(token != address(0), "Treasury: Invalid token address");
        require(maxAmount == 0 || maxAmount >= minAmount, "Treasury: Invalid limits");
        
        minListingAmount[token] = minAmount;
        maxListingAmount[token] = maxAmount;
        
        emit ListingLimitsUpdated(token, minAmount, maxAmount);
    }
    
    /**
     * @dev Withdraws accumulated treasury fees
     */
    function withdrawTreasuryFees(
        address token,
        address to,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "Treasury: Invalid recipient address");
        require(amount <= treasuryFees[token], "Treasury: Insufficient fees to withdraw");
        
        treasuryFees[token] -= amount;
        
        // Transfer from EVVM or directly from treasury reserves
        IERC20(token).safeTransfer(to, amount);
        
        emit FeeWithdrawn(token, to, amount);
    }
    
    /**
     * @dev Pauses the contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    // ============ PRIVATE FUNCTIONS ============
    
    /**
     * @dev Verifies proof hash (placeholder for ZK integration)
     */
    function _verifyProofHash(bytes32 proofHash) private pure returns (bool) {
        // TODO: Integrate with actual ZK verifier
        // This is a placeholder implementation
        
        // For hackathon/demo purposes, accept any non-zero hash
        return proofHash != bytes32(0);
        
        // Future implementation:
        // return zkVerifier.isProofVerified(proofHash);
    }
}
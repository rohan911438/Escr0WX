// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IEVVMManager.sol";

/**
 * @title EVVMManager
 * @dev EVVM (Ethereum Virtual Value Machine) Manager for handling internal balances,
 * deposits, withdrawals, and async nonce management for the EscrowX ecosystem
 */
contract EVVMManager is IEVVMManager, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // ============ CONSTANTS ============
    
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    uint8 public constant OPERATION_DEPOSIT = 0;
    uint8 public constant OPERATION_WITHDRAW = 1;
    uint8 public constant OPERATION_LOCK = 2;
    uint8 public constant OPERATION_UNLOCK = 3;
    uint8 public constant OPERATION_TRANSFER = 4;
    
    // ============ STATE VARIABLES ============
    
    /// @dev Current nonce counter for async operations
    uint256 private _currentNonce;
    
    /// @dev Mapping from user address and token to their balance
    mapping(address => mapping(address => UserBalance)) private _balances;
    
    /// @dev Mapping from nonce to async operation data
    mapping(uint256 => AsyncOperation) private _asyncOperations;
    
    /// @dev Mapping to track supported tokens
    mapping(address => bool) public supportedTokens;
    
    /// @dev Emergency withdrawal delay (in seconds)
    uint256 public emergencyWithdrawDelay = 24 hours;
    
    /// @dev Mapping for emergency withdrawal requests
    mapping(address => mapping(address => uint256)) public emergencyWithdrawRequests;
    
    // ============ EVENTS ============
    
    event TokenSupportUpdated(address indexed token, bool supported);
    event EmergencyWithdrawRequested(address indexed user, address indexed token, uint256 timestamp);
    
    // ============ CONSTRUCTOR ============
    
    constructor(address admin, address treasury) {
        require(admin != address(0), "EVVMManager: Invalid admin address");
        require(treasury != address(0), "EVVMManager: Invalid treasury address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(TREASURY_ROLE, treasury);
        _grantRole(OPERATOR_ROLE, admin);
        
        _currentNonce = 0;
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyTreasury() {
        require(hasRole(TREASURY_ROLE, msg.sender), "EVVMManager: Only treasury can call this");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "EVVMManager: Only operator can call this");
        _;
    }
    
    modifier supportedToken(address token) {
        require(supportedTokens[token], "EVVMManager: Token not supported");
        _;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Deposits tokens into user's EVVM balance
     */
    function deposit(
        address token,
        uint256 amount
    ) external override nonReentrant whenNotPaused supportedToken(token) returns (uint256 nonce) {
        require(amount > 0, "EVVMManager: Amount must be greater than zero");
        
        // Generate nonce
        nonce = ++_currentNonce;
        
        // Create async operation record
        _asyncOperations[nonce] = AsyncOperation({
            nonce: nonce,
            user: msg.sender,
            token: token,
            amount: amount,
            operationType: OPERATION_DEPOSIT,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Transfer tokens from user to this contract
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user balance
        _balances[msg.sender][token].available += amount;
        
        // Mark operation as completed
        _asyncOperations[nonce].completed = true;
        
        emit BalanceDeposited(msg.sender, token, amount, nonce);
        emit AsyncOperationCompleted(nonce, msg.sender, OPERATION_DEPOSIT, true);
        
        return nonce;
    }
    
    /**
     * @dev Withdraws tokens from user's EVVM balance
     */
    function withdraw(
        address token,
        uint256 amount
    ) external override nonReentrant whenNotPaused supportedToken(token) returns (uint256 nonce) {
        require(amount > 0, "EVVMManager: Amount must be greater than zero");
        require(
            _balances[msg.sender][token].available >= amount,
            "EVVMManager: Insufficient available balance"
        );
        
        // Generate nonce
        nonce = ++_currentNonce;
        
        // Create async operation record
        _asyncOperations[nonce] = AsyncOperation({
            nonce: nonce,
            user: msg.sender,
            token: token,
            amount: amount,
            operationType: OPERATION_WITHDRAW,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Update user balance
        _balances[msg.sender][token].available -= amount;
        
        // Transfer tokens to user
        IERC20(token).safeTransfer(msg.sender, amount);
        
        // Mark operation as completed
        _asyncOperations[nonce].completed = true;
        
        emit BalanceWithdrawn(msg.sender, token, amount, nonce);
        emit AsyncOperationCompleted(nonce, msg.sender, OPERATION_WITHDRAW, true);
        
        return nonce;
    }
    
    /**
     * @dev Locks tokens for a listing (called by Treasury)
     */
    function lockBalance(
        address user,
        address token,
        uint256 amount,
        uint256 listingId
    ) external override onlyTreasury supportedToken(token) returns (uint256 nonce) {
        require(
            _balances[user][token].available >= amount,
            "EVVMManager: Insufficient available balance to lock"
        );
        
        // Generate nonce
        nonce = ++_currentNonce;
        
        // Create async operation record
        _asyncOperations[nonce] = AsyncOperation({
            nonce: nonce,
            user: user,
            token: token,
            amount: amount,
            operationType: OPERATION_LOCK,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Update balances - move from available to locked
        _balances[user][token].available -= amount;
        _balances[user][token].locked += amount;
        
        // Mark operation as completed
        _asyncOperations[nonce].completed = true;
        
        emit BalanceLocked(user, token, amount, listingId, nonce);
        emit AsyncOperationCompleted(nonce, user, OPERATION_LOCK, true);
        
        return nonce;
    }
    
    /**
     * @dev Unlocks tokens from a listing (called by Treasury)
     */
    function unlockBalance(
        address user,
        address token,
        uint256 amount,
        uint256 listingId
    ) external override onlyTreasury supportedToken(token) returns (uint256 nonce) {
        require(
            _balances[user][token].locked >= amount,
            "EVVMManager: Insufficient locked balance to unlock"
        );
        
        // Generate nonce
        nonce = ++_currentNonce;
        
        // Create async operation record
        _asyncOperations[nonce] = AsyncOperation({
            nonce: nonce,
            user: user,
            token: token,
            amount: amount,
            operationType: OPERATION_UNLOCK,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Update balances - move from locked to available
        _balances[user][token].locked -= amount;
        _balances[user][token].available += amount;
        
        // Mark operation as completed
        _asyncOperations[nonce].completed = true;
        
        emit BalanceUnlocked(user, token, amount, listingId, nonce);
        emit AsyncOperationCompleted(nonce, user, OPERATION_UNLOCK, true);
        
        return nonce;
    }
    
    /**
     * @dev Transfers locked tokens between users (called by Treasury)
     */
    function transferLocked(
        address from,
        address to,
        address token,
        uint256 amount,
        uint256 /* listingId */
    ) external override onlyTreasury supportedToken(token) returns (uint256 nonce) {
        require(
            _balances[from][token].locked >= amount,
            "EVVMManager: Insufficient locked balance to transfer"
        );
        
        // Generate nonce
        nonce = ++_currentNonce;
        
        // Create async operation record
        _asyncOperations[nonce] = AsyncOperation({
            nonce: nonce,
            user: from,
            token: token,
            amount: amount,
            operationType: OPERATION_TRANSFER,
            timestamp: block.timestamp,
            completed: false
        });
        
        // Update balances
        _balances[from][token].locked -= amount;
        _balances[to][token].available += amount;
        
        // Mark operation as completed
        _asyncOperations[nonce].completed = true;
        
        emit AsyncOperationCompleted(nonce, from, OPERATION_TRANSFER, true);
        
        return nonce;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets user's balance information for a token
     */
    function getUserBalance(
        address user,
        address token
    ) external view override returns (UserBalance memory balance) {
        return _balances[user][token];
    }
    
    /**
     * @dev Gets async operation details by nonce
     */
    function getAsyncOperation(uint256 nonce) external view override returns (AsyncOperation memory operation) {
        return _asyncOperations[nonce];
    }
    
    /**
     * @dev Checks if user has sufficient available balance
     */
    function hasSufficientBalance(
        address user,
        address token,
        uint256 amount
    ) external view override returns (bool) {
        return _balances[user][token].available >= amount;
    }
    
    /**
     * @dev Gets total balance (available + locked) for a user and token
     */
    function getTotalBalance(address user, address token) external view override returns (uint256) {
        UserBalance memory balance = _balances[user][token];
        return balance.available + balance.locked + balance.pending;
    }
    
    /**
     * @dev Gets current nonce counter
     */
    function getCurrentNonce() external view override returns (uint256) {
        return _currentNonce;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Adds or removes support for a token
     */
    function setSupportedToken(address token, bool supported) external onlyOperator {
        require(token != address(0), "EVVMManager: Invalid token address");
        supportedTokens[token] = supported;
        emit TokenSupportUpdated(token, supported);
    }
    
    /**
     * @dev Sets emergency withdrawal delay
     */
    function setEmergencyWithdrawDelay(uint256 delay) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyWithdrawDelay = delay;
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
    
    /**
     * @dev Emergency withdrawal request (first step)
     */
    function requestEmergencyWithdraw(address token) external whenNotPaused {
        emergencyWithdrawRequests[msg.sender][token] = block.timestamp;
        emit EmergencyWithdrawRequested(msg.sender, token, block.timestamp);
    }
    
    /**
     * @dev Execute emergency withdrawal (after delay)
     */
    function executeEmergencyWithdraw(address token) external nonReentrant whenNotPaused {
        uint256 requestTime = emergencyWithdrawRequests[msg.sender][token];
        require(requestTime > 0, "EVVMManager: No emergency withdrawal request");
        require(
            block.timestamp >= requestTime + emergencyWithdrawDelay,
            "EVVMManager: Emergency withdrawal delay not met"
        );
        
        UserBalance storage balance = _balances[msg.sender][token];
        uint256 totalAmount = balance.available + balance.locked;
        
        require(totalAmount > 0, "EVVMManager: No balance to withdraw");
        
        // Reset balances
        balance.available = 0;
        balance.locked = 0;
        
        // Reset emergency request
        emergencyWithdrawRequests[msg.sender][token] = 0;
        
        // Transfer tokens
        IERC20(token).safeTransfer(msg.sender, totalAmount);
        
        emit BalanceWithdrawn(msg.sender, token, totalAmount, ++_currentNonce);
    }
}
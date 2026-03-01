// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEVVMManager
 * @dev Interface for EVVM (Ethereum Virtual Value Machine) Manager
 * Handles internal balances, deposits, withdrawals, and async nonce management
 */
interface IEVVMManager {
    
    // ============ STRUCTS ============
    
    struct UserBalance {
        uint256 available;      // Available balance for new listings
        uint256 locked;         // Locked balance in active listings
        uint256 pending;        // Pending balance (async operations)
    }
    
    struct AsyncOperation {
        uint256 nonce;          // Operation nonce for tracking
        address user;           // User address
        address token;          // Token address
        uint256 amount;         // Amount involved
        uint8 operationType;    // 0=deposit, 1=withdrawal, 2=lock, 3=unlock
        uint256 timestamp;      // Operation timestamp
        bool completed;         // Whether operation is completed
    }
    
    // ============ EVENTS ============
    
    event BalanceDeposited(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 nonce
    );
    
    event BalanceWithdrawn(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 nonce
    );
    
    event BalanceLocked(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 listingId,
        uint256 nonce
    );
    
    event BalanceUnlocked(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 listingId,
        uint256 nonce
    );
    
    event AsyncOperationCompleted(
        uint256 indexed nonce,
        address indexed user,
        uint8 operationType,
        bool success
    );
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Deposits tokens into user's EVVM balance
     * @param token The ERC20 token address
     * @param amount The amount to deposit
     * @return nonce The operation nonce for tracking
     */
    function deposit(address token, uint256 amount) external returns (uint256 nonce);
    
    /**
     * @dev Withdraws tokens from user's EVVM balance
     * @param token The ERC20 token address
     * @param amount The amount to withdraw
     * @return nonce The operation nonce for tracking
     */
    function withdraw(address token, uint256 amount) external returns (uint256 nonce);
    
    /**
     * @dev Locks tokens for a listing (called by Treasury)
     * @param user The user whose tokens to lock
     * @param token The ERC20 token address
     * @param amount The amount to lock
     * @param listingId The listing ID for reference
     * @return nonce The operation nonce for tracking
     */
    function lockBalance(
        address user,
        address token,
        uint256 amount,
        uint256 listingId
    ) external returns (uint256 nonce);
    
    /**
     * @dev Unlocks tokens from a listing (called by Treasury)
     * @param user The user whose tokens to unlock
     * @param token The ERC20 token address
     * @param amount The amount to unlock
     * @param listingId The listing ID for reference
     * @return nonce The operation nonce for tracking
     */
    function unlockBalance(
        address user,
        address token,
        uint256 amount,
        uint256 listingId
    ) external returns (uint256 nonce);
    
    /**
     * @dev Transfers locked tokens between users (called by Treasury)
     * @param from The sender's address
     * @param to The recipient's address
     * @param token The ERC20 token address
     * @param amount The amount to transfer
     * @return nonce The operation nonce for tracking
     */
    function transferLocked(
        address from,
        address to,
        address token,
        uint256 amount,
        uint256 /* listingId */
    ) external returns (uint256 nonce);
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets user's balance information for a token
     * @param user The user address
     * @param token The token address
     * @return balance The UserBalance struct
     */
    function getUserBalance(
        address user,
        address token
    ) external view returns (UserBalance memory balance);
    
    /**
     * @dev Gets async operation details by nonce
     * @param nonce The operation nonce
     * @return operation The AsyncOperation struct
     */
    function getAsyncOperation(uint256 nonce) external view returns (AsyncOperation memory operation);
    
    /**
     * @dev Checks if user has sufficient available balance
     * @param user The user address
     * @param token The token address
     * @param amount The amount to check
     * @return Whether user has sufficient balance
     */
    function hasSufficientBalance(
        address user,
        address token,
        uint256 amount
    ) external view returns (bool);
    
    /**
     * @dev Gets total balance (available + locked) for a user and token
     * @param user The user address
     * @param token The token address
     * @return Total balance
     */
    function getTotalBalance(address user, address token) external view returns (uint256);
    
    /**
     * @dev Gets current nonce counter
     * @return Current nonce value
     */
    function getCurrentNonce() external view returns (uint256);
}
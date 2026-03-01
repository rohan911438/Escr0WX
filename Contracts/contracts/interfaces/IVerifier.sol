// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVerifier
 * @dev Interface for ZK proof verification
 * Compatible with RISC Zero and vlayer Web Prover Server output formats
 */
interface IVerifier {
    
    // ============ STRUCTS ============
    
    struct ProofData {
        bytes32 proofHash;      // Hash of the proof
        bytes proof;            // The actual proof bytes
        bytes publicInputs;     // Public inputs for verification
        uint256 timestamp;      // Proof generation timestamp
    }
    
    struct VerificationResult {
        bool isValid;           // Whether proof is valid
        bytes32 proofId;        // Unique proof identifier
        uint256 verifiedAt;     // Verification timestamp
        string verifierType;    // Type of verifier used
    }
    
    // ============ EVENTS ============
    
    event ProofVerified(
        bytes32 indexed proofId,
        address indexed submitter,
        uint256 indexed listingId,
        bool isValid,
        string verifierType
    );
    
    event VerifierUpdated(
        address indexed oldVerifier,
        address indexed newVerifier,
        string verifierType
    );
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Verifies a ZK proof for a delivery claim
     * @param listingId The listing ID associated with the proof
     * @param proofData The proof data structure
     * @return result The verification result
     */
    function verifyProof(
        uint256 listingId,
        ProofData calldata proofData
    ) external payable returns (VerificationResult memory result);
    
    /**
     * @dev Batch verification for multiple proofs
     * @param listingIds Array of listing IDs
     * @param proofDataArray Array of proof data structures
     * @return results Array of verification results
     */
    function batchVerifyProofs(
        uint256[] calldata listingIds,
        ProofData[] calldata proofDataArray
    ) external payable returns (VerificationResult[] memory results);
    
    /**
     * @dev Sets the verification parameters (owner only)
     * @param verifierAddress The address of the verifier contract
     * @param verifierType The type identifier of the verifier
     */
    function setVerifier(address verifierAddress, string calldata verifierType) external;
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets verification result by proof ID
     * @param proofId The unique proof identifier
     * @return result The verification result
     */
    function getVerificationResult(bytes32 proofId) external view returns (VerificationResult memory result);
    
    /**
     * @dev Checks if a proof hash has been verified
     * @param proofHash The proof hash to check
     * @return Whether the proof has been verified successfully
     */
    function isProofVerified(bytes32 proofHash) external view returns (bool);
    
    /**
     * @dev Gets the current verifier address
     * @return The address of the active verifier contract
     */
    function getCurrentVerifier() external view returns (address);
    
    /**
     * @dev Gets the verifier type string
     * @return The type identifier of the current verifier
     */
    function getVerifierType() external view returns (string memory);
    
    /**
     * @dev Validates proof format before verification
     * @param proofData The proof data to validate
     * @return Whether the proof format is valid
     */
    function validateProofFormat(ProofData calldata proofData) external view returns (bool);
}

/**
 * @title IRiscZeroVerifier
 * @dev Interface specifically for RISC Zero verifier integration
 */
interface IRiscZeroVerifier {
    
    /**
     * @dev Verifies a RISC Zero proof
     * @param seal The proof seal from RISC Zero
     * @param imageId The RISC Zero image ID
     * @param publicInputs The public inputs for the proof
     * @return Whether the proof is valid
     */
    function verify(
        bytes calldata seal,
        bytes32 imageId,
        bytes calldata publicInputs
    ) external view returns (bool);
}
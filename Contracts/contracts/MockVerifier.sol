// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVerifier.sol";

/**
 * @title MockVerifier
 * @dev Mock ZK proof verifier for hackathon and testing purposes
 * In production, this should be replaced with actual RISC Zero or vlayer verifier
 */
contract MockVerifier is IVerifier, Ownable {
    
    // ============ STATE VARIABLES ============
    
    /// @dev Mapping from proof ID to verification result
    mapping(bytes32 => VerificationResult) private _verificationResults;
    
    /// @dev Current verifier address (this contract)
    address private _currentVerifier;
    
    /// @dev Verifier type identifier
    string private _verifierType;
    
    /// @dev Mock success rate (for testing - 100% = always pass, 0% = always fail)
    uint256 public mockSuccessRate = 100; // 100% success by default
    
    /// @dev Enable/disable automatic verification
    bool public autoVerifyEnabled = true;
    
    /// @dev Minimum proof size for format validation
    uint256 public constant MIN_PROOF_SIZE = 32;
    
    // ============ EVENTS ============
    
    event MockParametersUpdated(uint256 successRate, bool autoVerify);
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        _currentVerifier = address(this);
        _verifierType = "Mock_Hackathon_v1.0";
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Verifies a ZK proof for a delivery claim (Mock implementation)
     */
    function verifyProof(
        uint256 listingId,
        ProofData calldata proofData
    ) external payable override returns (VerificationResult memory result) {
        require(proofData.proofHash != bytes32(0), "MockVerifier: Invalid proof hash");
        require(validateProofFormat(proofData), "MockVerifier: Invalid proof format");
        
        bytes32 proofId = keccak256(
            abi.encodePacked(
                listingId,
                proofData.proofHash,
                proofData.timestamp,
                block.timestamp
            )
        );
        
        // Mock verification logic
        bool isValid = _performMockVerification(proofData);
        
        result = VerificationResult({
            isValid: isValid,
            proofId: proofId,
            verifiedAt: block.timestamp,
            verifierType: _verifierType
        });
        
        // Store result
        _verificationResults[proofId] = result;
        
        emit ProofVerified(proofId, msg.sender, listingId, isValid, _verifierType);
        
        return result;
    }
    
    /**
     * @dev Batch verification for multiple proofs
     */
    function batchVerifyProofs(
        uint256[] calldata listingIds,
        ProofData[] calldata proofDataArray
    ) external payable override returns (VerificationResult[] memory results) {
        require(
            listingIds.length == proofDataArray.length,
            "MockVerifier: Arrays length mismatch"
        );
        
        results = new VerificationResult[](listingIds.length);
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            // Use internal call to avoid payable issues
            results[i] = this.verifyProof{value: 0}(listingIds[i], proofDataArray[i]);
        }
        
        // Refund any ETH sent (MockVerifier doesn't charge fees)
        if (msg.value > 0) {
            (bool success, ) = payable(msg.sender).call{value: msg.value}("");
            require(success, "MockVerifier: Batch refund failed");
        }
        
        return results;
    }
    
    /**
     * @dev Sets the verification parameters (owner only)
     */
    function setVerifier(address verifierAddress, string calldata verifierType) external override onlyOwner {
        address oldVerifier = _currentVerifier;
        _currentVerifier = verifierAddress;
        _verifierType = verifierType;
        
        emit VerifierUpdated(oldVerifier, verifierAddress, verifierType);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets verification result by proof ID
     */
    function getVerificationResult(bytes32 proofId) external view override returns (VerificationResult memory result) {
        return _verificationResults[proofId];
    }
    
    /**
     * @dev Checks if a proof hash has been verified
     */
    function isProofVerified(bytes32 proofHash) external view override returns (bool) {
        // In a real implementation, this would check against stored proof hashes
        // For mock, we'll check if any verification result exists with the hash
        return proofHash != bytes32(0); // Simplified for mock
    }
    
    /**
     * @dev Gets the current verifier address
     */
    function getCurrentVerifier() external view override returns (address) {
        return _currentVerifier;
    }
    
    /**
     * @dev Gets the verifier type string
     */
    function getVerifierType() external view override returns (string memory) {
        return _verifierType;
    }
    
    /**
     * @dev Validates proof format before verification
     */
    function validateProofFormat(ProofData calldata proofData) public pure override returns (bool) {
        // Basic format validation for mock
        return (
            proofData.proofHash != bytes32(0) &&
            proofData.proof.length >= MIN_PROOF_SIZE &&
            proofData.timestamp > 0
        );
    }
    
    // ============ MOCK-SPECIFIC FUNCTIONS ============
    
    /**
     * @dev Sets mock verification parameters (for testing)
     */
    function setMockParameters(uint256 successRate, bool autoVerify) external onlyOwner {
        require(successRate <= 100, "MockVerifier: Success rate must be <= 100");
        mockSuccessRate = successRate;
        autoVerifyEnabled = autoVerify;
        
        emit MockParametersUpdated(successRate, autoVerify);
    }
    
    /**
     * @dev Manually set a proof as verified (for testing)
     */
    function setProofVerified(
        bytes32 proofId,
        bool isValid,
        uint256 listingId
    ) external onlyOwner {
        _verificationResults[proofId] = VerificationResult({
            isValid: isValid,
            proofId: proofId,
            verifiedAt: block.timestamp,
            verifierType: _verifierType
        });
        
        emit ProofVerified(proofId, msg.sender, listingId, isValid, _verifierType);
    }
    
    /**
     * @dev Gets mock statistics
     */
    function getMockStats() external view returns (
        uint256 successRate,
        bool autoVerify,
        string memory verifierType,
        uint256 minProofSize
    ) {
        return (mockSuccessRate, autoVerifyEnabled, _verifierType, MIN_PROOF_SIZE);
    }
    
    /**
     * @dev Validates proof format before verification
     */
    function validateProofFormat(ProofData calldata proofData) public view override returns (bool) {
        return (
            proofData.proofHash != bytes32(0) &&
            proofData.proof.length >= MIN_PROOF_SIZE &&
            proofData.publicInputs.length > 0 &&
            proofData.timestamp > 0 &&
            proofData.timestamp <= block.timestamp
        );
    }
    
    // ============ PRIVATE FUNCTIONS ============
    
    /**
     * @dev Performs mock verification logic
     */
    function _performMockVerification(ProofData calldata proofData) private view returns (bool) {
        if (!autoVerifyEnabled) {
            return false; // Require manual verification when auto is disabled
        }
        
        // Deterministic mock verification based on proof hash and success rate
        uint256 hashValue = uint256(proofData.proofHash) % 100;
        return hashValue < mockSuccessRate;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IVerifier.sol";

/**
 * @title ZKVerifierAdapter
 * @dev Adapter contract for ZK proof verification that can integrate with
 * RISC Zero verifier, vlayer Web Prover Server, or other ZK verification systems
 */
contract ZKVerifierAdapter is IVerifier, Ownable, Pausable {
    
    // ============ STATE VARIABLES ============
    
    /// @dev Current active verifier implementation
    address private _currentVerifier;
    
    /// @dev Verifier type (e.g., "RISC_Zero", "vlayer", "Mock")
    string private _verifierType;
    
    /// @dev Mapping from proof ID to verification result
    mapping(bytes32 => VerificationResult) private _verificationResults;
    
    /// @dev Mapping to track verified proof hashes
    mapping(bytes32 => bool) private _verifiedProofs;
    
    /// @dev Trusted verifier addresses
    mapping(address => bool) public trustedVerifiers;
    
    /// @dev Verification timeout (in seconds)
    uint256 public verificationTimeout = 1 hours;
    
    /// @dev Minimum stake required for verification (anti-spam)
    uint256 public verificationStake = 0.001 ether;
    
    // ============ EVENTS ============
    
    event TrustedVerifierAdded(address indexed verifier);
    event TrustedVerifierRemoved(address indexed verifier);
    event VerificationParametersUpdated(uint256 timeout, uint256 stake);
    
    // ============ CONSTRUCTOR ============
    
    constructor(address initialVerifier, string memory initialType) Ownable(msg.sender) {
        require(initialVerifier != address(0), "ZKVerifierAdapter: Invalid verifier address");
        
        _currentVerifier = initialVerifier;
        _verifierType = initialType;
        trustedVerifiers[initialVerifier] = true;
        
        emit TrustedVerifierAdded(initialVerifier);
        emit VerifierUpdated(address(0), initialVerifier, initialType);
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyTrustedVerifier() {
        require(trustedVerifiers[msg.sender], "ZKVerifierAdapter: Not a trusted verifier");
        _;
    }
    
    modifier validProofData(ProofData calldata proofData) {
        require(validateProofFormat(proofData), "ZKVerifierAdapter: Invalid proof format");
        _;
    }
    
    // ============ EXTERNAL FUNCTIONS ============
    
    /**
     * @dev Verifies a ZK proof for a delivery claim
     */
    function verifyProof(
        uint256 listingId,
        ProofData calldata proofData
    ) external payable override whenNotPaused validProofData(proofData) returns (VerificationResult memory result) {
        require(msg.value >= verificationStake, "ZKVerifierAdapter: Insufficient verification stake");
        
        bytes32 proofId = _generateProofId(listingId, proofData);
        
        // Check if already verified
        if (_verificationResults[proofId].verifiedAt > 0) {
            return _verificationResults[proofId];
        }
        
        bool isValid = _delegateVerification(proofData);
        
        result = VerificationResult({
            isValid: isValid,
            proofId: proofId,
            verifiedAt: block.timestamp,
            verifierType: _verifierType
        });
        
        // Store results
        _verificationResults[proofId] = result;
        if (isValid) {
            _verifiedProofs[proofData.proofHash] = true;
        }
        
        emit ProofVerified(proofId, msg.sender, listingId, isValid, _verifierType);
        
        // Refund stake if verification successful
        if (isValid && msg.value > 0) {
            (bool success, ) = payable(msg.sender).call{value: msg.value}("");
            require(success, "ZKVerifierAdapter: Refund failed");
        }
        
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
            "ZKVerifierAdapter: Arrays length mismatch"
        );
        require(
            msg.value >= verificationStake * listingIds.length,
            "ZKVerifierAdapter: Insufficient batch verification stake"
        );
        
        results = new VerificationResult[](listingIds.length);
        uint256 successfulVerifications = 0;
        
        for (uint256 i = 0; i < listingIds.length; i++) {
            // Delegate to single verification (without additional payment)
            try this.verifyProof{value: 0}(listingIds[i], proofDataArray[i]) returns (
                VerificationResult memory result
            ) {
                results[i] = result;
                if (result.isValid) {
                    successfulVerifications++;
                }
            } catch {
                // Create failed verification result
                results[i] = VerificationResult({
                    isValid: false,
                    proofId: _generateProofId(listingIds[i], proofDataArray[i]),
                    verifiedAt: block.timestamp,
                    verifierType: _verifierType
                });
            }
        }
        
        // Refund stake for successful verifications
        if (successfulVerifications > 0) {
            uint256 refundAmount = verificationStake * successfulVerifications;
            if (refundAmount <= msg.value) {
                (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
                require(success, "ZKVerifierAdapter: Batch refund failed");
            }
        }
        
        return results;
    }
    
    /**
     * @dev Sets the verification parameters (owner only)
     */
    function setVerifier(address verifierAddress, string calldata verifierType) external override onlyOwner {
        require(verifierAddress != address(0), "ZKVerifierAdapter: Invalid verifier address");
        
        address oldVerifier = _currentVerifier;
        _currentVerifier = verifierAddress;
        _verifierType = verifierType;
        
        // Add to trusted verifiers if not already present
        if (!trustedVerifiers[verifierAddress]) {
            trustedVerifiers[verifierAddress] = true;
            emit TrustedVerifierAdded(verifierAddress);
        }
        
        emit VerifierUpdated(oldVerifier, verifierAddress, verifierType);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets verification result by proof ID
     */
    function getVerificationResult(bytes32 proofId) external view override returns (VerificationResult memory) {
        return _verificationResults[proofId];
    }
    
    /**
     * @dev Checks if a proof hash has been verified
     */
    function isProofVerified(bytes32 proofHash) external view override returns (bool) {
        return _verifiedProofs[proofHash];
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
    function validateProofFormat(ProofData calldata proofData) public view override returns (bool) {
        return (
            proofData.proofHash != bytes32(0) &&
            proofData.proof.length > 0 &&
            proofData.publicInputs.length > 0 &&
            proofData.timestamp > 0 &&
            proofData.timestamp <= block.timestamp
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Adds a trusted verifier address
     */
    function addTrustedVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "ZKVerifierAdapter: Invalid verifier address");
        require(!trustedVerifiers[verifier], "ZKVerifierAdapter: Verifier already trusted");
        
        trustedVerifiers[verifier] = true;
        emit TrustedVerifierAdded(verifier);
    }
    
    /**
     * @dev Removes a trusted verifier address
     */
    function removeTrustedVerifier(address verifier) external onlyOwner {
        require(trustedVerifiers[verifier], "ZKVerifierAdapter: Verifier not trusted");
        require(verifier != _currentVerifier, "ZKVerifierAdapter: Cannot remove current verifier");
        
        trustedVerifiers[verifier] = false;
        emit TrustedVerifierRemoved(verifier);
    }
    
    /**
     * @dev Updates verification parameters
     */
    function updateVerificationParameters(uint256 timeout, uint256 stake) external onlyOwner {
        require(timeout > 0 && timeout <= 24 hours, "ZKVerifierAdapter: Invalid timeout");
        
        verificationTimeout = timeout;
        verificationStake = stake;
        
        emit VerificationParametersUpdated(timeout, stake);
    }
    
    /**
     * @dev Pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraws accumulated stakes (owner only)
     */
    function withdrawStakes() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "ZKVerifierAdapter: No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ZKVerifierAdapter: Withdrawal failed");
    }
    
    // ============ PRIVATE FUNCTIONS ============
    
    /**
     * @dev Generates a unique proof ID
     */
    function _generateProofId(uint256 listingId, ProofData calldata proofData) private view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                listingId,
                proofData.proofHash,
                proofData.timestamp,
                block.timestamp,
                msg.sender
            )
        );
    }
    
    /**
     * @dev Delegates verification to the current verifier implementation
     */
    function _delegateVerification(ProofData calldata proofData) private returns (bool) {
        // For RISC Zero integration
        if (keccak256(bytes(_verifierType)) == keccak256(bytes("RISC_Zero"))) {
            return _verifyRiscZero(proofData);
        }
        
        // For vlayer integration  
        if (keccak256(bytes(_verifierType)) == keccak256(bytes("vlayer"))) {
            return _verifyVlayer(proofData);
        }
        
        // For Mock verifier
        if (keccak256(bytes(_verifierType)) == keccak256(bytes("Mock_Hackathon_v1.0"))) {
            return _verifyMock(proofData);
        }
        
        // Default to external verifier contract call
        return _verifyExternal(proofData);
    }
    
    /**
     * @dev RISC Zero verification logic
     */
    function _verifyRiscZero(ProofData calldata proofData) private pure returns (bool) {
        // TODO: Integrate with actual RISC Zero verifier
        // This would call the RISC Zero verifier contract
        // return IRiscZeroVerifier(_currentVerifier).verify(
        //     proofData.proof,
        //     imageId,
        //     proofData.publicInputs
        // );
        
        // Placeholder implementation
        return proofData.proof.length >= 32;
    }
    
    /**
     * @dev vlayer Web Prover Server verification logic
     */
    function _verifyVlayer(ProofData calldata proofData) private pure returns (bool) {
        // TODO: Integrate with vlayer Web Prover Server output format
        // Parse and verify proofData according to vlayer format
        
        // Placeholder implementation
        return proofData.publicInputs.length >= 32;
    }
    
    /**
     * @dev Mock verification for testing
     */
    function _verifyMock(ProofData calldata proofData) private returns (bool) {
        // Call mock verifier
        try IVerifier(_currentVerifier).verifyProof(0, proofData) returns (
            VerificationResult memory result
        ) {
            return result.isValid;
        } catch {
            return false;
        }
    }
    
    /**
     * @dev External verifier contract call
     */
    function _verifyExternal(ProofData calldata proofData) private returns (bool) {
        // Generic external verifier call
        if (_currentVerifier == address(0)) {
            return false;
        }
        
        // Make low-level call to verifier
        (bool success, bytes memory returnData) = _currentVerifier.call(
            abi.encodeWithSelector(
                IVerifier.verifyProof.selector,
                0, // listingId placeholder
                proofData
            )
        );
        
        if (success && returnData.length >= 32) {
            VerificationResult memory result = abi.decode(returnData, (VerificationResult));
            return result.isValid;
        }
        
        return false;
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow contract to receive Ether for verification stakes
    }
}
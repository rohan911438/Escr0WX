/**
 * Contract Integration Test Component
 * Tests if the EscrowX contract is properly connected and working with simple backend
 */

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useListingCount, useListing, useAllListings } from '@/hooks/useContracts';
import { ESCROW_CONTRACT_ADDRESS } from '@/lib/contracts';
import { apiClient } from '@/lib/simpleApi';
import TokenSetupHelper from '@/components/test/TokenSetupHelper';

export const ContractIntegrationTest: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Backend API tests
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [contractInfo, setContractInfo] = useState<any>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Test contract read functions
  const { data: listingCount, error: listingCountError, isLoading: listingCountLoading } = useListingCount();
  const { data: firstListing, error: firstListingError, isLoading: firstListingLoading } = useListing(1);
  const { data: allListings, error: allListingsError, isLoading: allListingsLoading } = useAllListings(0, 5);

  // Test backend API on component mount
  useEffect(() => {
    const testBackend = async () => {
      try {
        // Test backend health
        const healthResponse = await apiClient.health();
        if (healthResponse.success) {
          setBackendHealth(healthResponse.data);
        } else {
          setBackendError(`Backend health check failed: ${healthResponse.error?.message}`);
        }

        // Test contract info endpoint
        const contractResponse = await apiClient.getContractInfo();
        if (contractResponse.success) {
          setContractInfo(contractResponse.data);
        }
      } catch (error) {
        setBackendError(error instanceof Error ? error.message : 'Failed to connect to backend');
      }
    };

    testBackend();
  }, []);

  const handleConnect = () => {
    connect({ connector: injected() });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🧪 Simple EscrowX Integration Test</h2>
      
      {/* Backend API Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🖥️ Backend API Status</h3>
        {backendError ? (
          <div className="text-red-600">❌ Backend Error: {backendError}</div>
        ) : backendHealth ? (
          <div className="space-y-2">
            <p className="text-green-600">✅ Backend healthy</p>
            <p className="text-sm text-gray-600">Status: {backendHealth.status}</p>
            <p className="text-sm text-gray-600">Contract: {backendHealth.contract}</p>
            <p className="text-sm text-gray-600">Last check: {new Date(backendHealth.timestamp).toLocaleTimeString()}</p>
          </div>
        ) : (
          <p className="text-blue-600">⏳ Testing backend connection...</p>
        )}
      </div>

      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔗 Wallet Connection</h3>
        {isConnected ? (
          <div>
            <p className="text-green-600">✅ Connected: {address}</p>
            <button 
              onClick={() => disconnect()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div>
            <p className="text-orange-600">⚠️ Not connected</p>
            <button 
              onClick={handleConnect}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Connect MetaMask
            </button>
          </div>
        )}
      </div>

      {/* Contract Configuration */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 Contract Configuration</h3>
        <p><strong>Contract Address:</strong> {ESCROW_CONTRACT_ADDRESS}</p>
        <p><strong>Network:</strong> Sepolia (Chain ID: 11155111)</p>
        {contractInfo && (
          <p><strong>Backend Contract:</strong> {contractInfo.contractAddress}</p>
        )}
      </div>

      {/* Contract Read Tests */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">📖 Contract Read Tests</h3>
        
        {/* Listing Count Test */}
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">1. Total Listing Count</h4>
          {listingCountLoading ? (
            <p className="text-blue-600">⏳ Loading...</p>
          ) : listingCountError ? (
            <p className="text-red-600">❌ Error: {listingCountError.message}</p>
          ) : (
            <p className="text-green-600">✅ Count: {String(listingCount || 0)}</p>
          )}
        </div>

        {/* First Listing Test */}
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">2. First Listing Details</h4>
          {firstListingLoading ? (
            <p className="text-blue-600">⏳ Loading...</p>
          ) : firstListingError ? (
            <p className="text-red-600">❌ Error: {firstListingError.message}</p>
          ) : firstListing ? (
            <div className="text-sm">
              <p>✅ Listing ID: {String(firstListing.listingId)}</p>
              <p>✅ Creator: {firstListing.creator}</p>
              <p>✅ Amount: {String(firstListing.amount)}</p>
              <p>✅ Status: {firstListing.status}</p>
            </div>
          ) : (
            <p className="text-gray-600">📝 No listing found (this is normal if no listings exist)</p>
          )}
        </div>

        {/* All Listings Test */}
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">3. All Listings (First 5)</h4>
          {allListingsLoading ? (
            <p className="text-blue-600">⏳ Loading...</p>
          ) : allListingsError ? (
            <p className="text-red-600">❌ Error: {allListingsError.message}</p>
          ) : allListings && Array.isArray(allListings) ? (
            <div>
              <p className="text-green-600">✅ Retrieved {allListings.length} listings</p>
              {allListings.map((listing: any, index: number) => (
                <div key={index} className="text-xs text-gray-600 mt-1">
                  Listing {index + 1}: ID {String(listing.listingId)} - {listing.creator}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">📝 No listings found</p>
          )}
        </div>
      </div>

      {/* Test Results Summary */}
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📊 Test Results Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Backend</div>
            <div className={backendHealth ? "text-green-600" : "text-red-600"}>
              {backendHealth ? "✅ Online" : "❌ Offline"}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Connection</div>
            <div className={isConnected ? "text-green-600" : "text-orange-600"}>
              {isConnected ? "✅ Connected" : "⚠️ Not Connected"}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Contract Read</div>
            <div className={!listingCountError ? "text-green-600" : "text-red-600"}>
              {!listingCountError ? "✅ Working" : "❌ Failed"}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Data Retrieval</div>
            <div className={(!firstListingError && !allListingsError) ? "text-green-600" : "text-red-600"}>
              {(!firstListingError && !allListingsError) ? "✅ Working" : "❌ Failed"}
            </div>
          </div>
        </div>
      </div>

      {/* Token Setup for Real Transactions */}
      <div className="mt-6">
        <TokenSetupHelper />
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📋 Test Instructions</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Backend should show as "Online" (simple API server)</li>
          <li>Connect your MetaMask wallet to Sepolia testnet</li>
          <li>Get USDC tokens using the helper above for real transactions</li>
          <li>Check that contract address matches the deployed address</li>
          <li>Verify that contract read functions return data without errors</li>
          <li>All transactions will be handled by frontend via wagmi (no backend needed)</li>
        </ol>
      </div>
    </div>
  );
};

export default ContractIntegrationTest;
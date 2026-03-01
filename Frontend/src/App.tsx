import React, { useState, useEffect, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/web3Config';
import { WalletProvider, useWallet } from "@/contexts/WalletContext";
import { WalletModal } from "@/components/wallet";
import NetworkEnforcementModal from "@/components/wallet/NetworkEnforcementModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ExplorePage from "./pages/ExplorePage";
import CreateListing from "./pages/CreateListing";
import USDCDebugger from "./pages/USDCDebugger";
import ListingDetail from "./pages/ListingDetail";
import SubmitProof from "./pages/SubmitProof";
import MyListings from "./pages/MyListings";
import MyPurchases from "./pages/MyPurchases";
import NotFound from "./pages/NotFound";
import { useAccount, useChainId } from 'wagmi';
import { SEPOLIA_CHAIN_ID, checkNetwork } from '@/lib/web3Config';

// Remove ContractIntegrationTest from production
const ContractIntegrationTest = import.meta.env.DEV 
  ? React.lazy(() => import("./test/ContractIntegrationTest"))
  : null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Network Enforcement Component - needs to be inside WagmiProvider
const NetworkEnforcement = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number | undefined>();

  useEffect(() => {
    const checkNetworkStatus = async () => {
      if (isConnected) {
        const networkCheck = await checkNetwork();
        setCurrentChainId(networkCheck.currentChainId);
        setShowNetworkModal(!networkCheck.isCorrect);
      }
    };

    checkNetworkStatus();
  }, [isConnected, chainId]);

  return (
    <NetworkEnforcementModal
      isOpen={showNetworkModal}
      onClose={() => setShowNetworkModal(false)}
      currentChainId={currentChainId}
    />
  );
};

// Wallet Modal Component - needs to be inside WalletProvider  
const WalletModalWrapper = () => {
  const { isModalOpen, closeModal } = useWallet();
  return <WalletModal isOpen={isModalOpen} onClose={closeModal} />;
};

const App = () => {
  // Debug log to help identify if the app is loading
  console.log('EscrowX App loading...', {
    mode: import.meta.env.MODE,
    hasApiUrl: !!import.meta.env.VITE_API_URL,
    hasContractAddress: !!import.meta.env.VITE_CONTRACT_ADDRESS,
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <TooltipProvider>
            <WalletProvider>
              <Toaster />
              <Sonner />
              <WalletModalWrapper />
              <NetworkEnforcement />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/create" element={<CreateListing />} />
                  <Route path="/usdc-debug" element={<USDCDebugger />} />
                  <Route path="/listing/:id" element={<ListingDetail />} />
                  <Route path="/submit-proof/:id" element={<SubmitProof />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/my-purchases" element={<MyPurchases />} />
                  {/* Only include test route in development */}
                  {ContractIntegrationTest && (
                    <Route 
                      path="/test" 
                      element={
                        <Suspense fallback={<div>Loading test...</div>}>
                          <ContractIntegrationTest />
                        </Suspense>
                      } 
                    />
                  )}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </WalletProvider>
          </TooltipProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

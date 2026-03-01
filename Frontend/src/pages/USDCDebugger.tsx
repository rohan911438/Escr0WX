import { useAccount, useReadContract, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import { TOKEN_ADDRESSES, ERC20_ABI } from "@/lib/contracts";
import { formatUnits, parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import { useState } from "react";

export default function USDCDebugger() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [refreshCount, setRefreshCount] = useState(0);

  // Manual balance query with different parameters
  const { 
    data: usdcBalance, 
    isLoading: balanceLoading, 
    error: balanceError,
    refetch: refetchBalance 
  } = useReadContract({
    address: TOKEN_ADDRESSES.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && chainId === sepolia.id,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0, // Don't cache
    }
  });

  // Token decimals
  const { data: decimals } = useReadContract({
    address: TOKEN_ADDRESSES.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  // Token symbol
  const { data: symbol } = useReadContract({
    address: TOKEN_ADDRESSES.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  // Token name
  const { data: name } = useReadContract({
    address: TOKEN_ADDRESSES.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "name",
  });

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    refetchBalance();
  };

  const balanceFormatted = usdcBalance ? formatUnits(usdcBalance, 6) : "0";
  const expectedAmount = parseUnits("20", 6);

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">USDC Balance Debugger</h1>
        
        {!isConnected ? (
          <div className="glass-card p-6">
            <p className="text-white">Please connect your wallet to debug USDC balance</p>
          </div>
        ) : chainId !== sepolia.id ? (
          <div className="glass-card p-6">
            <p className="text-white">Please switch to Sepolia testnet</p>
            <p className="text-muted-foreground text-sm">Current chain ID: {chainId}</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Wallet Info */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Wallet Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="text-white font-mono">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain ID:</span>
                  <span className="text-white">{chainId} (Sepolia: {sepolia.id})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected:</span>
                  <span className="text-emerald-500">{isConnected ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Token Contract Info */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Token Contract Information</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Address:</span>
                  <span className="text-white font-mono">{TOKEN_ADDRESSES.USDC}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Name:</span>
                  <span className="text-white">{name || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Symbol:</span>
                  <span className="text-white">{symbol || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Decimals:</span>
                  <span className="text-white">{decimals?.toString() || 'Loading...'}</span>
                </div>
              </div>
            </div>

            {/* Balance Information */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Balance Information</h2>
                <Button onClick={handleRefresh} size="sm">
                  Refresh ({refreshCount})
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loading:</span>
                    <span className="text-white">{balanceLoading ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error:</span>
                    <span className="text-red-500">{balanceError?.message || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Raw Balance:</span>
                    <span className="text-white font-mono">{usdcBalance?.toString() || 'No data'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Formatted Balance:</span>
                    <span className="text-white font-bold text-lg">{balanceFormatted} USDC</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-white font-medium mb-2">Expected vs Actual</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Balance:</span>
                      <span className="text-emerald-500">20.00 USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Raw:</span>
                      <span className="text-emerald-500 font-mono">{expectedAmount.toString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Match:</span>
                      <span className={usdcBalance === expectedAmount ? 'text-emerald-500' : 'text-red-500'}>
                        {usdcBalance === expectedAmount ? 'Yes ✅' : 'No ❌'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Transaction Reference */}
                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-white font-medium mb-2">Transaction Reference</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Hash: 0x15b31da7d8f501d83137d0e5d4c1ec9a1e9bcc12e9e2eadc68b9dc6eae46dfa5</div>
                    <div>Amount: 20 USDC transferred to your address</div>
                    <div>Status: Success (574 confirmations)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Actions */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">Debug Actions</h2>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                  variant="outline"
                >
                  View on Etherscan
                </Button>
                <Button 
                  onClick={() => window.open(`https://sepolia.etherscan.io/token/${TOKEN_ADDRESSES.USDC}?a=${address}`, '_blank')}
                  variant="outline"
                >
                  View Token Holdings
                </Button>
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(`
Address: ${address}
Token: ${TOKEN_ADDRESSES.USDC}  
Balance: ${balanceFormatted} USDC
Raw: ${usdcBalance?.toString()}
Error: ${balanceError?.message || 'None'}
                    `);
                  }}
                  variant="outline"
                >
                  Copy Debug Info
                </Button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
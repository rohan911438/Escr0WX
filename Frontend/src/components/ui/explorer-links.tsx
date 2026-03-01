/**
 * Explorer Link Components
 * Provides convenient links to Etherscan and Solana Explorer
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getExplorerUrl, formatAddress } from "@/lib/web3Config";

interface EtherscanLinkProps {
  hash: string;
  type?: 'tx' | 'address' | 'token';
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  showCopy?: boolean;
}

interface SolanaExplorerLinkProps {
  address: string;
  type?: 'account' | 'tx';
  cluster?: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  showCopy?: boolean;
}

interface TransactionStatusProps {
  hash?: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  onDismiss?: () => void;
}

// Copy to clipboard hook
const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return { copied, copy };
};

// Etherscan Link Component
export const EtherscanLink: React.FC<EtherscanLinkProps> = ({
  hash,
  type = 'tx',
  children,
  className = '',
  showIcon = true,
  showCopy = false
}) => {
  const { copied, copy } = useCopyToClipboard();
  const url = getExplorerUrl(hash, type);
  const displayText = children || formatAddress(hash);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Button
        variant="link"
        className="p-0 h-auto font-mono text-sm hover:text-primary"
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      >
        {displayText}
        {showIcon && <ExternalLink className="ml-1 h-3 w-3" />}
      </Button>
      
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => copy(hash)}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
};

// Solana Explorer Link Component  
export const SolanaExplorerLink: React.FC<SolanaExplorerLinkProps> = ({
  address,
  type = 'account',
  cluster,
  children,
  className = '',
  showIcon = true,
  showCopy = false
}) => {
  const { copied, copy } = useCopyToClipboard();
  const network = cluster || import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
  const url = `https://explorer.solana.com/${type}/${address}${network !== 'mainnet-beta' ? `?cluster=${network}` : ''}`;
  const displayText = children || formatAddress(address);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Button
        variant="link"
        className="p-0 h-auto font-mono text-sm hover:text-primary"
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
      >
        {displayText}
        {showIcon && <ExternalLink className="ml-1 h-3 w-3" />}
      </Button>
      
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => copy(address)}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
};

// Transaction Status Component
export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  hash,
  status,
  error,
  onDismiss
}) => {
  const statusConfig = {
    pending: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      icon: '⏳',
      title: 'Transaction Pending'
    },
    success: {
      color: 'text-green-600', 
      bgColor: 'bg-green-50 border-green-200',
      icon: '✅',
      title: 'Transaction Successful'
    },
    error: {
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200', 
      icon: '❌',
      title: 'Transaction Failed'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.color}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <div>
            <h4 className="font-semibold">{config.title}</h4>
            {hash && (
              <div className="mt-1">
                <span className="text-sm">Transaction: </span>
                <EtherscanLink 
                  hash={hash} 
                  showCopy 
                  className={config.color}
                />
              </div>
            )}
            {error && (
              <p className="mt-1 text-sm">{error}</p>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
};

export default {
  EtherscanLink,
  SolanaExplorerLink, 
  TransactionStatus
};
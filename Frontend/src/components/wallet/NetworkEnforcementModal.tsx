/**
 * Network Enforcement Modal
 * Shows when user is on wrong network and provides switch to Sepolia functionality
 */

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { switchToSepolia, getNetworkName } from "@/lib/web3Config";

interface NetworkEnforcementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentChainId?: number;
}

export const NetworkEnforcementModal: React.FC<NetworkEnforcementModalProps> = ({
  isOpen,
  onClose,
  currentChainId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await switchToSepolia();
      if (success) {
        // Small delay to allow network switch to complete
        setTimeout(() => {
          onClose();
          setIsLoading(false);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Network switch error:', err);
      
      // Provide more specific error messages
      let errorMessage = err.message;
      
      if (err.message.includes('rejected')) {
        errorMessage = 'Network switch was cancelled. Please manually switch to Sepolia in your wallet settings.';
      } else if (err.message.includes('add it manually')) {
        errorMessage = 'Please add Sepolia network manually: Settings → Networks → Add Network → Sepolia Test Network';
      } else if (!errorMessage || errorMessage === 'Failed to switch network') {
        errorMessage = 'Unable to switch automatically. Please manually switch to Sepolia testnet in your wallet.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Wrong Network Detected</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              EscrowX requires the <strong>Sepolia Testnet</strong> to function properly.
            </p>
            <p>
              You're currently connected to: <strong>{getNetworkName(currentChainId)}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Please switch to Sepolia to continue using the application.
            </p>
            
            {currentChainId === 43114 && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-800">Manual Switch Instructions:</p>
                <p className="text-blue-700 mt-1">
                  1. Open your wallet → Networks → Add Network<br />
                  2. Network Name: <strong>Sepolia Test Network</strong><br />
                  3. Chain ID: <strong>11155111</strong><br />
                  4. RPC URL: <strong>https://rpc.sepolia.org</strong>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleSwitchNetwork} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching Network...
              </>
            ) : (
              'Switch to Sepolia'
            )}
          </Button>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://sepolia.etherscan.io', '_blank')}
              className="flex-1 sm:flex-none"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Sepolia
            </Button>
            <AlertDialogCancel 
              onClick={onClose} 
              className="flex-1 sm:flex-none"
            >
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NetworkEnforcementModal;
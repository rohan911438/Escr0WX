import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import React from "react";
import { toast } from "sonner";
import { useSubmitProof } from "@/hooks/useContracts";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Loader2 } from "lucide-react";

const SubmitProof = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { address } = useAccount();
  
  const [receiptHash, setReceiptHash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Contract hooks
  const { 
    submitProof,
    hash: submitHash, 
    isPending: submitLoading,
    isConfirming: confirmingTx,
    isConfirmed: submitSuccess 
  } = useSubmitProof();

  // Transaction receipt tracking is handled by the hook

  // Effect to handle successful proof submission
  React.useEffect(() => {
    if (submitSuccess) {
      setLoading(false);
      toast.success("Proof submitted on-chain!", { 
        description: `Listing #${id} — Awaiting verification` 
      });
      setTimeout(() => navigate(`/listing/${id}`), 2000);
    }
  }, [submitSuccess, id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!receiptHash || !receiptHash.startsWith('0x')) {
      toast.error("Please enter a valid proof hash starting with 0x");
      return;
    }

    if (!id) {
      toast.error("Invalid listing ID");
      return;
    }

    try {
      setLoading(true);
      toast.info("Submitting proof to blockchain...");

      await submitProof({
        listingId: parseInt(id), // Convert string to number
        proofHash: receiptHash
      });

      toast.info("Transaction submitted! Waiting for confirmation...");
    } catch (error: any) {
      console.error('Submit proof error:', error);
      toast.error(error?.message || "Failed to submit proof");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Submit Proof</h1>
        <p className="mb-8 text-sm text-muted-foreground">Upload delivery proof to unlock escrowed funds</p>
        <form onSubmit={handleSubmit} className="glass-card space-y-5 p-8">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Proof File</label>
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-primary/30">
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm text-muted-foreground" />
            </div>
            {file && <p className="mt-2 text-xs text-primary">{file.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Receipt Hash</label>
            <input className={inputClass} placeholder="0x..." value={receiptHash} onChange={(e) => setReceiptHash(e.target.value)} required />
          </div>
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full" 
            type="submit"
            disabled={loading || submitLoading || confirmingTx || !address || !receiptHash}
          >
            {(loading || submitLoading || confirmingTx) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmingTx ? 'Confirming...' :
             submitLoading ? 'Submitting...' : 
             loading ? 'Processing...' :
             !address ? 'Connect Wallet' :
             'Submit Proof'
            }
          </Button>
        </form>
      </main>
    </div>
  );
};

export default SubmitProof;

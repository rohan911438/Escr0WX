
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UploadCloud, AlertCircle, Clock } from "lucide-react";

interface ActionPanelProps {
    status: string;
    isCreator: boolean; // Mock checks
    listingId: string;
}

export const ActionPanel = ({ status, isCreator, listingId }: ActionPanelProps) => {
    const navigate = useNavigate();

    // If Completed or Disputed, no primary actions needed in this panel usually, mainly mostly info.
    if (status === "completed" || status === "disputed") return null;

    return (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(0,240,255,0.05)]">
            <h3 className="mb-4 text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                {isCreator ? "Creator Actions" : "Fulfiller Actions"}
            </h3>

            {/* Fulfiller View Logic */}
            {!isCreator && status === "active" && (
                <div>
                    <p className="text-sm text-muted-foreground mb-4">
                        This request is open. Assign yourself to fulfill this purchase and earn the premium.
                    </p>
                    <Button variant="hero" className="w-full">
                        Fulfill Request
                    </Button>
                </div>
            )}

            {!isCreator && status === "escrowed" && (
                <div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Purchase the item and upload the receipt/proof to unlock funds.
                    </p>
                    <Button variant="glow" className="w-full" onClick={() => navigate(`/submit-proof/${listingId}`)}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Submit Proof
                    </Button>
                </div>
            )}

            {!isCreator && status === "proof_submitted" && (
                <div className="flex items-center gap-3 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <p className="text-sm text-blue-200">Waiting for creator verification...</p>
                </div>
            )}


            {/* Creator View Logic */}
            {isCreator && status === "active" && (
                <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4 border border-white/10">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Waiting for a fulfiller to accept...</p>
                </div>
            )}

            {isCreator && status === "escrowed" && (
                <div className="flex items-center gap-3 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <p className="text-sm text-blue-200">Waiting for fulfiller to submit proof...</p>
                </div>
            )}

            {isCreator && status === "proof_submitted" && (
                <div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Proof has been submitted. Verify the delivery/receipt to release funds.
                    </p>
                    <Button variant="glow" className="w-full bg-emerald-500 hover:bg-emerald-600 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Review & Release Funds
                    </Button>
                </div>
            )}

        </div>
    );
};

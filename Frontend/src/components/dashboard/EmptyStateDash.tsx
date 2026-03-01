
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyStateDash = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/20 p-12 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
                <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">You haven't created any escrow requests yet.</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Start by creating a listing to lock funds securely and request a purchase.
            </p>
            <Button variant="glow" onClick={() => navigate("/create")}>
                Create Your First Listing
            </Button>
        </div>
    );
};

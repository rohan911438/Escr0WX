import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-card/20 p-8 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
                <PackageSearch className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">No active escrow requests yet</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Be the first to create a listing and start earning premiums on your products.
            </p>
            <Button variant="glow" onClick={() => navigate("/create")}>
                Create First Listing
            </Button>
        </div>
    );
};

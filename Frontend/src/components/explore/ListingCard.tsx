import { Listing } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

const statusConfig = {
    active: { label: "Open", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Clock },
    escrowed: { label: "Fulfilled", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: ShieldCheck },
    proof_submitted: { label: "Verifying", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Clock },
    completed: { label: "Verified", color: "text-muted-foreground bg-muted/10 border-muted/20", icon: CheckCircle2 },
    disputed: { label: "Disputed", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: ShieldCheck },
};

export const ListingCard = ({ listing }: { listing: Listing }) => {
    const navigate = useNavigate();
    const config = statusConfig[listing.status];
    const StatusIcon = config.icon;

    return (
        <Card
            onClick={() => navigate(`/listing/${listing.id}`)}
            className="group relative overflow-hidden border-white/5 bg-[#111827] p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] cursor-pointer"
        >
            {/* Top Decoration */}
            <div className="absolute top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="p-5">
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="line-clamp-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                            {listing.productName}
                        </h3>
                        <span className="mt-1 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                            {listing.premium}% Premium
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-foreground">${listing.usdcAmount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">USDC</div>
                    </div>
                </div>

                {/* Description */}
                <p className="mb-6 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                    {listing.description}
                </p>

                {/* Footer Info */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${config.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                        </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                        {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                    </span>
                </div>
            </div>

            {/* CTA Overlay - Visible on Hover */}
            <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-gradient-to-t from-background/90 to-transparent pb-6 pt-12 transition-transform duration-300 group-hover:translate-y-0">
                <Button size="sm" variant="glow" className="shadow-lg">
                    View Details <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
            </div>
        </Card>
    );
};

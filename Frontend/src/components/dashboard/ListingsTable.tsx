
import { Button } from "@/components/ui/button";
import { Listing } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertCircle, Clock, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
    active: { label: "Open", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Clock },
    escrowed: { label: "In Progress", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: ShieldCheck },
    proof_submitted: { label: "Proof Submitted", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: AlertCircle },
    completed: { label: "Released", color: "text-muted-foreground bg-muted/10 border-muted/20", icon: CheckCircle2 },
    disputed: { label: "Disputed", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

export const ListingsTable = ({ listings }: { listings: Listing[] }) => {
    const navigate = useNavigate();

    const handleCancel = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        toast.error("Cancelled listing (Mock)", { description: `Listing ${id} has been cancelled.` });
    };

    const handleReview = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        navigate(`/submit-proof/${id}`); // Placeholder for review page logic
    };

    return (
        <div className="rounded-xl border border-white/5 bg-card/20 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Locked Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {listings.map((listing) => {
                            const status = statusConfig[listing.status];
                            const Icon = status.icon;

                            return (
                                <tr
                                    key={listing.id}
                                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/listing/${listing.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-foreground">{listing.productName}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{listing.description || "No description"}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-foreground">
                                        {listing.usdcAmount} USDC
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                                            <Icon className="h-3 w-3" />
                                            {status.label}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {listing.createdAt}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {listing.status === "active" && (
                                            <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleCancel(e, listing.id)}>
                                                Cancel
                                            </Button>
                                        )}
                                        {listing.status === "proof_submitted" && (
                                            <Button size="sm" variant="outline" className="h-8 border-primary/20 hover:bg-primary/10 text-primary" onClick={(e) => handleReview(e, listing.id)}>
                                                Review Proof
                                            </Button>
                                        )}
                                        {listing.status === "escrowed" && (
                                            <span className="text-xs text-muted-foreground italic">Awaiting Proof</span>
                                        )}
                                        {["completed", "disputed"].includes(listing.status) && (
                                            <Button size="sm" variant="ghost" className="h-8 group-hover:bg-white/10">
                                                Details <ArrowRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

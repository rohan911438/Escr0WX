
import { Listing } from "@/data/mockData";
import { ExternalLink, User, Shield, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ListingInfo = ({ listing }: { listing: Listing }) => {
    const totalPayout = listing.usdcAmount + (listing.usdcAmount * (listing.premium / 100));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Product Card */}
            <div className="rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-sm">
                <div className="mb-4">
                    <Badge variant="outline" className="mb-2 border-primary/20 bg-primary/5 text-primary">
                        {listing.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <h1 className="text-3xl font-bold text-foreground">{listing.productName}</h1>
                    <a
                        href={listing.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        {listing.productUrl} <ExternalLink className="h-3 w-3" />
                    </a>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                    {listing.description || "No description provided."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                    <div className="rounded-md bg-[#0B0F19] px-3 py-2 border border-white/5">
                        <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">Requested Item</span>
                        <span className="font-semibold text-foreground">{listing.productName}</span>
                    </div>
                </div>
            </div>

            {/* Financials */}
            <div className="rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Escrow Financials</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-[#0B0F19] p-4 border border-white/5">
                        <div className="text-xs text-muted-foreground mb-1">Locked Amount</div>
                        <div className="text-2xl font-bold text-foreground">{listing.usdcAmount} <span className="text-sm font-normal text-muted-foreground">USDC</span></div>
                    </div>

                    <div className="rounded-lg bg-[#0B0F19] p-4 border border-white/5">
                        <div className="text-xs text-muted-foreground mb-1 items-center flex gap-1">
                            Premium Reward <Info className="h-3 w-3" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">+{listing.premium}%</div>
                    </div>
                </div>

                <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-100">Total Payout upon Delivery</span>
                    <span className="text-xl font-bold text-emerald-400">{totalPayout.toFixed(2)} USDC</span>
                </div>
            </div>

            {/* Parties */}
            <div className="rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-wider">Involved Parties</h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-500/20 p-2 text-blue-400">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">Creator (Buyer)</div>
                                <div className="text-xs text-muted-foreground font-mono">{listing.seller}</div>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">VERIFIED</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-full p-2 ${listing.buyer ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-muted-foreground'}`}>
                                <Shield className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">Fulfiller (Seller)</div>
                                <div className="text-xs text-muted-foreground font-mono">{listing.buyer || "Waiting for acceptance..."}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

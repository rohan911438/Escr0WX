
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, Wallet } from "lucide-react";

interface LiveSummaryProps {
    data: {
        usdcAmount: string;
        premium: string;
    };
}

export const LiveSummary = ({ data }: LiveSummaryProps) => {
    const amount = parseFloat(data.usdcAmount) || 0;
    const premium = parseFloat(data.premium) || 0;
    const fulfillerEarns = amount + (amount * (premium / 100));

    return (
        <Card className="sticky top-24 border-white/10 bg-card/40 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Transaction Summary</h3>

            <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-[#0B0F19] p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <Lock className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">You Lock</p>
                            <p className="font-bold text-foreground">{amount.toFixed(2)} USDC</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-[#0B0F19] p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Fulfiller Earns</p>
                            <p className="font-bold text-emerald-400">{fulfillerEarns.toFixed(2)} USDC</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-primary">Secure Escrow</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Funds are locked in a smart contract on Sepolia and only released after you verify delivery.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

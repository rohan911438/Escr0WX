
interface PaymentTermsProps {
    data: {
        usdcAmount: string;
        premium: string;
    };
    updateData: (key: string, value: string) => void;
}

export const PaymentTerms = ({ data, updateData }: PaymentTermsProps) => {
    const inputClass =
        "w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all";

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">Payment Terms</h2>
                <p className="text-sm text-muted-foreground mb-6">Set the amount to lock and the reward for the fulfiller.</p>

                <div className="grid gap-6">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">USDC Amount</label>
                        <div className="relative">
                            <input
                                className={`${inputClass} pl-8`}
                                type="number"
                                placeholder="0.00"
                                value={data.usdcAmount}
                                onChange={(e) => updateData("usdcAmount", e.target.value)}
                                autoFocus
                            />
                            <span className="absolute left-3 top-3.5 text-xs text-muted-foreground">$</span>
                            <span className="absolute right-3 top-3.5 text-xs font-bold text-muted-foreground">USDC</span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">This amount will be locked in the smart contract.</p>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Premium %</label>
                        <div className="relative">
                            <input
                                className={`${inputClass} pr-8`}
                                type="number"
                                placeholder="3"
                                value={data.premium}
                                onChange={(e) => updateData("premium", e.target.value)}
                            />
                            <span className="absolute right-3 top-3.5 text-xs font-bold text-muted-foreground">%</span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                            Recommended: 3-5% for faster fulfillment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

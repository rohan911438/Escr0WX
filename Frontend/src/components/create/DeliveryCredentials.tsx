
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DeliveryCredentialsProps {
    data: {
        deliveryData: string;
    };
    updateData: (key: string, value: string) => void;
}

export const DeliveryCredentials = ({ data, updateData }: DeliveryCredentialsProps) => {
    const inputClass =
        "w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all";

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-foreground">Delivery Credentials</h2>
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-card border-white/10 text-xs">
                                <p>This data is encrypted client-side and only revealed to the selected fulfiller.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground mb-6">Securely provide shipping details.</p>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Encrypted Delivery Data</label>
                    <textarea
                        className={`${inputClass} min-h-[120px] resize-none font-mono text-xs`}
                        placeholder="Enter Name, Address, Phone Number, etc..."
                        value={data.deliveryData}
                        onChange={(e) => updateData("deliveryData", e.target.value)}
                        autoFocus
                    />
                    <div className="mt-2 flex items-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        End-to-End Encryption Enabled
                    </div>
                </div>
            </div>
        </div>
    );
};

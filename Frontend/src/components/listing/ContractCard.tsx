
import { Copy, ExternalLink, Network } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const ContractCard = () => {
    const contractAddress = "0x7a2...9b1c"; // Mock
    const txHash = "0x891...c2e3"; // Mock

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    return (
        <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">On-Chain Data</h3>
                <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Network className="h-3 w-3" /> Sepolia
                </div>
            </div>

            <div className="space-y-4">
                <div className="group">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Contract Address</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-xs font-mono text-foreground transition-colors group-hover:bg-white/10">
                        {contractAddress}
                        <div className="flex gap-1 opactiy-0 group-hover:opacity-100 transition-opacity">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(contractAddress)}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy Address</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="group">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Creation Tx Hash</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2 text-xs font-mono text-foreground transition-colors group-hover:bg-white/10">
                        {txHash}
                        <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

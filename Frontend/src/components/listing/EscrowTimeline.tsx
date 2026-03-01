
import { Check, Clock, Circle } from "lucide-react";

const steps = [
    { id: "created", label: "Request Created" },
    { id: "active", label: "Smart Contract Funded" },
    { id: "escrowed", label: "Fulfiller Assigned" },
    { id: "proof_submitted", label: "Proof Submitted" },
    { id: "completed", label: "Funds Released" },
];

export const EscrowTimeline = ({ status }: { status: string }) => {
    // Determine current step index
    let currentStepIndex = 0;
    if (status === "active") currentStepIndex = 1;
    if (status === "escrowed") currentStepIndex = 2;
    if (status === "proof_submitted") currentStepIndex = 3;
    if (status === "completed") currentStepIndex = 4;
    if (status === "disputed") currentStepIndex = 3; // Visualize dispute as a halt at proof

    return (
        <div className="rounded-xl border border-white/10 bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">Escrow Progress</h3>

            <div className="relative flex flex-col gap-6 pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-white/5" />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex items-center gap-4">
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted
                                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                                    }`}
                            >
                                {isCompleted ? <Check className="h-3 w-3" /> : <Circle className="h-2 w-2" />}
                            </div>

                            <div>
                                <p className={`text-sm font-medium transition-colors ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                                    {step.label}
                                </p>
                                {isCurrent && (
                                    <span className="text-[10px] text-primary animate-pulse">Running on Sepolia...</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

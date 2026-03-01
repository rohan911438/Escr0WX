
import { Card } from "@/components/ui/card";

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    active?: boolean;
}

export const StatCard = ({ label, value, subValue, active }: StatCardProps) => {
    return (
        <Card className={`border-white/5 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 ${active ? 'border-primary/50 shadow-[0_0_20px_rgba(0,240,255,0.1)]' : ''}`}>
            <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${active ? 'text-primary' : 'text-foreground'}`}>{value}</span>
                    {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
                </div>
            </div>
        </Card>
    );
};

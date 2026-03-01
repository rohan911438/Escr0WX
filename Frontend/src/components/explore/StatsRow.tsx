import { Card } from "@/components/ui/card";

interface StatItemProps {
    label: string;
    value: string;
    subValue?: string;
}

const StatItem = ({ label, value, subValue }: StatItemProps) => (
    <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {subValue && <span className="text-xs text-primary">{subValue}</span>}
        </div>
    </div>
);

export const StatsRow = () => {
    return (
        <Card className="mb-8 grid grid-cols-1 gap-6 border-white/5 bg-card/40 p-6 backdrop-blur-sm sm:grid-cols-3">
            <StatItem label="Active Listings" value="1,248" subValue="+12% this week" />
            <StatItem label="Total Value Locked" value="$4.2M" subValue="USDC" />
            <StatItem label="Average Premium" value="3.8%" subValue="~ 4 days duration" />
        </Card>
    );
};

import { Shield, Coins, FileKey, Fingerprint } from "lucide-react";

const techs = [
  { icon: Shield, title: "Ethereum Escrow", desc: "Non-custodial smart contracts on Ethereum" },
  { icon: Coins, title: "USDC Settlement", desc: "Stablecoin payments with instant finality" },
  { icon: FileKey, title: "EIP-712 Signatures", desc: "Typed structured data for off-chain auth" },
  { icon: Fingerprint, title: "ZK-Proof Verification", desc: "Privacy-preserving delivery proof on-chain" },
];

const TechnologyGrid = () => (
  <section className="border-t border-border/30 py-24">
    <div className="container mx-auto px-4">
      <div className="mb-16 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Stack</p>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Technology</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {techs.map((t) => (
          <div
            key={t.title}
            className="glass-card glow-border-hover group cursor-default p-6 transition-all duration-300"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{t.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TechnologyGrid;

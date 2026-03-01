const badges = ["EIP-712", "ERC-20", "Sepolia Compatible", "Remix Deployed"];

const SecuritySection = () => (
  <section className="border-t border-border/30 py-24">
    <div className="container mx-auto px-4 text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Ethos</p>
      <h2 className="mx-auto mb-4 max-w-2xl text-3xl font-bold tracking-tight text-foreground">
        Built Ethereum-native.<br />Minimal. Trustless. Composable.
      </h2>
      <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed text-muted-foreground">
        No off-chain dependencies. No intermediaries. Every transaction verifiable on-chain.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {badges.map((b) => (
          <span
            key={b}
            className="rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default SecuritySection;

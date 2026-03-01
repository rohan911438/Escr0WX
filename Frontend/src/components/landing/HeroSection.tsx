import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";

const HeroSection = () => {
  const { connect } = useWallet();
  const navigate = useNavigate();

  const handleConnect = () => {
    connect();
    navigate("/dashboard");
  };

  const steps = [
    { label: "Listing", active: true },
    { label: "Escrow Lock", active: true },
    { label: "Proof", active: false },
    { label: "Release", active: false },
  ];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full bg-purple-glow/5 blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Ethereum-native Escrow Protocol
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground lg:text-6xl xl:text-7xl">
              Verifiable Commerce<br />
              <span className="gradient-text">on Ethereum.</span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              Buy real-world goods using crypto. No banks. No cards. Only cryptographic proof. 
              Trustless escrow powered by on-chain verification.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={handleConnect}>
                Connect Wallet
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="hero-secondary" size="xl">
                <Eye className="mr-1 h-5 w-5" />
                View Demo
              </Button>
            </div>
          </div>

          {/* Right — Escrow Flow Visual */}
          <div className="relative hidden lg:block">
            <div className="animate-float">
              <div className="glass-card p-8">
                <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Escrow Flow
                </p>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${
                          step.active
                            ? "bg-primary/20 text-primary glow-cyan"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${step.active ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              step.active ? "bg-primary" : "bg-transparent"
                            }`}
                            style={{ width: step.active ? "100%" : "0%" }}
                          />
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`text-xs ${step.active ? "text-primary" : "text-muted-foreground/30"}`}>→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

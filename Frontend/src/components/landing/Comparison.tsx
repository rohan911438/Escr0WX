import { motion } from "framer-motion";
import { Check, X, Zap, Shield, Clock, HandCoins } from "lucide-react";

export const Comparison = () => {
    return (
        <section className="py-24 bg-brand-dark/50 relative">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose EscrowX?</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Traditional banking is slow. P2P is risky. EscrowX is the best of both worlds.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Traditional Banks */}
                    <ComparisonCard
                        title="Traditional Banks"
                        icon={<Clock className="w-6 h-6" />}
                        features={[
                            { text: "Slow Settlement (3-5 days)", positive: false },
                            { text: "High Fees (1-3%)", positive: false },
                            { text: "Manual Verification", positive: false },
                            { text: "Limited Global Reach", positive: false },
                            { text: "Business Hours Only", positive: false },
                        ]}
                        delay={0}
                    />

                    {/* EscrowX - Highlighted */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: -20, scale: 1 }} // Popped up effect
                        viewport={{ once: true }}
                        className="relative p-8 rounded-2xl bg-brand-card border border-brand-accent-cyan shadow-[0_0_50px_rgba(0,240,255,0.15)] z-10"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-accent-cyan text-brand-dark font-bold px-4 py-1 rounded-full text-sm">
                            RECOMMENDED
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-brand-accent-cyan/10 text-brand-accent-cyan">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">EscrowX</h3>
                        </div>
                        <ul className="space-y-4">
                            <FeatureItem text="Instant Settlement" positive={true} highlight />
                            <FeatureItem text="Low Fees (<0.1%)" positive={true} highlight />
                            <FeatureItem text="Cryptographic Proofs" positive={true} highlight />
                            <FeatureItem text="Global & Permissionless" positive={true} highlight />
                            <FeatureItem text="24/7 Availability" positive={true} highlight />
                        </ul>
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <button className="w-full py-3 rounded-lg bg-brand-accent-cyan text-brand-dark font-bold hover:bg-brand-accent-cyan/90 transition-colors">
                                Start Transacting
                            </button>
                        </div>
                    </motion.div>

                    {/* OTC / P2P */}
                    <ComparisonCard
                        title="OTC / P2P Markets"
                        icon={<HandCoins className="w-6 h-6" />}
                        features={[
                            { text: "Instant Settlement", positive: true },
                            { text: "High Scam Risk", positive: false },
                            { text: "No Dispute Resolution", positive: false },
                            { text: "Volatile Pricing", positive: false },
                            { text: "Trust-based limits", positive: false },
                        ]}
                        delay={0.2}
                    />
                </div>
            </div>
        </section>
    );
};

const ComparisonCard = ({ title, icon, features, delay }: { title: string, icon: any, features: any[], delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        viewport={{ once: true }}
        className="p-8 rounded-2xl bg-brand-card/30 border border-white/5 grayscale hover:grayscale-0 transition-all duration-500"
    >
        <div className="flex items-center gap-3 mb-6 opacity-70">
            <div className="p-2 rounded-lg bg-white/5 text-gray-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-200">{title}</h3>
        </div>
        <ul className="space-y-4">
            {features.map((f, i) => (
                <FeatureItem key={i} text={f.text} positive={f.positive} />
            ))}
        </ul>
    </motion.div>
);

const FeatureItem = ({ text, positive, highlight }: { text: string, positive: boolean, highlight?: boolean }) => (
    <li className="flex items-center gap-3">
        {positive ? (
            <div className={`p-0.5 rounded-full ${highlight ? 'bg-brand-accent-cyan text-brand-dark' : 'bg-green-500/20 text-green-500'}`}>
                <Check className="w-3 h-3" strokeWidth={3} />
            </div>
        ) : (
            <div className="p-0.5 rounded-full bg-red-500/20 text-red-500">
                <X className="w-3 h-3" strokeWidth={3} />
            </div>
        )}
        <span className={`${highlight ? 'text-white font-medium' : 'text-gray-400'}`}>{text}</span>
    </li>
);

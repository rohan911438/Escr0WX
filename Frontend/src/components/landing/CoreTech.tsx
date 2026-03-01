import { motion } from "framer-motion";
import { Code2, Coins, Fingerprint, Database } from "lucide-react";

export const CoreTech = () => {
    return (
        <section className="py-24 bg-brand-card relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            <div className="container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-brand-accent-cyan text-sm font-semibold tracking-wider uppercase mb-2 block">Infrastructure</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Designed for Verifiability</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Built on Ethereum primitives for maximum security and composability.
                    </p>
                </motion.div>

                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <FeatureBlock
                        icon={<Code2 className="w-6 h-6" />}
                        title="Smart Contract Escrow"
                        desc="Immutable logic handling fund custody and release conditions."
                    />
                    <FeatureBlock
                        icon={<Coins className="w-6 h-6" />}
                        title="USDC Settlement"
                        desc="Stablecoin integration for reliable value transfer."
                    />
                    <FeatureBlock
                        icon={<Fingerprint className="w-6 h-6" />}
                        title="EIP-712 Signatures"
                        desc="Cryptographically secure authorization for all actions."
                    />
                    <FeatureBlock
                        icon={<Database className="w-6 h-6" />}
                        title="On-Chain Verification"
                        desc="Proof validation executed entirely on public ledger."
                    />
                </motion.div>
            </div>
        </section>
    );
};

const FeatureBlock = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-brand-accent-cyan/50 hover:bg-white/10 transition-all duration-300 group"
    >
        <div className="mb-4 text-gray-400 group-hover:text-brand-accent-cyan transition-colors">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
            {desc}
        </p>
    </motion.div>
);

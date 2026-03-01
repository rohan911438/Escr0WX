import { motion } from "framer-motion";
import { Building2, Globe, Gem, Briefcase, Car, Server } from "lucide-react";

export const UseCases = () => {
    return (
        <section className="py-32 bg-brand-dark relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-accent-purple/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-brand-accent-purple text-sm font-semibold tracking-wider uppercase mb-2 block">
                        Applications
                    </span>
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Secure Any High-Value Asset
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        From digital services to physical real estate, EscrowX provides the trust layer for the new economy.
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
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <UseCaseCard
                        icon={<Gem className="w-8 h-8 text-brand-accent-cyan" />}
                        title="Luxury Goods"
                        desc="Buy and sell watches, jewelry, and art with verified provenance and secure funds."
                    />
                    <UseCaseCard
                        icon={<Building2 className="w-8 h-8 text-brand-accent-purple" />}
                        title="Real Estate"
                        desc="Streamline property transactions with on-chain deposits and milestone-based releases."
                    />
                    <UseCaseCard
                        icon={<Briefcase className="w-8 h-8 text-pink-500" />}
                        title="OTC Crypto Deals"
                        desc="Swap large volumes of tokens privately and securely without slippage."
                    />
                    <UseCaseCard
                        icon={<Car className="w-8 h-8 text-yellow-400" />}
                        title="Vehicle Imports"
                        desc="Secure cross-border vehicle purchases until delivery is verified."
                    />
                    <UseCaseCard
                        icon={<Server className="w-8 h-8 text-green-400" />}
                        title="Digital Services"
                        desc="Escrow for development, auditing, and consulting contracts."
                    />
                    <UseCaseCard
                        icon={<Globe className="w-8 h-8 text-blue-400" />}
                        title="Cross-Border Trade"
                        desc="Eliminate letter of credit friction with instant stablecoin settlement."
                    />
                </motion.div>
            </div>
        </section>
    );
};

const UseCaseCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="group p-8 rounded-2xl bg-brand-card border border-white/5 hover:border-brand-accent-cyan/30 hover:shadow-[0_0_30px_rgba(0,240,255,0.05)] transition-all duration-300 relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent-cyan/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />

        <div className="mb-6 p-3 rounded-lg bg-white/5 w-fit group-hover:bg-brand-accent-cyan/10 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300">
            {desc}
        </p>
    </motion.div>
);

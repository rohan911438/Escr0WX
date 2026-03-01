import { motion } from "framer-motion";

export const Security = () => {
    return (
        <section className="py-32 bg-brand-dark flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-card/0 via-brand-accent-purple/5 to-brand-card/0 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10 max-w-4xl"
            >
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8">
                    Minimal. Composable. <span className="text-brand-accent-cyan">Trustless.</span>
                </h2>

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
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                >
                    <Stat label="Banks" value="0" />
                    <Stat label="Intermediaries" value="0" />
                    <Stat label="Custody Risk" value="0%" />
                    <Stat label="On-Chain" value="100%" />
                </motion.div>
            </motion.div>
        </section>
    );
};

const Stat = ({ label, value }: { label: string, value: string }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, scale: 0.8 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut" } }
        }}
        className="flex flex-col items-center"
    >
        <span className="text-3xl md:text-4xl font-bold text-white mb-2 font-mono">{value}</span>
        <span className="text-sm text-gray-500 uppercase tracking-widest leading-relaxed">{label}</span>
    </motion.div>
);

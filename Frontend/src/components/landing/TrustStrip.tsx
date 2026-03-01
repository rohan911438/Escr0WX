import { motion } from "framer-motion";

export const TrustStrip = () => {
    const features = [
        "Ethereum Native",
        "ERC-20 Compatible",
        "EIP-712 Signatures",
        "Sepolia Ready"
    ];

    return (
        <div className="border-y border-white/5 bg-brand-dark/50 backdrop-blur-sm">
            <div className="container py-8 overflow-hidden">
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 group cursor-default"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent-cyan/50 group-hover:bg-brand-accent-cyan group-hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all" />
                            <span className="text-gray-400 font-medium tracking-wide text-sm uppercase group-hover:text-white transition-colors">{feature}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

import { motion } from "framer-motion";
import { Lock, ShoppingBag, ScrollText } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-brand-dark relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Escrow without Middlemen</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A trustless protocol that guarantees delivery or refunds, powered by cryptographic proofs.
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          <StepCard
            icon={<Lock className="w-8 h-8 text-brand-accent-cyan" />}
            title="Create a Request"
            desc="Lock USDC into escrow for a real-world purchase. Funds are secured on-chain."
            step="01"
          />
          <StepCard
            icon={<ShoppingBag className="w-8 h-8 text-brand-accent-purple" />}
            title="Fulfill the Purchase"
            desc="Anyone can complete the transaction using their preferred payment method."
            step="02"
          />
          <StepCard
            icon={<ScrollText className="w-8 h-8 text-white" />}
            title="Submit Cryptographic Proof"
            desc="On-chain verification unlocks funds automatically. No disputes, no fraud."
            step="03"
          />
        </motion.div>
      </div>
    </section>
  );
};

const StepCard = ({ icon, title, desc, step }: { icon: any, title: string, desc: string, step: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    }}
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
    className="relative group p-8 rounded-2xl bg-brand-card/50 border border-white/5 hover:border-brand-accent-cyan/30 transition-all duration-300"
  >
    <div className="absolute top-8 right-8 text-4xl font-bold text-white/5 font-mono group-hover:text-brand-accent-cyan/10 transition-colors">
      {step}
    </div>
    <div className="mb-6 p-4 rounded-xl bg-white/5 w-fit group-hover:bg-brand-accent-cyan/10 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-accent-cyan transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
      {desc}
    </p>
  </motion.div>
);

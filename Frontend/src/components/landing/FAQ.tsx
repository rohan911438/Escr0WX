import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export const FAQ = () => {
    return (
        <section className="py-24 bg-brand-dark relative">
            <div className="container max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <FAQItem
                            value="item-1"
                            question="Who holds the funds during the transaction?"
                            answer="No one holds your funds. They are locked in a smart contract that neither the buyer, the seller, nor EscrowX can unilaterally access. Funds are only released when the cryptographic conditions of the deal are met."
                        />
                        <FAQItem
                            value="item-2"
                            question="How do you verify physical goods delivery?"
                            answer="We use a combination of third-party oracle networks (like Chainlink) and approved logistics partners. For high-value items, we can require multi-sig approval from a trusted auditor."
                        />
                        <FAQItem
                            value="item-3"
                            question="What happens if there is a dispute?"
                            answer="If a dispute arises (e.g., goods not delivered), the smart contract enters a 'Dispute Mode'. A decentralized court (like Kleros) or a mutually agreed-upon arbitrator reviews the evidence and votes on the fund distribution."
                        />
                        <FAQItem
                            value="item-4"
                            question="Which currencies and chains are supported?"
                            answer="Currently, we support USDC and ETH on Ethereum Sepolia (Testnet). Mainnet launch will support Ethereum, Arbitrum, and Optimism with USDC, USDT, and DAI."
                        />
                        <FAQItem
                            value="item-5"
                            question="Is the smart contract audited?"
                            answer="Yes, our core protocol has been audited by leading security firms. You can view the audit reports in our documentation."
                        />
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
};

const FAQItem = ({ value, question, answer }: { value: string, question: string, answer: string }) => (
    <AccordionItem value={value} className="border border-white/10 bg-brand-card/50 px-6 rounded-xl data-[state=open]:border-brand-accent-cyan/50 transition-colors">
        <AccordionTrigger className="text-lg font-medium text-white hover:text-brand-accent-cyan hover:no-underline text-left">
            {question}
        </AccordionTrigger>
        <AccordionContent className="text-gray-400 leading-relaxed text-base pt-2 pb-6">
            {answer}
        </AccordionContent>
    </AccordionItem>
);

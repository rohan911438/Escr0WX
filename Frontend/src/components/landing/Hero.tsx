import { ArrowRight, ShieldCheck, Lock, FileCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { BackgroundBeams } from "@/components/ui/background-beams";

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-dark px-4 sm:px-6 lg:px-8">
            <BackgroundBeams className="-z-10" />

            <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
                {/* Left Content */}
                <div className="space-y-8 text-center lg:text-left">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.1,
                                    delayChildren: 0.2
                                }
                            }
                        }}
                    >
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
                            <span className="inline-block px-4 py-1.5 rounded-full border border-brand-accent-cyan/30 bg-brand-accent-cyan/10 text-brand-accent-cyan text-sm font-medium mb-6 backdrop-blur-sm">
                                Protocol v2.0 is Live on Sepolia
                            </span>
                        </motion.div>
                        <motion.h1
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6"
                        >
                            Commerce, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent-cyan to-brand-accent-purple">
                                Verified by Code.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-8"
                        >
                            EscrowX enables verifiable crypto-to-physical commerce using Ethereum-native smart contracts and cryptographic proof verification.
                        </motion.p>

                        <motion.div
                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                        >
                            <Button size="lg" className="w-full sm:w-auto bg-brand-accent-cyan hover:bg-brand-accent-cyan/90 text-brand-dark font-bold h-14 px-8 shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all hover:scale-105 rounded-full text-lg">
                                Connect Wallet
                            </Button>
                            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white bg-transparent hover:bg-white/10 h-14 px-8 rounded-full text-lg backdrop-blur-md">
                                Explore How It Works <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Content - Visual Flow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative hidden lg:block"
                >
                    <div className="relative z-10 bg-brand-card/30 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="space-y-0 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[29px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-accent-cyan via-brand-accent-purple to-brand-accent-cyan opacity-30" />

                            <FlowStep
                                icon={<FileCheck className="w-6 h-6 text-brand-accent-cyan" />}
                                title="Create Listing"
                                desc="Define terms & deposit collateral"
                                delay={0}
                            />
                            <FlowStep
                                icon={<Lock className="w-6 h-6 text-brand-accent-purple" />}
                                title="Lock Funds"
                                desc="USDC locked in smart contract"
                                delay={0.2}
                            />
                            <FlowStep
                                icon={<CreditCard className="w-6 h-6 text-white" />}
                                title="Submit Proof"
                                desc="Cryptographic verification of purchase"
                                delay={0.4}
                            />
                            <FlowStep
                                icon={<ShieldCheck className="w-6 h-6 text-green-400" />}
                                title="Release Payment"
                                desc="Funds released instantly"
                                delay={0.6}
                                isLast
                            />
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 bg-brand-card/90 backdrop-blur-md border border-brand-accent-cyan/30 p-4 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                <span className="text-sm font-mono text-green-400 font-bold tracking-wider">AUDITED SCOPE</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const FlowStep = ({ icon, title, desc, delay, isLast }: { icon: any, title: string, desc: string, delay: number, isLast?: boolean }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 + delay }}
        className={`flex items-start gap-6 relative z-10 ${!isLast ? 'mb-8' : ''}`}
    >
        <div className={`p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-lg`}>
            {icon}
        </div>
        <div className="pt-2">
            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-gray-400">{desc}</p>
        </div>
    </motion.div>
);

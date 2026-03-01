import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import { WalletButton } from "@/components/wallet";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const { openModal } = useWallet();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-brand-dark/80 backdrop-blur-md"
        >
            <div className="container px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate("/")}
                    >
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-brand-accent-cyan/20 rounded-xl blur-lg group-hover:bg-brand-accent-cyan/40 transition-all duration-300" />
                            <img src="/logo.svg" alt="EscrowX Logo" className="w-8 h-8 relative z-10" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight group-hover:text-brand-accent-cyan transition-colors">
                            EscrowX
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink onClick={() => navigate("/explore")}>Explore</NavLink>
                        <NavLink onClick={() => navigate("/how-it-works")}>How it Works</NavLink>
                        <NavLink onClick={() => navigate("/developers")}>Developers</NavLink>
                        
                        <WalletButton />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/5 bg-brand-dark"
                    >
                        <div className="p-4 space-y-4">
                            <MobileNavLink onClick={() => { navigate("/explore"); setIsOpen(false); }}>Explore</MobileNavLink>
                            <MobileNavLink onClick={() => { navigate("/how-it-works"); setIsOpen(false); }}>How it Works</MobileNavLink>
                            <MobileNavLink onClick={() => { navigate("/developers"); setIsOpen(false); }}>Developers</MobileNavLink>
                            <div className="pt-4">
                                {isConnected ? (
                                    <Button
                                        onClick={() => { navigate("/dashboard"); setIsOpen(false); }}
                                        className="w-full bg-brand-card border border-brand-accent-cyan/50 text-brand-accent-cyan"
                                    >
                                        Dashboard
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => { openModal(); setIsOpen(false); }}
                                        className="w-full bg-brand-accent-cyan text-brand-dark font-semibold"
                                    >
                                        Connect Wallet
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

const NavLink = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="text-sm font-medium text-gray-400 hover:text-white transition-colors hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
    >
        {children}
    </button>
);

const MobileNavLink = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="block w-full text-left py-2 text-base font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg px-4 transition-colors"
    >
        {children}
    </button>
);

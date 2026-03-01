import { Github, FileText, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-brand-dark py-12">
            <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-brand-accent-cyan" />
                    <span className="text-xl font-bold text-white tracking-tight">EscrowX</span>
                </div>

                <div className="flex items-center gap-8">
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <Github className="w-4 h-4" /> GitHub
                    </a>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Documentation
                    </a>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <Twitter className="w-4 h-4" /> Twitter
                    </a>
                </div>

                <div className="text-sm text-gray-600">
                    Built on Ethereum
                </div>
            </div>
        </footer>
    );
};

import { useWallet } from "@/contexts/WalletContext";
import { WalletButton } from "@/components/wallet";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { openModal } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-foreground">
            Escrow<span className="text-primary">X</span>
          </Link>
          <WalletButton />
        </div>
      </nav>
    );
  }

  const navLinks = [
    { to: "/explore", label: "Explore" },
    { to: "/create", label: "Create" },
    { to: "/my-listings", label: "My Listings" },
    { to: "/my-purchases", label: "My Purchases" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/explore" className="text-xl font-bold tracking-tight text-foreground">
            Escrow<span className="text-primary">X</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button variant="ghost" size="sm" className={location.pathname === link.to ? "text-primary" : "text-muted-foreground"}>
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            Sepolia
          </span>
          <span className="rounded-md bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground border border-white/5">
            {address && shortenAddress(address)}
          </span>
          <WalletButton />
        </div>
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-3">
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">Sepolia</span>
              <span className="rounded-md bg-secondary/50 px-3 py-1 text-xs font-mono text-muted-foreground border border-white/5">
                {address && shortenAddress(address)}
              </span>
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

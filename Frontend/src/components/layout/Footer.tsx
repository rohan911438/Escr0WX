import { Github, Twitter, FileText } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-background">
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Escrow<span className="text-primary">X</span>
          </span>
          <p className="mt-1 text-sm text-muted-foreground">Verifiable Commerce on Ethereum</p>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
            <FileText className="h-5 w-5" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Powered by Ethereum · Built for ETH Global
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

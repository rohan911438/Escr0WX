import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CoreTech } from "@/components/landing/CoreTech";
import { Security } from "@/components/landing/Security";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/Footer";
import { UseCases } from "@/components/landing/UseCases";
import { Comparison } from "@/components/landing/Comparison";
import { FAQ } from "@/components/landing/FAQ";
import { Toaster } from "@/components/ui/toaster";



const Index = () => {
  return (
    <div className="min-h-screen bg-brand-dark overflow-x-hidden selection:bg-brand-accent-cyan/30 selection:text-brand-accent-cyan">
      <Navbar />
      <Hero />
      <TrustStrip />
      <UseCases />
      <HowItWorks />
      <Comparison />
      <CoreTech />
      <Security />
      <FAQ />
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;

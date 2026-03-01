import Navbar from "@/components/layout/Navbar";
import { mockListings } from "@/data/mockData";
import { useParams } from "react-router-dom";
import { ListingInfo } from "@/components/listing/ListingInfo";
import { EscrowTimeline } from "@/components/listing/EscrowTimeline";
import { ActionPanel } from "@/components/listing/ActionPanel";
import { ContractCard } from "@/components/listing/ContractCard";
import { SolanaAuditTrail } from "@/components/listing/SolanaAuditTrail";
import { useWallet } from "@/contexts/WalletContext";

const ListingDetail = () => {
  const { id } = useParams();
  const { address } = useWallet();
  const listing = mockListings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Listing not found</h1>
          <p className="text-muted-foreground mt-2">The listing you are looking for does not exist or has been removed.</p>
        </main>
      </div>
    );
  }

  // Mock checking if the current user is the creator
  // For demo, if address is set, we can toggle roles or just assume logic.
  // To make it testable, let's say if address matches seller (even mock string match) it's creator.
  // Or for now, we can hardcode for demo purposes or use a query param? 
  // Let's use simple logic: if listing.seller starts with "0x1a2b" (first mock listing) and user address is similar?
  // Easier: Just pass a prop or state. In a real app complexity is higher.
  // We'll assume the user is the CREATOR if they are viewing listing "1" or "3" for demo variety, else Fulfiller.
  // Actually, let's just use a simple check against the mock string.
  const isCreator = address ? listing.seller.toLowerCase().includes(address.toLowerCase().slice(0, 4)) : false;
  // This might be too strict for mock data. Let's just default to Fulfiller view unless it's a specific ID for demo.
  // Demo override: ID 1 is Creator View, ID 2 is Fulfiller View.
  const isCreatorView = id === "1" || id === "3" || id === "5";

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 pt-24 pb-16">

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">

          {/* Left Column: Info */}
          <div>
            <ListingInfo listing={listing} />
          </div>

          {/* Right Column: Timeline & Actions */}
          <div className="space-y-6">
            <ActionPanel status={listing.status} isCreator={isCreatorView} listingId={listing.id} />
            <EscrowTimeline status={listing.status} />
            <SolanaAuditTrail listingId={listing.id} />
            <ContractCard />
          </div>

        </div>
      </main>
    </div>
  );
};

export default ListingDetail;

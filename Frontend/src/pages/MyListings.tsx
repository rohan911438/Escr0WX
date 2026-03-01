import Navbar from "@/components/layout/Navbar";
import { mockListings } from "@/data/mockData";
import { StatCard } from "@/components/dashboard/StatCard";
import { ListingsTable } from "@/components/dashboard/ListingsTable";
import { EmptyStateDash } from "@/components/dashboard/EmptyStateDash";
import { useWallet } from "@/contexts/WalletContext";
import { useMemo } from "react";

const MyListings = () => {
  const { address } = useWallet();

  // Simulate filtering for "my" listings. 
  // In a real app, this would query the backend/blockchain for listings created by the connected wallet.
  // For now, we'll just take the even indexed ones as "mine" if connected, or all if just testing logic.
  // Actually, let's use the 'seller' field if it matches, or fallback to evens for demo purposes.
  const myListings = useMemo(() => {
    return mockListings.filter((l, i) => {
      // Mock logic: If address is set, try to match. Otherwise use evens.
      // Since mock data has random addresses, we'll just stick to a subset for demo.
      return i % 2 === 0;
    });
  }, [address]);

  const stats = useMemo(() => {
    const totalLocked = myListings.reduce((acc, curr) => acc + curr.usdcAmount, 0);
    const active = myListings.filter(l => l.status === "active").length;
    const completed = myListings.filter(l => l.status === "completed").length;
    const disputed = myListings.filter(l => l.status === "disputed").length;

    return { totalLocked, active, completed, disputed };
  }, [myListings]);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Escrow Requests</h1>
          <p className="text-sm text-muted-foreground">Track the status of your locked funds.</p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Locked" value={`$${stats.totalLocked.toLocaleString()}`} subValue="USDC" active />
          <StatCard label="Active Listings" value={stats.active.toString()} />
          <StatCard label="Completed" value={stats.completed.toString()} />
          <StatCard label="Disputed" value={stats.disputed.toString()} />
        </div>

        {/* Listings Content */}
        {myListings.length > 0 ? (
          <ListingsTable listings={myListings} />
        ) : (
          <EmptyStateDash />
        )}

      </main>
    </div>
  );
};

export default MyListings;

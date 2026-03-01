import Navbar from "@/components/layout/Navbar";
import { mockListings } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { StatsRow } from "@/components/explore/StatsRow";
import { ListingCard } from "@/components/explore/ListingCard";
import { EmptyState } from "@/components/explore/EmptyState";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExplorePage = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"premium" | "value">("premium");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "in_progress">("all");

  const filteredListings = useMemo(() => {
    let result = [...mockListings];

    // Filter
    if (filterStatus !== "all") {
      if (filterStatus === "open") {
        result = result.filter(l => l.status === "active");
      } else if (filterStatus === "in_progress") {
        result = result.filter(l => ["escrowed", "proof_submitted", "disputed"].includes(l.status));
      }
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "premium") {
        return b.premium - a.premium;
      } else {
        return b.usdcAmount - a.usdcAmount;
      }
    });

    return result;
  }, [filterStatus, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">

        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Open Escrow Requests</h1>
          <p className="text-muted-foreground">
            Fulfill a purchase and earn the locked premium once delivery is verified on-chain.
          </p>
        </div>

        {/* Stats Row */}
        <StatsRow />

        {/* Filters & Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={sortBy} onValueChange={(val: "premium" | "value") => setSortBy(val)}>
              <SelectTrigger className="w-[180px] bg-card/50 border-white/10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Highest Premium %</SelectItem>
                <SelectItem value="value">Highest Value</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 rounded-lg bg-card/50 p-1 border border-white/10">
              <button
                onClick={() => setFilterStatus("all")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${filterStatus === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("open")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${filterStatus === "open" ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground hover:text-foreground"}`}
              >
                Open
              </button>
              <button
                onClick={() => setFilterStatus("in_progress")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${filterStatus === "in_progress" ? "bg-blue-500/20 text-blue-400" : "text-muted-foreground hover:text-foreground"}`}
              >
                In Progress
              </button>
            </div>
          </div>

          <Button onClick={() => navigate("/create")} variant="glow" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Create Request
          </Button>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default ExplorePage;

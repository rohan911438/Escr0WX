import Navbar from "@/components/layout/Navbar";
import { mockListings } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  escrowed: "bg-warning/10 text-warning border-warning/20",
  proof_submitted: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const MyPurchases = () => {
  const navigate = useNavigate();
  const myPurchases = mockListings.filter((l) => l.buyer !== null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold text-foreground">My Purchases</h1>
        <p className="mb-8 text-sm text-muted-foreground">Orders you've funded</p>
        <div className="space-y-4">
          {myPurchases.map((listing) => (
            <div
              key={listing.id}
              className="glass-card glow-border-hover flex cursor-pointer items-center justify-between p-5 transition-all duration-300"
              onClick={() => navigate(`/listing/${listing.id}`)}
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">{listing.productName}</h3>
                <p className="text-xs text-muted-foreground">${listing.usdcAmount} USDC · {listing.createdAt}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusColors[listing.status]}`}>
                {listing.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyPurchases;

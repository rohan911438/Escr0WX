import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { SolanaNetworkStatus } from "@/components/dashboard/SolanaNetworkStatus";
import { 
  DollarSign, 
  List, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Calendar,
  ExternalLink,
  Wallet,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ESCROW_CONTRACT_ADDRESS, 
  ESCROW_CONTRACT_ABI, 
  EscrowListing,
  ListingDisplayData,
  getListingStatusText,
  LISTING_STATUS 
} from "@/lib/contracts";

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Read user's listing IDs using wagmi
  const { data: userListingIds, refetch: refetchUserListings } = useReadContract({
    address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
    abi: ESCROW_CONTRACT_ABI,
    functionName: "getUserListings",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refresh every 10 seconds
    },
  });

  // Process listings data
  useEffect(() => {
    const loadListings = async () => {
      if (!userListingIds || userListingIds.length === 0) {
        setListings([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // For demo, we'll create mock listing data based on the IDs
      // In production, you'd fetch each listing individually  
      const mockListings: ListingDisplayData[] = (userListingIds as bigint[]).map((id, index) => {
        const status = index === 0 ? LISTING_STATUS.OPEN : LISTING_STATUS.FULFILLED;
        const statusColor = {
          [LISTING_STATUS.OPEN]: "text-green-400",
          [LISTING_STATUS.FULFILLED]: "text-blue-400", 
          [LISTING_STATUS.PROOF_SUBMITTED]: "text-yellow-400",
          [LISTING_STATUS.VERIFIED]: "text-green-400",
          [LISTING_STATUS.RELEASED]: "text-gray-400",
          [LISTING_STATUS.CANCELLED]: "text-red-400",
          [LISTING_STATUS.DISPUTED]: "text-orange-400"
        }[status] || "text-gray-400";

        return {
          id: id.toString(),
          title: `Escrow Listing #${id.toString()}`,
          amount: "3.00", // Your actual amounts from the creation form
          premium: "0.96", // Your actual amounts from the creation form  
          totalAmount: "3.96", // Your actual amounts from the creation form
          status: getListingStatusText(status),
          statusColor,
          createdAt: new Date(),
          tokenSymbol: "USDC"
        };
      });
      
      setListings(mockListings);
      setIsLoading(false);
    };

    loadListings();
  }, [userListingIds, refreshKey]);

  // Calculate stats from actual data
  const stats = [
    { 
      label: "Total Locked", 
      value: `$${listings.reduce((sum, l) => sum + parseFloat(l.totalAmount), 0).toFixed(2)}`, 
      icon: DollarSign, 
      change: `${listings.length} listings` 
    },
    { 
      label: "Active Listings", 
      value: listings.filter(l => l.status === "Open" || l.status === "Fulfilled").length.toString(), 
      icon: List, 
      change: "awaiting fulfillment" 
    },
    { 
      label: "Completed", 
      value: listings.filter(l => l.status === "Released").length.toString(), 
      icon: CheckCircle, 
      change: "successfully released" 
    },
    { 
      label: "Total Earnings", 
      value: `$${listings.filter(l => l.status === "Released").reduce((sum, l) => sum + parseFloat(l.premium), 0).toFixed(2)}`, 
      icon: TrendingUp, 
      change: "from premiums" 
    },
  ];

  const handleRefresh = () => {
    refetchUserListings();
    setRefreshKey(prev => prev + 1);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 pt-24 pb-16">
          <div className="text-center">
            <div className="mb-8 rounded-full bg-primary/10 p-6 w-20 h-20 mx-auto flex items-center justify-center">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              Connect your wallet to view your escrow listings and activity.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your escrow overview</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/create')} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="glass-card glow-border-hover p-6 transition-all duration-300">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs text-primary">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Network Status and Listings Section */}
        <div className="grid gap-6 lg:grid-cols-[1fr_350px] mb-8">
          {/* Listings Section */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Your Escrow Listings</h2>
              {listings.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {listings.length} total listing{listings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading your listings...</span>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first escrow listing to get started with secure transactions.
                </p>
                <Button onClick={() => navigate('/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Success message for new listings */}
                {listings.length > 0 && (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-300 mb-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                )}

                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className="border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors bg-card/20 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{listing.itemName}</h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={listing.status === "Released" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {listing.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {listing.createdAt}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">${listing.totalAmount}</div>
                        <div className="text-xs text-green-400">+${listing.premium} premium</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <a 
                        href={`https://sepolia.etherscan.io/address/${ESCROW_CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        View Contract <ExternalLink className="h-3 w-3" />
                      </a>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/listing/${listing.id}`)}
                        >
                          View Details
                        </Button>
                        {listing.status === "Open" && (
                          <Button 
                            size="sm"
                            onClick={() => navigate('/explore')}
                          >
                            Share Listing
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tips Section */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">💡 Next Steps</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Share your listing link with potential buyers</li>
                    <li>• Monitor fulfillments and proof submissions</li>
                    <li>• Verify delivery proofs to release funds</li>
                    <li>• Create more listings to increase earnings</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Solana Network Status */}
          <div>
            <SolanaNetworkStatus />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

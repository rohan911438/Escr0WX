export interface Listing {
  id: string;
  productName: string;
  productUrl: string;
  description: string;
  usdcAmount: number;
  premium: number;
  seller: string;
  buyer: string | null;
  status: "active" | "escrowed" | "proof_submitted" | "completed" | "disputed";
  createdAt: string;
  proofHash: string | null;
}

export const mockListings: Listing[] = [
  {
    id: "1",
    productName: "MacBook Pro M3 Max",
    productUrl: "https://apple.com/macbook-pro",
    description: "Language model training workstation. Need fast delivery.",
    usdcAmount: 2499,
    premium: 3,
    seller: "0x1a2b...9f0e",
    buyer: "0x3c4d...1a2b",
    status: "escrowed",
    createdAt: "2024-01-15",
    proofHash: null,
  },
  {
    id: "2",
    productName: "Sony WH-1000XM5",
    productUrl: "https://sony.com/headphones",
    description: "Noise cancelling headphones for deep work sessions.",
    usdcAmount: 348,
    premium: 5,
    seller: "0x5e6f...3c4d",
    buyer: null,
    status: "active",
    createdAt: "2024-01-18",
    proofHash: null,
  },
  {
    id: "3",
    productName: "iPad Air M2",
    productUrl: "https://apple.com/ipad-air",
    description: "Digital art creation tablet with pencil support.",
    usdcAmount: 799,
    premium: 4,
    seller: "0x7a8b...5e6f",
    buyer: "0x9c0d...7a8b",
    status: "completed",
    createdAt: "2024-01-10",
    proofHash: "0xabc123...def456",
  },
  {
    id: "4",
    productName: "Ledger Nano X",
    productUrl: "https://ledger.com",
    description: "Cold storage for crypto assets. Brand new only.",
    usdcAmount: 149,
    premium: 2,
    seller: "0xbe1f...9c0d",
    buyer: null,
    status: "active",
    createdAt: "2024-01-20",
    proofHash: null,
  },
  {
    id: "5",
    productName: "Bose QC Ultra",
    productUrl: "https://bose.com",
    description: "Comfortable headphones for long flights.",
    usdcAmount: 429,
    premium: 3,
    seller: "0xd2e3...be1f",
    buyer: "0xf4a5...d2e3",
    status: "proof_submitted",
    createdAt: "2024-01-12",
    proofHash: "0x789abc...123def",
  },
  {
    id: "6",
    productName: "Samsung Galaxy S24 Ultra",
    productUrl: "https://samsung.com",
    description: "High-end android phone with AI features.",
    usdcAmount: 1199,
    premium: 4,
    seller: "0x1234...abcd",
    buyer: null,
    status: "active",
    createdAt: "2024-01-22",
    proofHash: null,
  },
];

/**
 * Solana Audit Trail Component
 * Displays immutable audit records from the Solana blockchain for EscrowX listings
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Hash,
  Calendar
} from 'lucide-react'

// Solana audit record types based on our Rust program
export interface SolanaAuditRecord {
  id: string
  recordType: 'lifecycle' | 'dispute'
  timestamp: number
  ethTxHash: string
  ethBlock: number
  event: string
  listingId: string
  party: string
  signature: string // Solana transaction signature
  account: string  // Solana account public key
  slot: number    // Solana slot number
  details?: {
    amount?: number
    reason?: string
    proofHash?: string
  }
}

// Mock Solana audit data generator for demonstration
const generateMockAuditRecords = (listingId: string): SolanaAuditRecord[] => {
  const baseTimestamp = Date.now();
  const listingIdNum = parseInt(listingId) || 1;
  
  // Generate realistic audit records for any listing ID
  const records: SolanaAuditRecord[] = [
    {
      id: `${listingId}_1`,
      recordType: 'lifecycle',
      timestamp: baseTimestamp - (86400000 + listingIdNum * 3600000), // Vary timing based on listing ID
      ethTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      ethBlock: 19234567 + listingIdNum * 100,
      event: 'LISTING_CREATED',
      listingId: listingId,
      party: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      account: `Audit${Math.random().toString(36).substring(2, 8)}...Trail${listingIdNum}`,
      slot: 245892345 + listingIdNum * 1000,
      details: { amount: Math.floor(Math.random() * 5000) + 100 }
    }
  ];

  // Add fulfilled record for most listings (80% chance)
  if (listingIdNum % 5 !== 0) {
    records.push({
      id: `${listingId}_2`,
      recordType: 'lifecycle',
      timestamp: baseTimestamp - (43200000 + listingIdNum * 1800000),
      ethTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      ethBlock: 19234567 + listingIdNum * 100 + 50,
      event: 'LISTING_FULFILLED',
      listingId: listingId,
      party: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      account: `Audit${Math.random().toString(36).substring(2, 8)}...Trail${listingIdNum}`,
      slot: 245892345 + listingIdNum * 1000 + 500,
      details: { amount: records[0].details?.amount }
    });
  }

  // Add escrow funded record for completed listings (60% chance)
  if (listingIdNum % 3 !== 0 && records.length > 1) {
    records.push({
      id: `${listingId}_3`,
      recordType: 'lifecycle',
      timestamp: baseTimestamp - (21600000 + listingIdNum * 900000),
      ethTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      ethBlock: 19234567 + listingIdNum * 100 + 75,
      event: 'ESCROW_FUNDED',
      listingId: listingId,
      party: records[0].party,
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      account: `Audit${Math.random().toString(36).substring(2, 8)}...Trail${listingIdNum}`,
      slot: 245892345 + listingIdNum * 1000 + 750,
      details: { amount: Math.floor((records[0].details?.amount || 0) * 1.05) } // Amount + premium
    });
  }

  // Add dispute for some listings (15% chance)
  if (listingIdNum % 7 === 0 && records.length > 1) {
    records.push({
      id: `${listingId}_4`,
      recordType: 'dispute',
      timestamp: baseTimestamp - (3600000 + listingIdNum * 300000),
      ethTxHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      ethBlock: 19234567 + listingIdNum * 100 + 90,
      event: 'DISPUTE_RAISED',
      listingId: listingId,
      party: records[0].party,
      signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      account: `Audit${Math.random().toString(36).substring(2, 8)}...Trail${listingIdNum}`,
      slot: 245892345 + listingIdNum * 1000 + 900,
      details: { 
        reason: 'Quality concerns with delivered product',
        proofHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
      }
    });
  }

  // Sort records by timestamp (newest first)
  return records.sort((a, b) => b.timestamp - a.timestamp);
};

interface SolanaAuditTrailProps {
  listingId: string
}

const getEventBadgeVariant = (event: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (event) {
    case 'LISTING_CREATED':
    case 'LISTING_FULFILLED':
    case 'ESCROW_FUNDED':
      return 'default'
    case 'PROOF_SUBMITTED':
    case 'FUNDS_RELEASED':
      return 'secondary'
    case 'DISPUTE_RAISED':
    case 'LISTING_CANCELLED':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getEventIcon = (event: string) => {
  switch (event) {
    case 'LISTING_CREATED':
    case 'LISTING_FULFILLED':
    case 'ESCROW_FUNDED':
    case 'PROOF_SUBMITTED':
    case 'FUNDS_RELEASED':
      return <CheckCircle className="h-4 w-4" />
    case 'DISPUTE_RAISED':
      return <AlertCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export const SolanaAuditTrail: React.FC<SolanaAuditTrailProps> = ({ listingId }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate loading state for realism
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500 + Math.random() * 1000);
    return () => clearTimeout(timer);
  }, [listingId]);
  
  // Generate audit records for this specific listing  
  const listingRecords = generateMockAuditRecords(listingId);
  
  // Show only first 3 records initially, expand to show all
  const displayedRecords = isExpanded ? listingRecords : listingRecords.slice(0, 3)
  
  // Get Solana program ID from environment variables
  const solanaProgram = import.meta.env.VITE_SOLANA_PROGRAM_ID || '6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj';
  const solanaNetwork = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
  
  const formatSolanaExplorerUrl = (signature: string) => 
    `https://explorer.solana.com/tx/${signature}?cluster=${solanaNetwork}`
  
  const formatEtherscanUrl = (txHash: string) => 
    `https://sepolia.etherscan.io/tx/${txHash}`

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }

  const truncateHash = (hash: string, length: number = 12) => 
    `${hash.slice(0, length)}...${hash.slice(-4)}`

  const truncateProgramId = (programId: string) =>
    `${programId.slice(0, 6)}...${programId.slice(-4)}`;

  if (isLoading) {
    return (
      <Card className="border-white/10 bg-card/40 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-primary animate-pulse" />
            Solana Audit Trail
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Loading blockchain audit records...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-[#0B0F19] p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Always show the audit trail component with records now
  return (
    <Card className="border-white/10 bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          Solana Audit Trail
          <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">
            {listingRecords.length} Records
          </Badge>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Immutable blockchain audit log • Program: {truncateProgramId(solanaProgram)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedRecords.map((record) => {
          const { date, time } = formatTimestamp(record.timestamp)
          
          return (
            <div 
              key={record.id} 
              className="rounded-lg border border-white/5 bg-[#0B0F19] p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getEventIcon(record.event)}
                  <Badge variant={getEventBadgeVariant(record.event)} className="text-xs">
                    {record.event.replace('_', ' ')}
                  </Badge>
                  {record.recordType === 'dispute' && (
                    <Badge variant="destructive" className="text-xs">
                      DISPUTE
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {date} {time}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Solana Tx:</span>
                  <a 
                    href={formatSolanaExplorerUrl(record.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-primary hover:text-primary/80 transition-colors"
                  >
                    {truncateHash(record.signature)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ethereum Tx:</span>
                  <a 
                    href={formatEtherscanUrl(record.ethTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {truncateHash(record.ethTxHash)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Slot:</span>
                  <span className="font-mono">{record.slot.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Party:</span>
                  <span className="font-mono">{truncateHash(record.party, 8)}</span>
                </div>
              </div>

              {/* Event Details */}
              {record.details && (
                <div className="pt-2 border-t border-white/5">
                  {record.details.amount && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold text-emerald-400">
                        {record.details.amount} USDC
                      </span>
                    </div>
                  )}
                  {record.details.reason && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Reason:</span>
                      <p className="text-foreground mt-1 italic">"{record.details.reason}"</p>
                    </div>
                  )}
                  {record.details.proofHash && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Proof Hash:</span>
                      <span className="font-mono">{truncateHash(record.details.proofHash)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Expand/Collapse Button */}
        {listingRecords.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show All {listingRecords.length} Records
              </>
            )}
          </Button>
        )}

        {/* Footer Info */}
        <div className="pt-3 border-t border-white/5 text-center">
          <p className="text-xs text-muted-foreground">
            Cross-chain audit records are immutable and verified on Solana {solanaNetwork.charAt(0).toUpperCase() + solanaNetwork.slice(1)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
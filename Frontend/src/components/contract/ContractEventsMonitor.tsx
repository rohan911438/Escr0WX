/**
 * Real-time Contract Events Display
 * Shows live events from the EscrowX contract using wagmi event listeners
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Clock, ExternalLink } from 'lucide-react'
import { useWatchContractEvent } from 'wagmi'
import { escrowContractConfig, NETWORK_CONFIG, getListingStatusText } from '@/lib/contracts'
import { formatEther } from 'viem'

interface ContractEvent {
  id: string
  type: 'ListingCreated' | 'ListingFulfilled' | 'ProofSubmitted' | 'FundsReleased' | 'ListingCancelled'
  blockNumber: bigint
  transactionHash: string
  timestamp: Date
  args: any
}

export const ContractEventsMonitor: React.FC = () => {
  const [events, setEvents] = useState<ContractEvent[]>([])
  const [isLive, setIsLive] = useState(true)

  // Helper function to add new event
  const addEvent = (type: ContractEvent['type'], log: any) => {
    const newEvent: ContractEvent = {
      id: `${log.transactionHash}-${log.logIndex}`,
      type,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      timestamp: new Date(),
      args: log.args
    }
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50)) // Keep last 50 events
  }

  // Event listeners using wagmi
  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ListingCreated',
    enabled: isLive,
    onLogs(logs) {
      logs.forEach(log => addEvent('ListingCreated', log))
    },
  })

  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ListingFulfilled',
    enabled: isLive,
    onLogs(logs) {
      logs.forEach(log => addEvent('ListingFulfilled', log))
    },
  })

  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ProofSubmitted',
    enabled: isLive,
    onLogs(logs) {
      logs.forEach(log => addEvent('ProofSubmitted', log))
    },
  })

  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'FundsReleased',
    enabled: isLive,
    onLogs(logs) {
      logs.forEach(log => addEvent('FundsReleased', log))
    },
  })

  useWatchContractEvent({
    ...escrowContractConfig,
    eventName: 'ListingCancelled',
    enabled: isLive,
    onLogs(logs) {
      logs.forEach(log => addEvent('ListingCancelled', log))
    },
  })

  const getEventColor = (type: ContractEvent['type']) => {
    switch (type) {
      case 'ListingCreated': return 'bg-blue-100 text-blue-800'
      case 'ListingFulfilled': return 'bg-green-100 text-green-800'
      case 'ProofSubmitted': return 'bg-yellow-100 text-yellow-800'
      case 'FundsReleased': return 'bg-purple-100 text-purple-800'
      case 'ListingCancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEventDetails = (event: ContractEvent) => {
    switch (event.type) {
      case 'ListingCreated':
        return (
          <div className="space-y-1">
            <p><strong>Listing ID:</strong> {event.args.listingId?.toString()}</p>
            <p><strong>Creator:</strong> {event.args.creator?.slice(0, 10)}...</p>
            <p><strong>Amount:</strong> {event.args.amount ? formatEther(event.args.amount) : 'N/A'} ETH</p>
            <p><strong>Premium:</strong> {event.args.premium ? formatEther(event.args.premium) : 'N/A'} ETH</p>
          </div>
        )
      case 'ListingFulfilled':
        return (
          <div className="space-y-1">
            <p><strong>Listing ID:</strong> {event.args.listingId?.toString()}</p>
            <p><strong>Fulfiller:</strong> {event.args.fulfiller?.slice(0, 10)}...</p>
          </div>
        )
      case 'ProofSubmitted':
        return (
          <div className="space-y-1">
            <p><strong>Listing ID:</strong> {event.args.listingId?.toString()}</p>
            <p><strong>Fulfiller:</strong> {event.args.fulfiller?.slice(0, 10)}...</p>
            <p><strong>Proof Hash:</strong> {event.args.proofHash?.slice(0, 10)}...</p>
          </div>
        )
      case 'FundsReleased':
        return (
          <div className="space-y-1">
            <p><strong>Listing ID:</strong> {event.args.listingId?.toString()}</p>
            <p><strong>Fulfiller:</strong> {event.args.fulfiller?.slice(0, 10)}...</p>
            <p><strong>Amount:</strong> {event.args.amount ? formatEther(event.args.amount) : 'N/A'} ETH</p>
          </div>
        )
      case 'ListingCancelled':
        return (
          <div className="space-y-1">
            <p><strong>Listing ID:</strong> {event.args.listingId?.toString()}</p>
            <p><strong>Creator:</strong> {event.args.creator?.slice(0, 10)}...</p>
            <p><strong>Refund:</strong> {event.args.refundAmount ? formatEther(event.args.refundAmount) : 'N/A'} ETH</p>
          </div>
        )
      default:
        return <p>Event details not available</p>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Contract Events
          </CardTitle>
          <CardDescription>
            Real-time events from the EscrowX smart contract on Sepolia
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-muted-foreground">
              {isLive ? 'Live' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-sm px-3 py-1 bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2" />
            <p>No events yet. Activity will appear here as it happens.</p>
            <p className="text-sm mt-1">Try creating a listing to see events!</p>
          </div>
        ) : (
          <ScrollArea className="h-96 w-full">
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getEventColor(event.type)} variant="secondary">
                        {event.type}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                    <a
                      href={`${NETWORK_CONFIG.blockExplorer}/tx/${event.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      View TX <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <div className="text-sm">
                    {formatEventDetails(event)}
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Block: {event.blockNumber.toString()} • TX: {event.transactionHash.slice(0, 10)}...
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

export default ContractEventsMonitor
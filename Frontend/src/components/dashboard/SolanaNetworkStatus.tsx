/**
 * Solana Network Status Component
 * Shows connection status and basic metrics for the Solana audit system
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  ExternalLink, 
  Circle,
  RefreshCw,
  Activity
} from 'lucide-react'

interface SolanaNetworkStatusProps {
  className?: string
}

// Solana configuration from environment variables
const solanaConfig = {
  network: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  programId: import.meta.env.VITE_SOLANA_PROGRAM_ID || '6v2iemgJm3wqRmL36frHKAMNRMwjg5NdgjTjmtfamfvj',
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
};

// Mock Solana network status for demonstration
const mockSolanaStatus = {
  connected: true,
  network: solanaConfig.network,
  programId: solanaConfig.programId,
  totalRecords: 1247,
  currentSlot: 245895678,
  lastUpdateTime: Date.now() - 5000, // 5 seconds ago
  health: 'operational' as 'operational' | 'degraded' | 'down'
}

export const SolanaNetworkStatus: React.FC<SolanaNetworkStatusProps> = ({ className = "" }) => {
  const formatExplorerUrl = (programId: string) => 
    `https://explorer.solana.com/address/${programId}?cluster=${solanaConfig.network}`

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'operational':
        return 'text-emerald-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'down':
        return 'text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'operational':
        return <Badge variant="default" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/20">Operational</Badge>
      case 'degraded':
        return <Badge variant="destructive" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/20">Degraded</Badge>
      case 'down':
        return <Badge variant="destructive" className="text-xs">Down</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <Card className={`border-white/10 bg-card/40 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-primary" />
          Solana Audit System
          {getHealthBadge(mockSolanaStatus.health)}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Cross-chain audit ledger status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Network Status */}
        <div className="grid gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Circle className={`h-2 w-2 fill-current ${mockSolanaStatus.connected ? 'text-emerald-400' : 'text-red-400'}`} />
              Network:
            </span>
            <Badge variant="outline" className="text-xs capitalize">
              {mockSolanaStatus.network}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Program ID:</span>
            <a 
              href={formatExplorerUrl(mockSolanaStatus.programId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-primary hover:text-primary/80 transition-colors text-xs"
            >
              {mockSolanaStatus.programId.slice(0, 8)}...{mockSolanaStatus.programId.slice(-4)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Current Slot:</span>
            <span className="font-mono">{mockSolanaStatus.currentSlot.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Records:</span>
            <span className="font-semibold text-emerald-400">
              {mockSolanaStatus.totalRecords.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="text-xs">
              {Math.floor((Date.now() - mockSolanaStatus.lastUpdateTime) / 1000)}s ago
            </span>
          </div>
        </div>

        {/* Health Status */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${getHealthColor(mockSolanaStatus.health)}`} />
              <span className="text-xs font-medium">System Health</span>
            </div>
            <span className={`text-xs font-semibold capitalize ${getHealthColor(mockSolanaStatus.health)}`}>
              {mockSolanaStatus.health}
            </span>
          </div>
        </div>

        {/* Refresh Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-xs"
          onClick={() => {
            // In a real implementation, this would refresh the Solana status
            console.log('Refreshing Solana status...')
          }}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh Status
        </Button>

        {/* Info Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Immutable audit records powered by Solana
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
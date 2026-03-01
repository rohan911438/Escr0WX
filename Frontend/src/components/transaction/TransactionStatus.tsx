/**
 * Transaction Status Component
 * Provides UI feedback for transaction states with proper loading and error handling
 */

import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Loader2,
  AlertCircle 
} from 'lucide-react'
import { NETWORK_CONFIG } from '@/lib/contracts'

export interface TransactionStatusProps {
  hash?: `0x${string}`
  isPending?: boolean
  isConfirming?: boolean
  isConfirmed?: boolean
  isError?: boolean
  error?: Error | null
  onRetry?: () => void
  confirmationTarget?: number
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({
  hash,
  isPending,
  isConfirming,
  isConfirmed,
  isError,
  error,
  onRetry,
  confirmationTarget = 1
}) => {
  // Don't render anything if no transaction state
  if (!isPending && !isConfirming && !isConfirmed && !isError) {
    return null
  }

  const getStatusConfig = () => {
    if (isError) {
      return {
        color: 'destructive' as const,
        icon: XCircle,
        title: 'Transaction Failed',
        description: error?.message || 'Transaction was rejected or failed',
        progress: 0
      }
    }
    
    if (isConfirmed) {
      return {
        color: 'default' as const,
        icon: CheckCircle,
        title: 'Transaction Confirmed',
        description: 'Your transaction has been successfully confirmed on the blockchain',
        progress: 100
      }
    }
    
    if (isConfirming) {
      return {
        color: 'default' as const,
        icon: Clock,
        title: 'Confirming Transaction',
        description: `Waiting for ${confirmationTarget} block confirmation${confirmationTarget > 1 ? 's' : ''}...`,
        progress: 75
      }
    }
    
    if (isPending) {
      return {
        color: 'default' as const,
        icon: Loader2,
        title: 'Transaction Pending',
        description: 'Please confirm the transaction in your wallet',
        progress: 25
      }
    }
    
    return {
      color: 'default' as const,
      icon: AlertCircle,
      title: 'Unknown Status',
      description: 'Unknown transaction status',
      progress: 0
    }
  }

  const status = getStatusConfig()
  const Icon = status.icon

  return (
    <Alert className={status.color === 'destructive' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {isPending || isConfirming ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Icon className={`h-4 w-4 ${
              isError ? 'text-red-600' : 
              isConfirmed ? 'text-green-600' : 
              'text-blue-600'
            }`} />
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <strong className="text-sm font-medium">{status.title}</strong>
              {hash && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {hash.slice(0, 10)}...
                </Badge>
              )}
            </div>
            
            {isError && onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="text-xs h-7"
              >
                Retry
              </Button>
            )}
          </div>
          
          <AlertDescription className="text-sm">
            {status.description}
          </AlertDescription>
          
          {/* Progress indicator */}
          {(isPending || isConfirming) && (
            <div className="space-y-1">
              <Progress value={status.progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {isPending && 'Wallet Confirmation'}
                  {isConfirming && 'Blockchain Confirmation'}
                </span>
                <span>{status.progress}%</span>
              </div>
            </div>
          )}
          
          {/* Transaction hash link */}
          {hash && (
            <div className="flex items-center space-x-2">
              <a
                href={`${NETWORK_CONFIG.blockExplorer}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:underline"
              >
                View on {NETWORK_CONFIG.name} Explorer <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </Alert>
  )
}

/**
 * Transaction Button Component
 * Button that shows different states during transaction lifecycle
 */
interface TransactionButtonProps {
  onClick: () => void
  isPending?: boolean
  isConfirming?: boolean
  isConfirmed?: boolean
  isError?: boolean
  disabled?: boolean
  children: React.ReactNode
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export const TransactionButton: React.FC<TransactionButtonProps> = ({
  onClick,
  isPending,
  isConfirming,
  isConfirmed,
  isError,
  disabled,
  children,
  size = 'default',
  variant = 'default'
}) => {
  const getButtonState = () => {
    if (isPending) {
      return {
        text: 'Confirm in Wallet',
        icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" />,
        disabled: true
      }
    }
    
    if (isConfirming) {
      return {
        text: 'Confirming...',
        icon: <Clock className="mr-2 h-4 w-4" />,
        disabled: true
      }
    }
    
    if (isConfirmed) {
      return {
        text: 'Confirmed ✓',
        icon: <CheckCircle className="mr-2 h-4 w-4" />,
        disabled: false
      }
    }
    
    if (isError) {
      return {
        text: 'Retry Transaction',
        icon: <XCircle className="mr-2 h-4 w-4" />,
        disabled: false
      }
    }
    
    return {
      text: children,
      icon: null,
      disabled: disabled
    }
  }

  const buttonState = getButtonState()

  return (
    <Button
      onClick={onClick}
      disabled={buttonState.disabled}
      size={size}
      variant={isError ? 'destructive' : variant}
      className={isConfirmed ? 'bg-green-600 hover:bg-green-700' : ''}
    >
      {buttonState.icon}
      {buttonState.text}
    </Button>
  )
}

/**
 * Optimistic UI Helper Hook
 * Manages optimistic updates that revert on transaction failure
 */
export const useOptimisticUpdate = <T,>(
  initialValue: T,
  onConfirmed?: (value: T) => void
) => {
  const [optimisticValue, setOptimisticValue] = React.useState<T>(initialValue)
  const [isOptimistic, setIsOptimistic] = React.useState(false)

  const setOptimistic = (newValue: T) => {
    setOptimisticValue(newValue)
    setIsOptimistic(true)
  }

  const confirmUpdate = () => {
    setIsOptimistic(false)
    if (onConfirmed) {
      onConfirmed(optimisticValue)
    }
  }

  const revertUpdate = () => {
    setOptimisticValue(initialValue)
    setIsOptimistic(false)
  }

  return {
    value: optimisticValue,
    isOptimistic,
    setOptimistic,
    confirmUpdate,
    revertUpdate
  }
}

export default TransactionStatus
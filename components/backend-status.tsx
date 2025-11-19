"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface BackendStatus {
  status: 'healthy' | 'error' | 'loading'
  message: string
  lastChecked?: Date
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    status: 'loading',
    message: 'Checking backend status...'
  })

  const checkBackendHealth = async () => {
    setStatus({ status: 'loading', message: 'Checking backend status...' })
    
    try {
      const response = await apiClient.healthCheck()
      setStatus({
        status: 'healthy',
        message: response.message,
        lastChecked: new Date()
      })
    } catch (error) {
      setStatus({
        status: 'error',
        message: 'Backend is not responding. Make sure the Python server is running on port 5000.',
        lastChecked: new Date()
      })
    }
  }

  useEffect(() => {
    checkBackendHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status.status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'loading':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (status.status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Disconnected</Badge>
      case 'loading':
        return <Badge variant="outline">Connecting...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Backend Status</span>
          </div>
          {getStatusBadge()}
        </div>
        
        <p className="text-sm text-muted-foreground mb-3">{status.message}</p>
        
        {status.lastChecked && (
          <p className="text-xs text-muted-foreground mb-3">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </p>
        )}
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkBackendHealth}
            disabled={status.status === 'loading'}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${status.status === 'loading' ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {status.status === 'error' && (
            <Button 
              size="sm" 
              variant="default"
              onClick={() => window.open('http://localhost:5000/health', '_blank')}
            >
              Open Backend
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BackendStatus } from "@/components/backend-status"
import { apiClient } from "@/lib/api-client"
import { authApiClient } from "@/lib/auth-client"

export default function DebugPage() {
  const [tests, setTests] = useState({
    backend: { status: 'pending', message: 'Not tested' },
    database: { status: 'pending', message: 'Not tested' },
    auth: { status: 'pending', message: 'Not tested' }
  })

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status: 'running', message: 'Testing...' }
    }))

    try {
      const result = await testFn()
      setTests(prev => ({
        ...prev,
        [testName]: { status: 'success', message: result.message || 'Test passed' }
      }))
    } catch (error: any) {
      setTests(prev => ({
        ...prev,
        [testName]: { status: 'error', message: error.message || 'Test failed' }
      }))
    }
  }

  const testBackend = () => runTest('backend', async () => {
    const result = await apiClient.healthCheck()
    return { message: `Backend healthy: ${result.message}` }
  })

  const testDatabase = () => runTest('database', async () => {
    const response = await fetch('/api/test-db')
    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error)
    }
    return { message: 'Database connection successful' }
  })

  const testAuth = () => runTest('auth', async () => {
    // Test if auth endpoints are working
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    // Should return 401 for invalid token - this means auth is working
    if (response.status === 401) {
      return { message: 'Auth endpoints are working (401 for invalid token)' }
    } else {
      throw new Error('Auth endpoint not working as expected')
    }
  })

  const runAllTests = async () => {
    await testBackend()
    await testDatabase()
    await testAuth()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">✓ Pass</Badge>
      case 'error':
        return <Badge variant="destructive">✗ Fail</Badge>
      case 'running':
        return <Badge variant="secondary">⏳ Running</Badge>
      default:
        return <Badge variant="outline">⚪ Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">System Debug Dashboard</h1>
        
        {/* Backend Status */}
        <div className="mb-6">
          <BackendStatus />
        </div>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Button onClick={runAllTests}>Run All Tests</Button>
              <Button onClick={testBackend} variant="outline">Test Backend</Button>
              <Button onClick={testDatabase} variant="outline">Test Database</Button>
              <Button onClick={testAuth} variant="outline">Test Auth</Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">Backend Connection</h3>
                  <p className="text-sm text-gray-600">{tests.backend.message}</p>
                </div>
                {getStatusBadge(tests.backend.status)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">Database Connection</h3>
                  <p className="text-sm text-gray-600">{tests.database.message}</p>
                </div>
                {getStatusBadge(tests.database.status)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">Authentication System</h3>
                  <p className="text-sm text-gray-600">{tests.auth.message}</p>
                </div>
                {getStatusBadge(tests.auth.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Backend URL:</span>
                <code>{process.env.NEXT_PUBLIC_API_BASE_URL || 'Not set'}</code>
              </div>
              <div className="flex justify-between">
                <span>Auth Bypass:</span>
                <code>{process.env.NEXT_PUBLIC_BYPASS_AUTH || 'false'}</code>
              </div>
              <div className="flex justify-between">
                <span>Node Environment:</span>
                <code>{process.env.NODE_ENV}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

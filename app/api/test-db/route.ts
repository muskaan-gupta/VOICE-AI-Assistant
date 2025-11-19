import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await connectToDatabase()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      mongodb_uri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    })
    
  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      mongodb_uri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 })
  }
}

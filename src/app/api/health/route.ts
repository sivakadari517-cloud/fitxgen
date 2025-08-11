import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    await connectToDatabase()
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping()
    }
    
    // Check environment variables
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'MONGODB_URI',
      'CLAUDE_API_KEY',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        missing: missingEnvVars,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }
    
    // All checks passed
    return NextResponse.json({
      status: 'healthy',
      message: 'FitXGen API is running correctly',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        mongodb: 'operational',
        claude_api: 'configured',
        razorpay: 'configured',
        nextauth: 'configured'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Handle HEAD requests for monitoring systems
export async function HEAD(request: NextRequest) {
  try {
    await connectToDatabase()
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping()
    }
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}
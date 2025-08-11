import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

// Performance metrics schema
const PerformanceMetricSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String },
  name: { type: String, required: true, index: true },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  url: { type: String, required: true },
  userAgent: { type: String, required: true },
  deviceInfo: {
    isMobile: { type: Boolean },
    connectionType: { type: String },
    isLowEndDevice: { type: Boolean },
    memoryGB: { type: Number },
    cores: { type: Number }
  },
  metadata: {
    viewport: {
      width: { type: Number },
      height: { type: Number }
    },
    screenSize: {
      width: { type: Number },
      height: { type: Number }
    },
    buildVersion: { type: String }
  }
}, {
  timestamps: true,
  // TTL index for automatic cleanup after 30 days
  expireAfterSeconds: 30 * 24 * 60 * 60
})

// Indexes for efficient querying
PerformanceMetricSchema.index({ name: 1, timestamp: -1 })
PerformanceMetricSchema.index({ userId: 1, timestamp: -1 })
PerformanceMetricSchema.index({ sessionId: 1 })
PerformanceMetricSchema.index({ 'deviceInfo.isMobile': 1 })
PerformanceMetricSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 }) // 30 days

const PerformanceMetric = mongoose.models.PerformanceMetric || 
  mongoose.model('PerformanceMetric', PerformanceMetricSchema)

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(identifier, { count: 1, resetTime: now + 60000 }) // 1 minute window
    return false
  }
  
  if (limit.count >= 100) { // Max 100 requests per minute
    return true
  }
  
  limit.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, value, timestamp, url, userAgent, sessionId } = body
    if (!name || typeof value !== 'number' || !url || !userAgent || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Rate limiting by session ID
    if (isRateLimited(sessionId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Validate metric name
    const validMetrics = [
      'fcp', 'lcp', 'fid', 'cls', 'tti', 'ttfb',
      'navigation-start', 'dom-content-loaded', 'load-complete',
      'slow-resource', 'api-response-time', 'bundle-size'
    ]
    
    if (!validMetrics.some(metric => name.startsWith(metric))) {
      return NextResponse.json(
        { error: 'Invalid metric name' },
        { status: 400 }
      )
    }

    // Validate value ranges
    if (value < 0 || value > 60000) { // Max 60 seconds
      return NextResponse.json(
        { error: 'Invalid metric value' },
        { status: 400 }
      )
    }

    // Get session info (simplified for analytics)
    const session = null // Will implement proper auth checking if needed
    
    // Connect to database
    await connectToDatabase()

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(userAgent)

    // Create performance metric
    const metric = new PerformanceMetric({
      sessionId,
      userId: null, // Will be populated when proper auth is implemented
      name,
      value,
      timestamp: new Date(timestamp || Date.now()),
      url,
      userAgent,
      deviceInfo,
      metadata: {
        viewport: body.viewport || {},
        screenSize: body.screenSize || {},
        buildVersion: process.env.npm_package_version || '1.0.0'
      }
    })

    await metric.save()

    // Analytics processing (async, don't wait)
    processMetricAsync(metric).catch(console.error)

    return NextResponse.json({ success: true }, { status: 201 })

  } catch (error) {
    console.error('Performance analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // For now, allow analytics viewing (in production, add proper auth)
    const isAnalyticsEnabled = process.env.NODE_ENV === 'development' ||
                              request.headers.get('x-admin-key') === process.env.ADMIN_API_KEY
    
    if (!isAnalyticsEnabled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '24h'
    const metricName = searchParams.get('metric')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    await connectToDatabase()

    // Calculate time range
    const now = new Date()
    let startTime = new Date()
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1)
        break
      case '24h':
        startTime.setDate(now.getDate() - 1)
        break
      case '7d':
        startTime.setDate(now.getDate() - 7)
        break
      case '30d':
        startTime.setDate(now.getDate() - 30)
        break
      default:
        startTime.setDate(now.getDate() - 1)
    }

    // Build query
    const query: any = {
      timestamp: { $gte: startTime, $lte: now }
    }

    if (metricName) {
      query.name = metricName
    }

    // Get metrics with pagination
    const metrics = await PerformanceMetric.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get aggregated data (simplified without percentiles for compatibility)
    const aggregation = await PerformanceMetric.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          values: { $push: '$value' }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Calculate percentiles manually
    const processedAggregation = aggregation.map((item: any) => {
      const sortedValues = item.values.sort((a: number, b: number) => a - b)
      const count = sortedValues.length
      
      return {
        _id: item._id,
        count: item.count,
        avgValue: item.avgValue,
        minValue: item.minValue,
        maxValue: item.maxValue,
        p50: count > 0 ? sortedValues[Math.floor(count * 0.5)] : 0,
        p95: count > 0 ? sortedValues[Math.floor(count * 0.95)] : 0,
        p99: count > 0 ? sortedValues[Math.floor(count * 0.99)] : 0
      }
    })

    // Device breakdown
    const deviceBreakdown = await PerformanceMetric.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            isMobile: '$deviceInfo.isMobile',
            connectionType: '$deviceInfo.connectionType'
          },
          count: { $sum: 1 },
          avgFCP: {
            $avg: {
              $cond: [{ $eq: ['$name', 'fcp'] }, '$value', null]
            }
          },
          avgLCP: {
            $avg: {
              $cond: [{ $eq: ['$name', 'lcp'] }, '$value', null]
            }
          }
        }
      }
    ])

    return NextResponse.json({
      metrics,
      aggregation: processedAggregation,
      deviceBreakdown,
      pagination: {
        page,
        limit,
        hasMore: metrics.length === limit
      }
    })

  } catch (error) {
    console.error('Performance analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
  const isTablet = /iPad|Tablet/.test(userAgent)
  
  // Simple connection detection (would use navigator.connection in client)
  let connectionType = 'unknown'
  if (userAgent.includes('Mobile')) {
    connectionType = '4g' // Assume mobile is 4g
  }

  // Memory estimation based on device type
  let memoryGB = 4 // Default assumption
  if (userAgent.includes('iPhone')) {
    if (userAgent.includes('iPhone SE')) memoryGB = 3
    else if (userAgent.includes('iPhone 15')) memoryGB = 8
    else memoryGB = 6
  } else if (userAgent.includes('Android')) {
    memoryGB = isMobile ? 4 : 8
  }

  return {
    isMobile,
    isTablet,
    connectionType,
    isLowEndDevice: memoryGB <= 3,
    memoryGB,
    cores: isMobile ? 4 : 8 // Estimation
  }
}

async function processMetricAsync(metric: any) {
  // Process metrics for real-time alerts
  if (metric.name === 'lcp' && metric.value > 4000) {
    console.warn(`Poor LCP detected: ${metric.value}ms on ${metric.url}`)
    // Could send to monitoring service
  }

  if (metric.name === 'fcp' && metric.value > 3000) {
    console.warn(`Slow FCP detected: ${metric.value}ms on ${metric.url}`)
  }

  if (metric.name === 'cls' && metric.value > 0.25) {
    console.warn(`High CLS detected: ${metric.value} on ${metric.url}`)
  }

  // Aggregate real-time statistics
  // In production, this would update a real-time dashboard
}
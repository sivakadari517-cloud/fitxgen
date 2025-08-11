import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

// Analytics event schema
const AnalyticsEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  action: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  label: { type: String },
  value: { type: Number },
  timestamp: { type: Date, default: Date.now, index: true },
  page: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  
  // Conversion tracking fields
  conversionType: { 
    type: String,
    enum: ['registration', 'payment', 'calculation', 'referral', 'engagement', 'retention'],
    index: true
  },
  revenue: { type: Number },
  currency: { type: String, default: 'INR' },
  transactionId: { type: String, index: true },
  source: { type: String },
  medium: { type: String },
  campaign: { type: String },
  
  // User journey data
  userJourney: {
    startTime: { type: Number },
    lastActivity: { type: Number },
    referrer: { type: String },
    landingPage: { type: String },
    deviceInfo: {
      isMobile: { type: Boolean },
      browser: { type: String },
      os: { type: String },
      screenResolution: { type: String }
    },
    eventCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  // TTL index for automatic cleanup after 90 days
  expireAfterSeconds: 90 * 24 * 60 * 60
})

// Compound indexes for efficient querying
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 })
AnalyticsEventSchema.index({ sessionId: 1, timestamp: 1 })
AnalyticsEventSchema.index({ conversionType: 1, timestamp: -1 })
AnalyticsEventSchema.index({ category: 1, action: 1, timestamp: -1 })
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }) // 90 days

const AnalyticsEvent = mongoose.models.AnalyticsEvent || 
  mongoose.model('AnalyticsEvent', AnalyticsEventSchema)

// Rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(identifier: string, limit: number = 200): boolean {
  const now = Date.now()
  const windowMs = 60000 // 1 minute
  
  const existing = rateLimitMap.get(identifier)
  
  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return false
  }
  
  if (existing.count >= limit) {
    return true
  }
  
  existing.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    const { 
      sessionId, 
      action, 
      category, 
      timestamp, 
      page 
    } = body

    if (!sessionId || !action || !category || !page) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Rate limiting by session ID
    if (checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Process the event
    const event = new AnalyticsEvent({
      ...body,
      timestamp: new Date(timestamp || Date.now())
    })

    await event.save()

    // Process real-time analytics (async)
    processRealTimeAnalytics(event).catch(console.error)

    return NextResponse.json({ success: true }, { status: 201 })

  } catch (error) {
    console.error('Analytics event error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const action = searchParams.get('action')
    const conversionType = searchParams.get('conversionType')
    const timeRange = searchParams.get('range') || '24h'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)

    await connectToDatabase()

    // Build query
    const query: any = {}
    
    if (sessionId) query.sessionId = sessionId
    if (userId) query.userId = userId
    if (category) query.category = category
    if (action) query.action = action
    if (conversionType) query.conversionType = conversionType

    // Time range filter
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
      case '90d':
        startTime.setDate(now.getDate() - 90)
        break
      default:
        startTime.setDate(now.getDate() - 1)
    }

    query.timestamp = { $gte: startTime, $lte: now }

    // Get events with pagination
    const events = await AnalyticsEvent.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get summary statistics
    const stats = await AnalyticsEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' },
          uniqueUsers: { $addToSet: '$userId' },
          totalRevenue: { 
            $sum: { 
              $cond: [{ $ne: ['$revenue', null] }, '$revenue', 0] 
            } 
          },
          avgValue: { $avg: '$value' }
        }
      }
    ])

    // Get conversion funnel
    const conversionFunnel = await AnalyticsEvent.aggregate([
      { $match: { ...query, conversionType: { $ne: null } } },
      {
        $group: {
          _id: '$conversionType',
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Get top pages
    const topPages = await AnalyticsEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$page',
          events: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      { $sort: { events: -1 } },
      { $limit: 10 }
    ])

    return NextResponse.json({
      events,
      stats: stats[0] || { totalEvents: 0, uniqueSessions: [], uniqueUsers: [], totalRevenue: 0, avgValue: 0 },
      conversionFunnel,
      topPages,
      pagination: {
        page,
        limit,
        hasMore: events.length === limit
      }
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Process real-time analytics and alerts
async function processRealTimeAnalytics(event: any) {
  try {
    // Check for conversion events
    if (event.conversionType) {
      console.log(`🎉 Conversion: ${event.conversionType} - ${event.action}`)
      
      // Alert for high-value conversions
      if (event.conversionType === 'payment' && event.revenue > 0) {
        console.log(`💰 Payment conversion: ₹${event.revenue}`)
      }

      // Track referral success
      if (event.conversionType === 'referral') {
        console.log(`👥 Referral conversion from: ${event.metadata?.referrerUserId}`)
      }
    }

    // Check for engagement milestones
    if (event.category === 'engagement') {
      const sessionEvents = await AnalyticsEvent.countDocuments({
        sessionId: event.sessionId
      })

      // Milestone tracking
      if (sessionEvents === 5) {
        console.log(`🎯 User highly engaged: ${event.sessionId}`)
      }
    }

    // Check for potential issues
    if (event.action === 'form_submit_error') {
      console.warn(`⚠️ Form error on ${event.page}: ${event.metadata?.errors}`)
    }

    // Performance alerts
    if (event.category === 'performance' && event.value > 5000) {
      console.warn(`🐌 Slow performance on ${event.page}: ${event.value}ms`)
    }

  } catch (error) {
    console.error('Real-time analytics processing error:', error)
  }
}

// Batch processing for aggregated analytics
export async function PATCH(request: NextRequest) {
  try {
    // This endpoint would be called by a cron job for batch processing
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation')

    await connectToDatabase()

    switch (operation) {
      case 'daily_aggregation':
        await generateDailyAggregation()
        break
      case 'cleanup':
        await cleanupOldEvents()
        break
      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Batch processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Generate daily aggregation
async function generateDailyAggregation() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  const today = new Date(yesterday)
  today.setDate(today.getDate() + 1)

  const aggregation = await AnalyticsEvent.aggregate([
    {
      $match: {
        timestamp: { $gte: yesterday, $lt: today }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          category: '$category',
          action: '$action'
        },
        count: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
        uniqueUsers: { $addToSet: '$userId' },
        totalRevenue: { $sum: '$revenue' },
        avgValue: { $avg: '$value' }
      }
    }
  ])

  // Save aggregation results (would typically go to a separate collection)
  console.log(`Generated ${aggregation.length} daily aggregation records`)
}

// Cleanup old events
async function cleanupOldEvents() {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 90) // Keep 90 days

  const result = await AnalyticsEvent.deleteMany({
    timestamp: { $lt: cutoffDate }
  })

  console.log(`Cleaned up ${result.deletedCount} old analytics events`)
}
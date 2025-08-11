import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import User from '@/models/User'
import Feedback from '@/models/Feedback'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      type,
      category,
      rating,
      title,
      message,
      metadata,
      isPublic = false
    } = await request.json()

    // Validate required fields
    if (!type || !category || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'Type, category, title, and message are required' },
        { status: 400 }
      )
    }

    // Validate rating for rating type
    if (type === 'rating' && (!rating || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5 for rating feedback' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate usage duration
    const usageDuration = user.createdAt 
      ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Get device/browser info from headers
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'desktop'
    const browser = getBrowserInfo(userAgent)

    // Create feedback document
    const feedback = new Feedback({
      userId: user._id,
      type,
      category,
      rating: type === 'rating' ? rating : undefined,
      title: title.trim(),
      message: message.trim(),
      userInfo: {
        name: user.profile?.name || user.name || 'Anonymous',
        email: user.email,
        subscriptionStatus: user.subscription?.status || 'inactive',
        usageDuration
      },
      metadata: {
        ...metadata,
        device,
        browser,
        version: '1.0.0' // You would get this from your app version
      },
      isPublic: type === 'testimonial' ? isPublic : false,
      status: 'new',
      tags: [],
      priority: 'medium'
    })

    await feedback.save()

    // Handle special cases
    if (type === 'rating' && rating <= 2) {
      // Low rating - might want to trigger special follow-up
      console.log(`Low rating received: ${rating} stars from ${user.email}`)
    }

    if (type === 'bug_report') {
      // Bug report - might want to notify development team immediately
      console.log(`Bug report received from ${user.email}: ${title}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id,
      estimatedResponse: getEstimatedResponseTime(type, rating)
    })

  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const publicOnly = searchParams.get('public') === 'true'

    await connectMongoDB()

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    let query: any = {}

    if (publicOnly) {
      // Public feedback (testimonials, etc.)
      query = { 
        isPublic: true, 
        isVerified: true,
        type: { $in: ['testimonial', 'rating'] }
      }
    } else {
      // User's own feedback
      query.userId = user._id
    }

    if (type) {
      query.type = type
    }

    const skip = (page - 1) * limit

    const [feedback, totalCount] = await Promise.all([
      Feedback.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select(publicOnly 
          ? 'type title message rating userInfo.name createdAt isVerified helpfulCount'
          : '-userId -userInfo.email -adminNotes'
        ),
      Feedback.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// Helper function to extract browser info
function getBrowserInfo(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown'
}

// Helper function to estimate response time
function getEstimatedResponseTime(type: string, rating?: number): string {
  if (type === 'bug_report') return 'Within 24 hours'
  if (type === 'rating' && rating && rating <= 2) return 'Within 48 hours'
  if (type === 'testimonial') return 'We appreciate your feedback!'
  return 'Within 3-5 business days'
}
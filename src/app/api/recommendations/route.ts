import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    // Find user with stored recommendations
    const user = await User.findOne({ email: session.user.email })
      .select('recommendations')
      .lean() as any

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      recommendations: user.recommendations || null,
      hasRecommendations: !!user.recommendations
    })

  } catch (error) {
    console.error('Get recommendations error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    // Clear user recommendations
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $unset: { recommendations: 1 } }
    )

    return NextResponse.json({
      success: true,
      message: 'Recommendations cleared successfully'
    })

  } catch (error) {
    console.error('Clear recommendations error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to clear recommendations' },
      { status: 500 }
    )
  }
}
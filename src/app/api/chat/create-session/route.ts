import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import ChatSession from '@/models/ChatSession'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
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

    // Create new chat session
    const chatSession = new ChatSession({
      userId: user._id,
      userProfile: {
        name: user.profile?.name || user.name || 'User',
        age: user.profile?.age || 30,
        gender: user.profile?.gender || 'male'
      },
      healthContext: {
        height: user.measurements?.height || null,
        weight: user.measurements?.weight || null,
        bodyFatPercentage: user.results?.bodyFatPercentage || null,
        bmi: user.results?.bmi || null,
        activityLevel: user.lifestyle?.activityLevel || 'moderate',
        goals: user.goals?.primary ? [user.goals.primary] : [],
        dietaryRestrictions: user.lifestyle?.dietaryRestrictions || [],
        medicalHistory: user.lifestyle?.medicalConditions || []
      },
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await chatSession.save()

    return NextResponse.json({
      success: true,
      sessionId: chatSession._id.toString(),
      message: 'Chat session created successfully'
    })

  } catch (error) {
    console.error('Create chat session error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create chat session' },
      { status: 500 }
    )
  }
}
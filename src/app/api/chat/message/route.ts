import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import ChatSession from '@/models/ChatSession'
import User from '@/models/User'
import ArogyaAI, { HealthContext, ChatMessage } from '@/lib/claude-ai'
import { Types } from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, sessionId } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json(
        { success: false, message: 'Message and session ID are required' },
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

    // Find chat session and verify ownership
    const chatSession = await ChatSession.findOne({ 
      _id: new Types.ObjectId(sessionId),
      userId: user._id 
    })

    if (!chatSession) {
      return NextResponse.json(
        { success: false, message: 'Chat session not found' },
        { status: 404 }
      )
    }

    // Prepare user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    // Get conversation history
    const conversationHistory: ChatMessage[] = chatSession.messages || []

    // Build health context for AI
    const healthContext: HealthContext = {
      age: chatSession.userProfile?.age || user.profile?.age || 30,
      gender: chatSession.userProfile?.gender || user.profile?.gender || 'male',
      height: chatSession.healthContext?.height || user.measurements?.height || 170,
      weight: chatSession.healthContext?.weight || user.measurements?.weight || 70,
      bodyFatPercentage: chatSession.healthContext?.bodyFatPercentage || user.results?.bodyFatPercentage,
      bmi: chatSession.healthContext?.bmi || user.results?.bmi,
      activityLevel: chatSession.healthContext?.activityLevel || user.lifestyle?.activityLevel || 'moderate',
      goals: chatSession.healthContext?.goals || (user.goals?.primary ? [user.goals.primary] : ['general fitness']),
      dietaryRestrictions: chatSession.healthContext?.dietaryRestrictions || user.lifestyle?.dietaryRestrictions || [],
      medicalHistory: chatSession.healthContext?.medicalHistory || user.lifestyle?.medicalConditions || []
    }

    // Get AI response
    const arogyaAI = ArogyaAI.getInstance()
    let aiResponse: string

    try {
      aiResponse = await arogyaAI.chatWithArogya(message, healthContext, conversationHistory)
    } catch (error) {
      console.error('AI chat error:', error)
      aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or feel free to ask me something else about your health and wellness journey."
    }

    // Prepare AI message
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    }

    // Update chat session with new messages
    const updatedMessages = [...conversationHistory, userMessage, aiMessage]
    
    await ChatSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          messages: updatedMessages,
          updatedAt: new Date(),
          lastMessageAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageId: aiMessage.timestamp.getTime().toString()
    })

  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process message' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve chat history
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
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
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

    // Find chat session and verify ownership
    const chatSession = await ChatSession.findOne({ 
      _id: new Types.ObjectId(sessionId),
      userId: user._id 
    })

    if (!chatSession) {
      return NextResponse.json(
        { success: false, message: 'Chat session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: chatSession.messages || [],
      sessionInfo: {
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
        status: chatSession.status
      }
    })

  } catch (error) {
    console.error('Get chat history error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve chat history' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateReferralCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      age,
      gender,
      phone,
      height,
      weight,
      waist,
      neck,
      hip,
      activityLevel,
      dietaryHabits,
      sleepHours,
      sleepQuality,
      stressLevel,
      medicalHistory,
      smoking,
      alcohol,
      primaryObjective,
      dietaryRestrictions,
      exercisePreferences,
      targetWeight
    } = body

    // Validate required fields
    if (!name || !age || !gender || !height || !weight || !waist || !neck) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    // Additional validation for females
    if (gender === 'female' && !hip) {
      return NextResponse.json({ message: 'Hip measurement is required for females' }, { status: 400 })
    }

    await connectDB()

    // Find user and update their profile
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update user profile
    user.profile = {
      name,
      age,
      gender,
      phone,
      avatar: user.profile?.avatar || null
    }

    user.measurements = {
      height,
      weight,
      circumferences: {
        waist,
        neck,
        ...(hip && { hip })
      }
    }

    user.lifestyle = {
      activityLevel,
      dietaryHabits: dietaryHabits || [],
      sleepPattern: {
        averageHours: sleepHours || 7,
        quality: sleepQuality || 'good'
      },
      stressLevel: stressLevel || 'moderate',
      medicalHistory: medicalHistory || [],
      substanceUse: {
        smoking: smoking || false,
        alcohol: alcohol || 'none'
      }
    }

    user.goals = {
      primaryObjective,
      dietaryRestrictions: dietaryRestrictions || [],
      exercisePreferences: exercisePreferences || [],
      ...(targetWeight && { targetWeight })
    }

    // Generate referral code if not exists
    if (!user.referrals?.code) {
      user.referrals = {
        code: generateReferralCode(name),
        referred: [],
        earnings: 0
      }
    }

    await user.save()

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      userId: user._id 
    }, { status: 200 })

  } catch (error) {
    console.error('Onboarding API error:', error)
    return NextResponse.json({ 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}
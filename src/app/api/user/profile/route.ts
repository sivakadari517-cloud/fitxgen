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

    const user = await User.findOne({ email: session.user.email })
      .select('-password')
      .lean() as any

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Format the response
    const userData = {
      _id: user._id,
      profile: {
        name: user.profile?.name || user.name || 'User',
        age: user.profile?.age || null,
        gender: user.profile?.gender || null,
        avatar: user.profile?.avatar || null
      },
      measurements: {
        height: user.measurements?.height || null,
        weight: user.measurements?.weight || null,
        circumferences: {
          waist: user.measurements?.circumferences?.waist || null,
          neck: user.measurements?.circumferences?.neck || null,
          hip: user.measurements?.circumferences?.hip || null
        }
      },
      results: user.results || null,
      subscription: {
        status: user.subscription?.status || 'inactive',
        plan: user.subscription?.plan || null,
        additionalPeople: user.subscription?.additionalPeople || 0,
        expiresAt: user.subscription?.expiresAt || null
      },
      referrals: {
        code: user.referrals?.code || '',
        referred: user.referrals?.referred || [],
        earnings: user.referrals?.earnings || 0
      },
      lifestyle: user.lifestyle || null,
      goals: user.goals || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return NextResponse.json({
      success: true,
      user: userData
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { profile, measurements, lifestyle, goals } = body

    await connectMongoDB()

    const updateData: any = {
      updatedAt: new Date()
    }

    // Update profile data
    if (profile) {
      updateData['profile.name'] = profile.name
      updateData['profile.age'] = profile.age
      updateData['profile.gender'] = profile.gender
      if (profile.avatar) updateData['profile.avatar'] = profile.avatar
    }

    // Update measurements
    if (measurements) {
      if (measurements.height) updateData['measurements.height'] = measurements.height
      if (measurements.weight) updateData['measurements.weight'] = measurements.weight
      if (measurements.circumferences) {
        if (measurements.circumferences.waist) {
          updateData['measurements.circumferences.waist'] = measurements.circumferences.waist
        }
        if (measurements.circumferences.neck) {
          updateData['measurements.circumferences.neck'] = measurements.circumferences.neck
        }
        if (measurements.circumferences.hip) {
          updateData['measurements.circumferences.hip'] = measurements.circumferences.hip
        }
      }
    }

    // Update lifestyle data
    if (lifestyle) {
      updateData.lifestyle = lifestyle
    }

    // Update goals
    if (goals) {
      updateData.goals = goals
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
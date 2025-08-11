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

    // Find user with referral data
    const user = await User.findOne({ email: session.user.email })
      .select('referrals')
      .lean() as any

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Get referred users for detailed stats
    const referredUsers = await User.find({
      'referrals.referredBy': user.referrals?.code
    })
    .select('name email createdAt subscription')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean() as any[]

    // Calculate referral stats
    const totalReferred = user.referrals?.referred?.length || 0
    const activeReferrals = referredUsers.filter(u => u.subscription?.status === 'active').length
    const totalEarnings = user.referrals?.earnings || 0
    
    // Calculate pending earnings (referrals who haven't activated subscription yet)
    const pendingReferrals = referredUsers.filter(u => !u.subscription?.status || u.subscription.status !== 'active').length
    const pendingEarnings = pendingReferrals * 20 // ₹20 per referral

    // Format recent referrals
    const recentReferrals = referredUsers.map(referredUser => ({
      name: referredUser.name || 'New User',
      joinedAt: referredUser.createdAt,
      earnings: referredUser.subscription?.status === 'active' ? 20 : 0,
      status: referredUser.subscription?.status === 'active' ? 'active' : 'pending'
    }))

    const referralData = {
      code: user.referrals?.code || '',
      totalReferred,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
      recentReferrals
    }

    return NextResponse.json({
      success: true,
      referralData
    })

  } catch (error) {
    console.error('Get referral data error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { referralCode } = await request.json()

    if (!referralCode?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Referral code is required' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Find the referring user
    const referringUser = await User.findOne({ 
      'referrals.code': referralCode.trim().toUpperCase()
    })

    if (!referringUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid referral code' },
        { status: 400 }
      )
    }

    // Find current user
    const currentUser = await User.findOne({ email: session.user.email })

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user already used a referral code
    if (currentUser.referrals?.referredBy) {
      return NextResponse.json(
        { success: false, message: 'You have already used a referral code' },
        { status: 400 }
      )
    }

    // Check if user is trying to refer themselves
    if (referringUser._id.equals(currentUser._id)) {
      return NextResponse.json(
        { success: false, message: 'You cannot use your own referral code' },
        { status: 400 }
      )
    }

    // Update current user with referral info
    currentUser.referrals = {
      ...currentUser.referrals,
      referredBy: referralCode.trim().toUpperCase(),
      referralUsedAt: new Date()
    }
    await currentUser.save()

    // Update referring user's referral stats
    if (!referringUser.referrals.referred) {
      referringUser.referrals.referred = []
    }
    
    referringUser.referrals.referred.push(currentUser._id.toString())
    
    // Add earnings when the referred user activates subscription
    if (currentUser.subscription?.status === 'active') {
      referringUser.referrals.earnings = (referringUser.referrals.earnings || 0) + 20
    }
    
    await referringUser.save()

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully',
      referralBonus: currentUser.subscription?.status === 'active' ? 20 : 0
    })

  } catch (error) {
    console.error('Apply referral code error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to apply referral code' },
      { status: 500 }
    )
  }
}
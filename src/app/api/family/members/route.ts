import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import User from '@/models/User'
import FamilyMember from '@/models/FamilyMember'

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

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Get family members
    const familyMembers = await FamilyMember.find({ 
      userId: user._id, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .lean()

    return NextResponse.json({
      success: true,
      members: familyMembers,
      count: familyMembers.length
    })

  } catch (error) {
    console.error('Get family members error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch family members' },
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

    const { name, relationship, age, gender } = await request.json()

    // Validate required fields
    if (!name?.trim() || !relationship?.trim() || !age || !gender) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (age < 1 || age > 120) {
      return NextResponse.json(
        { success: false, message: 'Age must be between 1 and 120' },
        { status: 400 }
      )
    }

    if (!['male', 'female'].includes(gender)) {
      return NextResponse.json(
        { success: false, message: 'Gender must be male or female' },
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

    // Check subscription limits
    const currentFamilyCount = await FamilyMember.countDocuments({ 
      userId: user._id, 
      isActive: true 
    })

    const allowedMembers = user.subscription?.additionalPeople || 0

    if (currentFamilyCount >= allowedMembers) {
      return NextResponse.json(
        { 
          success: false, 
          message: `You can add up to ${allowedMembers} family members with your current subscription. Please upgrade to add more.`,
          requiresUpgrade: true
        },
        { status: 403 }
      )
    }

    // Check for duplicate names within the same family
    const existingMember = await FamilyMember.findOne({
      userId: user._id,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isActive: true
    })

    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'A family member with this name already exists' },
        { status: 400 }
      )
    }

    // Create new family member
    const familyMember = new FamilyMember({
      userId: user._id,
      name: name.trim(),
      relationship: relationship.trim(),
      age,
      gender,
      isActive: true
    })

    await familyMember.save()

    return NextResponse.json({
      success: true,
      message: 'Family member added successfully',
      member: familyMember
    })

  } catch (error) {
    console.error('Add family member error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add family member' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import User from '@/models/User'
import FamilyMember from '@/models/FamilyMember'
import { Types } from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find family member and verify ownership
    const familyMember = await FamilyMember.findOne({
      _id: new Types.ObjectId(params.id),
      userId: user._id,
      isActive: true
    })

    if (!familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      member: familyMember
    })

  } catch (error) {
    console.error('Get family member error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch family member' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, relationship, age, gender, measurements } = await request.json()

    await connectMongoDB()

    // Find user
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Find family member and verify ownership
    const familyMember = await FamilyMember.findOne({
      _id: new Types.ObjectId(params.id),
      userId: user._id,
      isActive: true
    })

    if (!familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      )
    }

    // Update basic info if provided
    if (name?.trim()) familyMember.name = name.trim()
    if (relationship?.trim()) familyMember.relationship = relationship.trim()
    if (age && age >= 1 && age <= 120) familyMember.age = age
    if (gender && ['male', 'female'].includes(gender)) familyMember.gender = gender

    // Update measurements if provided
    if (measurements) {
      if (!familyMember.measurements) {
        familyMember.measurements = {}
      }
      
      if (measurements.height && measurements.height >= 100 && measurements.height <= 250) {
        familyMember.measurements.height = measurements.height
      }
      if (measurements.weight && measurements.weight >= 20 && measurements.weight <= 300) {
        familyMember.measurements.weight = measurements.weight
      }
      if (measurements.circumferences) {
        if (!familyMember.measurements.circumferences) {
          familyMember.measurements.circumferences = {}
        }
        if (measurements.circumferences.waist) {
          familyMember.measurements.circumferences.waist = measurements.circumferences.waist
        }
        if (measurements.circumferences.neck) {
          familyMember.measurements.circumferences.neck = measurements.circumferences.neck
        }
        if (measurements.circumferences.hip) {
          familyMember.measurements.circumferences.hip = measurements.circumferences.hip
        }
      }
    }

    await familyMember.save()

    return NextResponse.json({
      success: true,
      message: 'Family member updated successfully',
      member: familyMember
    })

  } catch (error) {
    console.error('Update family member error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update family member' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find family member and verify ownership
    const familyMember = await FamilyMember.findOne({
      _id: new Types.ObjectId(params.id),
      userId: user._id,
      isActive: true
    })

    if (!familyMember) {
      return NextResponse.json(
        { success: false, message: 'Family member not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    familyMember.isActive = false
    await familyMember.save()

    return NextResponse.json({
      success: true,
      message: 'Family member removed successfully'
    })

  } catch (error) {
    console.error('Delete family member error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to remove family member' },
      { status: 500 }
    )
  }
}
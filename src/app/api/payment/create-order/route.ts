import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const PRICING_PLANS = {
  basic: { price: 99, name: 'Personal Analysis', additionalPeople: 0 },
  family: { price: 299, name: 'Family Plan', additionalPeople: 3 },
  premium: { price: 499, name: 'Premium Care', additionalPeople: 7 }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount, referralCode } = body

    // Validate plan
    const plan = PRICING_PLANS[planId as keyof typeof PRICING_PLANS]
    if (!plan) {
      return NextResponse.json({ message: 'Invalid plan selected' }, { status: 400 })
    }

    // Validate amount
    if (amount < 99 || amount > plan.price) {
      return NextResponse.json({ message: 'Invalid amount' }, { status: 400 })
    }

    await connectDB()

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${session.user.id}`,
      payment_capture: true
    }

    const razorpayOrder = await razorpay.orders.create(orderOptions)

    // Save payment record
    const payment = new Payment({
      userId: session.user.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      status: 'pending',
      additionalPeople: plan.additionalPeople,
      metadata: {
        planId,
        planName: plan.name,
        ...(referralCode && { referralCode })
      }
    })

    await payment.save()

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    }, { status: 200 })

  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json({ 
      message: error.message || 'Failed to create payment order' 
    }, { status: 500 })
  }
}
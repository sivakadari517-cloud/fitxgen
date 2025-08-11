import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'
import User from '@/models/User'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentId, signature } = body

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ message: 'Missing payment details' }, { status: 400 })
    }

    await connectDB()

    // Find payment record
    const payment = await Payment.findOne({ 
      razorpayOrderId: orderId,
      userId: session.user.id 
    })

    if (!payment) {
      return NextResponse.json({ message: 'Payment record not found' }, { status: 404 })
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (generatedSignature !== signature) {
      // Update payment status to failed
      payment.status = 'failed'
      await payment.save()
      
      return NextResponse.json({ message: 'Invalid payment signature' }, { status: 400 })
    }

    // Payment verified successfully
    payment.razorpayPaymentId = paymentId
    payment.razorpaySignature = signature
    payment.status = 'completed'
    await payment.save()

    // Update user subscription status
    const user = await User.findById(session.user.id)
    if (user) {
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 1 year validity

      user.subscription = {
        status: 'active',
        paymentId: paymentId,
        expiresAt: expiryDate,
        additionalPeople: payment.additionalPeople
      }

      await user.save()
    }

    // Handle referral rewards if applicable
    if (payment.metadata?.referralCode) {
      try {
        const referrer = await User.findOne({ 'referrals.code': payment.metadata.referralCode })
        if (referrer) {
          // Add referral earnings (10% of payment amount)
          const earningsAmount = Math.floor(payment.amount * 0.1)
          referrer.referrals.earnings += earningsAmount
          referrer.referrals.referred.push(session.user.id)
          await referrer.save()
        }
      } catch (error) {
        console.error('Referral processing error:', error)
        // Don't fail the payment for referral issues
      }
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      paymentId: paymentId
    }, { status: 200 })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      message: error.message || 'Payment verification failed' 
    }, { status: 500 })
  }
}
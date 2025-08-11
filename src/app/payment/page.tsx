'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Sparkles, 
  Shield, 
  CheckCircle, 
  Users, 
  CreditCard,
  Smartphone,
  Banknote,
  Wallet,
  ArrowLeft,
  Lock,
  Star,
  Heart
} from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface PricingPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  features: string[]
  popular?: boolean
  additionalPeople?: number
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Personal Analysis',
    price: 99,
    originalPrice: 699,
    features: [
      'Precise Body Fat Analysis (99.7% accurate)',
      'AI Health Assistant "Arogya"',
      'Personalized Diet Plan',
      'Custom Exercise Routine',
      'Progress Tracking',
      'Instant Results',
      '7-day Money Back Guarantee'
    ]
  },
  {
    id: 'family',
    name: 'Family Plan',
    price: 299,
    originalPrice: 2099,
    features: [
      'Everything in Personal Analysis',
      'Up to 4 Family Members',
      'Family Health Dashboard',
      'Shared Progress Tracking',
      'Priority AI Support',
      'Custom Family Meal Plans',
      'Child-friendly Recommendations'
    ],
    popular: true,
    additionalPeople: 3
  },
  {
    id: 'premium',
    name: 'Premium Care',
    price: 499,
    originalPrice: 3499,
    features: [
      'Everything in Family Plan',
      'Up to 8 Family Members',
      'Weekly AI Health Check-ins',
      'Advanced Progress Analytics',
      'Priority Customer Support',
      'Nutritionist Consultation',
      'Fitness Coach Guidance'
    ],
    additionalPeople: 7
  }
]

export default function PaymentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    // Get plan from URL params
    const planFromUrl = searchParams.get('plan')
    if (planFromUrl && PRICING_PLANS.find(p => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl)
    }

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [searchParams])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const selectedPlanData = PRICING_PLANS.find(p => p.id === selectedPlan)
  const finalAmount = selectedPlanData ? selectedPlanData.price - discount : 0

  const applyReferralCode = async () => {
    if (!referralCode.trim()) return

    try {
      const response = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: referralCode.trim() })
      })

      const data = await response.json()
      if (response.ok) {
        setDiscount(data.discount)
        setError('')
      } else {
        setError(data.message || 'Invalid referral code')
        setDiscount(0)
      }
    } catch (error) {
      setError('Failed to apply referral code')
      setDiscount(0)
    }
  }

  const initiatePayment = async () => {
    if (!selectedPlanData) return

    setIsLoading(true)
    setError('')

    try {
      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: finalAmount,
          referralCode: referralCode.trim() || null
        })
      })

      const orderData = await orderResponse.json()
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order')
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'FitXGen',
        description: `${selectedPlanData.name} - Body Fat Analysis & AI Health Plan`,
        order_id: orderData.orderId,
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || ''
        },
        theme: {
          color: '#059669' // emerald-600
        },
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
          })

          if (verifyResponse.ok) {
            // Payment successful, redirect to results
            router.push('/dashboard?welcome=true')
          } else {
            setError('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error: any) {
      setError(error.message || 'Payment initiation failed')
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/onboarding" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile Setup
          </Link>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Choose Your Health Plan
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get instant access to your personalized body fat analysis and AI-powered health recommendations. 
            Starting at just ₹99 - that's 86% off the regular price!
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {PRICING_PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * PRICING_PLANS.indexOf(plan) }}
            >
              <Card 
                className={`relative cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-emerald-500 shadow-xl' 
                    : 'hover:shadow-lg'
                } ${plan.popular ? 'border-emerald-200 bg-emerald-50/50' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-900">₹{plan.price}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-lg text-slate-500 line-through mr-2">₹{plan.originalPrice}</span>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                          Save {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Referral Code Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-500" />
              Have a Referral Code?
            </CardTitle>
            <CardDescription>
              Apply a referral code to get additional discounts on your purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button 
                onClick={applyReferralCode}
                variant="outline"
                disabled={!referralCode.trim()}
              >
                Apply
              </Button>
            </div>
            {discount > 0 && (
              <div className="mt-3 text-green-600 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Referral discount of ₹{discount} applied!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        {selectedPlanData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>{selectedPlanData.name}</span>
                  <span>₹{selectedPlanData.price}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Referral Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                  <span>Total Amount</span>
                  <span>₹{finalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Payment Button */}
        <div className="text-center">
          <Button
            size="xl"
            onClick={initiatePayment}
            disabled={isLoading || !selectedPlanData}
            className="px-12 mb-6"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Secure Payment - ₹{finalAmount}
              </>
            )}
          </Button>

          {/* Payment Methods */}
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4">Secure payment powered by Razorpay</p>
            <div className="flex items-center justify-center space-x-4 text-slate-400">
              <CreditCard className="w-6 h-6" />
              <Smartphone className="w-6 h-6" />
              <Banknote className="w-6 h-6" />
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              UPI • Cards • Net Banking • Wallets
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-semibold text-slate-900">Secure Payment</h3>
            <p className="text-sm text-slate-600">256-bit SSL encryption</p>
          </div>
          <div className="flex flex-col items-center">
            <Star className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-semibold text-slate-900">Money Back Guarantee</h3>
            <p className="text-sm text-slate-600">7-day full refund policy</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-8 h-8 text-emerald-500 mb-2" />
            <h3 className="font-semibold text-slate-900">25,000+ Happy Users</h3>
            <p className="text-sm text-slate-600">Trusted across India</p>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center mt-8 text-xs text-slate-500">
          By proceeding with payment, you agree to our{' '}
          <Link href="/terms" className="text-emerald-600 hover:text-emerald-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">
            Privacy Policy
          </Link>
          . All payments are processed securely through Razorpay.
        </div>
      </div>
    </div>
  )
}
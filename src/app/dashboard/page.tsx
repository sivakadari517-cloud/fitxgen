'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  TrendingUp, 
  Heart, 
  Brain, 
  Target, 
  MessageCircle,
  Share2,
  Settings,
  Trophy,
  Activity,
  Scale,
  Ruler,
  Calendar,
  BarChart3,
  Users,
  Gift,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface UserData {
  _id: string
  profile: {
    name: string
    age: number
    gender: 'male' | 'female'
    avatar?: string
  }
  measurements: {
    height: number
    weight: number
    circumferences: {
      waist: number
      neck: number
      hip?: number
    }
  }
  results?: {
    bodyFatPercentage: number
    bmi: number
    calculatedAt: Date
    recommendations: any
  }
  subscription: {
    status: string
    additionalPeople: number
  }
  referrals: {
    code: string
    referred: string[]
    earnings: number
  }
}

interface HealthMetrics {
  bodyFatPercentage: number
  bmi: number
  category: string
  healthStatus: string
  recommendations: string[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchUserData()
      // Show welcome message for new users
      if (searchParams.get('welcome') === 'true') {
        setShowWelcome(true)
      }
    }
  }, [status, router, searchParams])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        
        // If user has results, display them
        if (data.user.results) {
          setHealthMetrics({
            bodyFatPercentage: data.user.results.bodyFatPercentage,
            bmi: data.user.results.bmi,
            category: data.user.results.category || 'Unknown',
            healthStatus: data.user.results.healthStatus || 'Unknown',
            recommendations: data.user.results.recommendations?.basic || []
          })
        } else {
          // Calculate body fat if not already calculated
          calculateBodyFat()
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateBodyFat = async () => {
    if (!userData && !session) return
    
    setIsCalculating(true)
    try {
      const response = await fetch('/api/calculate/body-fat', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setHealthMetrics(data.results)
        
        // Refresh user data to get updated results
        fetchUserData()
      }
    } catch (error) {
      console.error('Failed to calculate body fat:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const getBodyFatColor = (percentage: number) => {
    if (percentage < 10) return 'text-blue-600'
    if (percentage < 15) return 'text-green-600'
    if (percentage < 20) return 'text-yellow-600'
    if (percentage < 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-emerald-600 bg-emerald-100'
      case 'fair': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-orange-600 bg-orange-100'
      default: return 'text-red-600 bg-red-100'
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your health insights...</p>
        </div>
      </div>
    )
  }

  if (!session || !userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">FitXGen</h1>
              <p className="text-sm text-slate-600">Health Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userData.profile.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 py-4"
        >
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    Welcome to FitXGen, {userData.profile.name}! 🎉
                  </h2>
                  <p className="opacity-90">
                    Your payment was successful. Let's discover your personalized health insights!
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowWelcome(false)}
                  size="sm"
                >
                  Got it!
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Body Fat Analysis */}
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Scale className="w-5 h-5 mr-2 text-emerald-600" />
                      Body Fat Analysis
                    </CardTitle>
                    <CardDescription>
                      Scientifically accurate analysis using US Navy method
                    </CardDescription>
                  </div>
                  {healthMetrics && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={calculateBodyFat}
                      disabled={isCalculating}
                    >
                      {isCalculating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isCalculating ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Calculating your body fat percentage...</p>
                  </div>
                ) : healthMetrics ? (
                  <div className="space-y-6">
                    {/* Main Metrics */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                        <div className={`text-4xl font-bold mb-2 ${getBodyFatColor(healthMetrics.bodyFatPercentage)}`}>
                          {healthMetrics.bodyFatPercentage}%
                        </div>
                        <p className="text-slate-700 font-medium">Body Fat Percentage</p>
                        <p className="text-sm text-slate-500 mt-1">{healthMetrics.category}</p>
                      </div>
                      
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {healthMetrics.bmi}
                        </div>
                        <p className="text-slate-700 font-medium">BMI</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getHealthStatusColor(healthMetrics.healthStatus)}`}>
                          {healthMetrics.healthStatus}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations Preview */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Recommendations</h3>
                      <div className="grid gap-3">
                        {healthMetrics.recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className="flex items-start p-3 bg-white rounded-xl border border-slate-200">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                              <span className="text-emerald-600 text-sm font-bold">{index + 1}</span>
                            </div>
                            <p className="text-slate-700 text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4">
                        <Brain className="w-4 h-4 mr-2" />
                        Get Detailed AI Recommendations
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Ready to calculate your body fat percentage?</p>
                    <Button onClick={calculateBodyFat} disabled={isCalculating}>
                      <Target className="w-4 h-4 mr-2" />
                      Calculate Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Tracking */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>
                  Monitor your health journey over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    Start tracking your progress by taking regular measurements
                  </p>
                  <Button variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    Add New Measurement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Chat */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Chat with Arogya
                </CardTitle>
                <CardDescription>
                  Your AI health assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-slate-900">Arogya AI</span>
                    </div>
                    <p className="text-sm text-slate-700">
                      Hello {userData.profile.name}! I'm ready to help you with personalized health guidance. 
                      What would you like to know about your results?
                    </p>
                  </div>
                  <Button className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral System */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-orange-600" />
                  Refer & Earn
                </CardTitle>
                <CardDescription>
                  Share health with loved ones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">₹{userData.referrals.earnings}</div>
                    <p className="text-sm text-slate-600">Total Earnings</p>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1">Your Referral Code</p>
                    <div className="font-mono text-lg font-bold text-slate-900">{userData.referrals.code}</div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>People referred</span>
                    <span className="font-semibold">{userData.referrals.referred.length}</span>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Add Family Member
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Health Goals
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Check-up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
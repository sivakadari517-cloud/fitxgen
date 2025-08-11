'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Utensils, 
  Dumbbell, 
  Heart, 
  Brain, 
  ArrowLeft,
  Sparkles,
  Clock,
  Target,
  CheckCircle,
  ChefHat,
  Activity,
  Calendar,
  Download,
  Share2,
  RefreshCw,
  TrendingUp,
  Star,
  BookOpen,
  Apple,
  Droplets,
  Moon,
  Shield,
  MessageCircle
} from 'lucide-react'

interface UserProfile {
  name: string
  age: number
  gender: 'male' | 'female'
  results?: {
    bodyFatPercentage: number
    bmi: number
    category: string
    healthStatus: string
  }
  goals?: {
    primary: string
    target: string
  }
  lifestyle?: {
    activityLevel: string
    dietaryRestrictions: string[]
  }
}

interface RecommendationData {
  diet: {
    dailyCalories: number
    macros: {
      protein: number
      carbs: number
      fats: number
    }
    mealPlan: Array<{
      meal: string
      time: string
      items: string[]
      calories: number
    }>
    tips: string[]
  }
  exercise: {
    weeklyPlan: Array<{
      day: string
      type: string
      duration: number
      exercises: Array<{
        name: string
        sets?: number
        reps?: string
        duration?: number
      }>
    }>
    tips: string[]
  }
  wellness: {
    sleepRecommendations: string[]
    stressManagement: string[]
    hydrationGoal: number
    supplements: string[]
  }
  aiInsights: string
}

export default function RecommendationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'diet' | 'exercise' | 'wellness' | 'ai'>('diet')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData.user)
      }

      // Fetch existing recommendations
      const recResponse = await fetch('/api/recommendations')
      if (recResponse.ok) {
        const recData = await recResponse.json()
        if (recData.recommendations) {
          setRecommendations(recData.recommendations)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = async () => {
    if (!userProfile) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations)
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const tabs = [
    { id: 'diet', label: 'Diet Plan', icon: Utensils, color: 'text-green-600' },
    { id: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'text-blue-600' },
    { id: 'wellness', label: 'Wellness', icon: Heart, color: 'text-red-600' },
    { id: 'ai', label: 'AI Insights', icon: Brain, color: 'text-purple-600' }
  ]

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your personalized recommendations...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Health Recommendations</h1>
              <p className="text-sm text-slate-600">Personalized guidance for your journey</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Generate Recommendations Section */}
        {!recommendations && (
          <Card className="shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Brain className="w-6 h-6 mr-2 text-purple-600" />
                AI-Powered Health Recommendations
              </CardTitle>
              <CardDescription>
                Get personalized diet, exercise, and wellness recommendations based on your health profile
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                {userProfile?.results ? (
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-900">{userProfile.results.bodyFatPercentage}%</div>
                      <p className="text-sm text-slate-600">Body Fat</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-900">{userProfile.results.bmi}</div>
                      <p className="text-sm text-slate-600">BMI</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="text-lg font-bold text-slate-900">{userProfile.results.category}</div>
                      <p className="text-sm text-slate-600">Category</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                    <p className="text-yellow-800">
                      Complete your body fat assessment first to get more accurate recommendations.
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Recommendations
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Content */}
        {recommendations && (
          <>
            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  className={activeTab === tab.id ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : ''}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${tab.color}`} />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Diet Plan Tab */}
            {activeTab === 'diet' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <Card className="shadow-xl">
                    <CardContent className="p-6 text-center">
                      <Apple className="w-8 h-8 text-green-600 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-slate-900">{recommendations.diet.dailyCalories}</div>
                      <p className="text-sm text-slate-600">Daily Calories</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-xl">
                    <CardContent className="p-6 text-center">
                      <ChefHat className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-slate-900">{recommendations.diet.macros.protein}g</div>
                      <p className="text-sm text-slate-600">Protein</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-xl">
                    <CardContent className="p-6 text-center">
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-slate-900">{recommendations.diet.macros.carbs}g</div>
                      <p className="text-sm text-slate-600">Carbs</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle>Daily Meal Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.diet.mealPlan.map((meal, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-slate-900">{meal.meal}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>{meal.time}</span>
                              <span>{meal.calories} cal</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {meal.items.map((item, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white rounded text-sm text-slate-700">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle>Nutrition Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recommendations.diet.tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Exercise Plan Tab */}
            {activeTab === 'exercise' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle>Weekly Exercise Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {recommendations.exercise.weeklyPlan.map((day, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-slate-900">{day.day}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <span>{day.type}</span>
                              <span>{day.duration} min</span>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            {day.exercises.map((exercise, idx) => (
                              <div key={idx} className="p-3 bg-white rounded border">
                                <h4 className="font-medium text-slate-800 mb-1">{exercise.name}</h4>
                                <p className="text-sm text-slate-600">
                                  {exercise.sets && exercise.reps && `${exercise.sets} sets × ${exercise.reps}`}
                                  {exercise.duration && `${exercise.duration} minutes`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle>Exercise Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recommendations.exercise.tips.map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Activity className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Wellness Tab */}
            {activeTab === 'wellness' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Moon className="w-5 h-5 mr-2 text-indigo-600" />
                        Sleep Optimization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recommendations.wellness.sleepRecommendations.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-green-600" />
                        Stress Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recommendations.wellness.stressManagement.map((rec, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Heart className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-700">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Droplets className="w-5 h-5 mr-2 text-blue-600" />
                        Hydration Goal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {recommendations.wellness.hydrationGoal}L
                        </div>
                        <p className="text-sm text-slate-600">Daily water intake</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-600" />
                        Supplements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recommendations.wellness.supplements.map((supplement, index) => (
                          <div key={index} className="p-2 bg-slate-50 rounded text-sm">
                            {supplement}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-600" />
                      AI-Generated Health Insights
                    </CardTitle>
                    <CardDescription>
                      Personalized analysis from Arogya AI based on your health profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                        {recommendations.aiInsights}
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <Button 
                        onClick={() => router.push('/chat')}
                        variant="outline"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with Arogya AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
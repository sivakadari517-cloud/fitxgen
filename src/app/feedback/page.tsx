'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Star,
  MessageSquare,
  Bug,
  Lightbulb,
  Heart,
  Send,
  ArrowLeft,
  CheckCircle,
  Users,
  TrendingUp,
  AlertCircle,
  Gift,
  ThumbsUp
} from 'lucide-react'

interface FeedbackData {
  type: 'rating' | 'suggestion' | 'bug_report' | 'testimonial' | 'feature_request' | 'general'
  category: string
  rating?: number
  title: string
  message: string
  isPublic?: boolean
}

export default function FeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'submit' | 'history' | 'testimonials'>('submit')
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    type: 'rating',
    category: 'general_experience',
    rating: 5,
    title: '',
    message: '',
    isPublic: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userFeedback, setUserFeedback] = useState([])
  const [testimonials, setTestimonials] = useState([])

  const feedbackTypes = [
    { 
      id: 'rating', 
      label: 'Rate FitXGen', 
      icon: Star, 
      color: 'text-yellow-600',
      description: 'Share your overall experience'
    },
    { 
      id: 'suggestion', 
      label: 'Suggestion', 
      icon: Lightbulb, 
      color: 'text-blue-600',
      description: 'Help us improve the app'
    },
    { 
      id: 'bug_report', 
      label: 'Report Bug', 
      icon: Bug, 
      color: 'text-red-600',
      description: 'Found an issue? Let us know'
    },
    { 
      id: 'testimonial', 
      label: 'Testimonial', 
      icon: Heart, 
      color: 'text-pink-600',
      description: 'Share your success story'
    },
    { 
      id: 'feature_request', 
      label: 'Feature Request', 
      icon: Gift, 
      color: 'text-purple-600',
      description: 'Suggest new features'
    }
  ]

  const categories = [
    { value: 'general_experience', label: 'General Experience' },
    { value: 'body_fat_calculation', label: 'Body Fat Calculation' },
    { value: 'ai_recommendations', label: 'AI Recommendations' },
    { value: 'user_interface', label: 'User Interface' },
    { value: 'payment_billing', label: 'Payment & Billing' },
    { value: 'family_features', label: 'Family Features' },
    { value: 'mobile_experience', label: 'Mobile Experience' },
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'data_accuracy', label: 'Data Accuracy' },
    { value: 'app_performance', label: 'App Performance' }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (activeTab === 'history') fetchUserFeedback()
      if (activeTab === 'testimonials') fetchTestimonials()
    }
  }, [status, router, activeTab])

  const fetchUserFeedback = async () => {
    try {
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const data = await response.json()
        setUserFeedback(data.feedback || [])
      }
    } catch (error) {
      console.error('Failed to fetch user feedback:', error)
    }
  }

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/feedback?public=true&type=testimonial')
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.feedback || [])
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...feedbackData,
          metadata: {
            page: 'feedback',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFeedbackData({
          type: 'rating',
          category: 'general_experience',
          rating: 5,
          title: '',
          message: '',
          isPublic: false
        })
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRatingChange = (rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading feedback center...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Feedback Center</h1>
              <p className="text-sm text-slate-600">Your voice helps us improve</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          <Button 
            onClick={() => setActiveTab('submit')}
            variant={activeTab === 'submit' ? 'default' : 'outline'}
            className={activeTab === 'submit' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Feedback
          </Button>
          <Button 
            onClick={() => setActiveTab('history')}
            variant={activeTab === 'history' ? 'default' : 'outline'}
            className={activeTab === 'history' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            My Feedback
          </Button>
          <Button 
            onClick={() => setActiveTab('testimonials')}
            variant={activeTab === 'testimonials' ? 'default' : 'outline'}
            className={activeTab === 'testimonials' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <Heart className="w-4 h-4 mr-2" />
            Success Stories
          </Button>
        </div>

        {/* Submit Feedback Tab */}
        {activeTab === 'submit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isSubmitted ? (
              <Card className="shadow-xl">
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Thank You!</h2>
                  <p className="text-slate-600 mb-6">
                    Your feedback has been submitted successfully. We'll review it and get back to you soon.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    Submit Another Feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Feedback Type Selection */}
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle>What type of feedback do you have?</CardTitle>
                      <CardDescription>Choose the category that best describes your feedback</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {feedbackTypes.map((type) => (
                          <div
                            key={type.id}
                            onClick={() => setFeedbackData(prev => ({ ...prev, type: type.id as any }))}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              feedbackData.type === type.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <type.icon className={`w-6 h-6 ${type.color}`} />
                              <div>
                                <h3 className="font-semibold text-slate-900">{type.label}</h3>
                                <p className="text-sm text-slate-600">{type.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rating (for rating type) */}
                  {feedbackData.type === 'rating' && (
                    <Card className="shadow-xl">
                      <CardHeader>
                        <CardTitle>How would you rate FitXGen?</CardTitle>
                        <CardDescription>Your rating helps us understand our performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center space-x-2 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(star)}
                              className="p-2"
                            >
                              <Star 
                                className={`w-8 h-8 ${
                                  star <= (feedbackData.rating || 0) 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-center text-slate-600">
                          {feedbackData.rating === 5 && "Excellent! We're thrilled you love FitXGen! ⭐"}
                          {feedbackData.rating === 4 && "Great! Thank you for the positive feedback! 👏"}
                          {feedbackData.rating === 3 && "Good! Help us make it even better! 💪"}
                          {feedbackData.rating === 2 && "We can do better! Tell us how to improve! 🤝"}
                          {feedbackData.rating === 1 && "We're sorry! Please help us understand what went wrong! 😔"}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category and Details */}
                  <Card className="shadow-xl">
                    <CardHeader>
                      <CardTitle>Feedback Details</CardTitle>
                      <CardDescription>Provide specific details about your feedback</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={feedbackData.category}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Title *
                        </label>
                        <Input
                          value={feedbackData.title}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Brief title for your feedback"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          value={feedbackData.message}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Please provide detailed feedback..."
                          rows={5}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      {feedbackData.type === 'testimonial' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={feedbackData.isPublic || false}
                            onChange={(e) => setFeedbackData(prev => ({ ...prev, isPublic: e.target.checked }))}
                            className="rounded"
                          />
                          <label htmlFor="isPublic" className="text-sm text-slate-700">
                            I allow FitXGen to share this testimonial publicly (your name will be shown)
                          </label>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Feedback
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </form>
            )}
          </motion.div>
        )}

        {/* My Feedback Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Your Feedback History</CardTitle>
                <CardDescription>Track the status of your submitted feedback</CardDescription>
              </CardHeader>
              <CardContent>
                {userFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">You haven't submitted any feedback yet.</p>
                    <Button 
                      onClick={() => setActiveTab('submit')}
                      className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      Submit Your First Feedback
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userFeedback.map((feedback: any, index) => (
                      <div key={index} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-slate-900">{feedback.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            feedback.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            feedback.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {feedback.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{feedback.message.substring(0, 200)}...</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{feedback.type} • {feedback.category}</span>
                          <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-pink-500" />
                  Success Stories
                </CardTitle>
                <CardDescription>Real experiences from FitXGen users</CardDescription>
              </CardHeader>
              <CardContent>
                {testimonials.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No public testimonials yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {testimonials.map((testimonial: any, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                        <div className="flex items-center mb-3">
                          {testimonial.rating && (
                            <div className="flex mr-3">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              ))}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-slate-900">
                            {testimonial.userInfo.name}
                          </span>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">{testimonial.title}</h3>
                        <p className="text-sm text-slate-700 mb-3">{testimonial.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {new Date(testimonial.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center">
                            <ThumbsUp className="w-4 h-4 text-slate-400 mr-1" />
                            <span className="text-xs text-slate-500">{testimonial.helpfulCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
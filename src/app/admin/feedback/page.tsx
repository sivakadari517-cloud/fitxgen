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
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Reply,
  Archive,
  Trash2,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  Gift,
  ArrowLeft
} from 'lucide-react'

interface FeedbackItem {
  _id: string
  type: string
  category: string
  title: string
  message: string
  rating?: number
  status: 'pending' | 'in_progress' | 'resolved' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  userInfo: {
    name: string
    email: string
    userId?: string
  }
  metadata: any
  createdAt: string
  updatedAt: string
  adminNotes?: string
  responseTime?: number
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'analytics'>('overview')
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([])
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgRating: 0,
    responseTime: 0,
    byType: {},
    byCategory: {},
    recentTrends: []
  })

  // Check if user is admin (in real app, this would be a proper role check)
  const isAdmin = session?.user?.email === 'admin@fitxgen.com' || session?.user?.name === 'Admin'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      if (!isAdmin) {
        router.push('/dashboard')
        return
      }
      fetchFeedback()
    }
  }, [status, router, isAdmin])

  useEffect(() => {
    filterFeedback()
  }, [feedback, searchTerm, statusFilter, typeFilter, priorityFilter])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/feedback?admin=true')
      if (response.ok) {
        const data = await response.json()
        setFeedback(data.feedback || [])
        calculateStats(data.feedback || [])
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (feedbackData: FeedbackItem[]) => {
    const total = feedbackData.length
    const pending = feedbackData.filter(f => f.status === 'pending').length
    const inProgress = feedbackData.filter(f => f.status === 'in_progress').length
    const resolved = feedbackData.filter(f => f.status === 'resolved').length
    
    const ratingsWithValues = feedbackData.filter(f => f.rating && f.rating > 0)
    const avgRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValues.length 
      : 0

    const byType = feedbackData.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byCategory = feedbackData.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      avgRating: Math.round(avgRating * 10) / 10,
      responseTime: 24, // Mock response time in hours
      byType,
      byCategory,
      recentTrends: []
    })
  }

  const filterFeedback = () => {
    let filtered = feedback

    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(f => f.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(f => f.type === typeFilter)
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(f => f.priority === priorityFilter)
    }

    setFilteredFeedback(filtered)
  }

  const updateFeedbackStatus = async (feedbackId: string, status: string, adminNotes?: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, adminNotes })
      })

      if (response.ok) {
        await fetchFeedback()
        if (selectedFeedback?._id === feedbackId) {
          setSelectedFeedback(null)
        }
      }
    } catch (error) {
      console.error('Failed to update feedback:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'archived': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rating': return Star
      case 'suggestion': return Lightbulb
      case 'bug_report': return Bug
      case 'testimonial': return Heart
      case 'feature_request': return Gift
      default: return MessageSquare
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin feedback center...</p>
        </div>
      </div>
    )
  }

  if (!session || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Feedback Center</h1>
              <p className="text-sm text-slate-600">Manage user feedback and analytics</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          <Button 
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            className={activeTab === 'overview' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button 
            onClick={() => setActiveTab('feedback')}
            variant={activeTab === 'feedback' ? 'default' : 'outline'}
            className={activeTab === 'feedback' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Feedback ({stats.total})
          </Button>
          <Button 
            onClick={() => setActiveTab('analytics')}
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            className={activeTab === 'analytics' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Feedback</p>
                      <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Average Rating</p>
                      <p className="text-2xl font-bold text-green-600">{stats.avgRating}/5</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Avg Response</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.responseTime}h</p>
                    </div>
                    <Reply className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>Latest feedback submissions requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.slice(0, 5).map((item) => {
                    const TypeIcon = getTypeIcon(item.type)
                    return (
                      <div key={item._id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                        <TypeIcon className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-600">
                            by {item.userInfo.name} • {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => setSelectedFeedback(item)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Feedback Management Tab */}
        {activeTab === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="rating">Rating</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="feature_request">Feature Request</option>
                  </select>

                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Items ({filteredFeedback.length})</CardTitle>
                <CardDescription>Manage and respond to user feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFeedback.map((item) => {
                    const TypeIcon = getTypeIcon(item.type)
                    return (
                      <div key={item._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <TypeIcon className="w-5 h-5 text-purple-500 mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                {item.rating && (
                                  <div className="flex">
                                    {[...Array(item.rating)].map((_, i) => (
                                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{item.message.substring(0, 150)}...</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <span>{item.userInfo.name}</span>
                                <span>{item.userInfo.email}</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                <span className="capitalize">{item.category.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            <Button size="sm" variant="outline" onClick={() => setSelectedFeedback(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.byType).map(([type, count]) => {
                      const countNum = Number(count)
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(countNum / stats.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{countNum}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.byCategory).slice(0, 8).map(([category, count]) => {
                      const countNum = Number(count)
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <span className="capitalize text-sm">{category.replace('_', ' ')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full">
                              <div
                                className="h-full bg-teal-500 rounded-full"
                                style={{ width: `${(countNum / stats.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{countNum}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Feedback Detail Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      {(() => {
                        const TypeIcon = getTypeIcon(selectedFeedback.type)
                        return <TypeIcon className="w-5 h-5 text-purple-500" />
                      })()}
                      <span>{selectedFeedback.title}</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedFeedback.userInfo.name} • {selectedFeedback.userInfo.email} • 
                      {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFeedback(null)}>
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                    {selectedFeedback.priority} priority
                  </span>
                  {selectedFeedback.rating && (
                    <div className="flex items-center space-x-1">
                      {[...Array(selectedFeedback.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-sm text-slate-600">({selectedFeedback.rating}/5)</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Message</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedFeedback.message}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Category</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedFeedback.category.replace('_', ' ')}
                  </span>
                </div>

                {selectedFeedback.adminNotes && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Admin Notes</h4>
                    <p className="text-slate-700 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      {selectedFeedback.adminNotes}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                  <Button 
                    onClick={() => updateFeedbackStatus(selectedFeedback._id, 'in_progress')}
                    variant="outline"
                    size="sm"
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    In Progress
                  </Button>
                  <Button 
                    onClick={() => updateFeedbackStatus(selectedFeedback._id, 'resolved', 'Issue resolved by admin team')}
                    variant="outline"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                  <Button 
                    onClick={() => updateFeedbackStatus(selectedFeedback._id, 'archived')}
                    variant="outline"
                    size="sm"
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MousePointer,
  Clock,
  Smartphone,
  Monitor,
  RefreshCcw,
  Download,
  Calendar,
  Eye,
  Target
} from 'lucide-react'

interface AnalyticsData {
  stats: {
    totalEvents: number
    uniqueSessions: string[]
    uniqueUsers: string[]
    totalRevenue: number
    avgValue: number
  }
  conversionFunnel: Array<{
    _id: string
    count: number
    revenue: number
    uniqueUsers: string[]
  }>
  topPages: Array<{
    _id: string
    events: number
    uniqueSessions: string[]
  }>
  events: any[]
}

interface AnalyticsDashboardProps {
  isAdmin?: boolean
  userId?: string
  timeRange?: '1h' | '24h' | '7d' | '30d' | '90d'
}

export default function AnalyticsDashboard({ 
  isAdmin = false, 
  userId, 
  timeRange = '24h' 
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState(timeRange)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedRange, userId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        range: selectedRange,
        ...(userId && { userId }),
        limit: '1000'
      })

      const response = await fetch(`/api/analytics/events?${params}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
  }

  const exportData = () => {
    if (!data) return
    
    const exportObj = {
      stats: data.stats,
      conversionFunnel: data.conversionFunnel,
      topPages: data.topPages,
      exportedAt: new Date().toISOString(),
      timeRange: selectedRange
    }
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitxgen-analytics-${selectedRange}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const { stats, conversionFunnel, topPages } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isAdmin ? 'Analytics Dashboard' : 'Your Activity'}
          </h2>
          <p className="text-slate-600">
            {isAdmin ? 'Monitor user behavior and conversions' : 'Track your FitXGen journey'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {/* Time Range Selector */}
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {isAdmin && (
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalEvents.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Sessions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueSessions.length.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueUsers.filter(Boolean).length.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-500" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>Track conversion events and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No conversions yet</p>
                ) : (
                  conversionFunnel.map((conversion, index) => (
                    <div key={conversion._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          conversion._id === 'payment' ? 'bg-green-500' :
                          conversion._id === 'registration' ? 'bg-blue-500' :
                          conversion._id === 'calculation' ? 'bg-purple-500' :
                          conversion._id === 'referral' ? 'bg-orange-500' :
                          'bg-gray-500'
                        }`} />
                        <div>
                          <p className="font-medium text-slate-900 capitalize">
                            {conversion._id.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {conversion.uniqueUsers.filter(Boolean).length} users
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{conversion.count}</p>
                        {conversion.revenue > 0 && (
                          <p className="text-sm text-green-600">₹{conversion.revenue.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Pages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Top Pages
              </CardTitle>
              <CardDescription>Most visited pages by events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPages.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No page data available</p>
                ) : (
                  topPages.map((page, index) => (
                    <div key={page._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900">
                            {page._id === '/' ? 'Home' : page._id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {page.uniqueSessions.length} sessions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{page.events}</p>
                        <p className="text-xs text-gray-500">events</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity (if admin) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest user events and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.events.slice(0, 20).map((event, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        event.conversionType ? 'bg-green-500' :
                        event.category === 'error' ? 'bg-red-500' :
                        event.category === 'engagement' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-slate-900">{event.action}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{event.page}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.userJourney?.deviceInfo?.isMobile ? (
                        <Smartphone className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Monitor className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-gray-500 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {data.events.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Key takeaways from your analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Engagement Score */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Engagement Score</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((stats.totalEvents / Math.max(stats.uniqueSessions.length, 1)) * 10, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {Math.round((stats.totalEvents / Math.max(stats.uniqueSessions.length, 1)) * 10)}%
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Events per session: {(stats.totalEvents / Math.max(stats.uniqueSessions.length, 1)).toFixed(1)}
                </p>
              </div>

              {/* Conversion Rate */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Conversion Rate</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((conversionFunnel.reduce((sum, c) => sum + c.count, 0) / Math.max(stats.uniqueSessions.length, 1)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-900">
                    {((conversionFunnel.reduce((sum, c) => sum + c.count, 0) / Math.max(stats.uniqueSessions.length, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  {conversionFunnel.reduce((sum, c) => sum + c.count, 0)} conversions from {stats.uniqueSessions.length} sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import mongoose from 'mongoose'

// Cron job for cleaning up old analytics data
export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Clean up analytics events older than 90 days
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)

    const AnalyticsEvent = mongoose.models.AnalyticsEvent
    if (AnalyticsEvent) {
      const result = await AnalyticsEvent.deleteMany({
        timestamp: { $lt: cutoffDate }
      })
      console.log(`Cleaned up ${result.deletedCount} old analytics events`)
    }

    // Clean up performance metrics older than 30 days
    const performanceCutoff = new Date()
    performanceCutoff.setDate(performanceCutoff.getDate() - 30)

    const PerformanceMetric = mongoose.models.PerformanceMetric
    if (PerformanceMetric) {
      const perfResult = await PerformanceMetric.deleteMany({
        timestamp: { $lt: performanceCutoff }
      })
      console.log(`Cleaned up ${perfResult.deletedCount} old performance metrics`)
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cleanup job failed:', error)
    return NextResponse.json(
      { error: 'Cleanup failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
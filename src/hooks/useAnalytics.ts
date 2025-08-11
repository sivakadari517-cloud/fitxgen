'use client'

import { useEffect, useCallback, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { analytics, conversionTracker, type AnalyticsEvent, type ConversionEvent } from '@/lib/analytics'

// Hook for basic analytics tracking
export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  // Track page views on route changes
  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    analytics.trackPageView(url)
  }, [pathname, searchParams])

  // Set user ID when session is available
  useEffect(() => {
    if (session?.user?.id) {
      analytics.setUserId(session.user.id)
    }
  }, [session])

  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp' | 'page'>) => {
    analytics.trackEvent(event)
  }, [])

  const trackConversion = useCallback((event: Omit<ConversionEvent, 'sessionId' | 'timestamp' | 'page'>) => {
    analytics.trackConversion(event)
  }, [])

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    analytics.trackButtonClick(buttonName, location || pathname)
  }, [pathname])

  const trackFormSubmission = useCallback((formName: string, success: boolean, errors?: string[]) => {
    analytics.trackFormSubmission(formName, success, errors)
  }, [])

  const trackFeatureUsage = useCallback((featureName: string, action: string, value?: number) => {
    analytics.trackFeatureUsage(featureName, action, value)
  }, [])

  return {
    trackEvent,
    trackConversion,
    trackButtonClick,
    trackFormSubmission,
    trackFeatureUsage,
    analytics,
    conversionTracker
  }
}

// Hook for conversion tracking
export function useConversionTracking() {
  const { data: session } = useSession()

  const trackRegistration = useCallback((method: 'email' | 'google' | 'phone') => {
    if (session?.user?.id) {
      conversionTracker.trackRegistration(method, session.user.id)
    }
  }, [session])

  const trackPayment = useCallback((transactionId: string, amount: number, currency: string = 'INR') => {
    conversionTracker.trackPayment(transactionId, amount, currency)
  }, [])

  const trackCalculation = useCallback((accuracy: number, method: 'navy' | 'ymca' | 'custom') => {
    conversionTracker.trackCalculation(accuracy, method)
  }, [])

  const trackReferral = useCallback((referrerUserId: string, newUserId: string) => {
    conversionTracker.trackReferral(referrerUserId, newUserId)
  }, [])

  const trackEngagementMilestone = useCallback((milestone: string, value: number) => {
    conversionTracker.trackEngagementMilestone(milestone, value)
  }, [])

  return {
    trackRegistration,
    trackPayment,
    trackCalculation,
    trackReferral,
    trackEngagementMilestone
  }
}

// Hook for measuring performance of functions
export function usePerformanceTracking() {
  const { trackEvent } = useAnalytics()

  const measureAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    eventName: string,
    category: string = 'performance'
  ): Promise<T> => {
    const startTime = performance.now()
    try {
      const result = await asyncFn()
      const endTime = performance.now()
      const duration = endTime - startTime

      trackEvent({
        action: 'async_operation',
        category,
        label: eventName,
        value: Math.round(duration),
        metadata: { operation: eventName, duration }
      })

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      trackEvent({
        action: 'async_operation_error',
        category,
        label: `${eventName}_error`,
        value: Math.round(duration),
        metadata: { 
          operation: eventName, 
          duration, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      throw error
    }
  }, [trackEvent])

  const measureSync = useCallback(<T>(
    syncFn: () => T,
    eventName: string,
    category: string = 'performance'
  ): T => {
    const startTime = performance.now()
    try {
      const result = syncFn()
      const endTime = performance.now()
      const duration = endTime - startTime

      trackEvent({
        action: 'sync_operation',
        category,
        label: eventName,
        value: Math.round(duration),
        metadata: { operation: eventName, duration }
      })

      return result
    } catch (error) {
      const endTime = performance.now()
      const duration = endTime - startTime

      trackEvent({
        action: 'sync_operation_error',
        category,
        label: `${eventName}_error`,
        value: Math.round(duration),
        metadata: { 
          operation: eventName, 
          duration, 
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      throw error
    }
  }, [trackEvent])

  return {
    measureAsync,
    measureSync
  }
}

// Hook for A/B testing and experiments
export function useExperiments() {
  const { trackEvent } = useAnalytics()
  const experimentsRef = useRef<Map<string, string>>(new Map())

  const getVariant = useCallback((experimentName: string, variants: string[]): string => {
    // Check if we already have a variant for this experiment
    if (experimentsRef.current.has(experimentName)) {
      return experimentsRef.current.get(experimentName)!
    }

    // Generate a consistent variant based on session ID and experiment name
    const sessionId = analytics.getUserJourney().sessionId
    const hash = Array.from(sessionId + experimentName)
      .reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)
    
    const variant = variants[Math.abs(hash) % variants.length]
    experimentsRef.current.set(experimentName, variant)

    // Track experiment exposure
    trackEvent({
      action: 'experiment_exposure',
      category: 'experiment',
      label: `${experimentName}_${variant}`,
      metadata: {
        experimentName,
        variant,
        variants: variants.length
      }
    })

    return variant
  }, [trackEvent])

  const trackExperimentConversion = useCallback((experimentName: string, conversionType: string, value?: number) => {
    const variant = experimentsRef.current.get(experimentName)
    if (!variant) return

    trackEvent({
      action: 'experiment_conversion',
      category: 'experiment',
      label: `${experimentName}_${variant}_${conversionType}`,
      value,
      metadata: {
        experimentName,
        variant,
        conversionType
      }
    })
  }, [trackEvent])

  return {
    getVariant,
    trackExperimentConversion
  }
}

// Hook for user behavior analytics
export function useBehaviorTracking() {
  const { trackEvent } = useAnalytics()
  const scrollDepthRef = useRef<Set<number>>(new Set())
  const timeOnPageRef = useRef<number>(Date.now())
  const pathname = usePathname()

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )

      // Track scroll milestones (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100]
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !scrollDepthRef.current.has(milestone)) {
          scrollDepthRef.current.add(milestone)
          trackEvent({
            action: 'scroll_depth',
            category: 'engagement',
            label: `${milestone}_percent`,
            value: milestone,
            metadata: { page: pathname, scrollPercent }
          })
        }
      }
    }

    const throttledScroll = throttle(handleScroll, 1000)
    window.addEventListener('scroll', throttledScroll)
    
    return () => {
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [trackEvent, pathname])

  // Track time on page
  useEffect(() => {
    timeOnPageRef.current = Date.now()
    scrollDepthRef.current.clear()

    return () => {
      const timeSpent = Date.now() - timeOnPageRef.current
      if (timeSpent > 5000) { // Only track if user spent more than 5 seconds
        trackEvent({
          action: 'time_on_page',
          category: 'engagement',
          label: pathname,
          value: Math.round(timeSpent / 1000), // Convert to seconds
          metadata: { page: pathname, timeSpentMs: timeSpent }
        })
      }
    }
  }, [pathname, trackEvent])

  // Track click heatmap data
  const trackClick = useCallback((element: string, x: number, y: number) => {
    trackEvent({
      action: 'click_tracking',
      category: 'interaction',
      label: element,
      metadata: {
        page: pathname,
        element,
        coordinates: { x, y },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    })
  }, [trackEvent, pathname])

  // Track form interactions
  const trackFormInteraction = useCallback((formName: string, field: string, action: 'focus' | 'blur' | 'change') => {
    trackEvent({
      action: 'form_interaction',
      category: 'form',
      label: `${formName}_${field}_${action}`,
      metadata: {
        formName,
        field,
        action,
        page: pathname
      }
    })
  }, [trackEvent, pathname])

  return {
    trackClick,
    trackFormInteraction
  }
}

// Hook for error tracking
export function useErrorTracking() {
  const { trackEvent } = useAnalytics()

  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent({
      action: 'javascript_error',
      category: 'error',
      label: error.name,
      metadata: {
        message: error.message,
        stack: error.stack,
        context,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    })
  }, [trackEvent])

  const trackApiError = useCallback((endpoint: string, status: number, message?: string) => {
    trackEvent({
      action: 'api_error',
      category: 'error',
      label: endpoint,
      value: status,
      metadata: {
        endpoint,
        status,
        message,
        url: window.location.href
      }
    })
  }, [trackEvent])

  const trackFormValidationError = useCallback((formName: string, field: string, error: string) => {
    trackEvent({
      action: 'form_validation_error',
      category: 'error',
      label: `${formName}_${field}`,
      metadata: {
        formName,
        field,
        error
      }
    })
  }, [trackEvent])

  // Automatically track unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), 'unhandled_error')
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      trackError(error, 'unhandled_promise_rejection')
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackError])

  return {
    trackError,
    trackApiError,
    trackFormValidationError
  }
}

// Utility function to throttle events
function throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
  let inThrottle: boolean
  return ((...args) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }) as T
}
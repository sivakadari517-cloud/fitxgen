'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { performanceMonitor, mobileOptimizer, progressiveLoader, type LoadingState, type PerformanceMetric } from '@/lib/performance'
import MobileLoader from '@/components/performance/MobileLoader'

interface PerformanceContextType {
  isLoading: boolean
  loadingState: LoadingState
  performanceScore: number
  deviceInfo: {
    isLowEnd: boolean
    connectionType: string
    optimizations: string[]
  }
  metrics: PerformanceMetric[]
  startLoading: () => void
  stopLoading: () => void
  recordCustomMetric: (name: string, value: number) => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

interface PerformanceProviderProps {
  children: ReactNode
  enableMobileLoader?: boolean
  showDeviceInfo?: boolean
  autoStart?: boolean
}

export default function PerformanceProvider({
  children,
  enableMobileLoader = true,
  showDeviceInfo = true,
  autoStart = true
}: PerformanceProviderProps) {
  const [isLoading, setIsLoading] = useState(autoStart)
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: autoStart,
    progress: 0,
    stage: 'initial'
  })
  const [performanceScore, setPerformanceScore] = useState(100)
  const [deviceInfo, setDeviceInfo] = useState({
    isLowEnd: false,
    connectionType: 'unknown',
    optimizations: [] as string[]
  })
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get device capabilities
    const isLowEnd = mobileOptimizer.isLowEndDevice_()
    const connectionType = mobileOptimizer.getConnectionType()
    const optimizations = mobileOptimizer.getOptimizations()

    setDeviceInfo({ isLowEnd, connectionType, optimizations })

    // Subscribe to loading state changes
    const unsubscribeLoader = progressiveLoader.subscribe(setLoadingState)

    // Update performance score periodically
    const scoreInterval = setInterval(() => {
      const score = performanceMonitor.getPerformanceScore()
      setPerformanceScore(score)
    }, 5000)

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics()
      setMetrics(currentMetrics.slice(-20)) // Keep last 20 metrics
    }, 2000)

    // Apply optimizations based on device
    applyDeviceOptimizations(optimizations)

    return () => {
      unsubscribeLoader()
      clearInterval(scoreInterval)
      clearInterval(metricsInterval)
      performanceMonitor.cleanup()
    }
  }, [])

  // Sync loading state changes
  useEffect(() => {
    setIsLoading(loadingState.isLoading)
  }, [loadingState.isLoading])

  // Apply device-specific optimizations
  const applyDeviceOptimizations = (optimizations: string[]) => {
    if (optimizations.includes('reduce-animations')) {
      // Disable complex animations for low-end devices
      document.documentElement.style.setProperty('--animation-duration', '0.1s')
      document.documentElement.classList.add('reduce-motion')
    }

    if (optimizations.includes('lazy-load-images')) {
      // Enable aggressive lazy loading
      document.documentElement.classList.add('aggressive-lazy-loading')
    }

    if (optimizations.includes('enable-data-saver')) {
      // Enable data saver mode
      document.documentElement.classList.add('data-saver-mode')
    }

    if (optimizations.includes('defer-non-critical-js')) {
      // Defer non-critical JavaScript
      const nonCriticalScripts = document.querySelectorAll('script[data-priority="low"]')
      nonCriticalScripts.forEach(script => {
        script.setAttribute('defer', 'true')
      })
    }
  }

  const startLoading = () => {
    setIsLoading(true)
    progressiveLoader.startLoading()
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'complete',
      progress: 100
    }))
  }

  const recordCustomMetric = (name: string, value: number) => {
    // Record custom performance metric
    if (typeof window !== 'undefined') {
      const metric = {
        name: `custom-${name}`,
        value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      
      // Send to analytics
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...metric,
          sessionId,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          screenSize: {
            width: screen.width,
            height: screen.height
          }
        })
      }).catch(() => {
        // Silent fail for analytics
      })
    }
  }

  const contextValue: PerformanceContextType = {
    isLoading,
    loadingState,
    performanceScore,
    deviceInfo,
    metrics,
    startLoading,
    stopLoading,
    recordCustomMetric
  }

  return (
    <PerformanceContext.Provider value={contextValue}>
      {enableMobileLoader && (
        <MobileLoader
          onLoadingComplete={stopLoading}
          showDeviceInfo={showDeviceInfo}
        />
      )}
      {children}
    </PerformanceContext.Provider>
  )
}

// Hook to use performance context
export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider')
  }
  return context
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const { recordCustomMetric, performanceScore, metrics } = usePerformance()

  const measureFunction = <T extends any[], R>(
    fn: (...args: T) => R,
    name: string
  ) => {
    return (...args: T): R => {
      const start = performance.now()
      try {
        const result = fn(...args)
        const end = performance.now()
        recordCustomMetric(name, end - start)
        return result
      } catch (error) {
        const end = performance.now()
        recordCustomMetric(`${name}-error`, end - start)
        throw error
      }
    }
  }

  const measureAsync = async <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    name: string,
    ...args: T
  ): Promise<R> => {
    const start = performance.now()
    try {
      const result = await fn(...args)
      const end = performance.now()
      recordCustomMetric(name, end - start)
      return result
    } catch (error) {
      const end = performance.now()
      recordCustomMetric(`${name}-error`, end - start)
      throw error
    }
  }

  return {
    measureFunction,
    measureAsync,
    recordCustomMetric,
    performanceScore,
    metrics
  }
}

// Device capabilities hook
export function useDeviceCapabilities() {
  const { deviceInfo } = usePerformance()
  
  return {
    isLowEndDevice: deviceInfo.isLowEnd,
    connectionType: deviceInfo.connectionType,
    optimizations: deviceInfo.optimizations,
    shouldReduceAnimations: deviceInfo.optimizations.includes('reduce-animations'),
    shouldLazyLoad: deviceInfo.optimizations.includes('lazy-load-images'),
    isDataSaverMode: deviceInfo.optimizations.includes('enable-data-saver')
  }
}

// Loading state hook
export function useLoadingState() {
  const { isLoading, loadingState, startLoading, stopLoading } = usePerformance()

  return {
    isLoading,
    progress: loadingState.progress,
    stage: loadingState.stage,
    error: loadingState.error,
    startLoading,
    stopLoading
  }
}
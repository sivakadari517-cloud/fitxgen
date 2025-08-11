// Performance monitoring and optimization utilities for FitXGen

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url: string
  userAgent: string
}

interface LoadingState {
  isLoading: boolean
  progress: number
  stage: 'initial' | 'data' | 'assets' | 'complete'
  error?: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.trackWebVitals()
    }
  }

  // Initialize performance observers
  private initializeObservers() {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const entryValue = (entry as any).value ||
                             (entry as any).processingStart ||
                             (entry as any).startTime ||
                             entry.duration || 0
            this.recordMetric({
              name: entry.name,
              value: entryValue,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent
            })
          })
        })

        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
        this.observers.set('core-vitals', observer)
      } catch (error) {
        console.warn('Performance Observer not supported:', error)
      }
    }

    // Resource loading observer
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 1000) { // Log slow resources
              this.recordMetric({
                name: `slow-resource-${entry.name}`,
                value: entry.duration,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
              })
            }
          })
        })

        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.set('resources', resourceObserver)
      } catch (error) {
        console.warn('Resource Observer not supported:', error)
      }
    }
  }

  // Track Core Web Vitals
  private trackWebVitals() {
    if (typeof window === 'undefined') return

    // First Contentful Paint
    this.measureFCP()
    
    // Largest Contentful Paint
    this.measureLCP()
    
    // Cumulative Layout Shift
    this.measureCLS()
    
    // First Input Delay
    this.measureFID()
    
    // Time to Interactive
    this.measureTTI()
  }

  private measureFCP() {
    if ('PerformancePaintTiming' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric({
              name: 'fcp',
              value: entry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent
            })
          }
        })
      })
      observer.observe({ entryTypes: ['paint'] })
    }
  }

  private measureLCP() {
    if ('LargestContentfulPaint' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric({
          name: 'lcp',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  }

  private measureCLS() {
    let clsValue = 0
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      this.recordMetric({
        name: 'cls',
        value: clsValue,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    })
    
    if ('LayoutShift' in window) {
      observer.observe({ entryTypes: ['layout-shift'] })
    }
  }

  private measureFID() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        this.recordMetric({
          name: 'fid',
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      })
    })

    if ('FirstInputDelay' in window) {
      observer.observe({ entryTypes: ['first-input'] })
    }
  }

  private measureTTI() {
    // Simplified TTI measurement
    let ttiTime = 0
    const startTime = performance.now()
    
    const checkTTI = () => {
      if (document.readyState === 'complete') {
        ttiTime = performance.now() - startTime
        this.recordMetric({
          name: 'tti',
          value: ttiTime,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      } else {
        setTimeout(checkTTI, 100)
      }
    }
    
    setTimeout(checkTTI, 0)
  }

  // Record performance metric
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric)
    }
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${metric.name}: ${Math.round(metric.value)}ms`)
    }
  }

  // Send metrics to analytics service
  private async sendToAnalytics(metric: PerformanceMetric) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metric)
      })
    } catch (error) {
      // Silent fail for analytics
    }
  }

  // Get current performance score
  getPerformanceScore(): number {
    const recentMetrics = this.metrics.slice(-10)
    if (recentMetrics.length === 0) return 100

    const weights = {
      fcp: 0.15,
      lcp: 0.25,
      fid: 0.25,
      cls: 0.25,
      tti: 0.10
    }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([name, weight]) => {
      const metric = recentMetrics.find(m => m.name === name)
      if (metric) {
        let score = 100
        
        // Score based on thresholds
        switch (name) {
          case 'fcp':
            score = metric.value < 1800 ? 100 : metric.value < 3000 ? 75 : 50
            break
          case 'lcp':
            score = metric.value < 2500 ? 100 : metric.value < 4000 ? 75 : 50
            break
          case 'fid':
            score = metric.value < 100 ? 100 : metric.value < 300 ? 75 : 50
            break
          case 'cls':
            score = metric.value < 0.1 ? 100 : metric.value < 0.25 ? 75 : 50
            break
          case 'tti':
            score = metric.value < 3800 ? 100 : metric.value < 7300 ? 75 : 50
            break
        }
        
        totalScore += score * weight
        totalWeight += weight
      }
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 100
  }

  // Get all metrics
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = []
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// Mobile-specific performance optimizations
class MobilePerformanceOptimizer {
  private connectionType: string = 'unknown'
  private isLowEndDevice: boolean = false
  private memoryInfo: any = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.detectDeviceCapabilities()
      this.optimizeForConnection()
    }
  }

  // Detect device capabilities
  private detectDeviceCapabilities() {
    // Memory detection
    if ('memory' in navigator) {
      this.memoryInfo = (navigator as any).memory
      this.isLowEndDevice = this.memoryInfo.jsHeapSizeLimit < 1073741824 // < 1GB
    }

    // Hardware concurrency
    const cores = navigator.hardwareConcurrency || 1
    if (cores <= 2) {
      this.isLowEndDevice = true
    }

    // Connection detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.connectionType = connection.effectiveType || 'unknown'
    }
  }

  // Optimize based on connection
  private optimizeForConnection() {
    if (this.connectionType === '2g' || this.connectionType === 'slow-2g') {
      // Ultra-low bandwidth optimizations
      this.enableDataSaver()
      this.preloadCriticalResources()
    } else if (this.connectionType === '3g') {
      // Moderate bandwidth optimizations
      this.preloadImportantResources()
    }
  }

  // Enable data saver mode
  private enableDataSaver() {
    // Disable auto-playing videos
    document.querySelectorAll('video').forEach(video => {
      video.preload = 'none'
      video.autoplay = false
    })

    // Lazy load all images
    document.querySelectorAll('img').forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy'
      }
    })
  }

  // Preload critical resources
  private preloadCriticalResources() {
    const criticalResources = [
      '/api/auth/session',
      '/css/critical.css'
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = resource.includes('.css') ? 'style' : 'fetch'
      document.head.appendChild(link)
    })
  }

  // Preload important resources
  private preloadImportantResources() {
    const importantResources = [
      '/api/user/profile',
      '/images/logo-small.webp'
    ]

    importantResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = resource
      document.head.appendChild(link)
    })
  }

  // Get optimization recommendations
  getOptimizations(): string[] {
    const optimizations: string[] = []

    if (this.isLowEndDevice) {
      optimizations.push('reduce-animations')
      optimizations.push('lazy-load-images')
      optimizations.push('defer-non-critical-js')
    }

    if (this.connectionType === '2g' || this.connectionType === 'slow-2g') {
      optimizations.push('enable-data-saver')
      optimizations.push('compress-images')
      optimizations.push('minimize-requests')
    }

    return optimizations
  }

  // Check if device is low-end
  isLowEndDevice_(): boolean {
    return this.isLowEndDevice
  }

  // Get connection type
  getConnectionType(): string {
    return this.connectionType
  }
}

// Progressive loading manager
class ProgressiveLoader {
  private loadingState: LoadingState = {
    isLoading: false,
    progress: 0,
    stage: 'initial'
  }

  private listeners: Array<(state: LoadingState) => void> = []

  // Start progressive loading
  startLoading() {
    this.updateState({
      isLoading: true,
      progress: 0,
      stage: 'initial'
    })

    // Simulate progressive loading stages
    this.loadStage('data', 25, 500)
      .then(() => this.loadStage('assets', 75, 1000))
      .then(() => this.loadStage('complete', 100, 200))
      .catch((error) => {
        this.updateState({
          ...this.loadingState,
          error: error.message,
          isLoading: false
        })
      })
  }

  // Load specific stage
  private loadStage(stage: LoadingState['stage'], targetProgress: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startProgress = this.loadingState.progress
      const progressDiff = targetProgress - startProgress
      const startTime = Date.now()

      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(
          startProgress + (progressDiff * elapsed) / duration,
          targetProgress
        )

        this.updateState({
          ...this.loadingState,
          progress,
          stage
        })

        if (progress < targetProgress) {
          requestAnimationFrame(updateProgress)
        } else {
          if (stage === 'complete') {
            this.updateState({
              ...this.loadingState,
              isLoading: false,
              progress: 100,
              stage: 'complete'
            })
          }
          resolve()
        }
      }

      requestAnimationFrame(updateProgress)
    })
  }

  // Update loading state
  private updateState(newState: Partial<LoadingState>) {
    this.loadingState = { ...this.loadingState, ...newState }
    this.listeners.forEach(listener => listener(this.loadingState))
  }

  // Subscribe to loading state changes
  subscribe(listener: (state: LoadingState) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Get current loading state
  getState(): LoadingState {
    return { ...this.loadingState }
  }
}

// Image optimization utility
class ImageOptimizer {
  // Get optimized image URL
  static getOptimizedImageUrl(
    src: string,
    width: number,
    height: number,
    quality: number = 80
  ): string {
    // For Next.js Image component
    if (src.startsWith('/')) {
      return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&h=${height}&q=${quality}`
    }
    
    // For external images, return as-is (would integrate with image CDN)
    return src
  }

  // Lazy load image with IntersectionObserver
  static lazyLoadImage(img: HTMLImageElement, src: string) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src
            img.classList.add('loaded')
            observer.unobserve(img)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(img)
  }

  // Convert to WebP if supported
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }
}

// Export utilities
export const performanceMonitor = new PerformanceMonitor()
export const mobileOptimizer = new MobilePerformanceOptimizer()
export const progressiveLoader = new ProgressiveLoader()
export { ImageOptimizer }
export type { PerformanceMetric, LoadingState }
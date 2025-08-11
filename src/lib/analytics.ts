// Comprehensive analytics and conversion tracking for FitXGen

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  userId?: string
  sessionId: string
  timestamp: number
  page: string
  metadata?: Record<string, any>
}

interface ConversionEvent extends AnalyticsEvent {
  conversionType: 'registration' | 'payment' | 'calculation' | 'referral' | 'engagement' | 'retention'
  revenue?: number
  currency?: string
  transactionId?: string
  source?: string
  medium?: string
  campaign?: string
}

interface UserJourney {
  userId?: string
  sessionId: string
  events: AnalyticsEvent[]
  startTime: number
  lastActivity: number
  source?: string
  medium?: string
  campaign?: string
  referrer?: string
  landingPage: string
  deviceInfo: {
    isMobile: boolean
    browser: string
    os: string
    screenResolution: string
  }
}

class AnalyticsManager {
  private sessionId: string
  private userId?: string
  private userJourney: UserJourney
  private gtmId?: string
  private pixelId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.userJourney = {
      sessionId: this.sessionId,
      events: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
      landingPage: typeof window !== 'undefined' ? window.location.href : '',
      deviceInfo: this.getDeviceInfo()
    }
    
    if (typeof window !== 'undefined') {
      this.initializeAnalytics()
      this.trackPageView()
    }
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        browser: 'unknown',
        os: 'unknown',
        screenResolution: '0x0'
      }
    }

    const userAgent = navigator.userAgent
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
    
    // Detect browser
    let browser = 'unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    // Detect OS
    let os = 'unknown'
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

    return {
      isMobile,
      browser,
      os,
      screenResolution: `${screen.width}x${screen.height}`
    }
  }

  private initializeAnalytics() {
    // Initialize Google Tag Manager
    this.initializeGTM()
    
    // Initialize Facebook Pixel
    this.initializeFacebookPixel()
    
    // Get UTM parameters
    this.parseUTMParameters()
    
    // Get referrer information
    this.userJourney.referrer = document.referrer || 'direct'
  }

  private initializeGTM() {
    this.gtmId = process.env.NEXT_PUBLIC_GTM_ID
    if (!this.gtmId) return

    // Initialize dataLayer
    (window as any).dataLayer = (window as any).dataLayer || []
    
    // GTM script injection
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtm.js?id=${this.gtmId}`
    document.head.appendChild(script)

    // Initialize GTM
    ;(window as any).dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    })

    // Add noscript fallback
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.gtmId}`
    iframe.height = '0'
    iframe.width = '0'
    iframe.style.display = 'none'
    iframe.style.visibility = 'hidden'
    noscript.appendChild(iframe)
    document.body.insertBefore(noscript, document.body.firstChild)
  }

  private initializeFacebookPixel() {
    this.pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
    if (!this.pixelId) return

    // Facebook Pixel initialization (simplified for TypeScript)
    if (!(window as any).fbq) {
      (window as any).fbq = function(...args: any[]) {
        ((window as any).fbq.q = (window as any).fbq.q || []).push(args)
      };
      (window as any).fbq.q = [];
      
      // Load Facebook Pixel script
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
      }
    }

    ;(window as any).fbq('init', this.pixelId)
    ;(window as any).fbq('track', 'PageView')
  }

  private parseUTMParameters() {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    this.userJourney.source = urlParams.get('utm_source') || undefined
    this.userJourney.medium = urlParams.get('utm_medium') || undefined
    this.userJourney.campaign = urlParams.get('utm_campaign') || undefined

    // Store in session storage for persistence
    if (this.userJourney.source) {
      sessionStorage.setItem('utm_source', this.userJourney.source)
      sessionStorage.setItem('utm_medium', this.userJourney.medium || '')
      sessionStorage.setItem('utm_campaign', this.userJourney.campaign || '')
    } else {
      // Try to get from session storage
      this.userJourney.source = sessionStorage.getItem('utm_source') || undefined
      this.userJourney.medium = sessionStorage.getItem('utm_medium') || undefined
      this.userJourney.campaign = sessionStorage.getItem('utm_campaign') || undefined
    }
  }

  // Set user ID after authentication
  setUserId(userId: string) {
    this.userId = userId
    this.userJourney.userId = userId

    // Update Google Analytics user ID
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId
      })
    }

    // Update Facebook Pixel user ID
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('init', this.pixelId, {
        external_id: userId
      })
    }
  }

  // Track generic events
  trackEvent(event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp' | 'page'>) {
    const fullEvent: AnalyticsEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      userId: this.userId
    }

    this.userJourney.events.push(fullEvent)
    this.userJourney.lastActivity = Date.now()

    // Send to Google Analytics
    this.sendToGA(fullEvent)

    // Send to Facebook Pixel
    this.sendToFacebookPixel(fullEvent)

    // Send to internal analytics
    this.sendToInternalAnalytics(fullEvent)
  }

  // Track conversion events
  trackConversion(event: Omit<ConversionEvent, 'sessionId' | 'timestamp' | 'page'>) {
    const fullEvent: ConversionEvent = {
      ...event,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      userId: this.userId,
      source: event.source || this.userJourney.source,
      medium: event.medium || this.userJourney.medium,
      campaign: event.campaign || this.userJourney.campaign
    }

    this.userJourney.events.push(fullEvent)
    this.userJourney.lastActivity = Date.now()

    // Send conversion to all platforms
    this.sendConversionToGA(fullEvent)
    this.sendConversionToFacebookPixel(fullEvent)
    this.sendToInternalAnalytics(fullEvent)

    // Special handling for payment conversions
    if (event.conversionType === 'payment') {
      this.trackPurchase(fullEvent)
    }
  }

  // Track page views
  trackPageView(page?: string) {
    const currentPage = page || (typeof window !== 'undefined' ? window.location.pathname : '')
    
    this.trackEvent({
      action: 'page_view',
      category: 'navigation',
      label: currentPage
    })

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: currentPage
      })
    }

    // Send to Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      ;(window as any).fbq('track', 'PageView')
    }
  }

  private sendToGA(event: AnalyticsEvent) {
    if (typeof window === 'undefined' || !(window as any).gtag) return

    ;(window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_id: event.userId,
      custom_map: event.metadata
    })
  }

  private sendConversionToGA(event: ConversionEvent) {
    if (typeof window === 'undefined' || !(window as any).gtag) return

    // Send as conversion event
    ;(window as any).gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
      event_category: event.category,
      event_label: event.label,
      value: event.revenue || event.value,
      currency: event.currency || 'INR',
      transaction_id: event.transactionId
    })

    // Send specific conversion based on type
    switch (event.conversionType) {
      case 'registration':
        ;(window as any).gtag('event', 'sign_up', {
          method: event.metadata?.method || 'email'
        })
        break
      case 'payment':
        ;(window as any).gtag('event', 'purchase', {
          transaction_id: event.transactionId,
          value: event.revenue,
          currency: event.currency,
          items: event.metadata?.items || []
        })
        break
      case 'calculation':
        ;(window as any).gtag('event', 'generate_lead', {
          currency: 'INR',
          value: 99 // Potential customer value
        })
        break
    }
  }

  private sendToFacebookPixel(event: AnalyticsEvent) {
    if (typeof window === 'undefined' || !(window as any).fbq) return

    ;(window as any).fbq('trackCustom', event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.metadata
    })
  }

  private sendConversionToFacebookPixel(event: ConversionEvent) {
    if (typeof window === 'undefined' || !(window as any).fbq) return

    switch (event.conversionType) {
      case 'registration':
        ;(window as any).fbq('track', 'CompleteRegistration')
        break
      case 'payment':
        ;(window as any).fbq('track', 'Purchase', {
          value: event.revenue,
          currency: event.currency || 'INR'
        })
        break
      case 'calculation':
        ;(window as any).fbq('track', 'Lead')
        break
      case 'engagement':
        ;(window as any).fbq('track', 'ViewContent')
        break
    }
  }

  private trackPurchase(event: ConversionEvent) {
    // Enhanced e-commerce tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'purchase', {
        transaction_id: event.transactionId,
        value: event.revenue,
        currency: event.currency || 'INR',
        items: [{
          item_id: 'fitxgen-premium',
          item_name: 'FitXGen Premium Access',
          category: 'Health & Fitness',
          quantity: 1,
          price: event.revenue
        }]
      })
    }
  }

  private async sendToInternalAnalytics(event: AnalyticsEvent | ConversionEvent) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...event,
          userJourney: this.getUserJourney()
        })
      })
    } catch (error) {
      // Silent fail for analytics
      console.warn('Failed to send internal analytics:', error)
    }
  }

  // Get current user journey
  getUserJourney(): UserJourney {
    return { ...this.userJourney }
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean, errors?: string[]) {
    this.trackEvent({
      action: success ? 'form_submit_success' : 'form_submit_error',
      category: 'form',
      label: formName,
      metadata: { errors }
    })
  }

  // Track button clicks
  trackButtonClick(buttonName: string, location: string) {
    this.trackEvent({
      action: 'button_click',
      category: 'interaction',
      label: `${buttonName}_${location}`
    })
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, action: string, value?: number) {
    this.trackEvent({
      action: 'feature_usage',
      category: 'engagement',
      label: `${featureName}_${action}`,
      value
    })
  }

  // Track timing events
  trackTiming(category: string, variable: string, time: number, label?: string) {
    this.trackEvent({
      action: 'timing',
      category,
      label: `${variable}_${label}`,
      value: time
    })
  }

  // Clean up
  cleanup() {
    // Send final analytics data
    if (this.userJourney.events.length > 0) {
      navigator.sendBeacon('/api/analytics/events', JSON.stringify({
        action: 'session_end',
        category: 'session',
        sessionId: this.sessionId,
        timestamp: Date.now(),
        userJourney: this.getUserJourney()
      }))
    }
  }
}

// Conversion tracking utilities
export class ConversionTracker {
  private analytics: AnalyticsManager

  constructor(analytics: AnalyticsManager) {
    this.analytics = analytics
  }

  // Track registration conversion
  trackRegistration(method: 'email' | 'google' | 'phone', userId: string) {
    this.analytics.setUserId(userId)
    this.analytics.trackConversion({
      action: 'registration',
      category: 'conversion',
      conversionType: 'registration',
      label: method,
      metadata: { registrationMethod: method }
    })
  }

  // Track payment conversion
  trackPayment(transactionId: string, amount: number, currency: string = 'INR') {
    this.analytics.trackConversion({
      action: 'payment',
      category: 'conversion',
      conversionType: 'payment',
      revenue: amount,
      currency,
      transactionId,
      label: `payment_${amount}_${currency}`
    })
  }

  // Track body fat calculation
  trackCalculation(accuracy: number, method: 'navy' | 'ymca' | 'custom') {
    this.analytics.trackConversion({
      action: 'body_fat_calculation',
      category: 'conversion',
      conversionType: 'calculation',
      value: accuracy,
      label: method,
      metadata: { calculationMethod: method, accuracy }
    })
  }

  // Track referral conversion
  trackReferral(referrerUserId: string, newUserId: string) {
    this.analytics.trackConversion({
      action: 'referral_conversion',
      category: 'conversion',
      conversionType: 'referral',
      label: referrerUserId,
      metadata: { referrerUserId, newUserId }
    })
  }

  // Track engagement milestones
  trackEngagementMilestone(milestone: string, value: number) {
    this.analytics.trackConversion({
      action: 'engagement_milestone',
      category: 'conversion',
      conversionType: 'engagement',
      label: milestone,
      value,
      metadata: { milestone }
    })
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager()
export const conversionTracker = new ConversionTracker(analytics)

// Export types
export type { AnalyticsEvent, ConversionEvent, UserJourney }
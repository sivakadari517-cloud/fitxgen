'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Shield, 
  Cookie, 
  BarChart3, 
  Target, 
  Settings,
  Check,
  X,
  Info
} from 'lucide-react'

interface ConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  timestamp: number
}

const CONSENT_STORAGE_KEY = 'fitxgen_consent'
const CONSENT_VERSION = '1.0'
const CONSENT_EXPIRY_DAYS = 365

export default function ConsentManager() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentSettings>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: 0
  })

  useEffect(() => {
    checkConsentStatus()
  }, [])

  const checkConsentStatus = () => {
    try {
      const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY)
      
      if (!storedConsent) {
        // No consent stored, show banner
        setShowBanner(true)
        return
      }

      const parsed = JSON.parse(storedConsent)
      
      // Check if consent is expired (1 year)
      const now = Date.now()
      const consentAge = now - parsed.timestamp
      const maxAge = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      
      if (consentAge > maxAge || parsed.version !== CONSENT_VERSION) {
        // Consent expired or version changed, request new consent
        setShowBanner(true)
        return
      }

      // Valid consent exists
      setConsent(parsed)
      applyConsentSettings(parsed)
      
    } catch (error) {
      // Invalid stored consent, request new
      setShowBanner(true)
    }
  }

  const saveConsent = (settings: Partial<ConsentSettings>) => {
    const fullSettings: ConsentSettings = {
      ...consent,
      ...settings,
      necessary: true, // Always true
      timestamp: Date.now()
    }

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        ...fullSettings,
        version: CONSENT_VERSION
      }))
      
      setConsent(fullSettings)
      applyConsentSettings(fullSettings)
      setShowBanner(false)
      setShowDetails(false)

      // Track consent decision
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: settings.analytics ? 'granted' : 'denied',
          ad_storage: settings.marketing ? 'granted' : 'denied',
          functionality_storage: settings.preferences ? 'granted' : 'denied',
          personalization_storage: settings.preferences ? 'granted' : 'denied'
        })
      }
      
    } catch (error) {
      console.error('Failed to save consent:', error)
    }
  }

  const applyConsentSettings = (settings: ConsentSettings) => {
    // Apply analytics consent
    if (settings.analytics) {
      enableAnalytics()
    } else {
      disableAnalytics()
    }

    // Apply marketing consent
    if (settings.marketing) {
      enableMarketing()
    } else {
      disableMarketing()
    }

    // Apply preferences consent
    if (settings.preferences) {
      enablePreferences()
    } else {
      disablePreferences()
    }
  }

  const enableAnalytics = () => {
    // Enable Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const disableAnalytics = () => {
    // Disable analytics and clear existing data
    if (typeof window !== 'undefined') {
      // Clear analytics cookies
      const analyticsCookies = document.cookie
        .split(';')
        .filter(cookie => cookie.trim().startsWith('_ga') || cookie.trim().startsWith('_gid'))
      
      analyticsCookies.forEach(cookie => {
        const name = cookie.split('=')[0].trim()
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`
      })

      if ((window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied'
        })
      }
    }
  }

  const enableMarketing = () => {
    // Enable marketing tools (Facebook Pixel, etc.)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', 'grant')
    }
  }

  const disableMarketing = () => {
    // Disable marketing tools
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('consent', 'revoke')
    }
  }

  const enablePreferences = () => {
    // Enable preference storage
    console.log('Preferences enabled')
  }

  const disablePreferences = () => {
    // Clear preference storage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('fitxgen_pref_')) {
        localStorage.removeItem(key)
      }
    })
  }

  const handleAcceptAll = () => {
    saveConsent({
      analytics: true,
      marketing: true,
      preferences: true
    })
  }

  const handleAcceptNecessary = () => {
    saveConsent({
      analytics: false,
      marketing: false,
      preferences: false
    })
  }

  const handleSavePreferences = () => {
    saveConsent(consent)
  }

  const toggleConsentType = (type: keyof ConsentSettings) => {
    if (type === 'necessary') return // Can't disable necessary cookies
    
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Your Privacy Matters
                </h2>
                <p className="text-slate-600 text-sm">
                  We use cookies and similar technologies to enhance your experience, analyze usage, 
                  and provide personalized content. Choose your preferences below.
                </p>
              </div>
            </div>

            {!showDetails ? (
              // Banner View
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleAcceptAll}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    Accept All
                  </Button>
                  
                  <Button 
                    onClick={handleAcceptNecessary}
                    variant="outline"
                  >
                    Necessary Only
                  </Button>
                  
                  <Button 
                    onClick={() => setShowDetails(true)}
                    variant="ghost"
                    className="text-purple-600"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Customize
                  </Button>
                </div>

                <p className="text-xs text-slate-500">
                  By clicking "Accept All", you agree to our{' '}
                  <a href="/privacy" className="text-purple-600 hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/cookies" className="text-purple-600 hover:underline">
                    Cookie Policy
                  </a>
                  .
                </p>
              </div>
            ) : (
              // Detailed View
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {/* Necessary Cookies */}
                    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3 flex-1">
                        <Cookie className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Necessary Cookies
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Essential for the website to function properly. Cannot be disabled.
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span>• Authentication</span>
                            <span>• Security</span>
                            <span>• Core functionality</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                          <div className="w-4 h-4 bg-white rounded-full ml-auto shadow">
                            <Check className="w-3 h-3 text-green-500 m-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3 flex-1">
                        <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Analytics Cookies
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Help us understand how you use our website to improve your experience.
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span>• Google Analytics</span>
                            <span>• Usage statistics</span>
                            <span>• Performance monitoring</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleConsentType('analytics')}
                          className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                            consent.analytics ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            consent.analytics ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3 flex-1">
                        <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Marketing Cookies
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Used to show you relevant ads and measure campaign effectiveness.
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span>• Facebook Pixel</span>
                            <span>• Ad targeting</span>
                            <span>• Conversion tracking</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleConsentType('marketing')}
                          className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                            consent.marketing ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            consent.marketing ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>

                    {/* Preferences Cookies */}
                    <div className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start space-x-3 flex-1">
                        <Settings className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            Preference Cookies
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Remember your settings and preferences for a personalized experience.
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span>• Theme preferences</span>
                            <span>• Language settings</span>
                            <span>• Dashboard layout</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => toggleConsentType('preferences')}
                          className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                            consent.preferences ? 'bg-purple-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            consent.preferences ? 'translate-x-6' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      You can change these preferences at any time in your account settings 
                      or by clicking the cookie icon in the footer.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button 
                      onClick={handleSavePreferences}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    >
                      Save Preferences
                    </Button>
                    
                    <Button 
                      onClick={() => setShowDetails(false)}
                      variant="outline"
                    >
                      Back
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Hook for accessing current consent settings
export function useConsent() {
  const [consent, setConsent] = useState<ConsentSettings | null>(null)

  useEffect(() => {
    const checkConsent = () => {
      try {
        const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
        if (stored) {
          setConsent(JSON.parse(stored))
        }
      } catch {
        setConsent(null)
      }
    }

    checkConsent()

    // Listen for storage changes
    const handleStorageChange = () => {
      checkConsent()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return consent
}

// Utility functions for checking consent
export const ConsentUtils = {
  hasConsent: (type: keyof ConsentSettings): boolean => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (!stored) return false
      
      const consent = JSON.parse(stored)
      return consent[type] === true
    } catch {
      return false
    }
  },

  isConsentRequired: (): boolean => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (!stored) return true
      
      const consent = JSON.parse(stored)
      const age = Date.now() - consent.timestamp
      const maxAge = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      
      return age > maxAge || consent.version !== CONSENT_VERSION
    } catch {
      return true
    }
  },

  revokeConsent: () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY)
    window.location.reload() // Refresh to show consent banner
  }
}
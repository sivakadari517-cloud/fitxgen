'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { progressiveLoader, mobileOptimizer, type LoadingState } from '@/lib/performance'
import { Loader2, Smartphone, Wifi, Battery } from 'lucide-react'

interface MobileLoaderProps {
  onLoadingComplete?: () => void
  showDeviceInfo?: boolean
  customMessage?: string
}

export default function MobileLoader({ 
  onLoadingComplete, 
  showDeviceInfo = true,
  customMessage 
}: MobileLoaderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    stage: 'initial'
  })
  const [deviceInfo, setDeviceInfo] = useState({
    isLowEnd: false,
    connectionType: 'unknown',
    optimizations: [] as string[]
  })

  useEffect(() => {
    // Get device capabilities
    const isLowEnd = mobileOptimizer.isLowEndDevice_()
    const connectionType = mobileOptimizer.getConnectionType()
    const optimizations = mobileOptimizer.getOptimizations()

    setDeviceInfo({ isLowEnd, connectionType, optimizations })

    // Subscribe to loading state
    const unsubscribe = progressiveLoader.subscribe(setLoadingState)

    // Start loading process
    progressiveLoader.startLoading()

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!loadingState.isLoading && loadingState.stage === 'complete') {
      const timer = setTimeout(() => {
        onLoadingComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loadingState, onLoadingComplete])

  const getStageMessage = () => {
    if (customMessage) return customMessage
    
    switch (loadingState.stage) {
      case 'initial':
        return 'Initializing FitXGen...'
      case 'data':
        return deviceInfo.isLowEnd ? 'Loading essential data...' : 'Fetching your health data...'
      case 'assets':
        return deviceInfo.connectionType.includes('2g') 
          ? 'Optimizing for your connection...' 
          : 'Loading interface...'
      case 'complete':
        return 'Welcome to FitXGen!'
      default:
        return 'Loading...'
    }
  }

  const getConnectionIcon = () => {
    switch (deviceInfo.connectionType) {
      case '4g':
      case '5g':
        return <Wifi className="w-4 h-4 text-green-500" />
      case '3g':
        return <Wifi className="w-4 h-4 text-yellow-500" />
      case '2g':
      case 'slow-2g':
        return <Wifi className="w-4 h-4 text-red-500" />
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />
    }
  }

  const getProgressColor = () => {
    if (loadingState.progress < 30) return 'from-purple-500 to-pink-500'
    if (loadingState.progress < 70) return 'from-blue-500 to-cyan-500'
    return 'from-green-500 to-emerald-500'
  }

  return (
    <AnimatePresence>
      {loadingState.isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center z-50"
        >
          <div className="max-w-sm mx-auto px-6 text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">FitXGen</h1>
              <p className="text-sm text-slate-600">AI-Powered Health Companion</p>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative">
                {/* Spinning loader */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto mb-4"
                >
                  <Loader2 className="w-full h-full text-purple-500" />
                </motion.div>

                {/* Progress circle */}
                <svg className="absolute inset-0 w-12 h-12 mx-auto transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-purple-500"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: loadingState.progress / 100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingState.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor()}`}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>{Math.round(loadingState.progress)}%</span>
                <span className="capitalize">{loadingState.stage}</span>
              </div>
            </div>

            {/* Loading Message */}
            <motion.p
              key={loadingState.stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-slate-700 mb-6 font-medium"
            >
              {getStageMessage()}
            </motion.p>

            {/* Device Information */}
            {showDeviceInfo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="bg-white/50 rounded-xl p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
                  {/* Connection Status */}
                  <div className="flex items-center space-x-1">
                    {getConnectionIcon()}
                    <span className="capitalize">{deviceInfo.connectionType}</span>
                  </div>

                  {/* Device Type */}
                  <div className="flex items-center space-x-1">
                    {deviceInfo.isLowEnd ? (
                      <Battery className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-green-500" />
                    )}
                    <span>{deviceInfo.isLowEnd ? 'Power Save' : 'High Performance'}</span>
                  </div>
                </div>

                {/* Optimization Status */}
                {deviceInfo.optimizations.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                    Optimized for your device
                  </div>
                )}
              </motion.div>
            )}

            {/* Error State */}
            {loadingState.error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">
                  {loadingState.error}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-red-700 underline"
                >
                  Retry
                </button>
              </motion.div>
            )}

            {/* Fun Facts for Slow Connections */}
            {(deviceInfo.connectionType.includes('2g') || deviceInfo.isLowEnd) && loadingState.progress < 50 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="mt-6 p-3 bg-blue-50 rounded-lg"
              >
                <p className="text-xs text-blue-600">
                  💡 Did you know? Your body fat percentage can vary by 1-2% throughout the day due to hydration levels!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for using mobile loader
export function useMobileLoader() {
  const [isLoading, setIsLoading] = useState(true)
  
  const startLoading = () => {
    setIsLoading(true)
    progressiveLoader.startLoading()
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  useEffect(() => {
    const unsubscribe = progressiveLoader.subscribe((state) => {
      if (!state.isLoading && state.stage === 'complete') {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [])

  return {
    isLoading,
    startLoading,
    stopLoading
  }
}
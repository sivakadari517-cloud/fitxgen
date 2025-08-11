'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ImageOptimizer } from '@/lib/performance'
import { Eye, AlertCircle } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  lazy?: boolean
  showLoadingState?: boolean
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  lazy = true,
  showLoadingState = true,
  fallbackSrc,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isVisible, setIsVisible] = useState(!lazy)
  const [supportsWebP, setSupportsWebP] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Check WebP support
  useEffect(() => {
    ImageOptimizer.supportsWebP().then(setSupportsWebP)
  }, [])

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isVisible])

  // Get optimized source URL
  const getOptimizedSrc = () => {
    if (hasError && fallbackSrc) {
      return fallbackSrc
    }

    let optimizedSrc = src

    // Convert to WebP if supported and not already WebP
    if (supportsWebP && !src.includes('.webp')) {
      const extension = src.split('.').pop()
      if (['jpg', 'jpeg', 'png'].includes(extension?.toLowerCase() || '')) {
        optimizedSrc = src.replace(new RegExp(`\.${extension}$`, 'i'), '.webp')
      }
    }

    return optimizedSrc
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Generate blur placeholder for better UX
  const generateBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL
    
    // Generate a simple colored placeholder based on image dimensions
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 10, 10)
      gradient.addColorStop(0, '#f3f4f6')
      gradient.addColorStop(1, '#e5e7eb')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 10, 10)
      return canvas.toDataURL()
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4K'
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
    >
      {/* Loading State */}
      {isLoading && showLoadingState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
        >
          <div className="flex flex-col items-center space-y-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </motion.div>
            <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-gray-400 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2 text-gray-500">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Main Image */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <Image
            src={getOptimizedSrc()}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            quality={quality}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={placeholder === 'blur' ? generateBlurPlaceholder() : undefined}
            sizes={sizes}
            className={`object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            style={{ objectFit: 'cover' }}
          />
        </motion.div>
      )}

      {/* Lazy Loading Placeholder */}
      {!isVisible && lazy && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-6 bg-gray-300 rounded"
          />
        </div>
      )}

      {/* Progressive Enhancement Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {supportsWebP ? 'WebP' : 'Legacy'}
        </div>
      )}
    </div>
  )
}

// Prebuilt components for common use cases
export function HeroImage(props: Omit<OptimizedImageProps, 'priority' | 'quality'>) {
  return (
    <OptimizedImage
      {...props}
      priority={true}
      quality={90}
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

export function ThumbnailImage(props: Omit<OptimizedImageProps, 'quality' | 'lazy'>) {
  return (
    <OptimizedImage
      {...props}
      quality={70}
      lazy={true}
      sizes="(max-width: 768px) 50vw, 200px"
    />
  )
}

export function ProfileImage(props: Omit<OptimizedImageProps, 'quality' | 'className'>) {
  return (
    <OptimizedImage
      {...props}
      quality={85}
      className="rounded-full"
      fallbackSrc="/images/default-avatar.png"
      sizes="(max-width: 768px) 80px, 120px"
    />
  )
}

// Gallery component with optimized loading
interface ImageGalleryProps {
  images: Array<{
    src: string
    alt: string
    width: number
    height: number
  }>
  className?: string
  itemClassName?: string
  lazy?: boolean
}

export function OptimizedImageGallery({
  images,
  className = '',
  itemClassName = '',
  lazy = true
}: ImageGalleryProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={itemClassName}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            quality={75}
            lazy={lazy && index > 4} // First 4 images load immediately
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow"
          />
        </motion.div>
      ))}
    </div>
  )
}
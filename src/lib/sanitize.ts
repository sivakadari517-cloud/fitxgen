// Input sanitization and validation utilities for security

interface SanitizeOptions {
  ALLOWED_TAGS: string[]
  ALLOWED_ATTR: string[]
  ALLOW_DATA_ATTR: boolean
  FORBID_TAGS: string[]
  FORBID_ATTR: string[]
}

// HTML sanitization options
const DEFAULT_SANITIZE_OPTIONS: SanitizeOptions = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
}

const STRICT_SANITIZE_OPTIONS: SanitizeOptions = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
}

/**
 * Basic HTML sanitization to prevent XSS attacks
 * Note: In production, consider using a dedicated library like DOMPurify
 */
export function sanitizeHtml(
  input: string,
  options: SanitizeOptions = DEFAULT_SANITIZE_OPTIONS
): string {
  if (typeof input !== 'string') {
    return ''
  }

  let sanitized = input.trim()

  // Remove forbidden tags completely
  options.FORBID_TAGS.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })

  // Remove forbidden attributes
  options.FORBID_ATTR.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
    sanitized = sanitized.replace(regex, '')
  })

  // If no tags are allowed, strip all HTML
  if (options.ALLOWED_TAGS.length === 0) {
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  } else {
    // Remove tags that are not in the allowed list
    sanitized = sanitized.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName) => {
      return options.ALLOWED_TAGS.includes(tagName.toLowerCase()) ? match : ''
    })
  }

  return sanitized
}

/**
 * Strict HTML sanitization - removes all HTML tags
 */
export function sanitizeHtmlStrict(input: string): string {
  return sanitizeHtml(input, STRICT_SANITIZE_OPTIONS)
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: any): any {
  if (input === null || input === undefined) {
    return input
  }

  if (typeof input === 'string') {
    return sanitizeString(input)
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }

  if (typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      // Sanitize both key and value
      const cleanKey = sanitizeString(key)
      sanitized[cleanKey] = sanitizeInput(value)
    }
    return sanitized
  }

  return input
}

/**
 * Sanitize string input
 */
function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Remove control characters
    .replace(/\0/g, '') // Remove null bytes
    .substring(0, 10000) // Limit length to prevent DoS
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null
  }

  const sanitized = sanitizeString(email.toLowerCase())
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  return emailRegex.test(sanitized) ? sanitized : null
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') {
    return null
  }

  const sanitized = sanitizeString(url)
  
  try {
    const urlObj = new URL(sanitized)
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null
    }
    
    // Block private/local IP ranges
    const hostname = urlObj.hostname
    if (isPrivateIP(hostname)) {
      return null
    }
    
    return urlObj.toString()
  } catch {
    return null
  }
}

/**
 * Check if hostname is a private IP address
 */
function isPrivateIP(hostname: string): boolean {
  const privateRanges = [
    /^127\./, // 127.0.0.0/8 (localhost)
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^169\.254\./, // 169.254.0.0/16 (link-local)
    /^::1$/, // IPv6 localhost
    /^fe80:/, // IPv6 link-local
    /^fc00:/, // IPv6 unique local
    /^fd00:/ // IPv6 unique local
  ]
  
  return privateRanges.some(range => range.test(hostname))
}

/**
 * Sanitize phone numbers
 */
export function sanitizePhoneNumber(phone: string): string | null {
  if (typeof phone !== 'string') {
    return null
  }

  // Remove all non-digit characters except +
  const sanitized = phone.replace(/[^\d+]/g, '')
  
  // Basic validation (10-15 digits, optional + prefix)
  const phoneRegex = /^\+?[1-9]\d{9,14}$/
  
  return phoneRegex.test(sanitized) ? sanitized : null
}

/**
 * Prevent NoSQL injection by sanitizing MongoDB queries
 */
export function sanitizeMongoQuery(query: any): any {
  if (query === null || query === undefined) {
    return query
  }

  if (typeof query === 'string') {
    return query
  }

  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery)
  }

  if (typeof query === 'object') {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(query)) {
      // Block MongoDB operators that could be used for injection
      if (key.startsWith('$') && !isAllowedMongoOperator(key)) {
        continue // Skip potentially dangerous operators
      }
      
      sanitized[key] = sanitizeMongoQuery(value)
    }
    
    return sanitized
  }

  return query
}

/**
 * List of allowed MongoDB operators
 */
function isAllowedMongoOperator(operator: string): boolean {
  const allowedOperators = [
    '$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin',
    '$and', '$or', '$not', '$nor',
    '$exists', '$type', '$regex', '$options',
    '$elemMatch', '$size', '$all',
    '$text', '$search'
  ]
  
  return allowedOperators.includes(operator)
}

/**
 * Validate file upload names and types
 */
export function sanitizeFileName(fileName: string): string | null {
  if (typeof fileName !== 'string') {
    return null
  }

  // Remove path traversal attempts
  let sanitized = fileName.replace(/[\/\\:*?"<>|]/g, '')
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, '')
  
  // Limit length
  sanitized = sanitized.substring(0, 255)
  
  // Check for valid extension
  const validExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.txt', '.md', '.csv'
  ]
  
  const hasValidExtension = validExtensions.some(ext => 
    sanitized.toLowerCase().endsWith(ext)
  )
  
  return hasValidExtension && sanitized.length > 0 ? sanitized : null
}

/**
 * Rate limit key sanitization
 */
export function sanitizeRateLimitKey(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9:.-]/g, '_')
    .substring(0, 250)
}

/**
 * Content Security Policy nonce generation
 */
export function generateCSPNonce(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for Node.js environment
  try {
    const crypto = require('crypto')
    return crypto.randomBytes(16).toString('hex')
  } catch {
    // Ultimate fallback using Math.random (less secure)
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }
}

/**
 * Validate and sanitize user agent strings
 */
export function sanitizeUserAgent(userAgent: string): string {
  if (typeof userAgent !== 'string') {
    return 'unknown'
  }

  return userAgent
    .replace(/[^\w\s\-.,;:()/[\]]/g, '') // Remove special chars except common ones
    .substring(0, 500) // Limit length
    .trim() || 'unknown'
}

/**
 * Comprehensive input validation for API requests
 */
export interface ValidationRule {
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'phone' | 'object' | 'array'
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  allowedValues?: any[]
  sanitize?: boolean
}

export function validateAndSanitize(
  input: any, 
  rules: Record<string, ValidationRule>
): { isValid: boolean; data: any; errors: string[] } {
  const errors: string[] = []
  const sanitizedData: any = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = input?.[field]

    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`)
      continue
    }

    // Skip validation for optional empty fields
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // Type validation and sanitization
    try {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`)
            break
          }
          let sanitizedString = rule.sanitize !== false ? sanitizeString(value) : value
          if (rule.minLength && sanitizedString.length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters`)
          }
          if (rule.maxLength && sanitizedString.length > rule.maxLength) {
            errors.push(`${field} must be at most ${rule.maxLength} characters`)
          }
          if (rule.pattern && !rule.pattern.test(sanitizedString)) {
            errors.push(`${field} has invalid format`)
          }
          if (rule.allowedValues && !rule.allowedValues.includes(sanitizedString)) {
            errors.push(`${field} has invalid value`)
          }
          sanitizedData[field] = sanitizedString
          break

        case 'email':
          const sanitizedEmail = sanitizeEmail(value)
          if (!sanitizedEmail) {
            errors.push(`${field} must be a valid email`)
          } else {
            sanitizedData[field] = sanitizedEmail
          }
          break

        case 'url':
          const sanitizedUrl = sanitizeUrl(value)
          if (!sanitizedUrl) {
            errors.push(`${field} must be a valid URL`)
          } else {
            sanitizedData[field] = sanitizedUrl
          }
          break

        case 'phone':
          const sanitizedPhone = sanitizePhoneNumber(value)
          if (!sanitizedPhone) {
            errors.push(`${field} must be a valid phone number`)
          } else {
            sanitizedData[field] = sanitizedPhone
          }
          break

        case 'number':
          const num = Number(value)
          if (isNaN(num)) {
            errors.push(`${field} must be a number`)
            break
          }
          if (rule.min !== undefined && num < rule.min) {
            errors.push(`${field} must be at least ${rule.min}`)
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(`${field} must be at most ${rule.max}`)
          }
          sanitizedData[field] = num
          break

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field} must be a boolean`)
          } else {
            sanitizedData[field] = value
          }
          break

        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`${field} must be an object`)
          } else {
            sanitizedData[field] = rule.sanitize !== false ? sanitizeInput(value) : value
          }
          break

        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`)
          } else {
            sanitizedData[field] = rule.sanitize !== false ? sanitizeInput(value) : value
          }
          break

        default:
          errors.push(`Unknown validation type for ${field}`)
      }
    } catch (error) {
      errors.push(`Validation error for ${field}`)
    }
  }

  return {
    isValid: errors.length === 0,
    data: sanitizedData,
    errors
  }
}

/**
 * Security-focused validation schemas for common use cases
 */
export const ValidationSchemas = {
  // User registration
  userRegistration: {
    name: { type: 'string' as const, required: true, minLength: 2, maxLength: 100 },
    email: { type: 'email' as const, required: true },
    password: { type: 'string' as const, required: true, minLength: 8, maxLength: 128 }
  },

  // Body measurements
  bodyMeasurements: {
    age: { type: 'number' as const, required: true, min: 10, max: 120 },
    height: { type: 'number' as const, required: true, min: 50, max: 300 },
    weight: { type: 'number' as const, required: true, min: 20, max: 500 },
    neck: { type: 'number' as const, required: true, min: 10, max: 100 },
    waist: { type: 'number' as const, required: true, min: 30, max: 200 }
  },

  // Feedback submission
  feedback: {
    type: { 
      type: 'string' as const, 
      required: true, 
      allowedValues: ['rating', 'suggestion', 'bug_report', 'testimonial', 'feature_request'] 
    },
    title: { type: 'string' as const, required: true, minLength: 5, maxLength: 200 },
    message: { type: 'string' as const, required: true, minLength: 10, maxLength: 5000 },
    rating: { type: 'number' as const, required: false, min: 1, max: 5 }
  },

  // Payment data
  paymentData: {
    amount: { type: 'number' as const, required: true, min: 1, max: 100000 },
    currency: { type: 'string' as const, required: true, allowedValues: ['INR', 'USD'] }
  }
}
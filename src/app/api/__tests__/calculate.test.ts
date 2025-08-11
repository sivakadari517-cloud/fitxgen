import { POST } from '../calculate/body-fat/route'
import { NextRequest } from 'next/server'

// Mock the body fat calculator
jest.mock('@/lib/body-fat-calculator', () => ({
  calculateBodyFat: jest.fn(),
  validateMeasurements: jest.fn()
}))

import { calculateBodyFat, validateMeasurements } from '@/lib/body-fat-calculator'

const mockCalculateBodyFat = calculateBodyFat as jest.MockedFunction<typeof calculateBodyFat>
const mockValidateMeasurements = validateMeasurements as jest.MockedFunction<typeof validateMeasurements>

describe('/api/calculate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/calculate', () => {
    it('returns body fat calculation for valid input', async () => {
      const mockResult = {
        bodyFatPercentage: 15.2,
        bmi: 24.7,
        category: 'Athletic',
        healthStatus: 'Excellent' as const,
        recommendations: ['Stay hydrated', 'Include strength training']
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockResult)
      expect(mockValidateMeasurements).toHaveBeenCalledWith(requestBody)
      expect(mockCalculateBodyFat).toHaveBeenCalledWith(requestBody)
    })

    it('returns 400 for invalid measurements', async () => {
      const validationErrors = ['Age must be between 13 and 100 years']
      mockValidateMeasurements.mockReturnValue(validationErrors)

      const requestBody = {
        age: 5, // Invalid age
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toEqual(validationErrors)
      expect(mockCalculateBodyFat).not.toHaveBeenCalled()
    })

    it('returns 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify({
          age: 30
          // Missing other required fields
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Missing required fields')
    })

    it('returns 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Invalid request format')
    })

    it('handles calculation errors gracefully', async () => {
      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockImplementation(() => {
        throw new Error('Calculation error')
      })

      const requestBody = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Calculation failed')
    })

    it('validates female measurements require hip', async () => {
      const validationErrors = ['Hip measurement is required for females']
      mockValidateMeasurements.mockReturnValue(validationErrors)

      const requestBody = {
        age: 28,
        height: 165,
        weight: 65,
        neck: 32,
        waist: 70,
        gender: 'female'
        // Missing hip measurement
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContain('Hip measurement is required for females')
    })

    it('handles edge case measurements', async () => {
      const mockResult = {
        bodyFatPercentage: 3.0, // Minimum bound
        bmi: 18.5,
        category: 'Essential Fat',
        healthStatus: 'Poor' as const,
        recommendations: ['Consider increasing caloric intake']
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: 18, // Minimum age
        height: 140, // Small height
        weight: 35, // Low weight
        neck: 25,
        waist: 55,
        gender: 'female',
        hip: 70
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.bodyFatPercentage).toBe(3.0)
      expect(data.data.category).toBe('Essential Fat')
    })

    it('sanitizes input data', async () => {
      const mockResult = {
        bodyFatPercentage: 20.5,
        bmi: 25.0,
        category: 'Average',
        healthStatus: 'Good' as const,
        recommendations: ['Maintain current fitness level']
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: '30', // String instead of number
        height: 175.5,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockCalculateBodyFat).toHaveBeenCalledWith({
        age: 30, // Should be converted to number
        height: 175.5,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      })
    })
  })

  describe('Rate Limiting', () => {
    it('handles rate limiting headers', async () => {
      const mockResult = {
        bodyFatPercentage: 15.2,
        bmi: 24.7,
        category: 'Athletic',
        healthStatus: 'Excellent' as const,
        recommendations: []
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '127.0.0.1'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      // Rate limiting headers should be present
      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy()
    })
  })

  describe('CORS Headers', () => {
    it('includes proper CORS headers', async () => {
      const mockResult = {
        bodyFatPercentage: 15.2,
        bmi: 24.7,
        category: 'Athletic',
        healthStatus: 'Excellent' as const,
        recommendations: []
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    })
  })

  describe('Security Headers', () => {
    it('includes security headers', async () => {
      const mockResult = {
        bodyFatPercentage: 15.2,
        bmi: 24.7,
        category: 'Athletic',
        healthStatus: 'Excellent' as const,
        recommendations: []
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })
  })

  describe('Content Type Validation', () => {
    it('rejects requests without JSON content type', async () => {
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify({
          age: 30,
          height: 175,
          weight: 75,
          neck: 38,
          waist: 82,
          gender: 'male'
        }),
        headers: {
          'Content-Type': 'text/plain'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Content-Type must be application/json')
    })
  })

  describe('Performance', () => {
    it('processes requests efficiently', async () => {
      const mockResult = {
        bodyFatPercentage: 15.2,
        bmi: 24.7,
        category: 'Athletic',
        healthStatus: 'Excellent' as const,
        recommendations: []
      }

      mockValidateMeasurements.mockReturnValue([])
      mockCalculateBodyFat.mockReturnValue(mockResult)

      const requestBody = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const startTime = Date.now()
      
      const request = new NextRequest('http://localhost/api/calculate', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(100) // Should process in under 100ms
    })
  })
})
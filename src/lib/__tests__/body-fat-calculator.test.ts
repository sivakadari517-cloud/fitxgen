import { 
  calculateBodyFat, 
  validateMeasurements, 
  calculateBMR,
  calculateTDEE,
  type MeasurementData,
  type BodyFatResult
} from '../body-fat-calculator'

describe('Body Fat Calculator', () => {
  describe('calculateBodyFat', () => {
    const validMaleData: MeasurementData = {
      age: 30,
      height: 180,
      weight: 80,
      neck: 40,
      waist: 85,
      gender: 'male'
    }

    const validFemaleData: MeasurementData = {
      age: 28,
      height: 165,
      weight: 65,
      neck: 32,
      waist: 70,
      hip: 95,
      gender: 'female'
    }

    it('calculates accurate body fat for male using Navy method', () => {
      const result = calculateBodyFat(validMaleData)
      
      expect(result.bodyFatPercentage).toBeGreaterThan(0)
      expect(result.bodyFatPercentage).toBeLessThan(50)
      expect(result.bmi).toBeGreaterThan(0)
      expect(result.category).toBeDefined()
      expect(result.healthStatus).toBeDefined()
      expect(result.recommendations).toBeDefined()
      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    it('calculates accurate body fat for female using Navy method', () => {
      const result = calculateBodyFat(validFemaleData)
      
      expect(result.bodyFatPercentage).toBeGreaterThan(0)
      expect(result.bodyFatPercentage).toBeLessThan(50)
      expect(result.bmi).toBeGreaterThan(0)
      expect(result.category).toBeDefined()
      expect(result.healthStatus).toBeDefined()
      expect(result.recommendations).toBeDefined()
      expect(Array.isArray(result.recommendations)).toBe(true)
    })

    it('throws error for female without hip measurement', () => {
      const femaleWithoutHip: MeasurementData = {
        age: 28,
        height: 165,
        weight: 65,
        neck: 32,
        waist: 70,
        gender: 'female'
        // Missing hip measurement
      }
      
      expect(() => calculateBodyFat(femaleWithoutHip))
        .toThrow('Hip measurement is required for females')
    })

    it('bounds body fat percentage between 3 and 50', () => {
      const extremeData: MeasurementData = {
        age: 20,
        height: 200,
        weight: 50,
        neck: 25,
        waist: 60,
        gender: 'male'
      }
      
      const result = calculateBodyFat(extremeData)
      
      expect(result.bodyFatPercentage).toBeGreaterThanOrEqual(3)
      expect(result.bodyFatPercentage).toBeLessThanOrEqual(50)
    })

    it('calculates BMI correctly', () => {
      const result = calculateBodyFat(validMaleData)
      
      // BMI = weight / (height in meters)^2
      const expectedBMI = 80 / (1.8 * 1.8)
      expect(result.bmi).toBeCloseTo(expectedBMI, 1)
    })

    it('provides appropriate categories for different body fat levels', () => {
      const lowBodyFat: MeasurementData = {
        age: 25,
        height: 180,
        weight: 65,
        neck: 35,
        waist: 70,
        gender: 'male'
      }
      
      const result = calculateBodyFat(lowBodyFat)
      expect(['Essential Fat', 'Athletic', 'Fitness', 'Average', 'Obese']).toContain(result.category)
    })

    it('provides health status assessment', () => {
      const result = calculateBodyFat(validMaleData)
      
      expect(['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']).toContain(result.healthStatus)
    })

    it('provides personalized recommendations', () => {
      const result = calculateBodyFat(validMaleData)
      
      expect(result.recommendations).toBeDefined()
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(result.recommendations.every(rec => typeof rec === 'string')).toBe(true)
    })

    it('rounds results to one decimal place', () => {
      const result = calculateBodyFat(validMaleData)
      
      expect(result.bodyFatPercentage.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1)
      expect(result.bmi.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1)
    })
  })

  describe('validateMeasurements', () => {
    it('returns empty array for valid measurements', () => {
      const validData: MeasurementData = {
        age: 25,
        height: 170,
        weight: 70,
        neck: 35,
        waist: 80,
        gender: 'male'
      }
      
      const errors = validateMeasurements(validData)
      expect(errors).toHaveLength(0)
    })

    it('validates age range', () => {
      const invalidAge = { age: 10, height: 170, weight: 70, neck: 35, waist: 80, gender: 'male' as const }
      const errors = validateMeasurements(invalidAge)
      
      expect(errors.some(error => error.includes('Age'))).toBe(true)
    })

    it('validates height range', () => {
      const invalidHeight = { age: 25, height: 90, weight: 70, neck: 35, waist: 80, gender: 'male' as const }
      const errors = validateMeasurements(invalidHeight)
      
      expect(errors.some(error => error.includes('Height'))).toBe(true)
    })

    it('validates weight range', () => {
      const invalidWeight = { age: 25, height: 170, weight: 20, neck: 35, waist: 80, gender: 'male' as const }
      const errors = validateMeasurements(invalidWeight)
      
      expect(errors.some(error => error.includes('Weight'))).toBe(true)
    })

    it('validates waist measurement range', () => {
      const invalidWaist = { age: 25, height: 170, weight: 70, neck: 35, waist: 30, gender: 'male' as const }
      const errors = validateMeasurements(invalidWaist)
      
      expect(errors.some(error => error.includes('Waist'))).toBe(true)
    })

    it('validates neck measurement range', () => {
      const invalidNeck = { age: 25, height: 170, weight: 70, neck: 15, waist: 80, gender: 'male' as const }
      const errors = validateMeasurements(invalidNeck)
      
      expect(errors.some(error => error.includes('Neck'))).toBe(true)
    })

    it('requires hip measurement for females', () => {
      const femaleWithoutHip = { 
        age: 25, 
        height: 170, 
        weight: 70, 
        neck: 35, 
        waist: 80, 
        gender: 'female' as const 
      }
      
      const errors = validateMeasurements(femaleWithoutHip)
      expect(errors.some(error => error.includes('Hip'))).toBe(true)
    })

    it('validates hip measurement range for females', () => {
      const invalidHip = { 
        age: 25, 
        height: 170, 
        weight: 70, 
        neck: 35, 
        waist: 80, 
        hip: 50, 
        gender: 'female' as const 
      }
      
      const errors = validateMeasurements(invalidHip)
      expect(errors.some(error => error.includes('Hip'))).toBe(true)
    })

    it('validates logical relationship between waist and neck', () => {
      const invalidLogic = { 
        age: 25, 
        height: 170, 
        weight: 70, 
        neck: 40, 
        waist: 35, 
        gender: 'male' as const 
      }
      
      const errors = validateMeasurements(invalidLogic)
      expect(errors.some(error => error.includes('Waist measurement should be larger'))).toBe(true)
    })

    it('handles missing required fields', () => {
      const incompleteData = { age: 25 }
      const errors = validateMeasurements(incompleteData)
      
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('calculateBMR', () => {
    it('calculates BMR for males correctly', () => {
      const bmr = calculateBMR(80, 180, 30, 'male')
      
      // Mifflin-St Jeor for males: 10 * weight + 6.25 * height - 5 * age + 5
      const expected = 10 * 80 + 6.25 * 180 - 5 * 30 + 5
      expect(bmr).toBe(expected)
      expect(bmr).toBeCloseTo(1780, 0)
    })

    it('calculates BMR for females correctly', () => {
      const bmr = calculateBMR(65, 165, 28, 'female')
      
      // Mifflin-St Jeor for females: 10 * weight + 6.25 * height - 5 * age - 161
      const expected = 10 * 65 + 6.25 * 165 - 5 * 28 - 161
      expect(bmr).toBe(expected)
      expect(bmr).toBeCloseTo(1380.25, 2)
    })

    it('returns higher BMR for males than females with same stats', () => {
      const maleBMR = calculateBMR(70, 170, 25, 'male')
      const femaleBMR = calculateBMR(70, 170, 25, 'female')
      
      expect(maleBMR).toBeGreaterThan(femaleBMR)
      expect(maleBMR - femaleBMR).toBe(166) // Difference in formula constants
    })
  })

  describe('calculateTDEE', () => {
    const baseBMR = 1500

    it('calculates TDEE for sedentary activity level', () => {
      const tdee = calculateTDEE(baseBMR, 'sedentary')
      expect(tdee).toBe(baseBMR * 1.2)
      expect(tdee).toBe(1800)
    })

    it('calculates TDEE for light activity level', () => {
      const tdee = calculateTDEE(baseBMR, 'light')
      expect(tdee).toBe(baseBMR * 1.375)
      expect(tdee).toBe(2062.5)
    })

    it('calculates TDEE for moderate activity level', () => {
      const tdee = calculateTDEE(baseBMR, 'moderate')
      expect(tdee).toBe(baseBMR * 1.55)
      expect(tdee).toBe(2325)
    })

    it('calculates TDEE for active activity level', () => {
      const tdee = calculateTDEE(baseBMR, 'active')
      expect(tdee).toBe(baseBMR * 1.725)
      expect(tdee).toBe(2587.5)
    })

    it('calculates TDEE for very active activity level', () => {
      const tdee = calculateTDEE(baseBMR, 'veryActive')
      expect(tdee).toBe(baseBMR * 1.9)
      expect(tdee).toBe(2850)
    })

    it('defaults to moderate for invalid activity level', () => {
      const tdee = calculateTDEE(baseBMR, 'invalid')
      const moderateTdee = calculateTDEE(baseBMR, 'moderate')
      
      expect(tdee).toBe(moderateTdee)
    })
  })

  describe('Integration Tests', () => {
    it('provides consistent results for same input', () => {
      const data: MeasurementData = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }
      
      const result1 = calculateBodyFat(data)
      const result2 = calculateBodyFat(data)
      
      expect(result1.bodyFatPercentage).toBe(result2.bodyFatPercentage)
      expect(result1.bmi).toBe(result2.bmi)
      expect(result1.category).toBe(result2.category)
      expect(result1.healthStatus).toBe(result2.healthStatus)
    })

    it('provides different results for different genders with same measurements', () => {
      const maleData: MeasurementData = {
        age: 30,
        height: 170,
        weight: 70,
        neck: 35,
        waist: 80,
        gender: 'male'
      }

      const femaleData: MeasurementData = {
        age: 30,
        height: 170,
        weight: 70,
        neck: 35,
        waist: 80,
        hip: 95,
        gender: 'female'
      }
      
      const maleResult = calculateBodyFat(maleData)
      const femaleResult = calculateBodyFat(femaleData)
      
      // Results should be different due to different formulas
      expect(maleResult.bodyFatPercentage).not.toBe(femaleResult.bodyFatPercentage)
    })

    it('validates comprehensive data flow', () => {
      const testData: MeasurementData = {
        age: 35,
        height: 175,
        weight: 80,
        neck: 40,
        waist: 90,
        gender: 'male'
      }
      
      // Validate first
      const errors = validateMeasurements(testData)
      expect(errors).toHaveLength(0)
      
      // Calculate body fat
      const result = calculateBodyFat(testData)
      expect(result.bodyFatPercentage).toBeGreaterThan(0)
      
      // Calculate BMR
      const bmr = calculateBMR(testData.weight, testData.height, testData.age, testData.gender)
      expect(bmr).toBeGreaterThan(1000)
      
      // Calculate TDEE
      const tdee = calculateTDEE(bmr, 'moderate')
      expect(tdee).toBeGreaterThan(bmr)
    })
  })

  describe('Edge Cases', () => {
    it('handles minimum valid measurements', () => {
      const minData: MeasurementData = {
        age: 13,
        height: 100,
        weight: 30,
        neck: 20,
        waist: 50,
        gender: 'male'
      }
      
      const errors = validateMeasurements(minData)
      expect(errors).toHaveLength(0)
      
      const result = calculateBodyFat(minData)
      expect(result).toBeDefined()
    })

    it('handles maximum valid measurements', () => {
      const maxData: MeasurementData = {
        age: 100,
        height: 250,
        weight: 300,
        neck: 60,
        waist: 200,
        hip: 200,
        gender: 'female'
      }
      
      const errors = validateMeasurements(maxData)
      expect(errors).toHaveLength(0)
      
      const result = calculateBodyFat(maxData)
      expect(result).toBeDefined()
    })

    it('provides age-appropriate recommendations', () => {
      const youngAdult: MeasurementData = {
        age: 25,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }

      const middleAged: MeasurementData = {
        age: 45,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }
      
      const youngResult = calculateBodyFat(youngAdult)
      const middleAgedResult = calculateBodyFat(middleAged)
      
      // Middle-aged should have additional recommendations
      const hasResistanceTraining = middleAgedResult.recommendations.some(rec => 
        rec.includes('resistance training') || rec.includes('muscle mass')
      )
      const hasFlexibility = middleAgedResult.recommendations.some(rec => 
        rec.includes('flexibility') || rec.includes('mobility')
      )
      
      expect(hasResistanceTraining || hasFlexibility).toBe(true)
    })
  })

  describe('Performance Tests', () => {
    it('calculates results efficiently', () => {
      const testData: MeasurementData = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male'
      }
      
      const startTime = Date.now()
      
      // Run 100 calculations
      for (let i = 0; i < 100; i++) {
        calculateBodyFat(testData)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 100 calculations in under 100ms
      expect(duration).toBeLessThan(100)
    })

    it('validation performs efficiently on large datasets', () => {
      const testData = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82,
        gender: 'male' as const
      }
      
      const startTime = Date.now()
      
      // Run 1000 validations
      for (let i = 0; i < 1000; i++) {
        validateMeasurements(testData)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete 1000 validations in under 50ms
      expect(duration).toBeLessThan(50)
    })
  })
})
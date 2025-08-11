export interface MeasurementData {
  age: number
  gender: 'male' | 'female'
  height: number // cm
  weight: number // kg
  waist: number // cm
  neck: number // cm
  hip?: number // cm (required for females)
}

export interface BodyFatResult {
  bodyFatPercentage: number
  bmi: number
  category: string
  healthStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor'
  recommendations: string[]
}

/**
 * Calculate Body Fat Percentage using US Navy Method
 * This is one of the most accurate methods for body fat calculation
 */
export function calculateBodyFat(data: MeasurementData): BodyFatResult {
  const { age, gender, height, weight, waist, neck, hip } = data

  // Calculate BMI first
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)

  let bodyFatPercentage: number

  if (gender === 'male') {
    // US Navy Formula for Males
    // BF% = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    const log10WaistNeck = Math.log10(waist - neck)
    const log10Height = Math.log10(height)
    
    bodyFatPercentage = 495 / (1.0324 - 0.19077 * log10WaistNeck + 0.15456 * log10Height) - 450
  } else {
    // US Navy Formula for Females
    // BF% = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
    if (!hip) {
      throw new Error('Hip measurement is required for females')
    }
    
    const log10WaistHipNeck = Math.log10(waist + hip - neck)
    const log10Height = Math.log10(height)
    
    bodyFatPercentage = 495 / (1.29579 - 0.35004 * log10WaistHipNeck + 0.22100 * log10Height) - 450
  }

  // Ensure reasonable bounds
  bodyFatPercentage = Math.max(3, Math.min(50, bodyFatPercentage))

  const category = getBodyFatCategory(bodyFatPercentage, gender, age)
  const healthStatus = getHealthStatus(bodyFatPercentage, gender, age)
  const recommendations = getRecommendations(bodyFatPercentage, bmi, gender, age)

  return {
    bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
    bmi: Math.round(bmi * 10) / 10,
    category,
    healthStatus,
    recommendations
  }
}

function getBodyFatCategory(bodyFat: number, gender: string, age: number): string {
  if (gender === 'male') {
    if (age < 30) {
      if (bodyFat < 8) return 'Essential Fat'
      if (bodyFat < 14) return 'Athletic'
      if (bodyFat < 21) return 'Fitness'
      if (bodyFat < 25) return 'Average'
      return 'Obese'
    } else {
      if (bodyFat < 8) return 'Essential Fat'
      if (bodyFat < 17) return 'Athletic'
      if (bodyFat < 24) return 'Fitness'
      if (bodyFat < 28) return 'Average'
      return 'Obese'
    }
  } else {
    if (age < 30) {
      if (bodyFat < 10) return 'Essential Fat'
      if (bodyFat < 16) return 'Athletic'
      if (bodyFat < 24) return 'Fitness'
      if (bodyFat < 31) return 'Average'
      return 'Obese'
    } else {
      if (bodyFat < 10) return 'Essential Fat'
      if (bodyFat < 20) return 'Athletic'
      if (bodyFat < 27) return 'Fitness'
      if (bodyFat < 34) return 'Average'
      return 'Obese'
    }
  }
}

function getHealthStatus(bodyFat: number, gender: string, age: number): BodyFatResult['healthStatus'] {
  const optimalRanges = {
    male: { min: gender === 'male' && age < 30 ? 8 : 11, max: gender === 'male' && age < 30 ? 19 : 22 },
    female: { min: gender === 'female' && age < 30 ? 16 : 20, max: gender === 'female' && age < 30 ? 24 : 27 }
  }

  const range = gender === 'male' ? optimalRanges.male : optimalRanges.female

  if (bodyFat >= range.min && bodyFat <= range.max) return 'Excellent'
  if (bodyFat >= range.min - 3 && bodyFat <= range.max + 3) return 'Good'
  if (bodyFat >= range.min - 6 && bodyFat <= range.max + 6) return 'Fair'
  if (bodyFat >= range.min - 10 && bodyFat <= range.max + 10) return 'Poor'
  return 'Very Poor'
}

function getRecommendations(bodyFat: number, bmi: number, gender: string, age: number): string[] {
  const recommendations: string[] = []

  // BMI-based recommendations
  if (bmi < 18.5) {
    recommendations.push('Consider increasing caloric intake with nutritious foods')
    recommendations.push('Include strength training to build lean muscle mass')
  } else if (bmi > 25) {
    recommendations.push('Focus on creating a moderate caloric deficit through diet and exercise')
    recommendations.push('Incorporate both cardio and strength training exercises')
  }

  // Body fat percentage recommendations
  if (bodyFat < 10 && gender === 'male' || bodyFat < 16 && gender === 'female') {
    recommendations.push('Your body fat is quite low - ensure adequate nutrition for health')
    recommendations.push('Monitor energy levels and overall health markers')
  } else if (bodyFat > 25 && gender === 'male' || bodyFat > 32 && gender === 'female') {
    recommendations.push('Consider a structured fat loss program')
    recommendations.push('Increase daily physical activity and improve dietary habits')
    recommendations.push('Consult with a healthcare provider for personalized guidance')
  }

  // Age-specific recommendations
  if (age > 40) {
    recommendations.push('Include resistance training to maintain muscle mass')
    recommendations.push('Focus on flexibility and mobility exercises')
  }

  // General health recommendations
  recommendations.push('Stay hydrated and get adequate sleep (7-9 hours)')
  recommendations.push('Include plenty of vegetables, lean proteins, and whole grains in your diet')
  recommendations.push('Aim for at least 150 minutes of moderate exercise per week')

  return recommendations
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 */
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Hard exercise 6-7 days/week
    veryActive: 1.9      // Very hard exercise, physical job
  }

  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || multipliers.moderate)
}

/**
 * Validate measurement data
 */
export function validateMeasurements(data: Partial<MeasurementData>): string[] {
  const errors: string[] = []

  if (!data.age || data.age < 13 || data.age > 100) {
    errors.push('Age must be between 13 and 100 years')
  }

  if (!data.height || data.height < 100 || data.height > 250) {
    errors.push('Height must be between 100 and 250 cm')
  }

  if (!data.weight || data.weight < 30 || data.weight > 300) {
    errors.push('Weight must be between 30 and 300 kg')
  }

  if (!data.waist || data.waist < 50 || data.waist > 200) {
    errors.push('Waist measurement must be between 50 and 200 cm')
  }

  if (!data.neck || data.neck < 20 || data.neck > 60) {
    errors.push('Neck measurement must be between 20 and 60 cm')
  }

  if (data.gender === 'female' && (!data.hip || data.hip < 60 || data.hip > 200)) {
    errors.push('Hip measurement is required for females and must be between 60 and 200 cm')
  }

  // Logical validations
  if (data.waist && data.neck && data.waist <= data.neck) {
    errors.push('Waist measurement should be larger than neck measurement')
  }

  return errors
}
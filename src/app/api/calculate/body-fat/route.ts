import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import User from '@/models/User'
import { calculateBodyFat } from '@/lib/body-fat-calculator'
import ArogyaAI, { HealthContext } from '@/lib/claude-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has required measurements
    const { measurements } = user
    if (!measurements?.height || !measurements?.weight || 
        !measurements?.circumferences?.waist || !measurements?.circumferences?.neck) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required measurements. Please complete your profile first.',
          requiresOnboarding: true
        },
        { status: 400 }
      )
    }

    // Calculate body fat percentage
    const bodyFatResult = calculateBodyFat({
      age: user.profile?.age || 30,
      gender: user.profile?.gender || 'male',
      height: measurements.height,
      weight: measurements.weight,
      waist: measurements.circumferences.waist,
      neck: measurements.circumferences.neck,
      hip: measurements.circumferences.hip
    })

    // Get health category based on body fat percentage and gender
    const getHealthCategory = (percentage: number, gender: string) => {
      const ranges = gender === 'female' ? {
        essential: [10, 13],
        athletes: [14, 20],
        fitness: [21, 24],
        average: [25, 31],
        obese: [32, 100]
      } : {
        essential: [2, 5],
        athletes: [6, 13],
        fitness: [14, 17],
        average: [18, 24],
        obese: [25, 100]
      }

      for (const [category, [min, max]] of Object.entries(ranges)) {
        if (percentage >= min && percentage <= max) {
          return category
        }
      }
      return 'unknown'
    }

    // Get health status
    const getHealthStatus = (category: string) => {
      switch (category) {
        case 'athletes': return 'Excellent'
        case 'fitness': return 'Good'
        case 'average': return 'Fair'
        case 'obese': return 'Poor'
        case 'essential': return 'Very Low'
        default: return 'Unknown'
      }
    }

    const category = getHealthCategory(bodyFatResult.bodyFatPercentage, user.profile?.gender || 'male')
    const healthStatus = getHealthStatus(category)

    // Create user context for AI recommendations
    const userContext = {
      profile: {
        name: user.profile?.name || 'User',
        age: user.profile?.age || 30,
        gender: user.profile?.gender || 'male'
      },
      measurements: {
        height: measurements.height,
        weight: measurements.weight,
        bodyFatPercentage: bodyFatResult.bodyFatPercentage,
        bmi: bodyFatResult.bmi
      },
      lifestyle: user.lifestyle || {},
      goals: user.goals || {},
      category,
      healthStatus
    }

    // Get AI recommendations
    let aiRecommendations: any = null
    try {
      const arogyaAI = ArogyaAI.getInstance()
      const healthContext: HealthContext = {
        age: userContext.profile.age,
        gender: userContext.profile.gender,
        height: userContext.measurements.height,
        weight: measurements.weight,
        bodyFatPercentage: userContext.measurements.bodyFatPercentage,
        bmi: userContext.measurements.bmi,
        activityLevel: userContext.lifestyle?.activityLevel || 'moderate',
        goals: userContext.goals?.primary ? [userContext.goals.primary] : ['general fitness'],
        dietaryRestrictions: userContext.lifestyle?.dietaryRestrictions || [],
        medicalHistory: userContext.lifestyle?.medicalConditions || []
      }
      
      aiRecommendations = await arogyaAI.generateHealthRecommendations(healthContext)
    } catch (error) {
      console.error('AI recommendations error:', error)
      // Continue without AI recommendations
    }

    // Basic recommendations based on category
    const basicRecommendations = getBasicRecommendations(category, user.profile?.gender || 'male')

    // Prepare results object
    const results = {
      bodyFatPercentage: Math.round(bodyFatResult.bodyFatPercentage * 10) / 10,
      bmi: Math.round(bodyFatResult.bmi * 10) / 10,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      healthStatus,
      calculatedAt: new Date(),
      recommendations: {
        basic: basicRecommendations,
        ai: aiRecommendations || null
      }
    }

    // Update user with results
    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          results,
          lastCalculation: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      results: {
        bodyFatPercentage: results.bodyFatPercentage,
        bmi: results.bmi,
        category: results.category,
        healthStatus: results.healthStatus,
        recommendations: basicRecommendations
      }
    })

  } catch (error) {
    console.error('Body fat calculation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to calculate body fat percentage' },
      { status: 500 }
    )
  }
}

function getBasicRecommendations(category: string, gender: string): string[] {
  const recommendations: { [key: string]: string[] } = {
    essential: [
      "Your body fat is very low. Consider consulting a healthcare professional.",
      "Focus on healthy weight gain with balanced nutrition.",
      "Include healthy fats like nuts, avocados, and olive oil in your diet."
    ],
    athletes: [
      "Excellent body composition! Maintain your current fitness routine.",
      "Focus on performance-based nutrition and adequate protein intake.",
      "Continue strength training to preserve lean muscle mass."
    ],
    fitness: [
      "Great job! You're in the fitness range. Keep up the good work.",
      "Maintain a balanced diet with adequate protein (0.8-1g per kg body weight).",
      "Include both cardio and strength training in your routine."
    ],
    average: [
      "You're in the average range. Small improvements can make a big difference.",
      "Create a moderate caloric deficit through diet and exercise.",
      "Include 150 minutes of moderate cardio per week.",
      "Add 2-3 strength training sessions weekly."
    ],
    obese: [
      "Focus on gradual, sustainable weight loss (0.5-1 kg per week).",
      "Prioritize whole foods and reduce processed food intake.",
      "Start with 30 minutes of walking daily and gradually increase.",
      "Consider consulting a healthcare professional for a personalized plan."
    ]
  }

  return recommendations[category] || [
    "Complete your profile for personalized recommendations.",
    "Maintain a balanced diet and regular exercise routine.",
    "Consult healthcare professionals for personalized advice."
  ]
}
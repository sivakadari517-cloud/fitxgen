import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import User from '@/models/User'
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

    // Find user
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate comprehensive recommendations
    const recommendations = await generateComprehensiveRecommendations(user)

    // Save recommendations to user profile
    await User.findOneAndUpdate(
      { email: session.user.email },
      { 
        $set: { 
          recommendations,
          recommendationsGeneratedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      recommendations,
      message: 'Recommendations generated successfully'
    })

  } catch (error) {
    console.error('Generate recommendations error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

async function generateComprehensiveRecommendations(user: any) {
  // Extract user data
  const profile = user.profile || {}
  const measurements = user.measurements || {}
  const results = user.results || {}
  const goals = user.goals || {}
  const lifestyle = user.lifestyle || {}

  const age = profile.age || 30
  const gender = profile.gender || 'male'
  const height = measurements.height || 170
  const weight = measurements.weight || 70
  const bodyFat = results.bodyFatPercentage || null
  const bmi = results.bmi || (weight / Math.pow(height/100, 2))

  // Calculate basic nutritional needs
  const bmr = calculateBMR(weight, height, age, gender)
  const tdee = calculateTDEE(bmr, lifestyle.activityLevel || 'moderate')
  const goalAdjustment = getGoalAdjustment(goals.primary || 'weight_loss')
  const dailyCalories = Math.round(tdee + goalAdjustment)

  // Generate diet recommendations
  const dietRecommendations = generateDietPlan(dailyCalories, bodyFat, goals.primary || 'weight_loss', gender)
  
  // Generate exercise recommendations
  const exerciseRecommendations = generateExercisePlan(
    bodyFat, 
    goals.primary || 'weight_loss', 
    lifestyle.activityLevel || 'moderate',
    age,
    gender
  )

  // Generate wellness recommendations
  const wellnessRecommendations = generateWellnessAdvice(age, gender, bodyFat, lifestyle)

  // Generate AI insights
  let aiInsights = ''
  try {
    const arogyaAI = ArogyaAI.getInstance()
    const healthContext: HealthContext = {
      age,
      gender,
      height,
      weight,
      bodyFatPercentage: bodyFat,
      bmi,
      activityLevel: lifestyle.activityLevel || 'moderate',
      goals: goals.primary ? [goals.primary] : ['general fitness'],
      dietaryRestrictions: lifestyle.dietaryRestrictions || [],
      medicalHistory: lifestyle.medicalConditions || []
    }
    
    aiInsights = await arogyaAI.generateHealthRecommendations(healthContext)
  } catch (error) {
    console.error('AI insights error:', error)
    aiInsights = 'AI insights are temporarily unavailable. Please check the other sections for your personalized recommendations.'
  }

  return {
    diet: dietRecommendations,
    exercise: exerciseRecommendations,
    wellness: wellnessRecommendations,
    aiInsights,
    generatedAt: new Date(),
    profile: {
      age,
      gender,
      bodyFat,
      bmi,
      goal: goals.primary
    }
  }
}

function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161
  }
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  }
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.55)
}

function getGoalAdjustment(goal: string): number {
  const adjustments = {
    weight_loss: -500,
    weight_gain: 500,
    muscle_gain: 300,
    maintenance: 0,
    athletic_performance: 200
  }
  return adjustments[goal as keyof typeof adjustments] || -300
}

function generateDietPlan(dailyCalories: number, bodyFat: number | null, goal: string, gender: string) {
  // Calculate macros based on goal
  const proteinPercent = goal.includes('muscle') ? 0.30 : 0.25
  const fatPercent = 0.25
  const carbPercent = 1 - proteinPercent - fatPercent

  const protein = Math.round((dailyCalories * proteinPercent) / 4)
  const fats = Math.round((dailyCalories * fatPercent) / 9)
  const carbs = Math.round((dailyCalories * carbPercent) / 4)

  const mealPlan = [
    {
      meal: 'Breakfast',
      time: '7:00 AM',
      items: ['Oats with almonds and berries', 'Green tea', 'Banana'],
      calories: Math.round(dailyCalories * 0.25)
    },
    {
      meal: 'Mid-Morning Snack',
      time: '10:00 AM',
      items: ['Mixed nuts', 'Fruit'],
      calories: Math.round(dailyCalories * 0.10)
    },
    {
      meal: 'Lunch',
      time: '1:00 PM',
      items: ['Brown rice', 'Dal', 'Vegetable curry', 'Salad'],
      calories: Math.round(dailyCalories * 0.30)
    },
    {
      meal: 'Evening Snack',
      time: '4:00 PM',
      items: ['Greek yogurt with berries', 'Green tea'],
      calories: Math.round(dailyCalories * 0.10)
    },
    {
      meal: 'Dinner',
      time: '7:00 PM',
      items: ['Grilled chicken/fish', 'Quinoa', 'Steamed vegetables'],
      calories: Math.round(dailyCalories * 0.25)
    }
  ]

  const tips = [
    'Stay hydrated - drink at least 8-10 glasses of water daily',
    'Include protein in every meal to maintain muscle mass',
    'Choose complex carbohydrates over simple sugars',
    'Eat plenty of colorful vegetables for micronutrients',
    'Practice portion control and mindful eating',
    'Avoid processed foods and added sugars',
    'Plan your meals in advance to avoid unhealthy choices'
  ]

  return {
    dailyCalories,
    macros: { protein, carbs, fats },
    mealPlan,
    tips
  }
}

function generateExercisePlan(bodyFat: number | null, goal: string, activityLevel: string, age: number, gender: string) {
  const isHighBodyFat = bodyFat && bodyFat > (gender === 'male' ? 20 : 28)
  const isBeginner = activityLevel === 'sedentary' || activityLevel === 'light'

  const weeklyPlan = [
    {
      day: 'Monday',
      type: 'Strength Training',
      duration: 45,
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '10-15' },
        { name: 'Squats', sets: 3, reps: '12-20' },
        { name: 'Lunges', sets: 3, reps: '10 each leg' },
        { name: 'Plank', sets: 3, duration: 30 }
      ]
    },
    {
      day: 'Tuesday',
      type: 'Cardio',
      duration: 30,
      exercises: [
        { name: 'Brisk Walking', duration: 30 },
        { name: 'Jumping Jacks', sets: 3, reps: '30 seconds' }
      ]
    },
    {
      day: 'Wednesday',
      type: 'Strength Training',
      duration: 45,
      exercises: [
        { name: 'Mountain Climbers', sets: 3, reps: '20' },
        { name: 'Wall Sits', sets: 3, duration: 30 },
        { name: 'Arm Circles', sets: 2, reps: '10 each direction' },
        { name: 'Crunches', sets: 3, reps: '15-20' }
      ]
    },
    {
      day: 'Thursday',
      type: 'Active Recovery',
      duration: 20,
      exercises: [
        { name: 'Yoga/Stretching', duration: 20 },
        { name: 'Light Walking', duration: 10 }
      ]
    },
    {
      day: 'Friday',
      type: 'Full Body Workout',
      duration: 40,
      exercises: [
        { name: 'Burpees', sets: 3, reps: '5-10' },
        { name: 'Push-ups', sets: 3, reps: '8-12' },
        { name: 'Squats', sets: 3, reps: '15-25' },
        { name: 'Plank', sets: 2, duration: 45 }
      ]
    },
    {
      day: 'Saturday',
      type: 'Cardio & Flexibility',
      duration: 35,
      exercises: [
        { name: 'Dancing or Cycling', duration: 25 },
        { name: 'Stretching', duration: 10 }
      ]
    },
    {
      day: 'Sunday',
      type: 'Rest Day',
      duration: 0,
      exercises: [
        { name: 'Complete Rest or Light Walk', duration: 15 }
      ]
    }
  ]

  const tips = [
    'Start slowly and gradually increase intensity',
    'Focus on proper form over speed or weight',
    'Listen to your body and rest when needed',
    'Stay consistent - aim for at least 150 minutes of moderate exercise per week',
    'Include both cardio and strength training in your routine',
    'Warm up before exercising and cool down afterwards',
    'Find activities you enjoy to maintain long-term adherence'
  ]

  return {
    weeklyPlan,
    tips
  }
}

function generateWellnessAdvice(age: number, gender: string, bodyFat: number | null, lifestyle: any) {
  const sleepRecommendations = [
    'Aim for 7-9 hours of quality sleep each night',
    'Maintain a consistent sleep schedule',
    'Create a relaxing bedtime routine',
    'Avoid screens 1 hour before bedtime',
    'Keep your bedroom cool, dark, and quiet',
    'Avoid caffeine 6 hours before bedtime'
  ]

  const stressManagement = [
    'Practice deep breathing exercises for 5-10 minutes daily',
    'Try meditation or mindfulness practices',
    'Engage in regular physical activity',
    'Maintain social connections with family and friends',
    'Take short breaks throughout your workday',
    'Consider yoga or tai chi for mind-body wellness'
  ]

  const hydrationGoal = Math.max(2.5, Math.round((35 * (lifestyle.weight || 70)) / 1000 * 10) / 10)

  const supplements = [
    'Vitamin D3 (especially if limited sun exposure)',
    'Omega-3 fatty acids (if not eating fish regularly)',
    'Multivitamin (to cover nutritional gaps)',
    'Probiotics (for digestive health)'
  ]

  // Add age-specific supplements
  if (age > 40) {
    supplements.push('Calcium and Magnesium (for bone health)')
  }

  if (gender === 'female') {
    supplements.push('Iron (if experiencing heavy periods)')
    supplements.push('Folate (especially important for reproductive health)')
  }

  return {
    sleepRecommendations,
    stressManagement,
    hydrationGoal,
    supplements
  }
}
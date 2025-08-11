import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
})

export interface HealthContext {
  age: number
  gender: 'male' | 'female'
  height: number
  weight: number
  bodyFatPercentage?: number
  bmi?: number
  activityLevel: string
  goals: string[]
  dietaryRestrictions: string[]
  medicalHistory: string[]
  currentConcerns?: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export class ArogyaAI {
  private static instance: ArogyaAI
  
  public static getInstance(): ArogyaAI {
    if (!ArogyaAI.instance) {
      ArogyaAI.instance = new ArogyaAI()
    }
    return ArogyaAI.instance
  }

  private buildSystemPrompt(healthContext: HealthContext): string {
    return `You are Arogya, an AI health and wellness assistant for FitXGen, designed specifically for Indian users. Your role is to provide personalized, science-based health guidance while being culturally sensitive to Indian lifestyle, food habits, and health practices.

USER PROFILE:
- Age: ${healthContext.age} years
- Gender: ${healthContext.gender}
- Height: ${healthContext.height} cm
- Weight: ${healthContext.weight} kg
- Body Fat: ${healthContext.bodyFatPercentage || 'Not available'}%
- BMI: ${healthContext.bmi || 'Not calculated'}
- Activity Level: ${healthContext.activityLevel}
- Goals: ${healthContext.goals.join(', ')}
- Dietary Restrictions: ${healthContext.dietaryRestrictions.join(', ') || 'None'}
- Medical History: ${healthContext.medicalHistory.join(', ') || 'None reported'}

GUIDELINES:
1. Always provide personalized advice based on the user's specific profile
2. Include Indian foods, recipes, and cultural practices in your recommendations
3. Consider the Indian climate, lifestyle, and food availability
4. Be encouraging and motivational while being realistic
5. Always suggest consulting healthcare professionals for medical concerns
6. Focus on sustainable, long-term health improvements
7. Use simple, easy-to-understand language
8. Provide actionable, specific recommendations
9. Consider budget-friendly options suitable for Indian families
10. Incorporate traditional Indian wellness practices (yoga, ayurveda) when appropriate

RESPONSE FORMAT:
- Keep responses concise but comprehensive (200-400 words)
- Use bullet points for recommendations when appropriate
- Include practical tips that can be implemented immediately
- End with an encouraging message or question to continue the conversation

Remember: You are a supportive health companion, not a replacement for medical professionals.`
  }

  async generateHealthRecommendations(healthContext: HealthContext): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(healthContext)
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Based on my health profile, please provide comprehensive recommendations for:
1. Diet plan suitable for Indian cuisine
2. Exercise routine considering my current fitness level
3. Lifestyle modifications for better health
4. Specific tips for achieving my stated goals

Please make recommendations practical and achievable for someone living in India.`
        }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate recommendations at this time.'
    } catch (error) {
      console.error('Error generating health recommendations:', error)
      throw new Error('Failed to generate health recommendations. Please try again.')
    }
  }

  async chatWithArogya(
    userMessage: string, 
    healthContext: HealthContext,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(healthContext)
      
      // Build conversation context
      const messages = conversationHistory
        .slice(-6) // Keep last 6 messages for context (3 exchanges)
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      
      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      })

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
      })

      return message.content[0].type === 'text' ? message.content[0].text : 'I apologize, but I cannot respond to that right now.'
    } catch (error) {
      console.error('Error in chat response:', error)
      throw new Error('Unable to process your message. Please try again.')
    }
  }

  async generateDietPlan(healthContext: HealthContext, preferences: {
    mealsPerDay: number
    cuisine: string[]
    budget: 'low' | 'medium' | 'high'
    cookingTime: 'quick' | 'moderate' | 'elaborate'
  }): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(healthContext)
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Create a detailed 7-day Indian diet plan with:
- ${preferences.mealsPerDay} meals per day
- Preferred cuisines: ${preferences.cuisine.join(', ')}
- Budget: ${preferences.budget}
- Cooking time preference: ${preferences.cookingTime}

Include:
1. Daily meal breakdown with specific Indian dishes
2. Portion sizes
3. Nutritional benefits
4. Shopping list for Indian ingredients
5. Preparation tips
6. Alternatives for different regions of India

Focus on locally available, affordable ingredients and traditional cooking methods.`
        }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate diet plan at this time.'
    } catch (error) {
      console.error('Error generating diet plan:', error)
      throw new Error('Failed to generate diet plan. Please try again.')
    }
  }

  async generateExercisePlan(healthContext: HealthContext, preferences: {
    availableTime: number // minutes per day
    equipment: string[]
    location: 'home' | 'gym' | 'outdoor' | 'mixed'
    experience: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(healthContext)
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Design a personalized exercise routine for me:
- Available time: ${preferences.availableTime} minutes per day
- Available equipment: ${preferences.equipment.join(', ') || 'None'}
- Preferred location: ${preferences.location}
- Experience level: ${preferences.experience}

Please include:
1. Weekly workout schedule
2. Specific exercises with repetitions/duration
3. Warm-up and cool-down routines
4. Progressive difficulty levels
5. Indian-specific modifications (considering climate, cultural preferences)
6. Alternative exercises for busy days
7. How to track progress

Consider the Indian lifestyle, climate challenges, and home-based options.`
        }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate exercise plan at this time.'
    } catch (error) {
      console.error('Error generating exercise plan:', error)
      throw new Error('Failed to generate exercise plan. Please try again.')
    }
  }

  async generateStressManagementPlan(healthContext: HealthContext): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(healthContext)
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Create a comprehensive stress management plan incorporating:
1. Traditional Indian practices (yoga, meditation, pranayama)
2. Modern stress-relief techniques
3. Lifestyle modifications suitable for Indian work culture
4. Daily routines and habits
5. Quick stress-busters for busy days
6. Long-term stress prevention strategies

Consider the unique stressors in Indian society (family expectations, work pressure, social dynamics) and provide culturally appropriate solutions.`
        }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate stress management plan at this time.'
    } catch (error) {
      console.error('Error generating stress management plan:', error)
      throw new Error('Failed to generate stress management plan. Please try again.')
    }
  }

  async analyzeProgressAndAdjustRecommendations(
    healthContext: HealthContext,
    progressData: {
      previousBodyFat?: number
      currentBodyFat?: number
      previousWeight?: number
      currentWeight?: number
      adherenceToRecommendations: number // 1-10 scale
      challenges: string[]
      achievements: string[]
    }
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(healthContext)
      
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Analyze my progress and adjust recommendations:

PROGRESS DATA:
- Previous body fat: ${progressData.previousBodyFat || 'N/A'}%
- Current body fat: ${progressData.currentBodyFat || 'N/A'}%
- Previous weight: ${progressData.previousWeight || 'N/A'} kg
- Current weight: ${progressData.currentWeight || 'N/A'} kg
- Adherence to recommendations: ${progressData.adherenceToRecommendations}/10
- Challenges faced: ${progressData.challenges.join(', ')}
- Achievements: ${progressData.achievements.join(', ')}

Please provide:
1. Progress analysis and what it means
2. Adjusted recommendations based on current results
3. Solutions for the challenges I'm facing
4. Motivation and encouragement
5. Next steps and goals for the coming period

Be specific about what's working and what needs to change.`
        }]
      })

      return message.content[0].type === 'text' ? message.content[0].text : 'Unable to analyze progress at this time.'
    } catch (error) {
      console.error('Error analyzing progress:', error)
      throw new Error('Failed to analyze progress. Please try again.')
    }
  }
}

export default ArogyaAI
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Ruler, 
  Activity, 
  Target,
  Heart,
  Sparkles,
  CheckCircle
} from 'lucide-react'

interface OnboardingData {
  // Personal Info
  name: string
  age: number
  gender: 'male' | 'female'
  phone: string
  
  // Measurements
  height: number
  weight: number
  waist: number
  neck: number
  hip?: number
  
  // Lifestyle
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
  dietaryHabits: string[]
  sleepHours: number
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent'
  stressLevel: 'low' | 'moderate' | 'high' | 'veryHigh'
  medicalHistory: string[]
  smoking: boolean
  alcohol: 'none' | 'occasional' | 'moderate' | 'heavy'
  
  // Goals
  primaryObjective: 'weightLoss' | 'weightGain' | 'muscleGain' | 'maintenance' | 'fitness'
  dietaryRestrictions: string[]
  exercisePreferences: string[]
  targetWeight?: number
}

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    age: 25,
    gender: 'male',
    phone: '',
    height: 170,
    weight: 70,
    waist: 80,
    neck: 35,
    activityLevel: 'moderate',
    dietaryHabits: [],
    sleepHours: 7,
    sleepQuality: 'good',
    stressLevel: 'moderate',
    medicalHistory: [],
    smoking: false,
    alcohol: 'none',
    primaryObjective: 'fitness',
    dietaryRestrictions: [],
    exercisePreferences: []
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    setError('')
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Info
        return !!(formData.name && formData.age && formData.gender && formData.phone)
      case 2: // Measurements
        return !!(formData.height && formData.weight && formData.waist && formData.neck)
      case 3: // Lifestyle
        return !!(formData.activityLevel && formData.sleepHours)
      case 4: // Goals
        return !!(formData.primaryObjective)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields before continuing.')
      return
    }
    
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Redirect to payment or dashboard
        router.push('/payment?plan=basic')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save your information. Please try again.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Let's Get to Know You
          </h1>
          <p className="text-slate-600">
            Help us create your personalized health profile for accurate body fat analysis
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
            </span>
          </div>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="h-3" />
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Form Steps */}
        <Card className="shadow-xl border-0 min-h-[500px]">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <PersonalInfoStep 
                  key="step1"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 2 && (
                <MeasurementsStep 
                  key="step2"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 3 && (
                <LifestyleStep 
                  key="step3"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
              {currentStep === 4 && (
                <GoalsStep 
                  key="step4"
                  formData={formData}
                  updateFormData={updateFormData}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={isLoading || !validateStep(currentStep)}
            className="px-6"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : currentStep === TOTAL_STEPS ? (
              <>
                Complete Setup
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step Components
const PersonalInfoStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: OnboardingData
  updateFormData: (updates: Partial<OnboardingData>) => void 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <User className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
      <p className="text-slate-600">Tell us about yourself so we can personalize your experience</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Full Name *
        </label>
        <Input
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Age *
        </label>
        <Input
          type="number"
          value={formData.age}
          onChange={(e) => updateFormData({ age: parseInt(e.target.value) || 0 })}
          placeholder="Enter your age"
          min={13}
          max={100}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Gender *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={formData.gender === 'male' ? 'default' : 'outline'}
            onClick={() => updateFormData({ gender: 'male' })}
            className="h-12"
          >
            Male
          </Button>
          <Button
            type="button"
            variant={formData.gender === 'female' ? 'default' : 'outline'}
            onClick={() => updateFormData({ gender: 'female' })}
            className="h-12"
          >
            Female
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Phone Number *
        </label>
        <Input
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          placeholder="Enter your phone number"
          required
        />
      </div>
    </div>
  </motion.div>
)

const MeasurementsStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: OnboardingData
  updateFormData: (updates: Partial<OnboardingData>) => void 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Ruler className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Body Measurements</h2>
      <p className="text-slate-600">Accurate measurements ensure precise body fat calculation</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Height (cm) *
        </label>
        <Input
          type="number"
          value={formData.height}
          onChange={(e) => updateFormData({ height: parseInt(e.target.value) || 0 })}
          placeholder="Enter your height"
          min={100}
          max={250}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Weight (kg) *
        </label>
        <Input
          type="number"
          value={formData.weight}
          onChange={(e) => updateFormData({ weight: parseInt(e.target.value) || 0 })}
          placeholder="Enter your weight"
          min={30}
          max={300}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Waist Circumference (cm) *
        </label>
        <Input
          type="number"
          value={formData.waist}
          onChange={(e) => updateFormData({ waist: parseInt(e.target.value) || 0 })}
          placeholder="Measure at narrowest point"
          min={50}
          max={200}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Neck Circumference (cm) *
        </label>
        <Input
          type="number"
          value={formData.neck}
          onChange={(e) => updateFormData({ neck: parseInt(e.target.value) || 0 })}
          placeholder="Measure below Adam's apple"
          min={20}
          max={60}
          required
        />
      </div>

      {formData.gender === 'female' && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Hip Circumference (cm) *
          </label>
          <Input
            type="number"
            value={formData.hip || ''}
            onChange={(e) => updateFormData({ hip: parseInt(e.target.value) || undefined })}
            placeholder="Measure at widest point"
            min={60}
            max={200}
            required
          />
        </div>
      )}
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
      <strong>Measurement Tips:</strong>
      <ul className="mt-2 space-y-1">
        <li>• Measure in the morning before eating</li>
        <li>• Use a flexible measuring tape</li>
        <li>• Keep the tape snug but not tight</li>
        <li>• Stand straight and breathe normally</li>
      </ul>
    </div>
  </motion.div>
)

const LifestyleStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: OnboardingData
  updateFormData: (updates: Partial<OnboardingData>) => void 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Lifestyle & Health</h2>
      <p className="text-slate-600">Help us understand your daily habits and health status</p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Activity Level *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
            { value: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week' },
            { value: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week' },
            { value: 'active', label: 'Active', desc: 'Hard exercise 6-7 days/week' },
            { value: 'veryActive', label: 'Very Active', desc: 'Very hard exercise, physical job' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.activityLevel === option.value ? 'default' : 'outline'}
              onClick={() => updateFormData({ activityLevel: option.value as any })}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-70">{option.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sleep Hours per Night *
          </label>
          <Input
            type="number"
            value={formData.sleepHours}
            onChange={(e) => updateFormData({ sleepHours: parseInt(e.target.value) || 7 })}
            min={4}
            max={12}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Sleep Quality *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'poor', label: 'Poor' },
              { value: 'fair', label: 'Fair' },
              { value: 'good', label: 'Good' },
              { value: 'excellent', label: 'Excellent' }
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={formData.sleepQuality === option.value ? 'default' : 'outline'}
                onClick={() => updateFormData({ sleepQuality: option.value as any })}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Stress Level *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
            { value: 'veryHigh', label: 'Very High' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.stressLevel === option.value ? 'default' : 'outline'}
              onClick={() => updateFormData({ stressLevel: option.value as any })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Do you smoke?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={!formData.smoking ? 'default' : 'outline'}
              onClick={() => updateFormData({ smoking: false })}
            >
              No
            </Button>
            <Button
              type="button"
              variant={formData.smoking ? 'default' : 'outline'}
              onClick={() => updateFormData({ smoking: true })}
            >
              Yes
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Alcohol Consumption
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'none', label: 'None' },
              { value: 'occasional', label: 'Occasional' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'heavy', label: 'Heavy' }
            ].map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={formData.alcohol === option.value ? 'default' : 'outline'}
                onClick={() => updateFormData({ alcohol: option.value as any })}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)

const GoalsStep = ({ 
  formData, 
  updateFormData 
}: { 
  formData: OnboardingData
  updateFormData: (updates: Partial<OnboardingData>) => void 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Health Goals</h2>
      <p className="text-slate-600">Define your objectives so we can create a personalized plan</p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Primary Health Objective *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'weightLoss', label: 'Weight Loss', desc: 'Reduce body weight and fat' },
            { value: 'weightGain', label: 'Weight Gain', desc: 'Increase healthy body weight' },
            { value: 'muscleGain', label: 'Muscle Gain', desc: 'Build lean muscle mass' },
            { value: 'maintenance', label: 'Maintenance', desc: 'Maintain current physique' },
            { value: 'fitness', label: 'General Fitness', desc: 'Improve overall health' }
          ].map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={formData.primaryObjective === option.value ? 'default' : 'outline'}
              onClick={() => updateFormData({ primaryObjective: option.value as any })}
              className="h-auto p-4 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">{option.label}</div>
                <div className="text-xs opacity-70">{option.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {(formData.primaryObjective === 'weightLoss' || formData.primaryObjective === 'weightGain') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Target Weight (kg)
          </label>
          <Input
            type="number"
            value={formData.targetWeight || ''}
            onChange={(e) => updateFormData({ targetWeight: parseInt(e.target.value) || undefined })}
            placeholder="Enter your target weight"
            min={30}
            max={300}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Dietary Restrictions (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Vegetarian',
            'Vegan',
            'Jain',
            'Gluten-free',
            'Dairy-free',
            'Low-carb',
            'Keto',
            'Diabetic',
            'High Protein'
          ].map((restriction) => (
            <Button
              key={restriction}
              type="button"
              variant={formData.dietaryRestrictions.includes(restriction) ? 'default' : 'outline'}
              onClick={() => {
                const current = formData.dietaryRestrictions
                const updated = current.includes(restriction)
                  ? current.filter(r => r !== restriction)
                  : [...current, restriction]
                updateFormData({ dietaryRestrictions: updated })
              }}
              size="sm"
            >
              {restriction}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Exercise Preferences (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Yoga',
            'Gym/Weights',
            'Running',
            'Swimming',
            'Cycling',
            'Dancing',
            'Martial Arts',
            'Home Workouts',
            'Walking'
          ].map((exercise) => (
            <Button
              key={exercise}
              type="button"
              variant={formData.exercisePreferences.includes(exercise) ? 'default' : 'outline'}
              onClick={() => {
                const current = formData.exercisePreferences
                const updated = current.includes(exercise)
                  ? current.filter(e => e !== exercise)
                  : [...current, exercise]
                updateFormData({ exercisePreferences: updated })
              }}
              size="sm"
            >
              {exercise}
            </Button>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
      <div className="flex items-start">
        <Heart className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Almost done!</strong> Your personalized health profile will help our AI assistant "Arogya" 
          provide you with accurate body fat analysis and tailored recommendations for your Indian lifestyle.
        </div>
      </div>
    </div>
  </motion.div>
)
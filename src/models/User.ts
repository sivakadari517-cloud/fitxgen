import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  email: string
  password: string
  profile: {
    name: string
    age: number
    gender: 'male' | 'female'
    phone?: string
    avatar?: string
  }
  measurements: {
    height: number
    weight: number
    circumferences: {
      waist: number
      neck: number
      hip?: number
    }
  }
  lifestyle: {
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
    dietaryHabits: string[]
    sleepPattern: {
      averageHours: number
      quality: 'poor' | 'fair' | 'good' | 'excellent'
    }
    stressLevel: 'low' | 'moderate' | 'high' | 'veryHigh'
    medicalHistory: string[]
    substanceUse: {
      smoking: boolean
      alcohol: 'none' | 'occasional' | 'moderate' | 'heavy'
    }
  }
  goals: {
    primaryObjective: 'weightLoss' | 'weightGain' | 'muscleGain' | 'maintenance' | 'fitness'
    dietaryRestrictions: string[]
    exercisePreferences: string[]
    targetWeight?: number
  }
  results: {
    bodyFatPercentage: number
    bmi: number
    calculatedAt: Date
    recommendations: Record<string, any>
  }
  subscription: {
    status: 'active' | 'inactive' | 'expired'
    paymentId?: string
    expiresAt?: Date
    additionalPeople: number
  }
  referrals: {
    code: string
    referred: mongoose.Types.ObjectId[]
    earnings: number
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 13,
      max: 100
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
    },
    avatar: {
      type: String
    }
  },
  measurements: {
    height: {
      type: Number,
      required: true,
      min: 100,
      max: 250
    },
    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 300
    },
    circumferences: {
      waist: {
        type: Number,
        required: true,
        min: 50,
        max: 200
      },
      neck: {
        type: Number,
        required: true,
        min: 20,
        max: 60
      },
      hip: {
        type: Number,
        min: 60,
        max: 200
      }
    }
  },
  lifestyle: {
    activityLevel: {
      type: String,
      required: true,
      enum: ['sedentary', 'light', 'moderate', 'active', 'veryActive'],
      default: 'moderate'
    },
    dietaryHabits: [{
      type: String
    }],
    sleepPattern: {
      averageHours: {
        type: Number,
        min: 4,
        max: 12,
        default: 7
      },
      quality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
        default: 'good'
      }
    },
    stressLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'veryHigh'],
      default: 'moderate'
    },
    medicalHistory: [{
      type: String
    }],
    substanceUse: {
      smoking: {
        type: Boolean,
        default: false
      },
      alcohol: {
        type: String,
        enum: ['none', 'occasional', 'moderate', 'heavy'],
        default: 'none'
      }
    }
  },
  goals: {
    primaryObjective: {
      type: String,
      required: true,
      enum: ['weightLoss', 'weightGain', 'muscleGain', 'maintenance', 'fitness']
    },
    dietaryRestrictions: [{
      type: String
    }],
    exercisePreferences: [{
      type: String
    }],
    targetWeight: {
      type: Number,
      min: 30,
      max: 300
    }
  },
  results: {
    bodyFatPercentage: {
      type: Number,
      min: 3,
      max: 50
    },
    bmi: {
      type: Number,
      min: 10,
      max: 60
    },
    calculatedAt: {
      type: Date
    },
    recommendations: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'inactive'
    },
    paymentId: {
      type: String
    },
    expiresAt: {
      type: Date
    },
    additionalPeople: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  referrals: {
    code: {
      type: String,
      unique: true,
      sparse: true
    },
    referred: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    earnings: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
UserSchema.index({ email: 1 })
UserSchema.index({ 'referrals.code': 1 })
UserSchema.index({ 'subscription.status': 1 })
UserSchema.index({ createdAt: -1 })

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return this.profile.name
})

// Pre-save middleware to validate female hip measurement
UserSchema.pre('save', function(this: IUser, next) {
  if (this.profile?.gender === 'female' && !this.measurements?.circumferences?.hip) {
    return next(new Error('Hip measurement is required for females'))
  }
  next()
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
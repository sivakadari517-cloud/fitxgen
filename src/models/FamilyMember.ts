import mongoose, { Schema, Document } from 'mongoose'

export interface IFamilyMember extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  relationship: string
  age: number
  gender: 'male' | 'female'
  measurements?: {
    height?: number
    weight?: number
    circumferences?: {
      waist?: number
      neck?: number
      hip?: number
    }
    bodyFatPercentage?: number
    bmi?: number
    lastUpdated?: Date
  }
  results?: {
    bodyFatPercentage: number
    bmi: number
    category: string
    healthStatus: string
    calculatedAt: Date
    recommendations?: any
  }
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FamilyMemberSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  relationship: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  measurements: {
    height: {
      type: Number,
      min: 100,
      max: 250
    },
    weight: {
      type: Number,
      min: 20,
      max: 300
    },
    circumferences: {
      waist: {
        type: Number,
        min: 40,
        max: 200
      },
      neck: {
        type: Number,
        min: 20,
        max: 60
      },
      hip: {
        type: Number,
        min: 40,
        max: 200
      }
    },
    bodyFatPercentage: {
      type: Number,
      min: 1,
      max: 60
    },
    bmi: {
      type: Number,
      min: 10,
      max: 50
    },
    lastUpdated: {
      type: Date
    }
  },
  results: {
    bodyFatPercentage: {
      type: Number
    },
    bmi: {
      type: Number
    },
    category: {
      type: String
    },
    healthStatus: {
      type: String
    },
    calculatedAt: {
      type: Date
    },
    recommendations: {
      type: Schema.Types.Mixed
    }
  },
  avatar: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v)
      },
      message: 'Avatar must be a valid image URL'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
FamilyMemberSchema.index({ userId: 1, isActive: 1 })
FamilyMemberSchema.index({ userId: 1, name: 1 })
FamilyMemberSchema.index({ createdAt: -1 })

// Virtual for age calculation if birthdate is stored instead
FamilyMemberSchema.virtual('currentAge').get(function() {
  if (this.age) return this.age
  return null
})

// Method to calculate and update body fat
FamilyMemberSchema.methods.calculateBodyFat = function() {
  if (!this.measurements?.height || !this.measurements?.weight || 
      !this.measurements?.circumferences?.waist || !this.measurements?.circumferences?.neck) {
    return null
  }

  // Import the calculation function
  const { calculateBodyFat } = require('@/lib/body-fat-calculator')
  
  return calculateBodyFat({
    age: this.age,
    gender: this.gender,
    height: this.measurements.height,
    weight: this.measurements.weight,
    waist: this.measurements.circumferences.waist,
    neck: this.measurements.circumferences.neck,
    hip: this.measurements.circumferences.hip
  })
}

// Pre-save middleware to update measurements timestamp
FamilyMemberSchema.pre('save', function(next) {
  if (this.isModified('measurements')) {
    this.set('measurements.lastUpdated', new Date())
  }
  next()
})

// Ensure we don't duplicate the model
const FamilyMember = mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema)

export default FamilyMember
import mongoose, { Schema, Document } from 'mongoose'

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId
  type: 'rating' | 'suggestion' | 'bug_report' | 'testimonial' | 'feature_request' | 'general'
  category: string
  rating?: number
  title: string
  message: string
  userInfo: {
    name: string
    email: string
    subscriptionStatus: string
    usageDuration?: number // in days
  }
  metadata: {
    page?: string
    feature?: string
    device?: string
    browser?: string
    version?: string
  }
  attachments?: Array<{
    type: 'image' | 'file'
    url: string
    name: string
    size: number
  }>
  status: 'new' | 'reviewed' | 'in_progress' | 'resolved' | 'closed'
  adminNotes?: string
  response?: {
    message: string
    respondedBy: string
    respondedAt: Date
  }
  isPublic: boolean
  isVerified: boolean
  helpfulCount: number
  tags: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

const FeedbackSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['rating', 'suggestion', 'bug_report', 'testimonial', 'feature_request', 'general'],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'app_performance',
      'body_fat_calculation',
      'ai_recommendations',
      'user_interface',
      'payment_billing',
      'family_features',
      'data_accuracy',
      'customer_support',
      'mobile_experience',
      'general_experience',
      'feature_request',
      'technical_issue'
    ]
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  userInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    subscriptionStatus: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'trial', 'expired']
    },
    usageDuration: {
      type: Number,
      min: 0
    }
  },
  metadata: {
    page: String,
    feature: String,
    device: String,
    browser: String,
    version: String
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file']
    },
    url: String,
    name: String,
    size: Number
  }],
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'reviewed', 'in_progress', 'resolved', 'closed'],
    index: true
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  response: {
    message: {
      type: String,
      maxlength: 1000
    },
    respondedBy: String,
    respondedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'urgent']
  },
  resolvedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for better query performance
FeedbackSchema.index({ userId: 1, createdAt: -1 })
FeedbackSchema.index({ type: 1, status: 1 })
FeedbackSchema.index({ rating: -1, isPublic: 1 })
FeedbackSchema.index({ createdAt: -1 })
FeedbackSchema.index({ priority: 1, status: 1 })
FeedbackSchema.index({ tags: 1 })

// Virtual for feedback age in days
FeedbackSchema.virtual('ageInDays').get(function(this: IFeedback) {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
})

// Virtual for resolution time
FeedbackSchema.virtual('resolutionTimeInDays').get(function(this: IFeedback) {
  if (!this.resolvedAt) return null
  return Math.floor((this.resolvedAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24))
})

// Pre-save middleware to auto-assign priority based on type and rating
FeedbackSchema.pre('save', function(this: IFeedback, next) {
  if (this.isNew || this.isModified('type') || this.isModified('rating')) {
    // Auto-assign priority
    if (this.type === 'bug_report') {
      this.priority = 'high'
    } else if (this.type === 'rating' && this.rating && (this.rating as number) <= 2) {
      this.priority = 'high'
    } else if (this.type === 'feature_request') {
      this.priority = 'low'
    }

    // Auto-assign tags based on type and category
    const autoTags: string[] = []
    autoTags.push(this.type)
    autoTags.push(this.category)
    
    if (this.rating) {
      const rating = this.rating as number
      if (rating >= 4) autoTags.push('positive')
      else if (rating <= 2) autoTags.push('negative')
      else autoTags.push('neutral')
    }

    this.tags = [...new Set([...(this.tags || []), ...autoTags])]
  }

  // Set resolvedAt when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date()
  }

  next()
})

// Static methods for analytics
FeedbackSchema.statics.getAverageRating = function() {
  return this.aggregate([
    { $match: { type: 'rating', rating: { $exists: true } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ])
}

FeedbackSchema.statics.getRatingDistribution = function() {
  return this.aggregate([
    { $match: { type: 'rating', rating: { $exists: true } } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ])
}

FeedbackSchema.statics.getFeedbackByCategory = function() {
  return this.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ])
}

FeedbackSchema.statics.getRecentTestimonials = function(limit = 10) {
  return this.find({
    type: 'testimonial',
    isPublic: true,
    isVerified: true
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('title message userInfo.name rating createdAt')
}

// Ensure we don't duplicate the model
const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)

export default Feedback
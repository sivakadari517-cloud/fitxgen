import mongoose from 'mongoose'

export interface IPayment extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  additionalPeople: number
  metadata: {
    referralCode?: string
    discountApplied?: number
    promocode?: string
  }
  webhookEvents: Array<{
    event: string
    data: Record<string, any>
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    min: 99 // Minimum amount ₹99
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  additionalPeople: {
    type: Number,
    default: 0,
    min: 0
  },
  metadata: {
    referralCode: {
      type: String,
      maxlength: 20
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0
    },
    promocode: {
      type: String,
      maxlength: 50
    }
  },
  webhookEvents: [{
    event: {
      type: String,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// Indexes
PaymentSchema.index({ userId: 1, status: 1 })
PaymentSchema.index({ razorpayOrderId: 1 })
PaymentSchema.index({ razorpayPaymentId: 1 })
PaymentSchema.index({ status: 1, createdAt: -1 })
PaymentSchema.index({ createdAt: -1 })

// Virtual for formatted amount
PaymentSchema.virtual('formattedAmount').get(function(this: IPayment) {
  return `₹${this.amount.toLocaleString('en-IN')}`
})

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
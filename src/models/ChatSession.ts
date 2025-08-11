import mongoose from 'mongoose'

export interface IChatSession extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  context: {
    userHealthData: Record<string, any>
    conversationTopic: string
    lastActivity: Date
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ChatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 4000
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    userHealthData: {
      type: mongoose.Schema.Types.Mixed
    },
    conversationTopic: {
      type: String,
      maxlength: 200
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

// Indexes
ChatSessionSchema.index({ userId: 1, isActive: 1 })
ChatSessionSchema.index({ 'context.lastActivity': -1 })
ChatSessionSchema.index({ createdAt: -1 })

export default mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema)
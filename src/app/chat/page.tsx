'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Send, 
  Brain, 
  Heart, 
  Sparkles, 
  ArrowLeft,
  Mic,
  MicOff,
  MoreVertical,
  Download,
  Share,
  RefreshCw,
  User,
  Bot
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  typing?: boolean
}

interface UserProfile {
  name: string
  age: number
  gender: 'male' | 'female'
  healthMetrics?: {
    bodyFatPercentage?: number
    bmi?: number
    category?: string
  }
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      initializeChat()
    }
  }, [status, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile({
          name: profileData.user.profile.name,
          age: profileData.user.profile.age,
          gender: profileData.user.profile.gender,
          healthMetrics: profileData.user.results ? {
            bodyFatPercentage: profileData.user.results.bodyFatPercentage,
            bmi: profileData.user.results.bmi,
            category: profileData.user.results.category
          } : undefined
        })
      }

      // Create new chat session
      const sessionResponse = await fetch('/api/chat/create-session', {
        method: 'POST'
      })
      
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setSessionId(sessionData.sessionId)
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: `🙏 Namaste! I'm Arogya, your personal AI health assistant. I'm here to help you with personalized health guidance, nutrition advice, exercise recommendations, and answer any wellness questions you might have.

${userProfile?.healthMetrics ?
  `I can see you have a body fat percentage of ${userProfile.healthMetrics.bodyFatPercentage}% and you're in the ${userProfile.healthMetrics.category?.toLowerCase()} category. ` :
  'To give you the most personalized advice, consider completing your body fat assessment first. '
}

How can I help you on your health journey today? 💪✨`,
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: 'typing-' + Date.now(),
      role: 'assistant',
      content: 'Arogya is thinking...',
      timestamp: new Date(),
      typing: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Remove typing indicator and add AI response
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.typing)
          return [...filteredMessages, {
            id: 'ai-' + Date.now(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date()
          }]
        })
      } else {
        // Handle error
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.typing)
          return [...filteredMessages, {
            id: 'error-' + Date.now(),
            role: 'assistant',
            content: 'I apologize, but I encountered an issue processing your request. Please try again in a moment.',
            timestamp: new Date()
          }]
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.typing)
        return [...filteredMessages, {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: 'I apologize, but I encountered an issue processing your request. Please try again in a moment.',
          timestamp: new Date()
        }]
      })
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your health assistant...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Arogya AI</h1>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Brain className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                    } ${message.typing ? 'animate-pulse' : ''}`}>
                      {message.typing ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-sm text-slate-500">Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Arogya anything about your health..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none max-h-32 min-h-[48px]"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="h-12 w-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("What should I eat for better health?")}
              disabled={isLoading}
            >
              <Heart className="w-3 h-3 mr-1" />
              Diet Tips
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("Suggest an exercise routine for me")}
              disabled={isLoading}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Exercise Plan
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputMessage("How can I reduce stress?")}
              disabled={isLoading}
            >
              <Brain className="w-3 h-3 mr-1" />
              Stress Relief
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Gift, 
  Heart, 
  Users, 
  Share2, 
  Copy, 
  MessageCircle,
  Mail,
  ArrowLeft,
  IndianRupee,
  Trophy,
  Target,
  Sparkles,
  Home,
  Shield,
  Clock,
  TrendingUp,
  Check,
  Star,
  Phone
} from 'lucide-react'

interface ReferralData {
  code: string
  totalReferred: number
  activeReferrals: number
  totalEarnings: number
  pendingEarnings: number
  recentReferrals: Array<{
    name: string
    joinedAt: Date
    earnings: number
    status: 'active' | 'pending'
  }>
}

interface EmotionalTrigger {
  id: string
  title: string
  subtitle: string
  message: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

export default function ReferralsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTrigger, setSelectedTrigger] = useState<EmotionalTrigger | null>(null)
  const [shareMessage, setShareMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const emotionalTriggers: EmotionalTrigger[] = [
    {
      id: 'family-health',
      title: 'Family Health Journey',
      subtitle: 'Keep your loved ones healthy',
      message: `🏠 मैंने अपनी फैमिली की हेल्थ ट्रैक करने के लिए FitXGen का इस्तेमाल किया है और रिजल्ट्स बहुत अच्छे मिले हैं! 

💪 Scientific Body Fat Analysis के साथ हमें पता चल गया कि हम कैसे अपनी हेल्थ improve कर सकते हैं।

❤️ आप भी अपनी फैमिली के लिए try करें - सिर्फ ₹99 में complete health tracking मिल जाता है।

🎁 मेरा referral code use करें और हमारी health journey में शामिल हों!`,
      icon: Home,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'health-goals',
      title: 'Health Transformation',
      subtitle: 'Achieve fitness goals together',
      message: `💯 FitXGen ने मेरी health journey को बिल्कुल change कर दिया है!

📊 99.7% Accurate Body Fat Analysis से मुझे exact पता चल गया कि मैं कहाँ खड़ा हूँ।

🤖 AI Health Assistant "Arogya" 24/7 मेरे सवालों का जवाब देता है - बिल्कुल personal doctor की तरह!

🎯 अगर आप भी serious हैं अपनी health के बारे में, तो यह app definitely try करें।

Code: {REFERRAL_CODE}`,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'worry-peace',
      title: 'Peace of Mind',
      subtitle: "Worry less, live more",
      message: `😰 पहले मुझे हमेशा चिंता रहती थी कि मेरी health कैसी है, कितनी body fat है, क्या खाना चाहिए...

✨ FitXGen ने सब कुछ clear कर दिया! Scientific analysis के साथ proper guidance मिल गई।

🙏 अब मैं tension-free हूँ क्योंकि मुझे पता है कि मैं सही direction में जा रहा हूँ।

💚 आप भी इस peace of mind experience करें। Trust me, it's worth it!

My code: {REFERRAL_CODE} ❤️`,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'time-value',
      title: 'Time is Precious',
      subtitle: 'Start your journey today',
      message: `⏰ Time waste नहीं करते रहिये अपनी health के साथ!

🔬 FitXGen देता है scientific results सिर्फ कुछ measurements के साथ।

👨‍⚕️ कोई doctor के पास जाने की जरूरत नहीं - घर बैठे complete health analysis!

⚡ तुरंत शुरू करें अपनी health journey:

Code: {REFERRAL_CODE}
Link: fitxgen.com

📱 Download करें और healthy life की शुरुआत करें!`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'social-proof',
      title: 'Join the Community',
      subtitle: 'Thousands trust FitXGen',
      message: `🌟 हजारों लोग already FitXGen use कर रहे हैं अपनी health track करने के लिए!

📈 Scientific method से body fat percentage calculate करके सही diet और exercise plan मिलता है।

👥 मैं भी इस healthy community का part हूँ और आप भी बनिये!

💝 Special offer मेरे friends के लिए - use करें मेरा code और start करें अपनी health journey:

{REFERRAL_CODE}

Join the movement! 🚀`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'success-story',
      title: 'My Success Story',
      subtitle: 'Real results, real transformation',
      message: `🎉 Amazing results मिले हैं FitXGen से! 

📊 Body fat analysis के बाद मुझे पता चला कि मैं actually कहाँ था और क्या करना चाहिए।

💪 Proper guidance follow करके में already better feel कर रहा हूँ।

🏆 आप भी यह transformation experience कर सकते हैं!

Special discount के लिए use करें:
Code: {REFERRAL_CODE}

Trust me, यह investment है आपकी health में! 💯`,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchReferralData()
      // Set default trigger
      setSelectedTrigger(emotionalTriggers[0])
    }
  }, [status, router])

  useEffect(() => {
    if (selectedTrigger && referralData) {
      const message = selectedTrigger.message.replace(/{REFERRAL_CODE}/g, referralData.code)
      setShareMessage(message)
    }
  }, [selectedTrigger, referralData])

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals/data')
      if (response.ok) {
        const data = await response.json()
        setReferralData(data.referralData)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(shareMessage)
    const url = `https://wa.me/?text=${message}`
    window.open(url, '_blank')
  }

  const shareViaSMS = () => {
    const message = encodeURIComponent(shareMessage)
    const url = `sms:?body=${message}`
    window.location.href = url
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent('FitXGen - Transform Your Health Journey')
    const body = encodeURIComponent(shareMessage)
    const url = `mailto:?subject=${subject}&body=${body}`
    window.location.href = url
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your referral center...</p>
        </div>
      </div>
    )
  }

  if (!session || !referralData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Refer & Earn</h1>
              <p className="text-sm text-slate-600">Share health, earn rewards</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">₹{referralData.totalEarnings}</div>
              <p className="text-sm text-slate-600">Total Earnings</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{referralData.totalReferred}</div>
              <p className="text-sm text-slate-600">People Referred</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">₹{referralData.pendingEarnings}</div>
              <p className="text-sm text-slate-600">Pending</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{referralData.activeReferrals}</div>
              <p className="text-sm text-slate-600">Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Emotional Triggers */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Choose Your Message Style
              </CardTitle>
              <CardDescription>
                Select an approach that resonates with your loved ones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emotionalTriggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    onClick={() => setSelectedTrigger(trigger)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTrigger?.id === trigger.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${trigger.bgColor} rounded-full flex items-center justify-center`}>
                        <trigger.icon className={`w-5 h-5 ${trigger.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{trigger.title}</h3>
                        <p className="text-sm text-slate-600">{trigger.subtitle}</p>
                      </div>
                      {selectedTrigger?.id === trigger.id && (
                        <div className="ml-auto">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share Section */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-emerald-500" />
                Share & Earn
              </CardTitle>
              <CardDescription>
                Your referral code: <span className="font-mono font-bold text-emerald-600">{referralData.code}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Referral Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Referral Code
                </label>
                <div className="flex">
                  <Input
                    value={referralData.code}
                    readOnly
                    className="font-mono text-lg font-bold text-center"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(referralData.code)}
                    className="ml-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Message Preview */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message Preview
                </label>
                <div className="bg-slate-50 p-4 rounded-lg border max-h-40 overflow-y-auto text-sm">
                  {shareMessage.split('\n').map((line, index) => (
                    <p key={index} className="mb-2 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={shareViaWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={shareViaSMS}
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  SMS
                </Button>
                <Button
                  onClick={shareViaEmail}
                  variant="outline"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  onClick={() => copyToClipboard(shareMessage)}
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        {referralData.recentReferrals.length > 0 && (
          <Card className="shadow-xl mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Recent Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referralData.recentReferrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {referral.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{referral.name}</p>
                        <p className="text-sm text-slate-600">
                          Joined {new Date(referral.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">₹{referral.earnings}</p>
                      <p className={`text-xs ${
                        referral.status === 'active' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {referral.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
              How Referral Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Share Your Code</h3>
                <p className="text-sm text-slate-600">
                  Share your unique referral code with friends and family through WhatsApp, SMS, or any platform
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">They Join FitXGen</h3>
                <p className="text-sm text-slate-600">
                  When someone uses your code to purchase FitXGen, they get started on their health journey
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IndianRupee className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">You Earn Rewards</h3>
                <p className="text-sm text-slate-600">
                  Get ₹20 for each successful referral. Help more people, earn more rewards!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
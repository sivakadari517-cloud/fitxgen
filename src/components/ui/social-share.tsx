'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Share2, 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Linkedin,
  Send,
  Mail,
  Copy,
  CheckCircle,
  Users,
  Smartphone,
  Globe
} from 'lucide-react'
import { SocialSharing, ShareData, ShareOptions, ShareUtils, SharingTemplates } from '@/lib/social-sharing'

interface SocialShareProps {
  type: 'health-achievement' | 'referral' | 'app-recommendation' | 'progress' | 'family-health' | 'custom'
  data?: {
    // Health achievement data
    bodyFat?: number
    category?: string
    name?: string
    
    // Progress data
    oldBodyFat?: number
    newBodyFat?: number
    weeks?: number
    
    // Referral data
    referralCode?: string
    
    // Family data
    familySize?: number
    
    // Custom data
    customShareData?: ShareData
  }
  title?: string
  description?: string
  showPreview?: boolean
  compact?: boolean
}

export function SocialShare({ 
  type, 
  data = {}, 
  title = "Share Your Success", 
  description = "Spread the word about your health journey",
  showPreview = true,
  compact = false
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [shareData, setShareData] = useState<ShareData | null>(null)

  // Generate share data based on type
  const getShareData = (): ShareData => {
    switch (type) {
      case 'health-achievement':
        return SharingTemplates.healthAchievement(
          data.bodyFat || 0, 
          data.category || 'Unknown', 
          data.name || 'A FitXGen user'
        )
      case 'referral':
        return SharingTemplates.referralInvite(
          data.referralCode || '', 
          data.name || 'Your friend'
        )
      case 'app-recommendation':
        return SharingTemplates.appRecommendation()
      case 'progress':
        return SharingTemplates.progressUpdate(
          data.oldBodyFat || 0,
          data.newBodyFat || 0,
          data.weeks || 0,
          data.name || 'A FitXGen user'
        )
      case 'family-health':
        return SharingTemplates.familyHealth(data.familySize || 1)
      case 'custom':
        return data.customShareData || SharingTemplates.appRecommendation()
      default:
        return SharingTemplates.appRecommendation()
    }
  }

  const handleShare = (platform: ShareOptions['platform']) => {
    const shareDataToUse = getShareData()
    
    // Add referral link for certain types
    if (type === 'referral' && data.referralCode) {
      shareDataToUse.url = ShareUtils.generateReferralLink(data.referralCode)
    }
    
    SocialSharing.share({
      platform,
      data: shareDataToUse
    })
  }

  const handleCopy = async () => {
    const shareDataToUse = getShareData()
    const success = await SocialSharing.copyToClipboard(shareDataToUse)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    const shareDataToUse = getShareData()
    const success = await SocialSharing.shareNative(shareDataToUse)
    if (!success) {
      // Fallback to WhatsApp for mobile users
      handleShare('whatsapp')
    }
  }

  const platforms = ShareUtils.getRecommendedPlatforms()

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleNativeShare}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleShare('whatsapp')}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCopy}
        >
          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    )
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-emerald-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preview */}
        {showPreview && (
          <div className="p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-medium text-slate-900 mb-2">Preview:</h4>
            <div className="text-sm text-slate-700 whitespace-pre-line">
              {getShareData().text.substring(0, 200)}
              {getShareData().text.length > 200 && '...'}
            </div>
          </div>
        )}

        {/* Quick Share Options */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Quick Share</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Native Share (if supported) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button 
                onClick={handleNativeShare}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            
            {/* Copy Link */}
            <Button 
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              className={copied ? "bg-green-500 text-white" : ""}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Platform-specific sharing */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Share on Platform</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* WhatsApp - Most important for Indian market */}
            <Button 
              onClick={() => handleShare('whatsapp')}
              variant="outline"
              className="justify-start hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
              WhatsApp
            </Button>

            {/* Telegram */}
            <Button 
              onClick={() => handleShare('telegram')}
              variant="outline"
              className="justify-start hover:bg-blue-50"
            >
              <Send className="w-4 h-4 mr-2 text-blue-600" />
              Telegram
            </Button>

            {/* Twitter */}
            <Button 
              onClick={() => handleShare('twitter')}
              variant="outline"
              className="justify-start hover:bg-blue-50"
            >
              <Twitter className="w-4 h-4 mr-2 text-blue-500" />
              Twitter
            </Button>

            {/* Facebook */}
            <Button 
              onClick={() => handleShare('facebook')}
              variant="outline"
              className="justify-start hover:bg-blue-50"
            >
              <Facebook className="w-4 h-4 mr-2 text-blue-700" />
              Facebook
            </Button>

            {/* LinkedIn */}
            <Button 
              onClick={() => handleShare('linkedin')}
              variant="outline"
              className="justify-start hover:bg-blue-50"
            >
              <Linkedin className="w-4 h-4 mr-2 text-blue-800" />
              LinkedIn
            </Button>

            {/* Email */}
            <Button 
              onClick={() => handleShare('email')}
              variant="outline"
              className="justify-start hover:bg-slate-50"
            >
              <Mail className="w-4 h-4 mr-2 text-slate-600" />
              Email
            </Button>

            {/* SMS - Mobile only */}
            {ShareUtils.isPlatformAvailable('sms') && (
              <Button 
                onClick={() => handleShare('sms')}
                variant="outline"
                className="justify-start hover:bg-green-50 col-span-2"
              >
                <Smartphone className="w-4 h-4 mr-2 text-green-600" />
                Send SMS
              </Button>
            )}
          </div>
        </div>

        {/* Sharing Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Users className="w-4 h-4 text-blue-600 mt-1" />
            <div className="text-sm text-blue-800">
              <strong>Tip:</strong> Sharing with family and friends helps them discover FitXGen and 
              you earn rewards through our referral program!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Specific sharing components for common use cases
export function HealthAchievementShare({ 
  bodyFat, 
  category, 
  name,
  compact = false 
}: { 
  bodyFat: number
  category: string
  name: string
  compact?: boolean 
}) {
  return (
    <SocialShare
      type="health-achievement"
      data={{ bodyFat, category, name }}
      title="🎉 Share Your Health Achievement"
      description="Celebrate your progress and inspire others!"
      compact={compact}
    />
  )
}

export function ReferralShare({ 
  referralCode, 
  name,
  compact = false 
}: { 
  referralCode: string
  name: string
  compact?: boolean 
}) {
  return (
    <SocialShare
      type="referral"
      data={{ referralCode, name }}
      title="💰 Invite Friends & Earn Rewards"
      description="Share your referral code with family and friends"
      compact={compact}
    />
  )
}

export function ProgressShare({ 
  oldBodyFat, 
  newBodyFat, 
  weeks, 
  name,
  compact = false 
}: { 
  oldBodyFat: number
  newBodyFat: number
  weeks: number
  name: string
  compact?: boolean 
}) {
  return (
    <SocialShare
      type="progress"
      data={{ oldBodyFat, newBodyFat, weeks, name }}
      title="📈 Share Your Progress"
      description="Show the world your health transformation!"
      compact={compact}
    />
  )
}

export function AppRecommendationShare({ compact = false }: { compact?: boolean }) {
  return (
    <SocialShare
      type="app-recommendation"
      title="🚀 Recommend FitXGen"
      description="Help others discover scientific health tracking"
      compact={compact}
    />
  )
}
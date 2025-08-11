// Social sharing utilities for FitXGen
export interface ShareData {
  title: string
  text: string
  url?: string
  hashtags?: string[]
  via?: string
}

export interface ShareOptions {
  platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'telegram' | 'sms' | 'email'
  data: ShareData
}

export class SocialSharing {
  private static baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fitxgen.com'

  // WhatsApp sharing (most important for Indian market)
  static shareViaWhatsApp(data: ShareData): void {
    const message = this.formatMessage(data)
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    this.openShareWindow(url)
  }

  // Twitter sharing
  static shareViaTwitter(data: ShareData): void {
    const params = new URLSearchParams({
      text: data.text,
      url: data.url || this.baseUrl,
      hashtags: data.hashtags?.join(',') || '',
      via: data.via || 'FitXGenApp'
    })
    const url = `https://twitter.com/intent/tweet?${params.toString()}`
    this.openShareWindow(url)
  }

  // Facebook sharing
  static shareViaFacebook(data: ShareData): void {
    const params = new URLSearchParams({
      u: data.url || this.baseUrl,
      quote: data.text
    })
    const url = `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
    this.openShareWindow(url)
  }

  // LinkedIn sharing
  static shareViaLinkedIn(data: ShareData): void {
    const params = new URLSearchParams({
      url: data.url || this.baseUrl,
      title: data.title,
      summary: data.text
    })
    const url = `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
    this.openShareWindow(url)
  }

  // Telegram sharing
  static shareViaTelegram(data: ShareData): void {
    const message = this.formatMessage(data)
    const params = new URLSearchParams({
      url: data.url || this.baseUrl,
      text: message
    })
    const url = `https://t.me/share/url?${params.toString()}`
    this.openShareWindow(url)
  }

  // SMS sharing
  static shareViaSMS(data: ShareData): void {
    const message = this.formatMessage(data)
    const url = `sms:?body=${encodeURIComponent(message)}`
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  // Email sharing
  static shareViaEmail(data: ShareData): void {
    const params = new URLSearchParams({
      subject: data.title,
      body: this.formatMessage(data)
    })
    const url = `mailto:?${params.toString()}`
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }

  // Copy to clipboard
  static async copyToClipboard(data: ShareData): Promise<boolean> {
    try {
      const message = this.formatMessage(data)
      await navigator.clipboard.writeText(message)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  // Native Web Share API (if supported)
  static async shareNative(data: ShareData): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.share) {
      return false
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url || this.baseUrl
      })
      return true
    } catch (error) {
      console.error('Native sharing failed:', error)
      return false
    }
  }

  // Generic share method
  static share(options: ShareOptions): void {
    switch (options.platform) {
      case 'whatsapp':
        this.shareViaWhatsApp(options.data)
        break
      case 'twitter':
        this.shareViaTwitter(options.data)
        break
      case 'facebook':
        this.shareViaFacebook(options.data)
        break
      case 'linkedin':
        this.shareViaLinkedIn(options.data)
        break
      case 'telegram':
        this.shareViaTelegram(options.data)
        break
      case 'sms':
        this.shareViaSMS(options.data)
        break
      case 'email':
        this.shareViaEmail(options.data)
        break
      default:
        console.error('Unsupported platform:', options.platform)
    }
  }

  // Helper methods
  private static formatMessage(data: ShareData): string {
    const parts = [data.title, data.text]
    if (data.url) {
      parts.push(data.url)
    }
    if (data.hashtags?.length) {
      parts.push(data.hashtags.map(tag => `#${tag}`).join(' '))
    }
    return parts.filter(Boolean).join('\n\n')
  }

  private static openShareWindow(url: string): void {
    if (typeof window === 'undefined') return
    
    const width = 600
    const height = 400
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    window.open(
      url,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1`
    )
  }
}

// Predefined sharing templates for FitXGen
export const SharingTemplates = {
  // Health achievement sharing
  healthAchievement: (bodyFat: number, category: string, name: string): ShareData => ({
    title: '🎉 Health Journey Milestone!',
    text: `${name} achieved ${bodyFat}% body fat (${category} category) using FitXGen's scientific analysis! 💪

🔬 99.7% accurate body fat calculation
🤖 AI-powered health recommendations
👨‍👩‍👧‍👦 Family health tracking
💰 Just ₹99 for complete health insights

Transform your health journey today!`,
    hashtags: ['FitXGen', 'HealthGoals', 'BodyFat', 'FitnessJourney', 'HealthTech', 'IndiaFitness'],
    via: 'FitXGenApp'
  }),

  // Referral sharing
  referralInvite: (referralCode: string, name: string): ShareData => ({
    title: '💚 Join My Health Journey!',
    text: `Hi! I'm using FitXGen to track my family's health and it's amazing! 

✅ Scientific body fat analysis (99.7% accurate)
🤖 AI health assistant "Arogya" 
👥 Track entire family's health
📊 Personalized diet & exercise plans

Use my code ${referralCode} and we both benefit! Only ₹99 for complete health transformation.

- ${name}`,
    hashtags: ['FitXGen', 'HealthFamily', 'ReferralReward'],
    via: 'FitXGenApp'
  }),

  // App recommendation
  appRecommendation: (): ShareData => ({
    title: '🚀 FitXGen - India\'s #1 Health App',
    text: `Discover FitXGen - the most accurate body fat analysis app designed for Indian families!

🎯 99.7% accurate scientific calculations
🤖 24/7 AI health assistant
👨‍👩‍👧‍👦 Track your entire family
🍛 Indian diet recommendations
💪 Home workout plans
💰 Just ₹99 - affordable for everyone

Join thousands of Indian families on their health journey!`,
    hashtags: ['FitXGen', 'IndiaHealth', 'BodyFat', 'FamilyHealth', 'AIHealth'],
    via: 'FitXGenApp'
  }),

  // Progress sharing
  progressUpdate: (oldBF: number, newBF: number, weeks: number, name: string): ShareData => ({
    title: '📈 Amazing Progress Update!',
    text: `${name}'s health transformation with FitXGen:

Before: ${oldBF}% body fat
After: ${newBF}% body fat
Time: ${weeks} weeks
Improvement: ${(oldBF - newBF).toFixed(1)}% reduction! 🎉

With FitXGen's scientific tracking and AI guidance, consistent progress is possible!

#HealthTransformation #FitXGenResults`,
    hashtags: ['FitXGen', 'ProgressUpdate', 'HealthResults', 'Transformation'],
    via: 'FitXGenApp'
  }),

  // Family health sharing
  familyHealth: (familySize: number): ShareData => ({
    title: '👨‍👩‍👧‍👦 Our Family Health Journey',
    text: `Managing health for our family of ${familySize} is now so easy with FitXGen! 

✅ Individual health profiles for everyone
📊 Scientific body fat tracking
🤖 Personalized AI recommendations
💡 Indian diet & exercise plans
📱 All in one app for just ₹99

Every family deserves better health insights! 💚`,
    hashtags: ['FamilyHealth', 'FitXGen', 'HealthyFamily', 'IndiaHealth'],
    via: 'FitXGenApp'
  })
}

// Utility functions for specific use cases
export const ShareUtils = {
  // Generate shareable result image URL (for future implementation)
  generateResultImageUrl: (userId: string, resultId: string): string => {
    return `${SocialSharing['baseUrl']}/api/share/image/${userId}/${resultId}`
  },

  // Generate referral link
  generateReferralLink: (referralCode: string): string => {
    return `${SocialSharing['baseUrl']}/?ref=${referralCode}`
  },

  // Check if platform is available
  isPlatformAvailable: (platform: ShareOptions['platform']): boolean => {
    if (typeof window === 'undefined') return false

    switch (platform) {
      case 'whatsapp':
        return /Android|iPhone/i.test(navigator.userAgent)
      case 'sms':
        return /Android|iPhone/i.test(navigator.userAgent)
      default:
        return true
    }
  },

  // Get recommended platforms for Indian users
  getRecommendedPlatforms: (): ShareOptions['platform'][] => {
    const isMobile = typeof window !== 'undefined' && /Android|iPhone/i.test(navigator.userAgent)
    
    if (isMobile) {
      return ['whatsapp', 'telegram', 'twitter', 'facebook', 'sms']
    } else {
      return ['whatsapp', 'twitter', 'facebook', 'linkedin', 'email']
    }
  }
}
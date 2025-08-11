# FitXGen Analytics & Conversion Tracking Guide

This document outlines the comprehensive analytics and conversion tracking implementation for FitXGen.

## 🎯 Overview

FitXGen implements a multi-layered analytics system that tracks:
- **User behavior** and engagement patterns
- **Conversion events** across the entire funnel
- **Performance metrics** and app health
- **Business KPIs** and revenue tracking
- **A/B testing** and experiments

## 🔧 Architecture

### Core Components

1. **Analytics Manager** (`src/lib/analytics.ts`)
   - Google Tag Manager integration
   - Facebook Pixel tracking
   - Internal analytics API
   - User journey tracking
   - Conversion funnel analysis

2. **Analytics API** (`src/app/api/analytics/events/route.ts`)
   - Event collection and storage
   - Real-time processing
   - Aggregation and reporting
   - Rate limiting and validation

3. **React Hooks** (`src/hooks/useAnalytics.ts`)
   - `useAnalytics()` - Basic event tracking
   - `useConversionTracking()` - Conversion events
   - `usePerformanceTracking()` - Performance measurement
   - `useBehaviorTracking()` - User behavior analysis
   - `useErrorTracking()` - Error monitoring

4. **Analytics Dashboard** (`src/components/analytics/AnalyticsDashboard.tsx`)
   - Real-time metrics visualization
   - Conversion funnel analysis
   - User journey insights
   - Performance monitoring

## 🚀 Quick Start

### 1. Environment Setup

Add the following variables to your `.env.local`:

```bash
# Google Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GA_CONVERSION_ID=AW-XXXXXXXXX/XXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1234567890123456

# Internal Analytics
ADMIN_API_KEY=your-admin-api-key-for-analytics
GOOGLE_VERIFICATION=your-google-site-verification-code
```

### 2. Basic Usage

```typescript
import { useAnalytics, useConversionTracking } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackEvent, trackButtonClick } = useAnalytics()
  const { trackPayment } = useConversionTracking()

  const handleButtonClick = () => {
    trackButtonClick('cta_button', 'hero_section')
  }

  const handlePaymentSuccess = (transactionId: string, amount: number) => {
    trackPayment(transactionId, amount)
  }

  return (
    <button onClick={handleButtonClick}>
      Get Started
    </button>
  )
}
```

## 📊 Analytics Events

### Event Structure

```typescript
interface AnalyticsEvent {
  action: string          // What happened
  category: string        // Event category
  label?: string         // Additional context
  value?: number         // Numeric value
  metadata?: object      // Custom data
}
```

### Core Events

#### 1. Page Views
```typescript
// Automatically tracked on route changes
trackPageView('/dashboard')
```

#### 2. User Interactions
```typescript
trackButtonClick('signup_button', 'header')
trackFormSubmission('registration', true)
trackFeatureUsage('body_fat_calculator', 'calculate', 99.7)
```

#### 3. Conversions
```typescript
trackRegistration('email', userId)
trackPayment(transactionId, 99, 'INR')
trackCalculation(99.7, 'navy')
trackReferral(referrerUserId, newUserId)
```

#### 4. Performance
```typescript
trackTiming('api_response', 'user_profile', 245)
measureAsync(async () => {
  return await fetchUserData()
}, 'fetch_user_data')
```

## 🎯 Conversion Tracking

### Conversion Types

1. **Registration** - User signs up
2. **Payment** - Premium subscription purchase
3. **Calculation** - Body fat percentage calculation
4. **Referral** - Successful referral conversion
5. **Engagement** - Key engagement milestones

### Implementation

```typescript
// Track registration conversion
const { trackRegistration } = useConversionTracking()
trackRegistration('email') // or 'google', 'phone'

// Track payment conversion
const { trackPayment } = useConversionTracking()
trackPayment('txn_123456789', 99, 'INR')

// Track calculation conversion
const { trackCalculation } = useConversionTracking()
trackCalculation(15.2, 'navy')
```

## 📈 Performance Tracking

### Core Web Vitals

Automatically tracked:
- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **First Input Delay (FID)**
- **Cumulative Layout Shift (CLS)**
- **Time to Interactive (TTI)**

### Custom Performance Metrics

```typescript
const { measureAsync, measureSync } = usePerformanceTracking()

// Measure async operations
const userData = await measureAsync(
  () => fetchUserProfile(),
  'fetch_profile'
)

// Measure sync operations  
const result = measureSync(
  () => calculateBodyFat(measurements),
  'body_fat_calculation'
)
```

## 🧪 A/B Testing

### Setup Experiments

```typescript
const { getVariant, trackExperimentConversion } = useExperiments()

function PricingSection() {
  const priceVariant = getVariant('pricing_test', ['99', '149', '199'])
  
  return (
    <div>
      <h2>Premium Plan - ₹{priceVariant}</h2>
      <button onClick={() => {
        trackExperimentConversion('pricing_test', 'click_purchase')
      }}>
        Buy Now
      </button>
    </div>
  )
}
```

## 🔍 Error Tracking

### Automatic Error Tracking

```typescript
const { trackError, trackApiError } = useErrorTracking()

// Automatically tracks:
// - JavaScript errors
// - Unhandled promise rejections
// - API failures
// - Form validation errors
```

### Manual Error Tracking

```typescript
try {
  await riskyOperation()
} catch (error) {
  trackError(error, 'manual_operation')
}
```

## 👥 User Behavior Analytics

### Engagement Tracking

```typescript
const { trackClick, trackFormInteraction } = useBehaviorTracking()

// Automatically tracks:
// - Scroll depth (25%, 50%, 75%, 100%)
// - Time on page
// - Click heatmaps (when enabled)
// - Form interactions
```

## 📊 Analytics Dashboard

### Admin Dashboard

Access comprehensive analytics at `/admin/analytics`:
- Real-time user activity
- Conversion funnel analysis
- Revenue tracking
- Performance metrics
- User journey insights

### User Dashboard

Personal analytics for users:
- Individual usage patterns
- Goal tracking
- Achievement milestones
- Progress insights

## 🔐 Privacy & Compliance

### Data Collection

- **Anonymized by default** - No PII in analytics events
- **Consent-based** - Respects user privacy preferences
- **GDPR compliant** - Data retention and deletion policies
- **Secure transmission** - All data encrypted in transit

### Data Retention

- **Analytics events**: 90 days automatic cleanup
- **Performance data**: 30 days retention
- **Conversion data**: Retained for business analysis
- **User journey**: Anonymized after 30 days

## 🛠️ Advanced Configuration

### Custom Event Tracking

```typescript
// Track custom business events
analytics.trackEvent({
  action: 'ai_recommendation_generated',
  category: 'ai_features',
  label: 'nutrition_plan',
  value: 1,
  metadata: {
    recommendationType: 'nutrition',
    userGoal: 'weight_loss',
    accuracy: 95.5
  }
})
```

### Funnel Analysis

```typescript
// Define conversion funnels
const funnelSteps = [
  'landing_page_view',
  'signup_started',
  'signup_completed',
  'onboarding_completed',
  'first_calculation',
  'payment_initiated',
  'payment_completed'
]

// Track funnel progression
trackEvent({
  action: 'funnel_step',
  category: 'conversion',
  label: 'signup_completed',
  metadata: { funnelStep: 3, totalSteps: 7 }
})
```

### Real-time Alerts

Configure alerts for critical events:
- Payment failures
- High error rates
- Performance degradation
- Unusual user behavior

## 📚 Best Practices

### 1. Event Naming

Use consistent naming conventions:
```typescript
// Good
trackEvent({ action: 'button_click', category: 'navigation', label: 'header_cta' })

// Avoid
trackEvent({ action: 'click', category: 'button', label: 'CTA' })
```

### 2. Performance

- **Batch events** for high-frequency tracking
- **Use throttling** for scroll/resize events  
- **Minimize payload** size
- **Track essential metrics** only

### 3. Privacy

- **No PII** in event data
- **Anonymize user IDs** when possible
- **Respect opt-out** preferences
- **Document data usage** clearly

### 4. Testing

```typescript
// Mock analytics in tests
jest.mock('@/lib/analytics', () => ({
  analytics: {
    trackEvent: jest.fn(),
    trackConversion: jest.fn()
  }
}))
```

## 🔧 Troubleshooting

### Common Issues

1. **Events not appearing**
   - Check environment variables
   - Verify network requests
   - Check rate limiting

2. **Missing conversions**
   - Ensure user ID is set
   - Verify conversion triggers
   - Check attribution windows

3. **Performance impact**
   - Monitor bundle size
   - Use code splitting
   - Optimize event frequency

### Debug Mode

Enable debug logging in development:
```typescript
// Shows analytics events in console
localStorage.setItem('analytics_debug', 'true')
```

## 📞 Support

For analytics-related questions:
1. Check this documentation
2. Review implementation examples
3. Monitor browser console for errors
4. Contact the development team

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: FitXGen Development Team
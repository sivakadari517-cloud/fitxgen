# FitXGen Testing Guide

This document outlines the comprehensive testing strategy, test suites, and quality assurance procedures for FitXGen.

**Last Updated**: January 2024  
**Testing Version**: 1.0  
**Coverage Target**: 90%+

---

## 🧪 Testing Strategy

### Testing Pyramid

```
         /\
        /  \    E2E Tests
       /____\   (10% - Critical User Flows)
      /      \
     /        \  Integration Tests  
    /__________\ (20% - API & Component Integration)
   /            \
  /              \ Unit Tests
 /________________\ (70% - Functions, Utilities, Components)
```

### Testing Principles

1. **Test-Driven Development (TDD)** - Write tests before implementation
2. **Behavior-Driven Development (BDD)** - Test user scenarios and outcomes
3. **Continuous Testing** - Automated tests in CI/CD pipeline
4. **Risk-Based Testing** - Prioritize critical user journeys
5. **Performance-First** - Test performance alongside functionality

---

## 🎯 Test Coverage Areas

### 1. Functionality Testing

#### Core Features
- ✅ **Body Fat Calculation** - Accuracy and edge cases
- ✅ **User Authentication** - Sign-up, sign-in, session management
- ✅ **Payment Processing** - Razorpay integration and error handling
- ✅ **AI Chat Interface** - Claude API integration and responses
- ✅ **Data Management** - CRUD operations and data integrity
- ✅ **Referral System** - Link generation and tracking

#### User Interface
- ✅ **Component Rendering** - All UI components and states
- ✅ **User Interactions** - Buttons, forms, navigation
- ✅ **Responsive Design** - Mobile, tablet, desktop layouts
- ✅ **Accessibility** - WCAG 2.1 AA compliance
- ✅ **Cross-Browser** - Chrome, Firefox, Safari, Edge

### 2. Performance Testing

#### Core Web Vitals
- **First Contentful Paint (FCP)** - Target: < 1.8s
- **Largest Contentful Paint (LCP)** - Target: < 2.5s
- **First Input Delay (FID)** - Target: < 100ms
- **Cumulative Layout Shift (CLS)** - Target: < 0.1
- **Time to Interactive (TTI)** - Target: < 3.8s

#### Load Testing
- **Concurrent Users** - 1000+ simultaneous users
- **API Response Times** - < 200ms for most endpoints
- **Database Performance** - Query optimization and indexing
- **CDN Performance** - Asset delivery and caching

### 3. Mobile Testing

#### Device Testing Matrix
```
┌─────────────────┬──────────────┬──────────────┬──────────────┐
│ Device Category │ Screen Size  │ Primary Test │ Secondary    │
├─────────────────┼──────────────┼──────────────┼──────────────┤
│ Mobile          │ 375x667      │ iPhone 12    │ Pixel 5      │
│ Large Mobile    │ 414x896      │ iPhone 12 Pro│ Galaxy S21   │
│ Tablet          │ 768x1024     │ iPad         │ Galaxy Tab   │
│ Desktop         │ 1920x1080    │ Chrome       │ Safari       │
└─────────────────┴──────────────┴──────────────┴──────────────┘
```

#### Mobile-Specific Tests
- **Touch Interactions** - Tap, swipe, pinch gestures
- **Orientation Changes** - Portrait/landscape transitions
- **Network Conditions** - 3G, 4G, WiFi, offline
- **Battery Usage** - Power consumption optimization
- **App Install** - PWA installation and behavior

### 4. Security Testing

#### Authentication & Authorization
- **SQL/NoSQL Injection** - Input sanitization tests
- **XSS Prevention** - Cross-site scripting attack simulation
- **CSRF Protection** - Cross-site request forgery tests
- **Session Security** - Token validation and expiration
- **Rate Limiting** - DDoS and brute force protection

#### Data Protection
- **GDPR Compliance** - Data handling and user rights
- **Encryption Testing** - Data at rest and in transit
- **Privacy Controls** - Consent management validation
- **API Security** - Authentication and authorization

---

## 🔧 Testing Tools & Frameworks

### Frontend Testing Stack

```json
{
  "testing": {
    "unit": "Jest + React Testing Library",
    "integration": "Jest + MSW (Mock Service Worker)",
    "e2e": "Playwright",
    "visual": "Chromatic + Storybook",
    "accessibility": "axe-core + jest-axe",
    "performance": "Lighthouse CI"
  }
}
```

### Backend Testing Stack

```json
{
  "api_testing": {
    "unit": "Jest + Supertest",
    "integration": "Jest + Test Database",
    "load": "Artillery.io",
    "security": "OWASP ZAP",
    "monitoring": "DataDog + Sentry"
  }
}
```

---

## 🧩 Unit Testing

### Test File Structure

```
src/
├── __tests__/
│   ├── components/          # Component tests
│   ├── lib/                # Utility function tests
│   ├── hooks/              # Custom hook tests
│   └── pages/              # Page component tests
├── __mocks__/              # Mock implementations
└── test-utils/             # Testing utilities
```

### Example Unit Tests

#### Body Fat Calculator Tests
```javascript
// src/lib/__tests__/body-fat-calculator.test.ts
import { calculateBodyFat, validateMeasurements } from '../body-fat-calculator'

describe('Body Fat Calculator', () => {
  describe('calculateBodyFat', () => {
    it('calculates accurate body fat for male Navy method', () => {
      const measurements = {
        age: 30,
        height: 180,
        weight: 80,
        neck: 40,
        waist: 85,
        gender: 'male'
      }
      
      const result = calculateBodyFat(measurements, 'navy')
      
      expect(result.percentage).toBeCloseTo(15.2, 1)
      expect(result.accuracy).toBeGreaterThan(99.5)
      expect(result.category).toBe('Athletic')
    })
    
    it('handles edge cases and invalid inputs', () => {
      const invalidMeasurements = {
        age: -5,
        height: 0,
        weight: -10,
        neck: 100,
        waist: 200,
        gender: 'male'
      }
      
      expect(() => calculateBodyFat(invalidMeasurements, 'navy'))
        .toThrow('Invalid measurements provided')
    })
  })
  
  describe('validateMeasurements', () => {
    it('validates measurement ranges correctly', () => {
      const valid = validateMeasurements({
        age: 25,
        height: 170,
        weight: 70,
        neck: 35,
        waist: 80,
        gender: 'female'
      })
      
      expect(valid.isValid).toBe(true)
      expect(valid.errors).toHaveLength(0)
    })
  })
})
```

#### API Route Tests
```javascript
// src/app/api/__tests__/calculate.test.ts
import { POST } from '../calculate/route'
import { NextRequest } from 'next/server'

describe('/api/calculate', () => {
  it('returns body fat calculation for valid input', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify({
        measurements: {
          age: 30,
          height: 175,
          weight: 75,
          neck: 38,
          waist: 82,
          gender: 'male'
        },
        method: 'navy'
      })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.percentage).toBeDefined()
    expect(data.accuracy).toBeGreaterThan(99)
    expect(data.category).toBeDefined()
  })
  
  it('returns 400 for invalid input', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify({
        measurements: { invalid: 'data' }
      })
    })
    
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
```

---

## 🔗 Integration Testing

### Component Integration Tests

```javascript
// src/components/__tests__/CalculatorForm.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import CalculatorForm from '../CalculatorForm'

const server = setupServer(
  rest.post('/api/calculate', (req, res, ctx) => {
    return res(ctx.json({
      percentage: 15.2,
      accuracy: 99.7,
      category: 'Athletic',
      recommendations: []
    }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('CalculatorForm Integration', () => {
  it('submits form and displays results', async () => {
    render(<CalculatorForm />)
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/age/i), {
      target: { value: '30' }
    })
    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '175' }
    })
    fireEvent.change(screen.getByLabelText(/weight/i), {
      target: { value: '75' }
    })
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/15.2%/i)).toBeInTheDocument()
      expect(screen.getByText(/athletic/i)).toBeInTheDocument()
    })
  })
})
```

### API Integration Tests

```javascript
// src/__tests__/api-integration.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '../pages/api/user/profile'
import { createMocks } from 'node-mocks-http'

describe('/api/user/profile integration', () => {
  it('updates user profile successfully', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer valid-token'
          },
          body: JSON.stringify({
            name: 'Updated Name',
            age: 25,
            goals: ['weight_loss']
          })
        })
        
        expect(res.status).toBe(200)
        
        const data = await res.json()
        expect(data.user.name).toBe('Updated Name')
        expect(data.user.age).toBe(25)
      }
    })
  })
})
```

---

## 🎭 End-to-End Testing

### Critical User Journeys

#### User Registration & Onboarding Flow
```javascript
// e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test('complete user registration and onboarding', async ({ page }) => {
    // Navigate to sign up
    await page.goto('/')
    await page.click('text=Get Started')
    
    // Fill registration form
    await page.fill('[data-testid=email-input]', 'test@example.com')
    await page.fill('[data-testid=password-input]', 'SecurePass123!')
    await page.fill('[data-testid=name-input]', 'Test User')
    
    // Submit registration
    await page.click('button:text("Create Account")')
    
    // Wait for onboarding
    await expect(page).toHaveURL(/onboarding/)
    
    // Complete onboarding steps
    await page.selectOption('[data-testid=gender-select]', 'male')
    await page.fill('[data-testid=age-input]', '30')
    await page.fill('[data-testid=height-input]', '175')
    await page.fill('[data-testid=weight-input]', '75')
    
    await page.click('button:text("Continue")')
    
    // Verify dashboard access
    await expect(page).toHaveURL(/dashboard/)
    await expect(page.locator('h1')).toContainText('Welcome, Test User')
  })
  
  test('handles registration errors gracefully', async ({ page }) => {
    await page.goto('/auth/signup')
    
    // Try to submit with existing email
    await page.fill('[data-testid=email-input]', 'existing@example.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('button:text("Create Account")')
    
    // Check error message
    await expect(page.locator('[data-testid=error-message]'))
      .toContainText('Email already exists')
  })
})
```

#### Body Fat Calculation Flow
```javascript
// e2e/body-fat-calculation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Body Fat Calculation', () => {
  test.beforeEach(async ({ page }) => {
    // Log in user
    await page.goto('/auth/signin')
    await page.fill('[data-testid=email-input]', 'test@example.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('button:text("Sign In")')
    await expect(page).toHaveURL(/dashboard/)
  })
  
  test('calculates body fat percentage accurately', async ({ page }) => {
    // Navigate to calculator
    await page.click('text=Calculate Body Fat')
    await expect(page).toHaveURL(/calculate/)
    
    // Fill measurement form
    await page.fill('[data-testid=neck-input]', '38')
    await page.fill('[data-testid=waist-input]', '82')
    
    // Submit calculation
    await page.click('button:text("Calculate")')
    
    // Wait for results
    await page.waitForSelector('[data-testid=result-percentage]')
    
    // Verify results
    const percentage = await page.textContent('[data-testid=result-percentage]')
    const category = await page.textContent('[data-testid=result-category]')
    
    expect(percentage).toMatch(/\d+\.\d%/)
    expect(category).toBeTruthy()
    
    // Check recommendations are displayed
    await expect(page.locator('[data-testid=recommendations]')).toBeVisible()
  })
  
  test('saves calculation to history', async ({ page }) => {
    // Perform calculation (assuming previous test setup)
    await page.goto('/calculate')
    await page.fill('[data-testid=neck-input]', '38')
    await page.fill('[data-testid=waist-input]', '82')
    await page.click('button:text("Calculate")')
    
    // Navigate to history
    await page.click('text=View History')
    
    // Verify calculation appears in history
    await expect(page.locator('[data-testid=calculation-history]').first())
      .toContainText(new Date().toLocaleDateString())
  })
})
```

#### Payment Flow Testing
```javascript
// e2e/payment-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Payment Flow', () => {
  test('completes premium upgrade successfully', async ({ page }) => {
    // Setup authenticated user
    await page.goto('/dashboard')
    // ... authentication setup
    
    // Navigate to upgrade
    await page.click('text=Upgrade to Premium')
    await expect(page).toHaveURL(/payment/)
    
    // Verify pricing display
    await expect(page.locator('[data-testid=price-display]'))
      .toContainText('₹99')
    
    // Click proceed to payment
    await page.click('button:text("Proceed to Payment")')
    
    // Wait for Razorpay modal (in test environment, mock response)
    await page.waitForSelector('[data-testid=payment-modal]')
    
    // Simulate successful payment
    await page.evaluate(() => {
      // Mock Razorpay success callback
      window.razorpayCallback?.({
        razorpay_payment_id: 'pay_test123',
        razorpay_order_id: 'order_test123'
      })
    })
    
    // Verify success page
    await expect(page).toHaveURL(/payment\/success/)
    await expect(page.locator('h1')).toContainText('Payment Successful')
  })
})
```

---

## 📱 Mobile Testing Strategy

### Responsive Design Tests

```javascript
// e2e/mobile-responsive.spec.ts
import { test, expect, devices } from '@playwright/test'

const mobileDevices = [
  devices['iPhone 12'],
  devices['Pixel 5'],
  devices['Galaxy S8']
]

mobileDevices.forEach(device => {
  test.describe(`Mobile Tests - ${device.name}`, () => {
    test.use({ ...device })
    
    test('navigation works on mobile', async ({ page }) => {
      await page.goto('/')
      
      // Test mobile menu
      await page.click('[data-testid=mobile-menu-button]')
      await expect(page.locator('[data-testid=mobile-menu]')).toBeVisible()
      
      // Test navigation links
      await page.click('text=Dashboard')
      await expect(page).toHaveURL(/dashboard/)
    })
    
    test('calculator form is mobile-friendly', async ({ page }) => {
      await page.goto('/calculate')
      
      // Check form layout on mobile
      const form = page.locator('[data-testid=calculator-form]')
      await expect(form).toBeVisible()
      
      // Test input interactions
      await page.tap('[data-testid=age-input]')
      await page.fill('[data-testid=age-input]', '25')
      
      // Test button accessibility
      const calculateBtn = page.locator('button:text("Calculate")')
      await expect(calculateBtn).toBeVisible()
      
      // Verify button is properly sized for touch
      const buttonBox = await calculateBtn.boundingBox()
      expect(buttonBox!.height).toBeGreaterThanOrEqual(44) // iOS minimum touch target
    })
    
    test('handles orientation changes', async ({ page }) => {
      await page.goto('/dashboard')
      
      // Test portrait mode
      const portraitHeight = await page.evaluate(() => window.innerHeight)
      
      // Simulate orientation change
      await page.setViewportSize({ width: 896, height: 414 })
      
      // Verify layout adapts
      await expect(page.locator('[data-testid=dashboard-content]')).toBeVisible()
      
      const landscapeHeight = await page.evaluate(() => window.innerHeight)
      expect(landscapeHeight).toBeLessThan(portraitHeight)
    })
  })
})
```

### Touch Interaction Tests

```javascript
// e2e/touch-interactions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Touch Interactions', () => {
  test.use({ ...devices['iPhone 12'] })
  
  test('swipe gestures work correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Test horizontal swipe on cards
    const card = page.locator('[data-testid=metric-card]').first()
    const cardBox = await card.boundingBox()
    
    await page.touchscreen.tap(cardBox!.x + cardBox!.width / 2, cardBox!.y + cardBox!.height / 2)
    
    // Perform swipe gesture
    await page.touchscreen.tap(cardBox!.x + 50, cardBox!.y + cardBox!.height / 2)
    await page.mouse.move(cardBox!.x + cardBox!.width - 50, cardBox!.y + cardBox!.height / 2)
    
    // Verify swipe response
    await expect(page.locator('[data-testid=card-details]')).toBeVisible()
  })
  
  test('long press interactions', async ({ page }) => {
    await page.goto('/history')
    
    const historyItem = page.locator('[data-testid=history-item]').first()
    
    // Perform long press
    await historyItem.hover()
    await page.mouse.down()
    await page.waitForTimeout(1000) // Long press duration
    await page.mouse.up()
    
    // Verify context menu appears
    await expect(page.locator('[data-testid=context-menu]')).toBeVisible()
  })
})
```

---

## ⚡ Performance Testing

### Core Web Vitals Monitoring

```javascript
// tests/performance/web-vitals.test.js
import { test, expect } from '@playwright/test'

test.describe('Core Web Vitals', () => {
  test('homepage meets performance benchmarks', async ({ page }) => {
    await page.goto('/')
    
    // Measure FCP
    const fcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            resolve(fcpEntry.startTime)
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })
    
    expect(fcp).toBeLessThan(1800) // Target: < 1.8s
    
    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(5000), 5000)
      })
    })
    
    expect(lcp).toBeLessThan(2500) // Target: < 2.5s
  })
  
  test('calculator page performance', async ({ page }) => {
    await page.goto('/calculate')
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0]
            resolve({
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              ttfb: navigation.responseStart - navigation.requestStart
            })
          }, 1000)
        })
      })
    })
    
    expect(metrics.ttfb).toBeLessThan(600) // Time to First Byte < 600ms
    expect(metrics.domContentLoaded).toBeLessThan(1500) // DOM ready < 1.5s
    expect(metrics.loadComplete).toBeLessThan(3000) // Load complete < 3s
  })
})
```

### Load Testing Scenarios

```javascript
// Artillery.io configuration
// artillery-config.yml
config:
  target: 'https://fitxgen.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Normal load"
    - duration: 120
      arrivalRate: 100
      name: "High load"
    - duration: 60
      arrivalRate: 5
      name: "Cool down"
  defaults:
    headers:
      User-Agent: "FitXGen Load Test"

scenarios:
  - name: "Homepage and Calculator"
    weight: 70
    flow:
      - get:
          url: "/"
      - think: 3
      - get:
          url: "/calculate"
      - think: 5
      - post:
          url: "/api/calculate"
          json:
            measurements:
              age: 30
              height: 175
              weight: 75
              neck: 38
              waist: 82
              gender: "male"
            method: "navy"
      - think: 2

  - name: "User Authentication"
    weight: 20
    flow:
      - post:
          url: "/api/auth/signin"
          json:
            email: "test@example.com"
            password: "password123"
      - get:
          url: "/dashboard"

  - name: "Payment Flow"
    weight: 10
    flow:
      - get:
          url: "/payment"
      - post:
          url: "/api/payment/create"
          json:
            amount: 99
            currency: "INR"
```

---

## 🛡️ Security Testing

### Automated Security Tests

```javascript
// tests/security/security.test.js
import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('prevents XSS attacks', async ({ page }) => {
    await page.goto('/feedback')
    
    // Attempt XSS injection
    const maliciousScript = '<script>alert("XSS")</script>'
    await page.fill('[data-testid=feedback-message]', maliciousScript)
    await page.click('button:text("Submit")')
    
    // Verify script is not executed
    page.on('dialog', () => {
      throw new Error('XSS attack successful - this should not happen')
    })
    
    // Check that script is sanitized in display
    await page.waitForTimeout(2000)
    const feedbackDisplay = await page.textContent('[data-testid=feedback-display]')
    expect(feedbackDisplay).not.toContain('<script>')
  })
  
  test('enforces rate limiting', async ({ page, context }) => {
    await page.goto('/api/calculate')
    
    // Make multiple rapid requests
    const requests = []
    for (let i = 0; i < 15; i++) {
      requests.push(
        page.request.post('/api/calculate', {
          data: {
            measurements: { age: 30, height: 175, weight: 75, neck: 38, waist: 82, gender: 'male' },
            method: 'navy'
          }
        })
      )
    }
    
    const responses = await Promise.all(requests)
    
    // At least one request should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })
  
  test('validates authentication on protected routes', async ({ page }) => {
    // Attempt to access protected route without authentication
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/auth\/signin/)
  })
})
```

---

## 📊 Test Reporting & Monitoring

### Test Results Dashboard

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/lib/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-reports',
      filename: 'test-report.html',
      expand: true,
    }],
    ['jest-junit', {
      outputDirectory: './test-reports',
      outputName: 'junit.xml',
    }],
  ],
}
```

### Continuous Integration Tests

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-results
          path: test-results/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

---

## 🎯 Test Execution Plan

### Phase 1: Unit Testing (Week 1)
- [ ] Core utility functions (body fat calculation, validation)
- [ ] React components (isolated testing)
- [ ] Custom hooks
- [ ] API route handlers
- [ ] Authentication logic

### Phase 2: Integration Testing (Week 2)
- [ ] Component integration with APIs
- [ ] Database operations
- [ ] Third-party service integration (Razorpay, Claude)
- [ ] Authentication flows
- [ ] Data flow validation

### Phase 3: End-to-End Testing (Week 3)
- [ ] Critical user journeys
- [ ] Cross-browser compatibility
- [ ] Mobile device testing
- [ ] Performance benchmarking
- [ ] Security validation

### Phase 4: Production Validation (Week 4)
- [ ] Load testing with realistic scenarios
- [ ] Monitoring setup validation
- [ ] Error tracking verification
- [ ] Backup and recovery testing
- [ ] Accessibility compliance audit

---

## 📋 Test Quality Gates

### Pre-Deployment Checklist

#### Functionality
- [ ] All critical paths tested (95%+ pass rate)
- [ ] Edge cases and error scenarios covered
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsive design validated
- [ ] Accessibility compliance (WCAG 2.1 AA)

#### Performance
- [ ] Core Web Vitals meet targets
- [ ] Load times under specified thresholds
- [ ] Database queries optimized
- [ ] CDN and caching working correctly
- [ ] Memory usage within acceptable limits

#### Security
- [ ] No critical or high-severity vulnerabilities
- [ ] Authentication and authorization working
- [ ] Input validation and sanitization tested
- [ ] Rate limiting functioning properly
- [ ] GDPR compliance verified

#### Reliability
- [ ] Error handling comprehensive
- [ ] Monitoring and alerting configured
- [ ] Backup procedures tested
- [ ] Rollback plan verified
- [ ] Documentation updated

---

## 🔍 Quality Metrics

### Key Performance Indicators (KPIs)

```
┌─────────────────────┬──────────────┬──────────────┬──────────────┐
│ Metric              │ Target       │ Current      │ Status       │
├─────────────────────┼──────────────┼──────────────┼──────────────┤
│ Test Coverage       │ 90%          │ TBD          │ 🔄 In Progress│
│ Pass Rate           │ 95%          │ TBD          │ 🔄 In Progress│
│ Bug Discovery Rate  │ < 5/release  │ TBD          │ 🔄 In Progress│
│ Performance Score   │ 90+          │ TBD          │ 🔄 In Progress│
│ Security Score      │ A Grade      │ TBD          │ 🔄 In Progress│
│ Accessibility Score │ 95%          │ TBD          │ 🔄 In Progress│
└─────────────────────┴──────────────┴──────────────┴──────────────┘
```

### Success Criteria

1. **Functional Quality**: 95% of tests pass, all critical features working
2. **Performance**: Core Web Vitals green, < 3s load time on 3G
3. **Security**: No high/critical vulnerabilities, penetration test passed
4. **Reliability**: 99.9% uptime target, < 1% error rate
5. **User Experience**: Accessibility compliant, mobile-optimized

---

## 📞 Support & Resources

### Testing Environment Access
- **Staging**: https://fitxgen-staging.vercel.app
- **Test Database**: MongoDB Atlas test cluster
- **CI/CD**: GitHub Actions workflows
- **Reports**: Test results dashboard

### Documentation
- [Testing Best Practices](./docs/testing-best-practices.md)
- [API Testing Guide](./docs/api-testing.md)
- [Mobile Testing Checklist](./docs/mobile-testing.md)
- [Performance Testing Guide](./docs/performance-testing.md)

**Next Review**: Weekly test review meetings  
**Responsible Team**: QA & Development  
**Status**: Testing framework ready for implementation
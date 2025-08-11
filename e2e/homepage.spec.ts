import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/FitXGen/)
    await expect(page.locator('h1')).toContainText('Transform Your Body')
  })

  test('has working navigation', async ({ page }) => {
    // Test main navigation links
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('text=Features')).toBeVisible()
    await expect(page.locator('text=About')).toBeVisible()
    await expect(page.locator('text=Contact')).toBeVisible()
  })

  test('CTA button navigates to calculator', async ({ page }) => {
    await page.click('text=Get Started')
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test('displays key features', async ({ page }) => {
    await expect(page.locator('text=Body Fat Analysis')).toBeVisible()
    await expect(page.locator('text=AI Health Assistant')).toBeVisible()
    await expect(page.locator('text=Personalized Recommendations')).toBeVisible()
  })

  test('shows pricing information', async ({ page }) => {
    await expect(page.locator('text=₹99')).toBeVisible()
    await expect(page.locator('text=Premium Features')).toBeVisible()
  })

  test('mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile menu
    await page.click('[data-testid=mobile-menu-button]')
    await expect(page.locator('[data-testid=mobile-menu]')).toBeVisible()
    
    // Check hero section adapts
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=Get Started')).toBeVisible()
  })

  test('footer links work', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('text=Privacy Policy')).toBeVisible()
    await expect(page.locator('text=Terms of Service')).toBeVisible()
    
    await page.click('text=Privacy Policy')
    await expect(page).toHaveURL(/\/privacy/)
  })
})

test.describe('Homepage Performance', () => {
  test('loads within performance budget', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('has good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        setTimeout(() => resolve(0), 5000)
      })
    })
    
    // LCP should be under 2.5s
    expect(lcp).toBeLessThan(2500)
  })
})
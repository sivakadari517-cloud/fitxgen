# FitXGen Deployment Guide

This comprehensive guide covers deployment procedures, environment setup, monitoring, and maintenance for the FitXGen application.

**Last Updated**: January 2024  
**Version**: 1.0  
**Environment**: Production Ready

---

## 🚀 Quick Deployment

### Prerequisites

```bash
# Required versions
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.0.0

# Verify installation
node --version
npm --version
git --version
```

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/fitxgen)

---

## 🏗️ Environment Setup

### 1. Production Environment Variables

Create `.env.production` file:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitxgen-prod
MONGODB_DB_NAME=fitxgen-prod

# Authentication
NEXTAUTH_URL=https://fitxgen.com
NEXTAUTH_SECRET=your-production-secret-key-min-32-chars

# AI Integration
CLAUDE_API_KEY=your-claude-api-key

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=XXXXXXXXXXXXXXXX
ANALYTICS_API_SECRET=your-analytics-api-secret
ADMIN_API_KEY=your-admin-api-key

# Email Service
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@fitxgen.com

# Security
RATE_LIMIT_SECRET=your-rate-limit-secret
CSP_NONCE_SECRET=your-csp-nonce-secret

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### 2. Staging Environment Variables

Create `.env.staging` file:

```env
# Use staging variants of all production variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitxgen-staging
NEXTAUTH_URL=https://staging.fitxgen.com
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
NEXT_PUBLIC_GA_ID=G-STAGING-ID
```

---

## 🔧 Deployment Procedures

### Automated Deployment (Recommended)

#### Vercel Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Initial deployment setup
vercel

# 4. Set environment variables
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_SECRET production
# ... (add all production variables)

# 5. Deploy to production
vercel --prod
```

#### GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Manual Deployment

```bash
# 1. Clone repository
git clone https://github.com/your-username/fitxgen.git
cd fitxgen

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env.production
# Edit .env.production with production values

# 4. Build application
npm run build

# 5. Start production server
npm start
```

---

## 🗄️ Database Setup

### MongoDB Atlas Configuration

#### 1. Create Production Database

```javascript
// MongoDB connection setup
use fitxgen-prod

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: 1 })
db.calculations.createIndex({ userId: 1, createdAt: -1 })
db.chatsessions.createIndex({ userId: 1, createdAt: -1 })
db.payments.createIndex({ userId: 1, status: 1 })
db.feedback.createIndex({ createdAt: -1 })

// Set up TTL for temporary data
db.sessions.createIndex({ expires: 1 }, { expireAfterSeconds: 0 })
db.rateLimits.createIndex({ resetTime: 1 }, { expireAfterSeconds: 3600 })
```

#### 2. Database Migration Script

```javascript
// scripts/migrate-database.js
const { MongoClient } = require('mongodb')

async function migrateDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME)
    
    // Migration scripts
    console.log('Running database migrations...')
    
    // Add new fields to existing users
    await db.collection('users').updateMany(
      { version: { $exists: false } },
      { $set: { version: '1.0', migratedAt: new Date() } }
    )
    
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.close()
  }
}

migrateDatabase()
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="backups/backup_$DATE"
aws s3 cp "backups/backup_$DATE" "s3://fitxgen-backups/daily/" --recursive
```

---

## 📊 Monitoring & Observability

### 1. Application Monitoring

#### Health Check Endpoint

```javascript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    // Check database connection
    const { db } = await connectToDatabase()
    await db.admin().ping()
    
    // Check external services
    const checks = {
      database: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV
    }
    
    return NextResponse.json(checks, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    )
  }
}
```

#### Vercel Analytics Integration

```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/health",
      "destination": "/api/health"
    }
  ]
}
```

### 2. Error Tracking with Sentry

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend: (event) => {
    // Filter sensitive data
    if (event.request) {
      delete event.request.headers?.authorization
      delete event.request.data?.password
    }
    return event
  }
})
```

### 3. Performance Monitoring

#### Core Web Vitals Tracking

```javascript
// src/lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true
    })
  }
}

export function trackWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

---

## 🔒 Security Configuration

### 1. Security Headers

```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### 2. Rate Limiting Configuration

```javascript
// Production rate limits
const RATE_LIMITS = {
  calculation: { requests: 100, window: '1h' },
  auth: { requests: 5, window: '15m' },
  payment: { requests: 10, window: '1h' },
  api: { requests: 1000, window: '1h' }
}
```

---

## 🔄 Maintenance Procedures

### Daily Operations

#### 1. Health Monitoring

```bash
#!/bin/bash
# daily-health-check.sh

echo "🏥 Daily Health Check - $(date)"

# Check application health
curl -f https://fitxgen.com/health || echo "❌ Health check failed"

# Check database performance
echo "📊 Database Stats:"
mongo $MONGODB_URI --eval "db.stats()"

# Check error rates
echo "🚨 Recent Errors:"
curl -s "https://api.sentry.io/api/0/projects/fitxgen/events/" \
  -H "Authorization: Bearer $SENTRY_TOKEN" | jq '.[] | select(.level == "error")'

# Check performance metrics
echo "⚡ Performance Metrics:"
curl -s "https://api.vercel.com/v1/analytics" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

#### 2. Automated Backups

```yaml
# .github/workflows/backup.yml
name: Daily Backup

on:
  schedule:
    - cron: '0 2 * * *' # 2 AM UTC daily

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          mongodump --uri="${{ secrets.MONGODB_URI }}" --out=backup
          tar -czf backup-$(date +%Y%m%d).tar.gz backup/
          
      - name: Upload to S3
        uses: aws-actions/aws-cli@v1
        with:
          args: s3 cp backup-$(date +%Y%m%d).tar.gz s3://fitxgen-backups/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Weekly Operations

#### 1. Performance Review

```bash
#!/bin/bash
# weekly-performance-review.sh

echo "📈 Weekly Performance Review - $(date)"

# Generate performance report
node scripts/performance-report.js

# Update dependency security
npm audit --audit-level moderate

# Check for outdated packages
npm outdated

# Run comprehensive tests
npm run test:all
```

#### 2. Security Audit

```bash
#!/bin/bash
# weekly-security-audit.sh

echo "🔒 Weekly Security Audit - $(date)"

# Check for vulnerabilities
npm audit --audit-level high

# Update dependencies
npm update

# Run security tests
npm run test:security

# Check SSL certificate expiration
echo | openssl s_client -servername fitxgen.com -connect fitxgen.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Monthly Operations

#### 1. Capacity Planning

```javascript
// scripts/capacity-analysis.js
const MongoClient = require('mongodb').MongoClient

async function analyzeCapacity() {
  const client = new MongoClient(process.env.MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME)
    
    // User growth analysis
    const userGrowth = await db.collection('users').aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray()
    
    // Resource usage analysis
    const dbStats = await db.stats()
    
    console.log('📊 Capacity Analysis Report')
    console.log('User Growth:', userGrowth)
    console.log('Database Size:', dbStats.dataSize / (1024 * 1024), 'MB')
    console.log('Index Size:', dbStats.indexSize / (1024 * 1024), 'MB')
    
  } finally {
    await client.close()
  }
}

analyzeCapacity()
```

---

## 🚨 Incident Response

### Emergency Procedures

#### 1. Service Outage Response

```bash
# Emergency response checklist

# 1. Assess situation
curl -I https://fitxgen.com/health

# 2. Check external services
curl -I https://api.anthropic.com
curl -I https://api.razorpay.com

# 3. Review recent deployments
vercel logs --follow

# 4. Rollback if necessary
vercel rollback [deployment-url]

# 5. Communicate status
# Update status page and notify users
```

#### 2. Database Recovery

```bash
# Database recovery procedure

# 1. Stop application
vercel env rm MONGODB_URI production

# 2. Restore from backup
mongorestore --uri="$MONGODB_URI" backup/backup_latest/

# 3. Verify data integrity
mongo $MONGODB_URI --eval "db.users.count(); db.calculations.count()"

# 4. Restart application
vercel env add MONGODB_URI production
vercel --prod
```

### Monitoring Alerts

#### Vercel Integration

```json
{
  "alerts": {
    "error_rate": {
      "threshold": "5%",
      "period": "5m",
      "channels": ["email", "slack"]
    },
    "response_time": {
      "threshold": "2s",
      "period": "5m",
      "channels": ["email", "slack"]
    },
    "build_failure": {
      "channels": ["email", "slack"]
    }
  }
}
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, E2E)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup procedures verified
- [ ] Monitoring dashboards configured

### Deployment

- [ ] Code review approved
- [ ] Staging deployment successful
- [ ] Production database migrated
- [ ] Environment variables updated
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] CDN purged if applicable

### Post-Deployment

- [ ] Health checks passing
- [ ] Core functionality verified
- [ ] Performance metrics normal
- [ ] Error rates acceptable
- [ ] User feedback monitored
- [ ] Analytics tracking functional
- [ ] Backup verified

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues

```javascript
// Check connection
const { MongoClient } = require('mongodb')

async function testConnection() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    console.log('✅ Database connected successfully')
    await client.close()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

testConnection()
```

#### Performance Issues

```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
node --inspect src/server.js

# Profile API endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://fitxgen.com/api/calculate
```

---

## 📞 Support Contacts

### Development Team
- **Lead Developer**: developer@fitxgen.com
- **DevOps Engineer**: devops@fitxgen.com
- **Security Team**: security@fitxgen.com

### Service Providers
- **Vercel Support**: vercel.com/support
- **MongoDB Atlas**: support.mongodb.com
- **Claude AI**: support.anthropic.com
- **Razorpay**: razorpay.com/support

### Emergency Contacts
- **Primary On-call**: +91-XXXX-XXX-XXX
- **Secondary On-call**: +91-XXXX-XXX-XXX
- **Incident Manager**: incident@fitxgen.com

---

## 📚 Additional Resources

- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Platform Guide](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Security Best Practices](./SECURITY.md)
- [API Documentation](./API.md)
- [Testing Guide](./TESTING.md)

**Deployment Status**: Production Ready ✅  
**Last Successful Deploy**: TBD  
**Next Maintenance Window**: TBD
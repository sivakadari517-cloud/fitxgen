# FitXGen Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables (Required)
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

**Authentication:**
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your Vercel domain (e.g., https://fitxgen.vercel.app)

**Database:**
- `MONGODB_URI` - MongoDB Atlas connection string

**AI Integration:**
- `CLAUDE_API_KEY` - Anthropic Claude API key

**Payment Gateway:**
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Same as RAZORPAY_KEY_ID (public)

**Base URL:**
- `NEXT_PUBLIC_BASE_URL` - Your Vercel domain

**Optional (Analytics):**
- `NEXT_PUBLIC_GTM_ID` - Google Tag Manager ID
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics ID
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` - Facebook Pixel ID

**Admin Access:**
- `ADMIN_API_KEY` - Random secure string for admin endpoints

### 2. Database Setup
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] Network access configured (allow all IPs: 0.0.0.0/0)
- [ ] Connection string tested

### 3. External Services
- [ ] Anthropic Claude API account and key obtained
- [ ] Razorpay account setup (test/live keys)
- [ ] Google Analytics configured (if using)

## Deployment Steps

### 1. Connect to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Set Environment Variables
```bash
# Set all required environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add MONGODB_URI production
vercel env add CLAUDE_API_KEY production
vercel env add RAZORPAY_KEY_ID production
vercel env add RAZORPAY_KEY_SECRET production
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
vercel env add NEXT_PUBLIC_BASE_URL production
vercel env add ADMIN_API_KEY production
```

### 3. Deploy
```bash
# Deploy to production
vercel --prod
```

## Post-Deployment Verification

### 1. Health Check
- [ ] Visit `/api/health` - should return 200 OK
- [ ] Check all environment variables are loaded
- [ ] Verify database connection

### 2. Core Functionality
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Body fat calculation works
- [ ] Payment flow works (test mode)
- [ ] AI chat responds

### 3. Performance Check
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals in green
- [ ] Mobile responsiveness
- [ ] Page load times < 3s

### 4. Security Verification
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] No sensitive data in client-side code
- [ ] API endpoints properly protected

## Common Issues & Solutions

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Environment Variable Issues
- Ensure all required variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding variables

### Database Connection Issues
- Verify MongoDB Atlas network access allows Vercel IPs
- Check connection string format
- Test connection locally first

### API Route Errors
- Check function timeout limits (max 30s on Vercel)
- Verify all imports are available in serverless environment
- Check for Node.js compatibility issues

## Performance Optimization

### 1. Bundle Analysis
```bash
npm run build:analyze
```

### 2. Image Optimization
- Use Next.js Image component
- Implement proper lazy loading
- Use WebP format when possible

### 3. Caching Strategy
- Static assets: 1 year cache
- API responses: Short cache with revalidation
- Database queries: Implement proper indexing

## Monitoring Setup

### 1. Vercel Analytics
- Enable in Vercel dashboard
- Monitor Core Web Vitals
- Track function performance

### 2. Error Tracking
- Implement Sentry (optional)
- Monitor API error rates
- Set up alerts for critical issues

### 3. Uptime Monitoring
- Use Vercel's built-in monitoring
- Set up external monitoring (UptimeRobot, etc.)
- Configure alert notifications

## Security Checklist

- [ ] All secrets in environment variables
- [ ] No hardcoded API keys in code
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled

## Final Steps

1. **Custom Domain** (Optional)
   - Add domain in Vercel dashboard
   - Configure DNS records
   - Enable automatic HTTPS

2. **Team Access**
   - Invite team members to Vercel project
   - Set appropriate permissions
   - Configure deployment notifications

3. **Backup Strategy**
   - Set up MongoDB Atlas backups
   - Export environment variables
   - Document deployment process

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Troubleshooting:** Check `/api/health` endpoint for diagnostics

---

**Deployment Status:** Ready for Production ✅
**Estimated Deployment Time:** 5-10 minutes
**Support:** Contact team if issues arise during deployment
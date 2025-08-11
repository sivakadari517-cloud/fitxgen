#!/bin/bash

# FitXGen Deployment Script for Vercel
echo "🚀 Starting FitXGen deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Make sure you're in the project root directory.${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Environment check
echo -e "${YELLOW}🔍 Checking environment variables...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ Error: .env.local file not found.${NC}"
    echo "Please create .env.local with required variables:"
    echo "  - NEXTAUTH_SECRET"
    echo "  - NEXTAUTH_URL"
    echo "  - MONGODB_URI"
    echo "  - CLAUDE_API_KEY"
    echo "  - RAZORPAY_KEY_ID"
    echo "  - RAZORPAY_KEY_SECRET"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Type checking
echo -e "${YELLOW}🔍 Running type checks...${NC}"
if ! npm run type-check; then
    echo -e "${RED}❌ Type check failed. Please fix TypeScript errors before deploying.${NC}"
    exit 1
fi

# Linting
echo -e "${YELLOW}🧹 Running ESLint...${NC}"
if ! npm run lint; then
    echo -e "${YELLOW}⚠️  ESLint found issues. Consider fixing them before deploying.${NC}"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build test
echo -e "${YELLOW}🏗️  Running build test...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ Build failed. Please fix build errors before deploying.${NC}"
    exit 1
fi

# Deploy to Vercel
echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
vercel --prod

# Check deployment status
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🎉 FitXGen is now live!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Configure custom domain (if needed)"
    echo "3. Set up monitoring and analytics"
    echo "4. Test all functionality on production"
    echo ""
    echo "Vercel Dashboard: https://vercel.com/dashboard"
else
    echo -e "${RED}❌ Deployment failed. Check the output above for errors.${NC}"
    exit 1
fi
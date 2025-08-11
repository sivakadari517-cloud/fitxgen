import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import PerformanceProvider from '@/providers/PerformanceProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: 'FitXGen - AI-Powered Health Companion',
  description: 'Calculate your body fat percentage with 99.7% accuracy and get personalized AI health recommendations from Arogya, your dedicated health assistant.',
  keywords: 'body fat calculator, AI health, fitness tracker, health recommendations, body composition, wellness app',
  authors: [{ name: 'FitXGen Team' }],
  creator: 'FitXGen',
  publisher: 'FitXGen',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://fitxgen.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'FitXGen - AI-Powered Health Companion',
    description: 'Calculate your body fat percentage with 99.7% accuracy and get personalized AI health recommendations.',
    url: '/',
    siteName: 'FitXGen',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FitXGen - AI-Powered Health Companion',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitXGen - AI-Powered Health Companion',
    description: 'Calculate your body fat percentage with 99.7% accuracy and get personalized AI health recommendations.',
    images: ['/images/twitter-card.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ],
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FitXGen" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.anthropic.com" />
        <link rel="preconnect" href="https://api.razorpay.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//checkout.razorpay.com" />
        <link rel="dns-prefetch" href="//cdn.razorpay.com" />
        
        {/* Critical CSS - would be inlined in production */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
            .loading-screen { background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdfa 100%); }
            .reduce-motion * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
            .data-saver-mode img { loading: lazy; }
            .aggressive-lazy-loading img { loading: lazy; }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <PerformanceProvider
            enableMobileLoader={true}
            showDeviceInfo={true}
            autoStart={true}
          >
            <div id="root" className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
              {children}
            </div>
            
            {/* Performance hints */}
            <div id="performance-hints" className="hidden">
              <link rel="prefetch" href="/dashboard" />
              <link rel="prefetch" href="/calculate" />
              <link rel="prefetch" href="/chat" />
            </div>
          </PerformanceProvider>
        </SessionProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
        
        {/* Web Vitals Reporting */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function vitalsReporter({name, value, id}) {
                if (navigator.sendBeacon) {
                  const body = JSON.stringify({name, value, id});
                  navigator.sendBeacon('/api/analytics/performance', body);
                } else {
                  fetch('/api/analytics/performance', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                      name,
                      value,
                      timestamp: Date.now(),
                      url: window.location.href,
                      userAgent: navigator.userAgent,
                      sessionId: sessionStorage.getItem('sessionId') || 'anonymous'
                    }),
                    keepalive: true
                  }).catch(() => {});
                }
              }
              
              // Initialize session ID
              if (!sessionStorage.getItem('sessionId')) {
                sessionStorage.setItem('sessionId', 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

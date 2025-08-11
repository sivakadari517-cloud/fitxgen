'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Globe,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  Mail,
  Calendar
} from 'lucide-react'

export default function PrivacyPage() {
  const router = useRouter()

  const lastUpdated = "January 1, 2024"

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          details: [
            "Name, email address, and contact information",
            "Age, gender, and basic demographic data",
            "Account credentials (securely hashed passwords)"
          ]
        },
        {
          subtitle: "Health Data",
          details: [
            "Body measurements (height, weight, circumferences)",
            "Body fat percentage and BMI calculations",
            "Health goals and lifestyle preferences",
            "Progress tracking data and measurement history"
          ]
        },
        {
          subtitle: "Usage Data",
          details: [
            "App usage patterns and feature interactions",
            "Device information and technical specifications", 
            "Log data for troubleshooting and improvements"
          ]
        }
      ]
    },
    {
      id: "data-usage",
      title: "How We Use Your Data",
      icon: UserCheck,
      content: [
        {
          subtitle: "Service Delivery",
          details: [
            "Provide accurate body fat calculations and health insights",
            "Generate personalized diet, exercise, and wellness recommendations",
            "Enable AI-powered health consultations through Arogya",
            "Track your progress and show meaningful health trends"
          ]
        },
        {
          subtitle: "Account Management",
          details: [
            "Create and maintain your user account",
            "Process payments and manage subscriptions",
            "Handle referral rewards and family member additions",
            "Provide customer support and technical assistance"
          ]
        },
        {
          subtitle: "Improvement & Communication",
          details: [
            "Improve our algorithms and recommendation accuracy",
            "Send important service updates and health tips",
            "Conduct research to enhance health outcomes",
            "Ensure platform security and prevent fraud"
          ]
        }
      ]
    },
    {
      id: "data-sharing",
      title: "Data Sharing & Disclosure",
      icon: Globe,
      content: [
        {
          subtitle: "We Never Sell Your Data",
          details: [
            "Your personal and health information is never sold to third parties",
            "We do not engage in data brokering or advertising partnerships",
            "Your privacy is our fundamental commitment, not a commodity"
          ]
        },
        {
          subtitle: "Limited Sharing Scenarios",
          details: [
            "Service providers (payment processing, cloud hosting) under strict agreements",
            "Legal compliance when required by Indian law or court orders",
            "Emergency situations to protect health and safety",
            "Business transfers (with your consent and continued privacy protection)"
          ]
        },
        {
          subtitle: "Anonymous Data",
          details: [
            "We may use aggregated, anonymized data for research purposes",
            "This data cannot be linked back to individual users",
            "Helps improve health outcomes for the broader Indian population"
          ]
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security & Protection",
      icon: Lock,
      content: [
        {
          subtitle: "Technical Safeguards",
          details: [
            "End-to-end encryption for all sensitive health data",
            "Industry-standard SSL/TLS protocols for data transmission",
            "Regular security audits and vulnerability assessments",
            "Secure cloud infrastructure with redundant backups"
          ]
        },
        {
          subtitle: "Access Controls",
          details: [
            "Role-based access with minimum necessary permissions",
            "Multi-factor authentication for admin accounts",
            "Regular access reviews and account monitoring",
            "Immediate revocation procedures for compromised accounts"
          ]
        },
        {
          subtitle: "Compliance Standards",
          details: [
            "Adherence to Indian data protection regulations",
            "International security frameworks and best practices",
            "Regular compliance audits and certifications",
            "Transparent incident response and notification procedures"
          ]
        }
      ]
    },
    {
      id: "user-rights",
      title: "Your Rights & Controls",
      icon: Eye,
      content: [
        {
          subtitle: "Access & Portability",
          details: [
            "Request a complete copy of your personal data",
            "Export your health data in a portable format",
            "View all data processing activities related to your account",
            "Understand exactly how your information is being used"
          ]
        },
        {
          subtitle: "Correction & Updates",
          details: [
            "Update or correct your personal information anytime",
            "Modify health data and measurement history",
            "Change privacy preferences and communication settings",
            "Update family member information and relationships"
          ]
        },
        {
          subtitle: "Deletion & Withdrawal",
          details: [
            "Delete your account and all associated data",
            "Withdraw consent for specific data processing activities",
            "Request removal of specific data categories",
            "Opt-out of research participation or data analysis"
          ]
        }
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention & Deletion",
      icon: Calendar,
      content: [
        {
          subtitle: "Active Account Data",
          details: [
            "Personal and health data retained while account is active",
            "Measurement history preserved for progress tracking",
            "Communication records kept for customer service quality",
            "Payment information stored per regulatory requirements"
          ]
        },
        {
          subtitle: "Account Deletion",
          details: [
            "Complete data deletion within 30 days of account closure",
            "Anonymized research data may be retained longer",
            "Legal records preserved as required by Indian law",
            "Backup systems purged according to security protocols"
          ]
        },
        {
          subtitle: "Inactive Accounts",
          details: [
            "Accounts inactive for 3+ years may be archived",
            "Data access restricted but preservation maintained",
            "Reactivation possible with identity verification",
            "Permanent deletion available upon request"
          ]
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-sm text-slate-600">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  Your Privacy is Our Priority
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  At FitXGen, we understand that your health data is deeply personal. 
                  This privacy policy explains how we collect, use, and protect your information 
                  with the highest standards of security and transparency.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Encrypted</h3>
                  <p className="text-sm text-slate-600">Bank-grade encryption</p>
                </div>
                <div className="p-4">
                  <UserCheck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Your Control</h3>
                  <p className="text-sm text-slate-600">You own your data</p>
                </div>
                <div className="p-4">
                  <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-slate-900">Transparent</h3>
                  <p className="text-sm text-slate-600">Clear data practices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="shadow-xl border-l-4 border-emerald-500">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Core Principles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Data Minimization</h3>
                    <p className="text-sm text-slate-600">We collect only what's necessary for your health journey</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Purpose Limitation</h3>
                    <p className="text-sm text-slate-600">Data is used only for stated health and service purposes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">User Consent</h3>
                    <p className="text-sm text-slate-600">Clear consent for all data processing activities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Security First</h3>
                    <p className="text-sm text-slate-600">Industry-leading security measures protect your data</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{section.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.subtitle}</h3>
                        <ul className="space-y-2">
                          {item.details.map((detail, detailIdx) => (
                            <li key={detailIdx} className="flex items-start text-slate-700">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span className="text-sm leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact & Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                    <Mail className="w-6 h-6 mr-2 text-blue-600" />
                    Exercise Your Rights
                  </h2>
                  <p className="text-slate-700 mb-6">
                    You can exercise your privacy rights at any time. Contact us for:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm text-slate-600">
                      <Download className="w-4 h-4 text-green-600 mr-2" />
                      Data export and portability
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <Eye className="w-4 h-4 text-blue-600 mr-2" />
                      Access to your personal data
                    </li>
                    <li className="flex items-center text-sm text-slate-600">
                      <Trash2 className="w-4 h-4 text-red-600 mr-2" />
                      Account and data deletion
                    </li>
                  </ul>
                  <Button 
                    onClick={() => router.push('/contact')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Privacy Team
                  </Button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
                    Questions or Concerns?
                  </h2>
                  <p className="text-slate-700 mb-4">
                    If you have any questions about this privacy policy or our data practices, please don't hesitate to reach out.
                  </p>
                  <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <p><strong>Email:</strong> privacy@fitxgen.com</p>
                    <p><strong>Phone:</strong> +91 98765 43210</p>
                    <p><strong>Response Time:</strong> Within 48 hours</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    This policy may be updated periodically. We'll notify you of any significant changes 
                    via email and app notifications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
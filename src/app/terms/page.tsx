'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft,
  FileText,
  Scale,
  UserCheck,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  Globe,
  Smartphone,
  Users,
  Heart,
  Clock,
  RefreshCw,
  Mail,
  Gavel
} from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()

  const lastUpdated = "January 1, 2024"

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        {
          text: "By accessing and using FitXGen, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service."
        },
        {
          text: "These terms apply to all users of FitXGen, including visitors, registered users, and premium subscribers."
        },
        {
          text: "Your continued use of the service constitutes acceptance of any updates to these terms."
        }
      ]
    },
    {
      id: "service-description",
      title: "Service Description",
      icon: Heart,
      content: [
        {
          text: "FitXGen is a health and wellness platform that provides scientific body fat analysis using the US Navy method, along with personalized health recommendations."
        },
        {
          text: "Our service includes AI-powered health consultations, family health tracking, diet and exercise recommendations, and progress monitoring."
        },
        {
          text: "We aim for 99.7% accuracy in our calculations, but results are estimates based on provided measurements and should not replace professional medical advice."
        }
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts & Registration",
      icon: UserCheck,
      content: [
        {
          text: "You must provide accurate, complete, and current information during registration and keep your account information updated."
        },
        {
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account."
        },
        {
          text: "You must be at least 13 years old to create an account. Users under 18 require parental consent."
        },
        {
          text: "One account per person. Multiple accounts by the same individual are not permitted without prior authorization."
        }
      ]
    },
    {
      id: "subscription-payment",
      title: "Subscription & Payment Terms",
      icon: CreditCard,
      content: [
        {
          text: "FitXGen offers subscription-based access at ₹99 for comprehensive health tracking and AI-powered recommendations."
        },
        {
          text: "Payments are processed securely through Razorpay. All transactions are encrypted and follow industry security standards."
        },
        {
          text: "Subscriptions are billed in advance and are non-refundable except as required by law or our satisfaction guarantee."
        },
        {
          text: "We offer a 7-day satisfaction guarantee. If unsatisfied within 7 days of purchase, contact us for a full refund."
        },
        {
          text: "Price changes will be communicated 30 days in advance. Existing subscribers maintain their current rate until renewal."
        }
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: Shield,
      content: [
        {
          text: "Use FitXGen only for lawful purposes and in accordance with these terms and applicable laws."
        },
        {
          text: "Do not attempt to reverse engineer, decompile, or extract source code from our platform."
        },
        {
          text: "Prohibited activities include: sharing false health information, attempting unauthorized access, or using the service to harm others."
        },
        {
          text: "Respect other users' privacy and do not share others' health information without explicit consent."
        },
        {
          text: "Commercial use of the service without written permission is strictly prohibited."
        }
      ]
    },
    {
      id: "health-disclaimers",
      title: "Health Information Disclaimers",
      icon: AlertCircle,
      content: [
        {
          text: "FitXGen provides health estimates and educational information, not medical advice or diagnosis."
        },
        {
          text: "Always consult healthcare professionals for medical decisions. Our recommendations supplement but don't replace professional care."
        },
        {
          text: "Individual results may vary. Body fat calculations are estimates based on measurements and statistical models."
        },
        {
          text: "We are not responsible for health outcomes resulting from following our recommendations without medical supervision."
        },
        {
          text: "If you have medical conditions, consult your doctor before making significant lifestyle changes."
        }
      ]
    },
    {
      id: "data-privacy",
      title: "Data & Privacy",
      icon: Globe,
      content: [
        {
          text: "Your privacy is paramount. Please review our Privacy Policy for detailed information about data handling."
        },
        {
          text: "We collect and process health data only as necessary to provide our services effectively."
        },
        {
          text: "You retain ownership of your health data and can export or delete it at any time."
        },
        {
          text: "We implement industry-standard security measures to protect your sensitive information."
        },
        {
          text: "Data is stored securely in India with backup systems for continuity and disaster recovery."
        }
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: FileText,
      content: [
        {
          text: "All content, features, and functionality of FitXGen are owned by us or our licensors and protected by intellectual property laws."
        },
        {
          text: "You may use our service for personal, non-commercial purposes only. Commercial use requires explicit written permission."
        },
        {
          text: "The FitXGen name, logo, and branding are our trademarks and may not be used without authorization."
        },
        {
          text: "You grant us a license to use feedback, suggestions, or ideas you provide to improve our service."
        }
      ]
    },
    {
      id: "service-availability",
      title: "Service Availability & Modifications",
      icon: RefreshCw,
      content: [
        {
          text: "We strive for 99.9% uptime but cannot guarantee uninterrupted service availability."
        },
        {
          text: "Scheduled maintenance will be announced in advance when possible. Emergency maintenance may occur without notice."
        },
        {
          text: "We reserve the right to modify, suspend, or discontinue any part of our service with reasonable notice."
        },
        {
          text: "We continuously improve our algorithms and features. Updates may change how certain features work."
        }
      ]
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: Scale,
      content: [
        {
          text: "FitXGen is provided 'as is' without warranties of any kind, express or implied."
        },
        {
          text: "We are not liable for indirect, incidental, special, or consequential damages arising from service use."
        },
        {
          text: "Our total liability to you for all claims will not exceed the amount you paid for the service in the past 12 months."
        },
        {
          text: "We are not responsible for third-party content, services, or actions beyond our control."
        },
        {
          text: "Some jurisdictions do not allow liability limitations, so these may not apply to you."
        }
      ]
    },
    {
      id: "termination",
      title: "Account Termination",
      icon: Users,
      content: [
        {
          text: "You may terminate your account at any time through your account settings or by contacting support."
        },
        {
          text: "We may suspend or terminate accounts that violate these terms or engage in harmful activities."
        },
        {
          text: "Upon termination, your access to the service ends immediately, but your data retention is governed by our Privacy Policy."
        },
        {
          text: "Termination does not waive any obligations or liabilities that arose before termination."
        }
      ]
    },
    {
      id: "governing-law",
      title: "Governing Law & Disputes",
      icon: Gavel,
      content: [
        {
          text: "These terms are governed by the laws of India, specifically the laws applicable in Karnataka state."
        },
        {
          text: "Any disputes will be resolved in the courts of Bangalore, Karnataka, India."
        },
        {
          text: "We encourage resolving disputes through good-faith negotiation before resorting to legal action."
        },
        {
          text: "If any provision of these terms is found unenforceable, the remaining provisions continue in effect."
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Terms of Service</h1>
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
                <Scale className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                  Terms of Service
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  These terms govern your use of FitXGen and outline the rights and responsibilities 
                  for both users and our service. Please read them carefully.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      By using FitXGen, you agree to these terms. If you disagree with any part, 
                      please discontinue use. These terms may be updated periodically, and continued 
                      use constitutes acceptance of changes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Table of Contents</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <Button
                    key={section.id}
                    variant="ghost"
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <section.icon className="w-4 h-4 mr-3 text-slate-600 flex-shrink-0" />
                    <span className="text-sm">{index + 1}. {section.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                      <section.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{index + 1}. {section.title}</h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.content.map((item, idx) => (
                      <div key={idx} className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-4 mt-2 flex-shrink-0"></div>
                        <p className="text-slate-700 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
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
                    Questions About Terms?
                  </h2>
                  <p className="text-slate-700 mb-6">
                    If you have questions about these terms or need clarification on any provisions, 
                    our legal and support teams are here to help.
                  </p>
                  <div className="space-y-2 text-sm text-slate-600 mb-6">
                    <p><strong>Legal Team:</strong> legal@fitxgen.com</p>
                    <p><strong>General Support:</strong> support@fitxgen.com</p>
                    <p><strong>Phone:</strong> +91 98765 43210</p>
                  </div>
                  <Button 
                    onClick={() => router.push('/contact')}
                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Legal Team
                  </Button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                    <Clock className="w-6 h-6 mr-2 text-green-600" />
                    Updates & Changes
                  </h2>
                  <p className="text-slate-700 mb-4">
                    We may update these terms periodically to reflect changes in our service, 
                    legal requirements, or business practices.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <span className="text-sm text-slate-600">30-day notice for material changes</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <span className="text-sm text-slate-600">Email notification to active users</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <span className="text-sm text-slate-600">Prominent in-app notifications</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <span className="text-sm text-slate-600">Archive of previous versions available</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your continued use after changes indicates acceptance of updated terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={() => router.push('/privacy')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/about')}
            >
              <Heart className="w-4 h-4 mr-2" />
              About FitXGen
            </Button>
            <Button 
              onClick={() => router.push('/contact')}
              className="bg-gradient-to-r from-blue-500 to-purple-500"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
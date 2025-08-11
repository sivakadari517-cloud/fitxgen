'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft,
  Heart,
  Users,
  Target,
  Award,
  Sparkles,
  Shield,
  TrendingUp,
  Brain,
  Globe,
  CheckCircle,
  Star,
  Zap,
  BookOpen,
  PhoneCall
} from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()

  const features = [
    {
      icon: Target,
      title: "99.7% Accurate Analysis",
      description: "Scientific body fat calculation using the proven US Navy method with precision measurements"
    },
    {
      icon: Brain,
      title: "AI Health Assistant",
      description: "Arogya AI provides personalized, 24/7 health guidance tailored to Indian lifestyle and culture"
    },
    {
      icon: Users,
      title: "Family Health Tracking",
      description: "Monitor health metrics for your entire family with our multi-person measurement system"
    },
    {
      icon: Heart,
      title: "Indian-Focused Nutrition",
      description: "Diet recommendations featuring traditional Indian foods and cooking methods"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your health data is encrypted and stored securely with industry-standard protection"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visual progress reports and trend analysis to keep you motivated on your journey"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Happy Users" },
    { number: "99.7%", label: "Accuracy Rate" },
    { number: "₹99", label: "Affordable Price" },
    { number: "24/7", label: "AI Support" }
  ]

  const team = [
    {
      name: "Dr. Priya Sharma",
      role: "Chief Health Officer",
      bio: "15+ years in preventive medicine and nutrition science",
      avatar: "PS"
    },
    {
      name: "Rahul Verma",
      role: "Lead Developer",
      bio: "Full-stack developer passionate about health technology",
      avatar: "RV"
    },
    {
      name: "Anjali Singh", 
      role: "AI Specialist",
      bio: "Machine learning expert focused on healthcare applications",
      avatar: "AS"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">About FitXGen</h1>
              <p className="text-sm text-slate-600">Your health transformation partner</p>
            </div>
          </div>
          
          <Button 
            onClick={() => router.push('/contact')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            <PhoneCall className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            Transforming Health with
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"> Science & AI</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            FitXGen combines cutting-edge technology with deep understanding of Indian lifestyle to deliver personalized health insights that actually work for you and your family.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-xl text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <p className="text-slate-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <Card className="shadow-xl">
            <CardContent className="p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
                  <div className="space-y-4 text-slate-700 leading-relaxed">
                    <p>
                      FitXGen was born from a simple observation: most health apps weren't designed for Indian families. Generic recommendations didn't account for our food culture, family dynamics, or lifestyle challenges.
                    </p>
                    <p>
                      We set out to create something different - a health platform that understands that dal-chawal isn't just food, it's nutrition. That joint family decisions matter in health choices. That a solution needs to work for both a tech executive in Bangalore and a teacher in Patna.
                    </p>
                    <p>
                      Today, FitXGen uses advanced AI to deliver scientifically accurate body fat analysis while providing culturally relevant health guidance that fits seamlessly into Indian lifestyles.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full h-64 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-emerald-800">Made in India</h3>
                      <p className="text-emerald-600">For Indian Families</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mission & Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-2 gap-8 mb-16"
        >
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              </div>
              <p className="text-slate-700 text-center leading-relaxed">
                To make scientific health assessment accessible and affordable for every Indian family, providing personalized guidance that respects our culture while promoting evidence-based wellness.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
              </div>
              <p className="text-slate-700 text-center leading-relaxed">
                A healthier India where every family has access to personalized health insights, enabling preventive care and informed wellness decisions for generations to come.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose FitXGen?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Advanced technology meets Indian sensibility to deliver health insights that actually work
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Passionate experts dedicated to transforming health technology in India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="shadow-xl text-center">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                    {member.avatar}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-emerald-600 font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-slate-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <Card className="shadow-xl">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Values</h2>
                <p className="text-xl text-slate-600">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <Award className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Excellence</h3>
                  <p className="text-sm text-slate-600">Commitment to scientific accuracy and quality</p>
                </div>
                <div className="text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Empathy</h3>
                  <p className="text-sm text-slate-600">Understanding Indian family health dynamics</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Trust</h3>
                  <p className="text-sm text-slate-600">Transparent, secure, and reliable platform</p>
                </div>
                <div className="text-center">
                  <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Education</h3>
                  <p className="text-sm text-slate-600">Empowering informed health decisions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <Card className="shadow-xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Transform Your Health?</h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Join thousands of Indian families who are already on their journey to better health with FitXGen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Get Started for ₹99
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/contact')}
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Plus, 
  Settings, 
  ArrowLeft,
  User,
  Heart,
  Calendar,
  Scale,
  TrendingUp,
  Edit3,
  Trash2,
  Eye,
  Crown,
  Baby,
  UserCheck
} from 'lucide-react'

interface FamilyMember {
  _id: string
  name: string
  relationship: string
  age: number
  gender: 'male' | 'female'
  measurements?: {
    height?: number
    weight?: number
    bodyFatPercentage?: number
    bmi?: number
    lastUpdated?: Date
  }
  avatar?: string
  isActive: boolean
  createdAt: Date
}

interface UserData {
  subscription: {
    additionalPeople: number
    status: string
  }
}

export default function FamilyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    relationship: '',
    age: '',
    gender: 'male' as 'male' | 'female'
  })
  const [isAddingMember, setIsAddingMember] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      // Fetch user data to check subscription limits
      const userResponse = await fetch('/api/user/profile')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserData(userData.user)
      }

      // Fetch family members
      const familyResponse = await fetch('/api/family/members')
      if (familyResponse.ok) {
        const familyData = await familyResponse.json()
        setFamilyMembers(familyData.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.relationship.trim() || !newMember.age) {
      return
    }

    setIsAddingMember(true)
    try {
      const response = await fetch('/api/family/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMember.name.trim(),
          relationship: newMember.relationship.trim(),
          age: parseInt(newMember.age),
          gender: newMember.gender
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFamilyMembers(prev => [...prev, data.member])
        setNewMember({ name: '', relationship: '', age: '', gender: 'male' })
        setShowAddMember(false)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to add family member')
      }
    } catch (error) {
      console.error('Failed to add family member:', error)
      alert('Failed to add family member. Please try again.')
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this family member?')) {
      return
    }

    try {
      const response = await fetch(`/api/family/members/${memberId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFamilyMembers(prev => prev.filter(member => member._id !== memberId))
      }
    } catch (error) {
      console.error('Failed to delete family member:', error)
    }
  }

  const getRelationshipIcon = (relationship: string) => {
    const rel = relationship.toLowerCase()
    if (rel.includes('child') || rel.includes('son') || rel.includes('daughter')) {
      return <Baby className="w-4 h-4" />
    } else if (rel.includes('parent') || rel.includes('mother') || rel.includes('father')) {
      return <Crown className="w-4 h-4" />
    } else if (rel.includes('spouse') || rel.includes('husband') || rel.includes('wife')) {
      return <Heart className="w-4 h-4" />
    }
    return <User className="w-4 h-4" />
  }

  const getHealthStatusColor = (member: FamilyMember) => {
    if (!member.measurements?.bodyFatPercentage) return 'bg-slate-100'
    
    const bf = member.measurements.bodyFatPercentage
    const gender = member.gender
    
    if (gender === 'female') {
      if (bf <= 20) return 'bg-green-100 text-green-800'
      if (bf <= 24) return 'bg-emerald-100 text-emerald-800'
      if (bf <= 31) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    } else {
      if (bf <= 13) return 'bg-green-100 text-green-800'
      if (bf <= 17) return 'bg-emerald-100 text-emerald-800'
      if (bf <= 24) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }
  }

  const canAddMoreMembers = () => {
    if (!userData) return false
    return familyMembers.length < (userData.subscription.additionalPeople || 0)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading family health center...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Family Health Center</h1>
              <p className="text-sm text-slate-600">
                Track health for {familyMembers.length} of {userData?.subscription.additionalPeople || 0} members
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Add Member Card */}
        {canAddMoreMembers() && (
          <Card className="mb-8 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Plus className="w-5 h-5 mr-2 text-emerald-600" />
                    Add Family Member
                  </CardTitle>
                  <CardDescription>
                    Help your loved ones track their health journey too
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddMember(!showAddMember)}
                  variant={showAddMember ? "outline" : "default"}
                >
                  {showAddMember ? 'Cancel' : 'Add Member'}
                </Button>
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {showAddMember && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="pt-0">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Name *
                          </label>
                          <Input
                            value={newMember.name}
                            onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Relationship *
                          </label>
                          <Input
                            value={newMember.relationship}
                            onChange={(e) => setNewMember(prev => ({ ...prev, relationship: e.target.value }))}
                            placeholder="e.g., Spouse, Child, Parent"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Age *
                          </label>
                          <Input
                            type="number"
                            value={newMember.age}
                            onChange={(e) => setNewMember(prev => ({ ...prev, age: e.target.value }))}
                            placeholder="Enter age"
                            min="1"
                            max="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Gender *
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="male"
                                checked={newMember.gender === 'male'}
                                onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                                className="mr-2"
                              />
                              Male
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="female"
                                checked={newMember.gender === 'female'}
                                onChange={(e) => setNewMember(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                                className="mr-2"
                              />
                              Female
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleAddMember}
                        disabled={isAddingMember || !newMember.name.trim() || !newMember.relationship.trim() || !newMember.age}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500"
                      >
                        {isAddingMember ? 'Adding...' : 'Add Member'}
                      </Button>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}

        {/* Family Members Grid */}
        {familyMembers.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Family Members Yet</h3>
              <p className="text-slate-600 mb-6">
                Start tracking health for your loved ones by adding family members.
              </p>
              {canAddMoreMembers() ? (
                <Button 
                  onClick={() => setShowAddMember(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    Your current plan allows {userData?.subscription.additionalPeople || 0} additional family members.
                  </p>
                  <Button variant="outline">
                    Upgrade Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyMembers.map((member) => (
              <Card key={member._id} className="shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{member.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          {getRelationshipIcon(member.relationship)}
                          <span>{member.relationship}</span>
                          <span>•</span>
                          <span>{member.age}y</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteMember(member._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {member.measurements?.bodyFatPercentage ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-slate-900">
                            {member.measurements.bodyFatPercentage}%
                          </div>
                          <p className="text-xs text-slate-600">Body Fat</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-slate-900">
                            {member.measurements.bmi}
                          </div>
                          <p className="text-xs text-slate-600">BMI</p>
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(member)}`}>
                        <UserCheck className="w-3 h-3 mr-1" />
                        Health Tracked
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Scale className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-4">
                        No health data recorded yet
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => router.push(`/family/${member._id}/measurements`)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Measurements
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Added {new Date(member.createdAt).toLocaleDateString()}</span>
                      {member.measurements?.lastUpdated && (
                        <span>Updated {new Date(member.measurements.lastUpdated).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
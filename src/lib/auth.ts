import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import connectDB from './mongodb'
import User from '@/models/User'
import { generateReferralCode } from './utils'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        action: { label: 'Action', type: 'text' } // 'signin' or 'signup'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        const email = credentials.email as string
        const password = credentials.password as string
        const action = credentials.action as string

        if (action === 'signup') {
          // Check if user already exists
          const existingUser = await User.findOne({ email: email.toLowerCase() })
          if (existingUser) {
            throw new Error('User already exists with this email')
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 12)

          // Create new user with minimal required fields
          const newUser = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            profile: {
              name: email.split('@')[0], // Temporary name from email
              age: 25, // Will be updated during onboarding
              gender: 'male' // Will be updated during onboarding
            },
            measurements: {
              height: 170, // Will be updated during onboarding
              weight: 70, // Will be updated during onboarding
              circumferences: {
                waist: 80, // Will be updated during onboarding
                neck: 35 // Will be updated during onboarding
              }
            },
            goals: {
              primaryObjective: 'fitness' // Will be updated during onboarding
            },
            referrals: {
              code: generateReferralCode(email.split('@')[0]),
              referred: [],
              earnings: 0
            }
          })

          await newUser.save()

          return {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.profile.name,
            image: newUser.profile.avatar || null
          }
        } else {
          // Sign in existing user
          const user = await User.findOne({ email: email.toLowerCase() })
          if (!user) {
            throw new Error('No user found with this email')
          }

          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.profile.name,
            image: user.profile.avatar || null
          }
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful authentication
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return baseUrl + '/dashboard'
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  secret: process.env.NEXTAUTH_SECRET,
})

// Helper function to get current user data
export async function getCurrentUser(userId: string) {
  await connectDB()
  const user = await User.findById(userId).select('-password')
  return user
}

// Helper function to hash password
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

// Helper function to verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}
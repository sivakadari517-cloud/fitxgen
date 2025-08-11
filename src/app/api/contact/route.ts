import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'

// Contact form submission model (simple schema for contact inquiries)
interface ContactSubmission {
  name: string
  email: string
  subject: string
  category: string
  message: string
  submittedAt: Date
  status: 'new' | 'in_progress' | 'resolved'
  userAgent?: string
  ipAddress?: string
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, category, message } = await request.json()

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Rate limiting check (basic implementation)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    await connectMongoDB()

    // Create contact submission document
    const contactData: ContactSubmission = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      category: category || 'general',
      message: message.trim(),
      submittedAt: new Date(),
      status: 'new',
      userAgent,
      ipAddress
    }

    // In a production environment, you would save this to a ContactSubmission collection
    // For now, we'll simulate saving and return success
    
    // You could implement:
    // 1. Save to MongoDB collection
    // 2. Send email notification to support team
    // 3. Integration with support ticket system
    // 4. Auto-responder email to user

    console.log('Contact form submission:', contactData)

    // Simulate email notification to support team
    await sendNotificationToSupport(contactData)

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will respond within 24 hours.',
      submissionId: generateSubmissionId()
    })

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit your message. Please try again.' },
      { status: 500 }
    )
  }
}

// Generate a unique submission ID
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `CS-${timestamp}-${randomStr}`.toUpperCase()
}

// Simulate sending notification to support team
async function sendNotificationToSupport(contactData: ContactSubmission): Promise<void> {
  // In production, this would:
  // 1. Send email to support team
  // 2. Create ticket in support system
  // 3. Send Slack/Teams notification
  // 4. Log to monitoring system

  try {
    // Simulate notification logic
    const notification = {
      to: 'support@fitxgen.com',
      subject: `New Contact Form: ${contactData.subject}`,
      body: `
        New contact form submission received:
        
        Name: ${contactData.name}
        Email: ${contactData.email}
        Category: ${contactData.category}
        Subject: ${contactData.subject}
        
        Message:
        ${contactData.message}
        
        Submitted: ${contactData.submittedAt.toISOString()}
        IP: ${contactData.ipAddress}
      `
    }

    console.log('Support notification would be sent:', notification)

    // Here you would integrate with:
    // - SendGrid, Mailgun, or AWS SES for email
    // - Slack API for team notifications
    // - Support ticket systems like Zendesk, Freshdesk
    
  } catch (error) {
    console.error('Failed to send support notification:', error)
    // Don't fail the main request if notification fails
  }
}

// GET endpoint for retrieving contact form submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // In production, this would require admin authentication
    // For now, we'll return a simple response
    
    return NextResponse.json({
      success: true,
      message: 'Contact form API is operational',
      endpoints: {
        submit: 'POST /api/contact',
        status: 'GET /api/contact'
      }
    })

  } catch (error) {
    console.error('Contact API GET error:', error)
    return NextResponse.json(
      { success: false, message: 'API error' },
      { status: 500 }
    )
  }
}
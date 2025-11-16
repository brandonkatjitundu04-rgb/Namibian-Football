import { NextRequest, NextResponse } from 'next/server'

// POST contact form submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // In production, you would:
    // 1. Send an email using a service like SendGrid, Resend, or Nodemailer
    // 2. Store the message in a database
    // 3. Send a notification to admins
    
    // For now, we'll just log it
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    })

    // TODO: Implement email sending
    // Example:
    // await sendEmail({
    //   to: 'info@namibianfootball.com',
    //   subject: `Contact Form: ${subject}`,
    //   body: `From: ${name} (${email})\n\n${message}`,
    // })

    return NextResponse.json({ message: 'Message sent successfully' })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}


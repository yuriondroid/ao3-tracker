import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuth } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value
    
    if (sessionId) {
      await SimpleAuth.logout(sessionId)
      console.log('Logout API: Logged out session:', sessionId)
    }
    
    const response = NextResponse.json({ success: true })
    response.cookies.delete('sessionId')
    
    return response
  } catch (error) {
    console.error('Logout API: Error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuth } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value
    
    console.log('Session API: Checking session:', sessionId)
    
    if (sessionId) {
      const user = SimpleAuth.getUserFromSession(sessionId)
      
      if (user) {
        console.log('Session API: User found:', user.name)
        return NextResponse.json({ 
          authenticated: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            ao3Username: user.ao3Username 
          } 
        })
      }
    }
    
    console.log('Session API: No valid session found')
    return NextResponse.json({ authenticated: false, user: null })
  } catch (error) {
    console.error('Session API: Error:', error)
    return NextResponse.json({ authenticated: false, user: null })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value
    
    if (sessionId) {
      SimpleAuth.logout(sessionId)
      console.log('Session API: Logged out session:', sessionId)
    }
    
    const response = NextResponse.json({ success: true })
    response.cookies.delete('sessionId')
    
    return response
  } catch (error) {
    console.error('Session API: Logout error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

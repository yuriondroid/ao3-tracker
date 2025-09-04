import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuth } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('Login API: Attempting login for:', username)
    
    const user = await SimpleAuth.authenticate(username, password)
    
    if (user) {
      const sessionId = await SimpleAuth.createSession(user)
      
      const response = NextResponse.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          ao3Username: user.ao3Username 
        } 
      })
      
      // Set session cookie
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      console.log('Login API: Login successful for:', username)
      return response
    } else {
      console.log('Login API: Login failed for:', username)
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
  } catch (error) {
    console.error('Login API: Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

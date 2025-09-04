// Simple authentication system
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface User {
  id: string
  name: string
  email: string
  ao3Username: string
}

// In-memory storage for sessions (for now)
// In production, this should be replaced with Redis or database storage
const sessions = new Map<string, User>()

// Keep sessions alive for 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export class SimpleAuth {
  static async authenticate(username: string, password: string): Promise<User | null> {
    try {
      // Check if user exists in database
      const { data: user, error } = await supabase
        .from('users')
        .select('id, username, display_name, email')
        .eq('username', username)
        .single()

      if (error || !user) {
        console.log('SimpleAuth: User not found:', username)
        return null
      }

      // For now, accept any password (in production, verify against hashed password)
      const userData: User = {
        id: user.id,
        name: user.display_name,
        email: user.email,
        ao3Username: user.username
      }
      
      console.log('SimpleAuth: Authentication successful for:', username)
      return userData
    } catch (error) {
      console.log('SimpleAuth: Authentication error:', error)
      return null
    }
  }

  static createSession(user: User): string {
    const sessionId = `session_${user.ao3Username}_${Date.now()}`
    sessions.set(sessionId, user)
    console.log('SimpleAuth: Created session:', sessionId, 'for user:', user.name)
    return sessionId
  }

  static getUserFromSession(sessionId: string): User | null {
    const user = sessions.get(sessionId)
    console.log('SimpleAuth: Getting user from session:', sessionId, 'User:', user?.name || 'not found')
    return user || null
  }

  static logout(sessionId: string): void {
    sessions.delete(sessionId)
    console.log('SimpleAuth: Logged out session:', sessionId)
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [sessionId, user] of sessions.entries()) {
      const sessionTime = parseInt(sessionId.split('_').pop() || '0')
      if (now - sessionTime > SESSION_DURATION) {
        sessions.delete(sessionId)
        console.log('SimpleAuth: Cleaned up expired session:', sessionId)
      }
    }
  }
}

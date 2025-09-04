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

// Database storage for sessions
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

  static async createSession(user: User): Promise<string> {
    const sessionId = `session_${user.ao3Username}_${Date.now()}`
    const expiresAt = new Date(Date.now() + SESSION_DURATION)
    
    try {
      await supabase.from('sessions').insert({
        id: sessionId,
        user_id: user.id,
        expires_at: expiresAt
      })
      console.log('SimpleAuth: Created session:', sessionId, 'for user:', user.name)
      return sessionId
    } catch (error) {
      console.log('SimpleAuth: Failed to create session in database:', error)
      return sessionId
    }
  }

  static async getUserFromSession(sessionId: string): Promise<User | null> {
    try {
      const { data: session, error } = await supabase
        .from('sessions')
        .select(`
          id,
          expires_at,
          user_id
        `)
        .eq('id', sessionId)
        .single()

      if (error || !session) {
        console.log('SimpleAuth: Session not found:', sessionId)
        return null
      }

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        console.log('SimpleAuth: Session expired:', sessionId)
        await this.logout(sessionId)
        return null
      }

      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, display_name, email')
        .eq('id', session.user_id)
        .single()

      if (userError || !userData) {
        console.log('SimpleAuth: User not found for session:', sessionId)
        return null
      }

      const user: User = {
        id: userData.id,
        name: userData.display_name,
        email: userData.email,
        ao3Username: userData.username
      }

      console.log('SimpleAuth: Getting user from session:', sessionId, 'User:', user.name)
      return user
    } catch (error) {
      console.log('SimpleAuth: Error getting user from session:', error)
      return null
    }
  }

  static async logout(sessionId: string): Promise<void> {
    try {
      await supabase.from('sessions').delete().eq('id', sessionId)
      console.log('SimpleAuth: Logged out session:', sessionId)
    } catch (error) {
      console.log('SimpleAuth: Error logging out session:', error)
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      await supabase.from('sessions').delete().lt('expires_at', new Date().toISOString())
      console.log('SimpleAuth: Cleaned up expired sessions')
    } catch (error) {
      console.log('SimpleAuth: Error cleaning up sessions:', error)
    }
  }
}

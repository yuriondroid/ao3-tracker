// Simple authentication system
export interface User {
  id: string
  name: string
  email: string
  ao3Username: string
}

// In-memory storage for demo (replace with database in production)
const users = new Map<string, User>()
const sessions = new Map<string, User>()

export class SimpleAuth {
  static async authenticate(username: string, password: string): Promise<User | null> {
    // Simple validation - accept any non-empty credentials
    if (username && password) {
      const user: User = {
        id: username,
        name: username,
        email: `${username}@ao3.local`,
        ao3Username: username
      }
      
      // Store user
      users.set(username, user)
      
      console.log('SimpleAuth: Authentication successful for:', username)
      return user
    }
    
    console.log('SimpleAuth: Authentication failed - invalid credentials')
    return null
  }

  static createSession(user: User): string {
    const sessionId = `session_${user.id}_${Date.now()}`
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
}

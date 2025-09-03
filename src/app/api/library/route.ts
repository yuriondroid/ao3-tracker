import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuth } from '@/lib/simple-auth'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  // Get session from cookies
  const sessionId = request.cookies.get('session')?.value
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = SimpleAuth.getUserFromSession(sessionId)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    const { data: libraryEntries, error } = await supabase
      .from('user_library')
      .select(`
        *,
        fanworks (*)
      `)
      .eq('user_id', user.id)
      .order('date_added', { ascending: false })
    
    if (error) {
      console.error('Library fetch error:', error)
      throw error
    }
    
    return NextResponse.json({ 
      library: libraryEntries || [],
      count: libraryEntries?.length || 0
    })
  } catch (error) {
    console.error('Error fetching library:', error)
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Get session from cookies
  const sessionId = request.cookies.get('session')?.value
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = SimpleAuth.getUserFromSession(sessionId)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { libraryEntryId, updates } = await request.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    const { data, error } = await supabase
      .from('user_library')
      .update(updates)
      .eq('id', libraryEntryId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Library update error:', error)
      throw error
    }
    
    return NextResponse.json({ 
      success: true, 
      entry: data 
    })
  } catch (error) {
    console.error('Error updating library entry:', error)
    return NextResponse.json({ error: 'Failed to update library entry' }, { status: 500 })
  }
}


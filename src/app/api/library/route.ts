import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  
  try {
    const { data: libraryEntries, error } = await supabase
      .from('user_library')
      .select(`
        *,
        fanworks (*)
      `)
      .eq('user_id', session.user.id)
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
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { libraryEntryId, updates } = await request.json()
  const supabase = createServerSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('user_library')
      .update(updates)
      .eq('id', libraryEntryId)
      .eq('user_id', session.user.id)
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


import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuth } from '@/lib/simple-auth'
import { AO3Scraper } from '@/lib/ao3-scraper'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Get session from cookies
  const sessionId = request.cookies.get('session')?.value
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = SimpleAuth.getUserFromSession(sessionId)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ao3Url } = await request.json()
  
  // Extract work ID from URL
  const workIdMatch = ao3Url.match(/works\/(\d+)/)
  if (!workIdMatch) {
    return NextResponse.json({ error: 'Invalid AO3 URL' }, { status: 400 })
  }
  
  const workId = workIdMatch[1]
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  try {
    // Get user's session token
    const { data: userData } = await supabase
      .from('users')
      .select('ao3_session_token')
      .eq('ao3_username', user.id)
      .single()
    
    if (!userData?.ao3_session_token) {
      return NextResponse.json({ error: 'No AO3 session found' }, { status: 401 })
    }
    
    // Scrape work data
    const scraper = new AO3Scraper()
    const workData = await scraper.getSampleWorks() // For now, use sample works
    
    if (!workData || workData.length === 0) {
      return NextResponse.json({ error: 'Failed to scrape work' }, { status: 500 })
    }
    
    // Use the first work as sample data
    const work = workData[0]
    
    // Save to database
    const { data: fanwork, error: workError } = await supabase
      .from('fanworks')
      .upsert({
        ao3_work_id: workId,
        title: work.title,
        author: work.author,
        fandom: work.fandoms.join(', '),
        relationship: work.relationships.join(', '),
        additional_tags: work.additionalTags,
        rating: work.rating,
        warnings: work.warnings,
        status: work.status,
        chapters_published: work.chaptersPublished,
        chapters_total: work.chaptersTotal,
        word_count: work.wordCount,
        published_date: work.publishedDate,
        updated_date: work.updatedDate,
        summary: work.summary,
        kudos: work.kudos,
        comments: work.comments,
        bookmarks: work.bookmarks,
        hits: work.hits
      })
      .select()
      .single()
    
    if (workError) {
      console.error('Work save error:', workError)
      throw workError
    }
    
    // Add to user's library
    const { data: libraryEntry, error: libraryError } = await supabase
      .from('user_library')
      .insert({
        user_id: user.id,
        fanwork_id: fanwork.id,
        reading_status: 'want-to-read'
      })
      .select()
      .single()
    
    if (libraryError && libraryError.code !== '23505') { // Ignore duplicate key error
      console.error('Library save error:', libraryError)
      throw libraryError
    }
    
    return NextResponse.json({ 
      success: true, 
      work: work,
      message: 'Work added to library successfully'
    })
  } catch (error) {
    console.error('Error adding work:', error)
    return NextResponse.json({ error: 'Failed to add work' }, { status: 500 })
  }
}


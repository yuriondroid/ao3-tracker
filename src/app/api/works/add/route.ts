import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { AO3Scraper } from '@/lib/ao3-scraper'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { ao3Url } = await request.json()
  
  // Extract work ID from URL
  const workIdMatch = ao3Url.match(/works\/(\d+)/)
  if (!workIdMatch) {
    return NextResponse.json({ error: 'Invalid AO3 URL' }, { status: 400 })
  }
  
  const workId = workIdMatch[1]
  const supabase = createServerSupabaseClient()
  
  try {
    // Get user's session token
    const { data: userData } = await supabase
      .from('users')
      .select('ao3_session_token')
      .eq('ao3_username', session.user.ao3Username)
      .single()
    
    if (!userData?.ao3_session_token) {
      return NextResponse.json({ error: 'No AO3 session found' }, { status: 401 })
    }
    
    // Scrape work data
    const scraper = new AO3Scraper(userData.ao3_session_token)
    const workData = await scraper.scrapeWork(workId)
    
    if (!workData) {
      return NextResponse.json({ error: 'Failed to scrape work' }, { status: 500 })
    }
    
    // Save to database
    const { data: fanwork, error: workError } = await supabase
      .from('fanworks')
      .upsert({
        ao3_work_id: workId,
        title: workData.title,
        author: workData.author,
        fandom: workData.fandoms.join(', '),
        relationship: workData.relationships.join(', '),
        additional_tags: workData.additionalTags,
        rating: workData.rating,
        warnings: workData.warnings,
        status: workData.status,
        chapters_published: workData.chaptersPublished,
        chapters_total: workData.chaptersTotal,
        word_count: workData.wordCount,
        published_date: workData.publishedDate,
        updated_date: workData.updatedDate,
        summary: workData.summary,
        kudos: workData.kudos,
        comments: workData.comments,
        bookmarks: workData.bookmarks,
        hits: workData.hits
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
        user_id: session.user.id,
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
      work: workData,
      message: 'Work added to library successfully'
    })
  } catch (error) {
    console.error('Error adding work:', error)
    return NextResponse.json({ error: 'Failed to add work' }, { status: 500 })
  }
}


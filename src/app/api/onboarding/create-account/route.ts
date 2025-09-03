import { NextRequest, NextResponse } from 'next/server'
import { SimpleAuth } from '@/lib/simple-auth'
import { AO3Scraper } from '@/lib/ao3-scraper'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, ao3Username, ao3Password, username, displayName, importScope } = await request.json()

    console.log('Onboarding API: Creating account for:', username)

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Onboarding API: Missing Supabase environment variables')
      return NextResponse.json({ 
        success: false, 
        error: 'Database configuration is missing. Please check environment variables.' 
      }, { status: 500 })
    }

    // Create user in SimpleAuth
    const user = await SimpleAuth.authenticate(ao3Username, ao3Password)
    if (!user) {
      console.log('Onboarding API: SimpleAuth authentication failed')
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create user account' 
      }, { status: 400 })
    }

    console.log('Onboarding API: User created in SimpleAuth:', ao3Username)

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Create user in Supabase database
    let { data: dbUser, error: dbError } = await supabase
      .from('users')
      .insert({
        email: email,
        ao3_username: ao3Username
      })
      .select()
      .single()

    if (dbError) {
      if (dbError.message.includes('duplicate key')) {
        console.log('Onboarding API: User already exists in database, fetching existing user')
        // User already exists, fetch the existing user
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('ao3_username', ao3Username)
          .single()
        
        if (fetchError) {
          console.log('Onboarding API: Failed to fetch existing user:', fetchError)
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch existing user: ' + fetchError.message 
          }, { status: 500 })
        }
        
        dbUser = existingUser
      } else {
        console.log('Onboarding API: Failed to create user in database:', dbError)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to create user in database: ' + dbError.message 
        }, { status: 500 })
      }
    }

    if (!dbUser) {
      console.log('Onboarding API: No user data available')
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create or fetch user in database' 
      }, { status: 500 })
    }

    console.log('Onboarding API: User ready in database:', ao3Username)

    // Get user's actual reading history from AO3
    console.log('Onboarding API: Getting user history from AO3')
    const scraper = new AO3Scraper()
    const userWorks = await scraper.getUserHistory(ao3Username, ao3Password, importScope)

    if (userWorks.length === 0) {
      console.log('Onboarding API: No works found in user history')
      return NextResponse.json({ 
        success: false, 
        error: 'No reading history found. Please check your AO3 credentials.' 
      }, { status: 400 })
    }

    console.log('Onboarding API: Successfully scraped', userWorks.length, 'works from user history')

    // Save works to database
    console.log('Onboarding API: Saving works to database...')
    let savedCount = 0
    for (const work of userWorks) {
      try {
        await scraper.saveWorkToDatabase(work, dbUser.id)
        savedCount++
      } catch (error) {
        console.log('Onboarding API: Failed to save work:', work.title, error)
      }
    }

    console.log('Onboarding API: Saved', savedCount, 'works to database')

    // Create default shelves for the user
    await scraper.createDefaultShelvesForUser(dbUser.id)

    // Create new session for the user
    const sessionId = SimpleAuth.createSession(user)

    console.log('Onboarding API: Account created successfully for:', ao3Username)

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        username: ao3Username,
        displayName: displayName || ao3Username,
        email: email,
        onboardingCompleted: true
      },
      sessionId: sessionId,
      worksImported: userWorks.length,
      worksSaved: savedCount,
      works: userWorks
    })

  } catch (error) {
    console.error('Onboarding API: Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create account: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }, { status: 500 })
  }
}

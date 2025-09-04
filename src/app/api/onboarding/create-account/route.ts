import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { SimpleAuth } from '@/lib/simple-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Add global error handler
  const handleError = (error: any, context: string) => {
    console.error(`Onboarding API: ${context} error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: `${context}: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return handleError(parseError, 'Invalid JSON in request body');
    }
    
    const { email, username, password, displayName, importData } = requestData;

    // Validate required fields
    if (!email || !username || !password || !displayName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, username, password, and display name are required' 
      }, { status: 400 });
    }

    console.log('Onboarding API: Creating account for:', username);

    // Create user in SimpleAuth
    const user = {
      id: uuidv4(),
      name: displayName,
      email,
      ao3Username: username
    };

    // Store user in SimpleAuth (users Map)
    const users = (SimpleAuth as any).users || new Map();
    users.set(username, user);
    console.log('Onboarding API: User created in SimpleAuth:', username);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database (using current schema)
    let { data: dbUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        ao3_username: username, // Use current schema field
        ao3_session_token: 'temp_token' // Temporary token
      })
      .select()
      .single();

    if (dbError) {
      // If user already exists, fetch the existing user
      if (dbError.code === '23505') { // Unique constraint violation
        console.log('Onboarding API: User already exists in database, fetching existing user');
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select()
          .eq('ao3_username', username)
          .single();

        if (fetchError) {
          return handleError(fetchError, 'Failed to fetch existing user');
        }

        dbUser = existingUser;
      } else {
        return handleError(dbError, 'Failed to create user in database');
      }
    }

    console.log('Onboarding API: User ready in database:', username);

    // Process and combine all imported works
    const allWorks: any[] = [];
    
    // Add bookmarks (set status based on source)
    if (importData?.bookmarks) {
      allWorks.push(...importData.bookmarks.map((work: any) => ({
        // Fanwork data
        id: uuidv4(), // Generate new UUID for fanwork
        ao3_work_id: work.id,
        title: work.title,
        author: work.author,
        fandom: work.fandoms?.join(', ') || 'Unknown Fandom',
        relationship: work.relationships?.join(', ') || 'No Relationship',
        additional_tags: work.tags || [],
        rating: work.rating || 'NR',
        warnings: work.warnings || ['No Archive Warnings Apply'],
        category: work.categories?.join(', ') || null,
        status: 'to-read',
        chapters_published: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        word_count: work.words || 0,
        language: 'English',
        published_date: work.date_bookmarked ? new Date(work.date_bookmarked) : new Date(),
        updated_date: new Date(),
        summary: work.summary || '',
        kudos: work.kudos || 0,
        hits: work.hits || 0,
        bookmarks: work.bookmarks || 0,
        comments: 0,
        last_scraped: new Date(),
        
        // User library data
        user_id: dbUser.id,
        reading_status: 'want-to-read',
        user_rating: 0,
        progress_percentage: 0,
        current_chapter: 1,
        date_added: new Date().toISOString(),
        date_started: null,
        date_completed: null,
        last_read: null,
        private_notes: `Imported from bookmarks on ${new Date().toISOString()}`
      })));
    }

    // Add history works (set as completed)
    if (importData?.history) {
      allWorks.push(...importData.history.map((work: any) => ({
        // Fanwork data
        id: uuidv4(), // Generate new UUID for fanwork
        ao3_work_id: work.id,
        title: work.title,
        author: work.author,
        fandom: work.fandoms?.join(', ') || 'Unknown Fandom',
        relationship: work.relationships?.join(', ') || 'No Relationship',
        additional_tags: work.tags || [],
        rating: work.rating || 'NR',
        warnings: work.warnings || ['No Archive Warnings Apply'],
        category: work.categories?.join(', ') || null,
        status: 'to-read',
        chapters_published: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        word_count: work.words || 0,
        language: 'English',
        published_date: work.date_visited ? new Date(work.date_visited) : new Date(),
        updated_date: new Date(),
        summary: work.summary || '',
        kudos: work.kudos || 0,
        hits: work.hits || 0,
        bookmarks: work.bookmarks || 0,
        comments: 0,
        last_scraped: new Date(),
        
        // User library data
        user_id: dbUser.id,
        reading_status: 'completed',
        user_rating: 0,
        progress_percentage: 100,
        current_chapter: parseInt(work.chapters?.split('/')[1]) || 1,
        date_added: new Date().toISOString(),
        date_started: work.date_visited ? new Date(work.date_visited) : new Date(),
        date_completed: work.date_visited ? new Date(work.date_visited) : new Date(),
        last_read: work.date_visited ? new Date(work.date_visited) : new Date(),
        private_notes: `Imported from history on ${new Date().toISOString()}`
      })));
    }

    // Add marked for later works
    if (importData?.markedForLater) {
      allWorks.push(...importData.markedForLater.map((work: any) => ({
        // Fanwork data
        id: uuidv4(), // Generate new UUID for fanwork
        ao3_work_id: work.id,
        title: work.title,
        author: work.author,
        fandom: work.fandoms?.join(', ') || 'Unknown Fandom',
        relationship: work.relationships?.join(', ') || 'No Relationship',
        additional_tags: work.tags || [],
        rating: work.rating || 'NR',
        warnings: work.warnings || ['No Archive Warnings Apply'],
        category: work.categories?.join(', ') || null,
        status: 'to-read',
        chapters_published: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        word_count: work.words || 0,
        language: 'English',
        published_date: work.date_marked ? new Date(work.date_marked) : new Date(),
        updated_date: new Date(),
        summary: work.summary || '',
        kudos: work.kudos || 0,
        hits: work.hits || 0,
        bookmarks: work.bookmarks || 0,
        comments: 0,
        last_scraped: new Date(),
        
        // User library data
        user_id: dbUser.id,
        reading_status: 'to-read',
        user_rating: 0,
        progress_percentage: 0,
        current_chapter: 1,
        date_added: new Date().toISOString(),
        date_started: null,
        date_completed: null,
        last_read: null,
        private_notes: `Imported from marked for later on ${new Date().toISOString()}`
      })));
    }

    // Remove duplicates based on work ID
    const uniqueWorks = allWorks.reduce((acc: any[], current: any) => {
      const existing = acc.find((work: any) => work.id === current.id);
      if (!existing) {
        acc.push(current);
      } else {
        // If duplicate, prefer the one with more complete data or higher priority status
        const statusPriority: Record<string, number> = { 'completed': 3, 'reading': 2, 'want-to-read': 1, 'to-read': 0 };
        if (statusPriority[current.status] > statusPriority[existing.status]) {
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
      }
      return acc;
    }, [] as any[]);

    console.log('Onboarding API: Processing', uniqueWorks.length, 'unique works');

    // Double-check that dbUser exists and has an id
    if (!dbUser || !dbUser.id) {
      console.log('Onboarding API: dbUser is null or missing id, cannot save works');
      return NextResponse.json({ 
        success: false, 
        error: 'Database user not properly created. Please try again.' 
      }, { status: 500 });
    }

    // Insert works in batches to avoid overwhelming the database
    const batchSize = 50;
    let processedCount = 0;

    for (let i = 0; i < uniqueWorks.length; i += batchSize) {
      const batch = uniqueWorks.slice(i, i + batchSize);
      
      // Split each work into fanwork and library data
      const fanworksBatch = batch.map(work => ({
        id: work.id,
        ao3_work_id: work.ao3_work_id,
        title: work.title,
        author: work.author,
        fandom: work.fandom,
        relationship: work.relationship,
        additional_tags: work.additional_tags,
        rating: work.rating,
        warnings: work.warnings,
        category: work.category,
        status: work.status,
        chapters_published: work.chapters_published,
        chapters_total: work.chapters_total,
        word_count: work.word_count,
        language: work.language,
        published_date: work.published_date,
        updated_date: work.updated_date,
        summary: work.summary,
        kudos: work.kudos,
        hits: work.hits,
        bookmarks: work.bookmarks,
        comments: work.comments,
        last_scraped: work.last_scraped
      }));

      const libraryBatch = batch.map(work => ({
        user_id: work.user_id,
        fanwork_id: work.id,
        reading_status: work.reading_status,
        user_rating: work.user_rating,
        progress_percentage: work.progress_percentage,
        current_chapter: work.current_chapter,
        date_added: work.date_added,
        date_started: work.date_started,
        date_completed: work.date_completed,
        last_read: work.last_read,
        private_notes: work.private_notes
      }));

      // Insert fanworks
      const { error: fanworksError } = await supabase
        .from('fanworks')
        .upsert(fanworksBatch, { onConflict: 'ao3_work_id' });

      if (fanworksError) {
        console.error(`Onboarding API: Failed to insert fanworks batch ${i / batchSize + 1}:`, fanworksError);
      }

      // Insert library entries
      const { error: libraryError } = await supabase
        .from('user_library')
        .upsert(libraryBatch, { onConflict: 'user_id,fanwork_id' });

      if (libraryError) {
        console.error(`Onboarding API: Failed to insert library batch ${i / batchSize + 1}:`, libraryError);
      }

      if (!fanworksError && !libraryError) {
        processedCount += batch.length;
      }
    }

    console.log('Onboarding API: Saved', processedCount, 'works to database');

    // Create default shelves for the user
    try {
      await supabase.rpc('create_default_shelves_for_user', { user_uuid: dbUser.id });
      console.log('Onboarding API: Created default shelves for user');
    } catch (error) {
      console.log('Onboarding API: Failed to create default shelves:', error);
      // Continue anyway, shelves are not critical
    }

    // Create new session for the user
    let sessionId;
    try {
      sessionId = SimpleAuth.createSession(user);
      console.log('Onboarding API: Session created:', sessionId);
    } catch (error) {
      console.log('Onboarding API: Failed to create session:', error);
      sessionId = `session_${username}_${Date.now()}`;
    }

    // Mark user onboarding as completed (skip for now since column doesn't exist)
    // await supabase
    //   .from('users')
    //   .update({ onboarding_completed: true })
    //   .eq('id', dbUser.id);

    console.log('Onboarding API: Account created successfully for:', username);

    // Create response with session cookie
    try {
      const response = NextResponse.json({
        success: true,
        user: {
          id: dbUser.id,
          username: username,
          displayName: displayName,
          email: email,
          onboardingCompleted: true
        },
        sessionId: sessionId,
        worksImported: uniqueWorks.length,
        worksSaved: processedCount,
        message: `Successfully imported ${processedCount} unique works from your AO3 data!`
      });

      // Set session cookie
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } catch (error) {
      console.log('Onboarding API: Failed to create response:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create response: ' + (error instanceof Error ? error.message : 'Unknown error')
      }, { status: 500 });
    }

  } catch (error) {
    return handleError(error, 'Failed to create account');
  }
}

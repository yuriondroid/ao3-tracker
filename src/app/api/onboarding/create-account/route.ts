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
        id: work.id,
        user_id: dbUser.id,
        title: work.title,
        author: work.author,
        author_url: work.author_url,
        url: work.url,
        fandoms: work.fandoms,
        rating: work.rating,
        warnings: work.warnings,
        categories: work.categories,
        relationships: work.relationships,
        characters: work.characters,
        additional_tags: work.tags,
        words: work.words,
        chapters_current: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        kudos: work.kudos,
        hits: work.hits,
        bookmarks: work.bookmarks,
        comments: 0,
        summary: work.summary,
        published_date: work.date_bookmarked ? new Date(work.date_bookmarked) : new Date(),
        updated_date: new Date(),
        status: 'want-to-read', // Bookmarked works are usually "want to read"
        date_added: new Date().toISOString(),
        source: 'bookmarks'
      })));
    }

    // Add history works (set as completed)
    if (importData?.history) {
      allWorks.push(...importData.history.map((work: any) => ({
        id: work.id,
        user_id: dbUser.id,
        title: work.title,
        author: work.author,
        author_url: work.author_url,
        url: work.url,
        fandoms: work.fandoms,
        rating: work.rating,
        warnings: work.warnings,
        categories: work.categories,
        relationships: work.relationships,
        characters: work.characters,
        additional_tags: work.tags,
        words: work.words,
        chapters_current: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        kudos: work.kudos,
        hits: work.hits,
        bookmarks: work.bookmarks,
        comments: 0,
        summary: work.summary,
        published_date: work.date_visited ? new Date(work.date_visited) : new Date(),
        updated_date: new Date(),
        status: 'completed', // History implies they were read
        date_completed: work.date_visited || new Date().toISOString(),
        date_added: new Date().toISOString(),
        source: 'history',
        visit_count: work.visit_count || 1
      })));
    }

    // Add marked for later works
    if (importData?.markedForLater) {
      allWorks.push(...importData.markedForLater.map((work: any) => ({
        id: work.id,
        user_id: dbUser.id,
        title: work.title,
        author: work.author,
        author_url: work.author_url,
        url: work.url,
        fandoms: work.fandoms,
        rating: work.rating,
        warnings: work.warnings,
        categories: work.categories,
        relationships: work.relationships,
        characters: work.characters,
        additional_tags: work.tags,
        words: work.words,
        chapters_current: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        kudos: work.kudos,
        hits: work.hits,
        bookmarks: work.bookmarks,
        comments: 0,
        summary: work.summary,
        published_date: work.date_marked ? new Date(work.date_marked) : new Date(),
        updated_date: new Date(),
        status: 'to-read', // Marked for later is "to read"
        date_added: new Date().toISOString(),
        source: 'marked-for-later'
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
      
      const { error: insertError } = await supabase
        .from('works')
        .upsert(batch, { onConflict: 'id,user_id' });

      if (insertError) {
        console.error(`Onboarding API: Failed to insert batch ${i / batchSize + 1}:`, insertError);
        // Continue with other batches even if one fails
      } else {
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

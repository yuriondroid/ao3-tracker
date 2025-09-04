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

  // Helper function to ensure arrays are properly formatted
  const ensureArray = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value.map(v => String(v)).filter(Boolean);
    }
    if (value) {
      return [String(value)];
    }
    return [];
  };

  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      return handleError(parseError, 'Invalid JSON in request body');
    }
    
    const { email, username, password, displayName, importData } = requestData;
    
    console.log('Onboarding API: Received multi-file import data:', {
      email,
      username,
      displayName,
      hasImportData: !!importData,
      importDataKeys: importData ? Object.keys(importData) : [],
      bookmarksCount: importData?.bookmarks?.length || 0,
      historyCount: importData?.history?.length || 0,
      markedForLaterCount: importData?.markedForLater?.length || 0
    });

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

    // Store user in SimpleAuth
    const users = (SimpleAuth as any).users || new Map();
    users.set(username, user);
    console.log('Onboarding API: User created in SimpleAuth:', username);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    let { data: dbUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email,
        username,
        password: hashedPassword,
        display_name: displayName,
        onboarding_completed: true
      })
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '23505') {
        console.log('Onboarding API: User already exists, fetching existing user');
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select()
          .eq('username', username)
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

    // Process multi-file import data
    const allWorks: any[] = [];
    
    console.log('Onboarding API: Processing multi-file import data');
    
    // Process bookmarks
    if (importData?.bookmarks && importData.bookmarks.length > 0) {
      console.log('Onboarding API: Processing', importData.bookmarks.length, 'bookmarks');
      allWorks.push(...importData.bookmarks.map((work: any) => ({
        id: work.id || uuidv4(),
        user_id: dbUser.id,
        title: work.title || 'Untitled',
        author: work.author || 'Unknown Author',
        author_url: work.author_url || '',
        fandom: ensureArray(work.fandoms),
        relationship: ensureArray(work.relationships),
        characters: ensureArray(work.characters),
        additional_tags: ensureArray(work.tags),
        rating: work.rating || 'NR',
        warnings: ensureArray(work.warnings).length > 0 ? ensureArray(work.warnings) : ['No Archive Warnings Apply'],
        categories: ensureArray(work.categories),
        chapters_current: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        words: parseInt(work.words) || 0,
        kudos: parseInt(work.kudos) || 0,
        hits: parseInt(work.hits) || 0,
        bookmarks: parseInt(work.bookmarks) || 0,
        published_date: work.date_bookmarked ? new Date(work.date_bookmarked) : new Date(),
        updated_date: new Date(),
        summary: work.summary || '',
        url: work.url || '',
        status: 'want-to-read',
        progress: 0,
        user_rating: null,
        user_notes: `Imported from bookmarks on ${new Date().toISOString()}`,
        date_added: new Date(),
        date_started: null,
        date_completed: null,
        source: 'bookmarks',
        visit_count: 1,
        date_visited: null,
        date_bookmarked: work.date_bookmarked ? new Date(work.date_bookmarked) : new Date(),
        date_marked: null
      })));
    }

    // Process history
    if (importData?.history && importData.history.length > 0) {
      console.log('Onboarding API: Processing', importData.history.length, 'history works');
      allWorks.push(...importData.history.map((work: any) => ({
        id: work.id || uuidv4(),
        user_id: dbUser.id,
        title: work.title || 'Untitled',
        author: work.author || 'Unknown Author',
        author_url: work.author_url || '',
        fandom: ensureArray(work.fandoms),
        relationship: ensureArray(work.relationships),
        characters: ensureArray(work.characters),
        additional_tags: ensureArray(work.tags),
        rating: work.rating || 'NR',
        warnings: ensureArray(work.warnings).length > 0 ? ensureArray(work.warnings) : ['No Archive Warnings Apply'],
        categories: ensureArray(work.categories),
        chapters_current: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        words: parseInt(work.words) || 0,
        kudos: parseInt(work.kudos) || 0,
        hits: parseInt(work.hits) || 0,
        bookmarks: parseInt(work.bookmarks) || 0,
        published_date: work.date_visited ? new Date(work.date_visited) : new Date(),
        updated_date: new Date(),
        summary: work.summary || '',
        url: work.url || '',
        status: 'completed',
        progress: 100,
        user_rating: null,
        user_notes: `Imported from history on ${new Date().toISOString()}`,
        date_added: new Date(),
        date_started: work.date_visited ? new Date(work.date_visited) : new Date(),
        date_completed: work.date_visited ? new Date(work.date_visited) : new Date(),
        source: 'history',
        visit_count: work.visit_count || 1,
        date_visited: work.date_visited ? new Date(work.date_visited) : new Date(),
        date_bookmarked: null,
        date_marked: null
      })));
    }

    // Process marked for later
    if (importData?.markedForLater && importData.markedForLater.length > 0) {
      console.log('Onboarding API: Processing', importData.markedForLater.length, 'marked for later works');
      allWorks.push(...importData.markedForLater.map((work: any) => ({
        id: work.id || uuidv4(),
        user_id: dbUser.id,
        title: work.title || 'Untitled',
        author: work.author || 'Unknown Author',
        author_url: work.author_url || '',
        fandom: ensureArray(work.fandoms),
        relationship: ensureArray(work.relationships),
        characters: ensureArray(work.characters),
        additional_tags: ensureArray(work.tags),
        rating: work.rating || 'NR',
        warnings: ensureArray(work.warnings).length > 0 ? ensureArray(work.warnings) : ['No Archive Warnings Apply'],
        categories: ensureArray(work.categories),
        chapters_current: parseInt(work.chapters?.split('/')[0]) || 1,
        chapters_total: parseInt(work.chapters?.split('/')[1]) || 1,
        words: parseInt(work.words) || 0,
        kudos: parseInt(work.kudos) || 0,
        hits: parseInt(work.hits) || 0,
        bookmarks: parseInt(work.bookmarks) || 0,
        published_date: work.date_marked ? new Date(work.date_marked) : new Date(),
        updated_date: new Date(),
        summary: work.summary || '',
        url: work.url || '',
        status: 'to-read',
        progress: 0,
        user_rating: null,
        user_notes: `Imported from marked for later on ${new Date().toISOString()}`,
        date_added: new Date(),
        date_started: null,
        date_completed: null,
        source: 'marked-for-later',
        visit_count: 1,
        date_visited: null,
        date_bookmarked: null,
        date_marked: work.date_marked ? new Date(work.date_marked) : new Date()
      })));
    }

    // Remove duplicates based on work ID
    const uniqueWorks = allWorks.reduce((acc: any[], current: any) => {
      const existing = acc.find((work: any) => work.id === current.id);
      if (!existing) {
        acc.push(current);
      } else {
        // If duplicate, prefer the one with higher priority status
        const statusPriority: Record<string, number> = { 'completed': 3, 'reading': 2, 'want-to-read': 1, 'to-read': 0 };
        if (statusPriority[current.status] > statusPriority[existing.status]) {
          const index = acc.indexOf(existing);
          acc[index] = current;
        }
      }
      return acc;
    }, [] as any[]);

    console.log('Onboarding API: Processing', uniqueWorks.length, 'unique works from multi-file import');

    if (!dbUser || !dbUser.id) {
      console.log('Onboarding API: dbUser is null or missing id');
      return NextResponse.json({ 
        success: false, 
        error: 'Database user not properly created' 
      }, { status: 500 });
    }

    // Save works to database - use only the new works table
    const batchSize = 50;
    let processedCount = 0;

    console.log('Onboarding API: About to save', uniqueWorks.length, 'works to database');

    for (let i = 0; i < uniqueWorks.length; i += batchSize) {
      const batch = uniqueWorks.slice(i, i + batchSize);
      
      console.log('Onboarding API: Processing batch', i / batchSize + 1, 'with', batch.length, 'works');
      console.log('Onboarding API: Sample work from batch:', JSON.stringify(batch[0], null, 2));

      // Insert works directly into the works table (new schema)
      const { data: worksData, error: worksError } = await supabase
        .from('works')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: false })
        .select();

      if (worksError) {
        console.error(`Onboarding API: Failed to insert works batch ${i / batchSize + 1}:`, worksError);
        console.error('Onboarding API: Error details:', JSON.stringify(worksError, null, 2));
        continue; // Skip this batch if works fail
      }

      console.log(`Onboarding API: Successfully inserted batch ${i / batchSize + 1}:`, worksData?.length || 0, 'works');

      if (worksData && worksData.length > 0) {
        processedCount += worksData.length;
      }
    }

    console.log('Onboarding API: Saved', processedCount, 'works to database via multi-file import');

    // Create default shelves
    try {
      await supabase.rpc('create_default_shelves_for_user', { user_uuid: dbUser.id });
      console.log('Onboarding API: Created default shelves for user');
    } catch (error) {
      console.log('Onboarding API: Failed to create default shelves:', error);
      // Fallback: create shelves manually
      try {
        const defaultShelves = [
          { id: uuidv4(), user_id: dbUser.id, name: 'Currently Reading', is_default: true },
          { id: uuidv4(), user_id: dbUser.id, name: 'Want to Read', is_default: true },
          { id: uuidv4(), user_id: dbUser.id, name: 'Completed', is_default: true },
          { id: uuidv4(), user_id: dbUser.id, name: 'Favorites', is_default: true },
          { id: uuidv4(), user_id: dbUser.id, name: 'Dropped', is_default: true }
        ];
        
        await supabase.from('shelves').insert(defaultShelves);
        console.log('Onboarding API: Created default shelves manually');
      } catch (shelfError) {
        console.log('Onboarding API: Failed to create shelves manually:', shelfError);
      }
    }

    // Create session
    let sessionId;
    try {
      sessionId = await SimpleAuth.createSession(user);
      console.log('Onboarding API: Session created:', sessionId);
    } catch (error) {
      console.log('Onboarding API: Failed to create session:', error);
      sessionId = `session_${username}_${Date.now()}`;
    }

    console.log('Onboarding API: Multi-file import completed successfully for:', username);

    // Create response
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

      response.cookies.set('sessionId', sessionId, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
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

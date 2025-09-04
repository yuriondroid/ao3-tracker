import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SimpleAuth } from '@/lib/simple-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No session found' 
      }, { status: 401 });
    }

    const user = await SimpleAuth.getUserFromSession(sessionId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid session' 
      }, { status: 401 });
    }

    console.log('Library API: Fetching library for user:', user.name);

    // Try to fetch from works table first (new schema)
    let { data: works, error: worksError } = await supabase
      .from('works')
      .select('*')
      .eq('user_id', user.id)
      .order('date_added', { ascending: false });

    if (worksError) {
      console.log('Library API: Works table not found, trying old schema:', worksError);
      
      // Fallback to old schema (fanworks + user_library)
      const { data: libraryEntries, error: libraryError } = await supabase
        .from('user_library')
        .select(`
          *,
          fanworks (*)
        `)
        .eq('user_id', user.id)
        .order('date_added', { ascending: false });

      if (libraryError) {
        console.error('Library API: Failed to fetch library:', libraryError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to fetch library' 
        }, { status: 500 });
      }

      // Transform old schema format to new format
      works = libraryEntries?.map(entry => ({
        id: entry.fanwork_id,
        user_id: entry.user_id,
        title: entry.fanworks?.title || 'Unknown Title',
        author: entry.fanworks?.author || 'Unknown Author',
        author_url: entry.fanworks?.author_url || '',
        fandom: entry.fanworks?.fandom || [],
        relationship: entry.fanworks?.relationship || [],
        characters: entry.fanworks?.characters || [],
        additional_tags: entry.fanworks?.additional_tags || [],
        rating: entry.fanworks?.rating || 'NR',
        warnings: entry.fanworks?.warnings || [],
        categories: entry.fanworks?.categories || [],
        chapters_current: entry.fanworks?.chapters_current || 1,
        chapters_total: entry.fanworks?.chapters_total || 1,
        words: entry.fanworks?.words || 0,
        kudos: entry.fanworks?.kudos || 0,
        hits: entry.fanworks?.hits || 0,
        bookmarks: entry.fanworks?.bookmarks || 0,
        comments: entry.fanworks?.comments || 0,
        published_date: entry.fanworks?.published_date,
        updated_date: entry.fanworks?.updated_date,
        summary: entry.fanworks?.summary || '',
        url: entry.fanworks?.url || '',
        status: entry.reading_status,
        progress: entry.progress_percentage || 0,
        user_rating: entry.user_rating,
        user_notes: entry.private_notes || '',
        shelf_id: entry.shelf_id,
        date_added: entry.date_added,
        date_started: entry.date_started,
        date_completed: entry.date_completed,
        source: entry.source || 'unknown',
        visit_count: entry.visit_count || 1,
        date_visited: entry.last_read,
        date_bookmarked: entry.date_bookmarked,
        date_marked: entry.date_marked
      })) || [];
    }

    console.log('Library API: Found', works?.length || 0, 'works for user:', user.name);

    return NextResponse.json({
      success: true,
      library: works || [],
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ao3Username: user.ao3Username
      }
    });

  } catch (error) {
    console.error('Library API: Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}


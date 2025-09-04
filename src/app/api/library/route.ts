import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SimpleAuth } from '@/lib/simple-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const sessionId = request.cookies.get('sessionId')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No session found' 
      }, { status: 401 });
    }

    // Get user from session
    const user = SimpleAuth.getUserFromSession(sessionId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid session' 
      }, { status: 401 });
    }

    // Get user ID from database
    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('ao3_username', user.ao3Username)
      .single();

    if (!dbUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found in database' 
      }, { status: 404 });
    }

    const userId = dbUser.id;

    // Fetch library data from database
    const { data: libraryEntries, error } = await supabase
      .from('user_library')
      .select(`
        *,
        fanworks (*)
      `)
      .eq('user_id', userId)
      .order('date_added', { ascending: false });

    if (error) {
      console.error('Failed to fetch works:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch library data' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      library: libraryEntries || []
    });

  } catch (error) {
    console.error('Library API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Get user ID from session (you'll need to implement this based on your session system)
    // For now, we'll use a placeholder - you should get this from your session
    const userId = 'placeholder-user-id'; // Replace with actual user ID from session

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


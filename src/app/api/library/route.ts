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
    const user = await SimpleAuth.getUserFromSession(sessionId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid session' 
      }, { status: 401 });
    }

    const userId = user.id;

    // Fetch works directly from the works table
    const { data: works, error } = await supabase
      .from('works')
      .select('*')
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
      library: works || []
    });

  } catch (error) {
    console.error('Library API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}


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

    // Fetch from works table (new schema)
    const { data: works, error: worksError } = await supabase
      .from('works')
      .select('*')
      .eq('user_id', user.id)
      .order('date_added', { ascending: false });

    if (worksError) {
      console.error('Library API: Failed to fetch works:', worksError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch library' 
      }, { status: 500 });
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


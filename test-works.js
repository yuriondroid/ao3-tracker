require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testWorksTable() {
  try {
    console.log('Testing works table...');
    
    // Test if works table exists
    const { data: works, error } = await supabase
      .from('works')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Works table error:', error);
      console.log('Works table does not exist or has issues');
      
      // Try to create a simple test work
      const testWork = {
        id: 'test-work-' + Date.now(),
        user_id: 'test-user-id',
        title: 'Test Work',
        author: 'Test Author',
        words: 1000,
        status: 'to-read',
        source: 'test'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('works')
        .insert(testWork)
        .select()
        .single();
      
      if (insertError) {
        console.error('Failed to insert test work:', insertError);
      } else {
        console.log('Successfully inserted test work:', insertData);
        
        // Clean up
        await supabase
          .from('works')
          .delete()
          .eq('id', testWork.id);
      }
    } else {
      console.log('Works table exists and is accessible');
      console.log('Sample work:', works[0] || 'No works found');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWorksTable();

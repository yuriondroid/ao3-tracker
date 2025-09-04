require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
    } else {
      console.log('Database connection successful!');
    }
    
    // Check what columns exist in users table
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });
    
    if (columnsError) {
      console.log('Could not get columns, trying simple query...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (simpleError) {
        console.error('Simple query error:', simpleError);
      } else {
        console.log('Simple query successful, columns:', Object.keys(simpleData[0] || {}));
      }
    } else {
      console.log('Table columns:', columns);
    }
    
    // Test user creation with minimal fields
    const testUser = {
      id: 'test-' + Date.now(),
      email: 'test@example.com',
      username: 'testuser'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (insertError) {
      console.error('User creation error:', insertError);
    } else {
      console.log('User creation successful:', insertData);
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);
      
      console.log('Test user cleaned up');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabase();

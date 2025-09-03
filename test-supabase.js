const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wbalwxecdjlyvrpvrbcv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYWx3eGVjZGpseXZycHZyYmN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjMwMjEsImV4cCI6MjA3MjQ5OTAyMX0.kwA_6V49jKl4SQZGnq4vykox3C7Qpa1x_X5DX6QosrU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
    } else {
      console.log('Supabase connection successful!')
      console.log('Data:', data)
    }
  } catch (err) {
    console.error('Connection failed:', err.message)
  }
}

testConnection()

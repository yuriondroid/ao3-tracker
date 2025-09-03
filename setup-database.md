# Database Setup Instructions

## Step 1: Go to Your Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard/project/wbalwxecjlyvrpvrbcv
2. Sign in to your Supabase account

## Step 2: Open SQL Editor
1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** to create a new SQL query

## Step 3: Copy and Paste the Database Schema
Copy the entire contents of the `database-schema.sql` file and paste it into the SQL editor.

## Step 4: Run the SQL Commands
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for all the SQL commands to execute successfully
3. You should see a success message

## Step 5: Verify the Tables Were Created
1. Go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   - users
   - user_preferences
   - fanworks
   - user_library
   - user_shelves
   - shelf_items
   - reading_sessions

## Step 6: Test the Application
1. Go back to your terminal
2. Run: `npm run dev`
3. Open http://localhost:3000 in your browser
4. Try logging in with your AO3 credentials

## What the Database Schema Creates:
- **users**: Stores user information and AO3 session tokens
- **fanworks**: Stores AO3 work details (title, author, fandom, etc.)
- **user_library**: Tracks which works each user has added
- **user_shelves**: Custom shelves for organizing works
- **reading_sessions**: Tracks reading progress and time spent
- **user_preferences**: User settings and blocked content

## Security Features:
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Session tokens are encrypted
- No passwords are stored, only session tokens

---

**Need Help?** If you encounter any errors, check the SQL editor for specific error messages.


# FicTracker AO3 Integration Setup Guide

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **AO3 Account**: You'll need your AO3 username and password for authentication
3. **Node.js**: Version 18 or higher

## Step 1: Set Up Supabase Database

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `database-schema.sql` into the editor
4. Run the SQL to create all tables and policies

## Step 2: Configure Environment Variables

1. In your Supabase project, go to Settings > API
2. Copy your project URL and anon key
3. Update your `.env.local` file with your actual values:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3001

# AO3 Configuration
AO3_BASE_URL=https://archiveofourown.org
```

**Important**: Generate a random string for `NEXTAUTH_SECRET`. You can use:
```bash
openssl rand -base64 32
```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Start the Development Server

```bash
npm run dev
```

## Step 5: Test the Integration

1. Open your browser to `http://localhost:3001`
2. You should see the login form
3. Enter your AO3 username and password
4. After successful authentication, you'll be redirected to the dashboard

## Step 6: Add Your First Work

1. Navigate to the "Add Fic" page
2. Paste an AO3 work URL (e.g., `https://archiveofourown.org/works/123456`)
3. Click "Add to Library"
4. The work should be scraped and added to your library

## Features Available

✅ **AO3 Authentication**: Secure login with your AO3 credentials
✅ **Work Scraping**: Automatically extract work details from AO3 URLs
✅ **Library Management**: Add, organize, and track your reading progress
✅ **Reading Status**: Mark works as want-to-read, currently reading, or completed
✅ **Progress Tracking**: Track chapter progress and reading sessions
✅ **Shelves**: Create custom shelves to organize your library
✅ **Statistics**: View reading statistics and trends

## Security Notes

- Your AO3 password is never stored - only a session token is kept
- All data is protected with Row Level Security (RLS)
- Session tokens are encrypted and stored securely
- The scraper respects AO3's robots.txt and implements rate limiting

## Troubleshooting

### Authentication Issues
- Make sure your AO3 credentials are correct
- Check that your AO3 account is active and not suspended
- Verify your environment variables are set correctly

### Database Issues
- Ensure all SQL from `database-schema.sql` was executed successfully
- Check that RLS policies are in place
- Verify your Supabase connection strings

### Scraping Issues
- Some works may be private or locked - these require a valid session
- Very large works may take longer to scrape
- Network issues can cause scraping failures

## Next Steps

1. **Customize the UI**: Modify the components to match your preferences
2. **Add More Features**: Implement bulk imports, reading goals, etc.
3. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform
4. **Scale**: Consider implementing caching and rate limiting for production

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Ensure your Supabase database is properly configured
4. Check that all dependencies are installed correctly


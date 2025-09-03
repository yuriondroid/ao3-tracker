# Complete AO3 Integration Setup Guide

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up
3. Create a new project (choose a name like "ao3-tracker")

### 1.2 Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database-schema.sql` from your project
3. Paste it into the SQL editor
4. Click **Run** to execute all the SQL commands

### 1.3 Get Your API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 2: Configure Environment Variables

### 2.1 Update .env.local
Replace the placeholder values in your `.env.local` file with your actual Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-actual-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# AO3 Configuration
AO3_BASE_URL=https://archiveofourown.org
```

### 2.2 Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and paste it as your `NEXTAUTH_SECRET`

## Step 3: Test the Application

### 3.1 Start the Development Server
```bash
npm run dev
```

### 3.2 Test Authentication
1. Open your browser to `http://localhost:3000`
2. You should see the login form
3. Enter your AO3 username and password
4. After successful login, you should see the main dashboard

### 3.3 Test Adding Works
1. Navigate to "Add Fic" in the sidebar
2. Paste an AO3 work URL (e.g., `https://archiveofourown.org/works/123456`)
3. Click "Add to Library"
4. The work should be scraped and added to your library

## Step 4: Troubleshooting Common Issues

### Issue: "Invalid URL" Error
**Solution**: Make sure your Supabase URL in `.env.local` is correct and doesn't have trailing slashes.

### Issue: Authentication Fails
**Solution**: 
1. Check that your AO3 credentials are correct
2. Ensure your AO3 account is active
3. Verify your environment variables are set correctly

### Issue: Database Errors
**Solution**: 
1. Make sure you ran the complete `database-schema.sql` file
2. Check that your Supabase keys are correct
3. Verify Row Level Security (RLS) policies are in place

### Issue: Redirect Loops
**Solution**: 
1. Clear your browser cache
2. Restart the development server
3. Check that the authentication flow is working properly

## Step 5: Production Deployment

### 5.1 Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy

### 5.2 Update Production Environment Variables
In your production environment (Vercel, etc.), update:
- `NEXTAUTH_URL` to your production URL
- `SUPABASE_URL` and keys to your production Supabase instance

## Step 6: Advanced Features

### 6.1 Bulk Import
To import all your AO3 bookmarks:
1. Navigate to "Library" page
2. Click "Import from AO3"
3. Enter your AO3 credentials
4. Wait for the import to complete

### 6.2 Custom Shelves
1. Go to "Library" page
2. Click "Create Shelf"
3. Name your shelf and choose a color
4. Add works to your shelf

### 6.3 Reading Progress
1. Open any work in your library
2. Update your reading progress
3. Mark chapters as read
4. Track your reading statistics

## Step 7: Security Notes

- Your AO3 password is never stored - only session tokens
- All data is protected with Row Level Security (RLS)
- Session tokens are encrypted and stored securely
- The scraper respects AO3's robots.txt and implements rate limiting

## Step 8: Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your environment variables
3. Ensure your Supabase database is properly configured
4. Check that all dependencies are installed correctly

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Generate NextAuth secret
openssl rand -base64 32

# Check if server is running
curl http://localhost:3000
```

## File Structure
```
ao3-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── library/route.ts
│   │   │   └── works/add/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       ├── auth.ts
│       ├── ao3-scraper.ts
│       └── supabase.ts
├── components/
│   ├── AuthProvider.tsx
│   ├── LoginForm.tsx
│   ├── Layout.tsx
│   └── FicEntryForm.tsx
├── database-schema.sql
├── .env.local
└── package.json
```

## Next Steps After Setup

1. **Customize the UI**: Modify components to match your preferences
2. **Add More Features**: Implement bulk imports, reading goals, etc.
3. **Scale**: Consider implementing caching and rate limiting for production
4. **Monitor**: Set up logging and monitoring for production use

---

**Need Help?** If you're still having issues, check the terminal logs for specific error messages and ensure all environment variables are correctly set.


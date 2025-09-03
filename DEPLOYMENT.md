# 🚀 Deployment Guide: GitHub + Vercel

This guide will help you deploy your AO3 Tracker to GitHub and Vercel, solving all the local development issues.

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Supabase project (already set up)

## 🎯 Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

1. **Install GitHub CLI** (if not already installed):
   ```bash
   # macOS
   brew install gh
   
   # Or download from: https://cli.github.com/
   ```

2. **Login to GitHub**:
   ```bash
   gh auth login
   ```

3. **Create the repository**:
   ```bash
   gh repo create ao3-tracker --public --source=. --remote=origin --push
   ```

### Option B: Manual GitHub Creation

1. **Go to GitHub.com** and create a new repository
2. **Name it**: `ao3-tracker`
3. **Make it public**
4. **Don't initialize** with README (we already have one)

5. **Add the remote and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ao3-tracker.git
   git branch -M main
   git push -u origin main
   ```

## 🚀 Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "New Project"**
3. **Import your GitHub repository**:
   - Select "Import Git Repository"
   - Choose your `ao3-tracker` repository
   - Click "Import"

4. **Configure the project**:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (leave as default)
   - **Output Directory**: `.next` (leave as default)
   - **Install Command**: `npm install` (leave as default)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://wbalwxecdljyvrpvrbcv.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiYWx3eGVjZGpseXZycHZyYmN2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjkyMzAyMSwiZXhwIjoyMDcyNDk5MDIxfQ.JLWkFbvgnXfk6U0VDUKOQ17VLKqgAakuxsTN_Klko
   PLAYWRIGHT_BROWSERS_PATH=0
   ```

6. **Deploy**:
   Click "Deploy" and wait for the build to complete

## 🔧 Step 3: Configure Supabase for Production

1. **Go to your Supabase dashboard**
2. **Navigate to Settings > API**
3. **Copy your production URL and anon key**
4. **Update Vercel environment variables** if needed

## 🎉 Step 4: Test Your Live Site

1. **Visit your Vercel URL** (something like `https://ao3-tracker-xxx.vercel.app`)
2. **Test the login flow**
3. **Try the onboarding process**
4. **Check that data is being saved to Supabase**

## 🔄 Step 5: Set Up Automatic Deployments

1. **Every time you push to GitHub**, Vercel will automatically deploy
2. **To make changes**:
   ```bash
   # Make your changes
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Vercel will automatically deploy** the new version

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Vercel build logs
   - Make sure all dependencies are in `package.json`
   - Verify environment variables are set

2. **Database Connection Issues**:
   - Verify Supabase URL and keys in Vercel
   - Check Supabase RLS policies
   - Ensure database schema is deployed

3. **Scraping Issues**:
   - Vercel has limitations with Puppeteer
   - Consider using Vercel's Edge Runtime for API routes
   - Or use external scraping services

### Vercel-Specific Optimizations:

1. **Add `vercel.json`** for better configuration:
   ```json
   {
     "functions": {
       "src/app/api/onboarding/create-account/route.ts": {
         "maxDuration": 60
       }
     }
   }
   ```

2. **Use Edge Runtime** for API routes that need longer execution:
   ```typescript
   export const runtime = 'edge'
   ```

## 🎯 Benefits of This Setup:

✅ **No more local environment issues**  
✅ **Automatic deployments on every push**  
✅ **Better error logging and debugging**  
✅ **Production-ready environment**  
✅ **Easy to share and collaborate**  
✅ **Free hosting and SSL certificates**  

## 📞 Next Steps:

1. **Test everything thoroughly** on the live site
2. **Share the URL** with others to test
3. **Monitor Vercel logs** for any issues
4. **Set up custom domain** if desired
5. **Add analytics** (Google Analytics, etc.)

Your AO3 Tracker will now be live and accessible from anywhere! 🎉

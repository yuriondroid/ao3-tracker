# AO3 Tracker - Fanfiction Reading Tracker

A modern web application for tracking your Archive of Our Own (AO3) fanfiction reading progress, discovering new stories, and managing your reading library.

## 🚀 Features

- **AO3 Integration**: Import your reading history directly from AO3
- **Reading Progress**: Track your progress through stories
- **Library Management**: Organize fics into custom shelves
- **Statistics**: View detailed reading statistics and analytics
- **Discover**: Find new stories based on your preferences
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom session-based auth
- **Web Scraping**: Puppeteer for AO3 data extraction
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- AO3 account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ao3-tracker.git
   cd ao3-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PLAYWRIGHT_BROWSERS_PATH=0
   ```

4. **Set up the database**
   - Run the SQL schema in your Supabase SQL editor
   - See `database-schema.sql` for the complete schema

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Database Schema

The application uses the following main tables:

- `users` - User accounts and preferences
- `fanworks` - AO3 works metadata
- `user_library` - User's reading progress
- `user_shelves` - Custom organization shelves
- `reading_sessions` - Reading session tracking
- `import_jobs` - Import progress tracking

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the database schema from `database-schema.sql`
3. Get your project URL and service role key
4. Add them to your environment variables

### AO3 Scraping

The application uses Puppeteer to scrape AO3 data. Make sure to:
- Respect AO3's rate limits
- Use the application responsibly
- Follow AO3's terms of service

## 🚀 Deployment

### Vercel Deployment

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Configure environment variables**
   - Add your Supabase credentials in Vercel dashboard
   - Set `PLAYWRIGHT_BROWSERS_PATH=0`

3. **Deploy**
   - Vercel will automatically deploy on every push

### Environment Variables

Required environment variables for production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PLAYWRIGHT_BROWSERS_PATH=0
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for personal use and educational purposes. Please respect AO3's terms of service and rate limits when using the scraping functionality.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/ao3-tracker/issues) page
2. Create a new issue with detailed information
3. Include your environment and steps to reproduce

## 🎯 Roadmap

- [ ] Mobile app version
- [ ] Reading time tracking
- [ ] Social features (sharing shelves)
- [ ] Advanced search and filtering
- [ ] Reading recommendations
- [ ] Export/import functionality

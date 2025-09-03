-- FicTracker Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  ao3_username TEXT UNIQUE,
  ao3_session_token TEXT, -- For accessing private works
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_fandoms TEXT[] DEFAULT '{}',
  blocked_tags TEXT[] DEFAULT '{}',
  blocked_ratings TEXT[] DEFAULT '{}',
  blocked_warnings TEXT[] DEFAULT '{}',
  preferred_ratings TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fanworks table
CREATE TABLE fanworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ao3_work_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  fandom TEXT NOT NULL,
  relationship TEXT,
  additional_tags TEXT[],
  rating TEXT,
  warnings TEXT[],
  category TEXT,
  status TEXT,
  chapters_published INTEGER,
  chapters_total INTEGER,
  word_count INTEGER,
  language TEXT DEFAULT 'English',
  published_date TIMESTAMP,
  updated_date TIMESTAMP,
  summary TEXT,
  kudos INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  hits INTEGER DEFAULT 0,
  last_scraped TIMESTAMP DEFAULT NOW()
);

-- User library entries
CREATE TABLE user_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fanwork_id UUID REFERENCES fanworks(id) ON DELETE CASCADE,
  reading_status TEXT CHECK (reading_status IN ('want-to-read', 'currently-reading', 'completed', 'dropped')),
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_chapter INTEGER DEFAULT 1,
  date_added TIMESTAMP DEFAULT NOW(),
  date_started TIMESTAMP,
  date_completed TIMESTAMP,
  last_read TIMESTAMP,
  private_notes TEXT,
  UNIQUE(user_id, fanwork_id)
);

-- User shelves
CREATE TABLE user_shelves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Shelf items
CREATE TABLE shelf_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shelf_id UUID REFERENCES user_shelves(id) ON DELETE CASCADE,
  library_entry_id UUID REFERENCES user_library(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shelf_id, library_entry_id)
);

-- Reading sessions for tracking
CREATE TABLE reading_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  library_entry_id UUID REFERENCES user_library(id) ON DELETE CASCADE,
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  chapters_read INTEGER DEFAULT 0,
  words_read INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX idx_users_ao3_username ON users(ao3_username);
CREATE INDEX idx_fanworks_ao3_work_id ON fanworks(ao3_work_id);
CREATE INDEX idx_user_library_user_id ON user_library(user_id);
CREATE INDEX idx_user_library_reading_status ON user_library(reading_status);
CREATE INDEX idx_user_shelves_user_id ON user_shelves(user_id);
CREATE INDEX idx_reading_sessions_user_id ON reading_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE fanworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelf_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Fanworks are readable by all authenticated users
CREATE POLICY "Authenticated users can view fanworks" ON fanworks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can manage fanworks" ON fanworks FOR ALL USING (auth.role() = 'service_role');

-- User library policies
CREATE POLICY "Users can view own library" ON user_library FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own library" ON user_library FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own library entries" ON user_library FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own library entries" ON user_library FOR DELETE USING (auth.uid()::text = user_id::text);

-- User shelves policies
CREATE POLICY "Users can view own shelves" ON user_shelves FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own shelves" ON user_shelves FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own shelves" ON user_shelves FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own shelves" ON user_shelves FOR DELETE USING (auth.uid()::text = user_id::text);

-- Shelf items policies
CREATE POLICY "Users can view own shelf items" ON shelf_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_shelves 
    WHERE user_shelves.id = shelf_items.shelf_id 
    AND user_shelves.user_id::text = auth.uid()::text
  )
);
CREATE POLICY "Users can manage own shelf items" ON shelf_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_shelves 
    WHERE user_shelves.id = shelf_items.shelf_id 
    AND user_shelves.user_id::text = auth.uid()::text
  )
);

-- Reading sessions policies
CREATE POLICY "Users can view own reading sessions" ON reading_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own reading sessions" ON reading_sessions FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own reading sessions" ON reading_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own reading sessions" ON reading_sessions FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

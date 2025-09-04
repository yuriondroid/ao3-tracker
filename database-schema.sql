-- AO3 Tracker Database Schema for Supabase
-- Run this in your Supabase SQL editor to replace the existing schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS reading_sessions CASCADE;
DROP TABLE IF EXISTS shelf_items CASCADE;
DROP TABLE IF EXISTS user_shelves CASCADE;
DROP TABLE IF EXISTS user_library CASCADE;
DROP TABLE IF EXISTS fanworks CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hashed password
  display_name TEXT NOT NULL,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table for authentication
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Works table (consolidated from fanworks + user_library)
CREATE TABLE works (
  id TEXT PRIMARY KEY, -- AO3 work ID
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  author_url TEXT,
  fandom TEXT[] DEFAULT '{}',
  relationship TEXT[] DEFAULT '{}',
  characters TEXT[] DEFAULT '{}',
  additional_tags TEXT[] DEFAULT '{}',
  rating TEXT,
  warnings TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  chapters_current INTEGER DEFAULT 1,
  chapters_total INTEGER DEFAULT 1,
  words INTEGER DEFAULT 0,
  language TEXT DEFAULT 'English',
  published_date TIMESTAMP,
  updated_date TIMESTAMP,
  summary TEXT,
  url TEXT,
  status TEXT DEFAULT 'to-read', -- 'reading', 'completed', 'dropped', 'to-read', 'want-to-read'
  progress INTEGER DEFAULT 0, -- percentage read
  user_rating INTEGER CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)), -- 1-5 stars
  user_notes TEXT,
  shelf_id TEXT,
  date_added TIMESTAMP DEFAULT NOW(),
  date_started TIMESTAMP,
  date_completed TIMESTAMP,
  source TEXT, -- 'bookmarks', 'history', 'marked-for-later'
  visit_count INTEGER DEFAULT 1,
  date_visited TIMESTAMP,
  date_bookmarked TIMESTAMP,
  date_marked TIMESTAMP
);

-- Shelves table for custom organization
CREATE TABLE shelves (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reading sessions for tracking progress
CREATE TABLE reading_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  work_id TEXT REFERENCES works(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  words_read INTEGER,
  time_spent INTEGER, -- minutes
  progress_before INTEGER,
  progress_after INTEGER
);

-- Import jobs for tracking import progress
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'importing_works', 'completed', 'failed'
  total_works INTEGER DEFAULT 0,
  processed_works INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Create default shelves for new users
CREATE OR REPLACE FUNCTION create_default_shelves_for_user(user_uuid UUID) RETURNS void AS $$
BEGIN
  INSERT INTO shelves (id, user_id, name, is_default) VALUES 
    (gen_random_uuid()::text, user_uuid, 'Currently Reading', true),
    (gen_random_uuid()::text, user_uuid, 'Want to Read', true),
    (gen_random_uuid()::text, user_uuid, 'Completed', true),
    (gen_random_uuid()::text, user_uuid, 'Favorites', true),
    (gen_random_uuid()::text, user_uuid, 'Dropped', true);
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own works" ON works FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own works" ON works FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own works" ON works FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own works" ON works FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own shelves" ON shelves FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own shelves" ON shelves FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own shelves" ON shelves FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own shelves" ON shelves FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own reading sessions" ON reading_sessions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own reading sessions" ON reading_sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own reading sessions" ON reading_sessions FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own reading sessions" ON reading_sessions FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own import jobs" ON import_jobs FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own import jobs" ON import_jobs FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own import jobs" ON import_jobs FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_works_user_id ON works(user_id);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
CREATE INDEX IF NOT EXISTS idx_works_date_added ON works(date_added);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_shelves_user_id ON shelves(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id ON import_jobs(user_id);

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

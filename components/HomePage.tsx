'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Heart, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Bookmark,
  Eye
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Work {
  id: string;
  title: string;
  author: string;
  words: number;
  status: string;
  source: string;
  date_added: string;
  kudos: number;
  hits: number;
  bookmarks: number;
}

interface Stats {
  totalWorks: number;
  totalWords: number;
  currentlyReading: number;
  completed: number;
  wantToRead: number;
  bookmarks: number;
  markedForLater: number;
  totalKudos: number;
  totalHits: number;
  totalBookmarks: number;
}

const HomePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWorks: 0,
    totalWords: 0,
    currentlyReading: 0,
    completed: 0,
    wantToRead: 0,
    bookmarks: 0,
    markedForLater: 0,
    totalKudos: 0,
    totalHits: 0,
    totalBookmarks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user session
        const sessionResponse = await fetch('/api/session');
        const sessionData = await sessionResponse.json();

        if (sessionData.authenticated) {
          setUser(sessionData.user);
          
          // Fetch library data
          const libraryResponse = await fetch('/api/library');
          const libraryData = await libraryResponse.json();
          
          if (libraryData.success && libraryData.works) {
            setWorks(libraryData.works);
            
            // Calculate stats
            const calculatedStats: Stats = {
              totalWorks: libraryData.works.length,
              totalWords: libraryData.works.reduce((sum: number, work: Work) => sum + (work.words || 0), 0),
              currentlyReading: libraryData.works.filter((work: Work) => work.status === 'reading').length,
              completed: libraryData.works.filter((work: Work) => work.status === 'completed').length,
              wantToRead: libraryData.works.filter((work: Work) => work.status === 'want-to-read').length,
              bookmarks: libraryData.works.filter((work: Work) => work.source === 'bookmarks').length,
              markedForLater: libraryData.works.filter((work: Work) => work.source === 'marked-for-later').length,
              totalKudos: libraryData.works.reduce((sum: number, work: Work) => sum + (work.kudos || 0), 0),
              totalHits: libraryData.works.reduce((sum: number, work: Work) => sum + (work.hits || 0), 0),
              totalBookmarks: libraryData.works.reduce((sum: number, work: Work) => sum + (work.bookmarks || 0), 0)
            };
            
            setStats(calculatedStats);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const recentWorks = works.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.displayName || user?.username || 'User'}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your AO3 library
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Works</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Currently Reading</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentlyReading}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Heart className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Want to Read</p>
              <p className="text-2xl font-bold text-gray-900">{stats.wantToRead}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Words Read</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bookmarks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bookmarks}</p>
            </div>
            <Bookmark className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Marked for Later</p>
              <p className="text-2xl font-bold text-gray-900">{stats.markedForLater}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Works</h2>
        </div>
        <div className="p-6">
          {recentWorks.length > 0 ? (
            <div className="space-y-4">
              {recentWorks.map((work) => (
                <div key={work.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{work.title}</h3>
                    <p className="text-sm text-gray-600">by {work.author}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{work.words.toLocaleString()} words</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded ${
                        work.status === 'completed' ? 'bg-green-100 text-green-800' :
                        work.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                        work.status === 'want-to-read' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {work.status}
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded ${
                        work.source === 'bookmarks' ? 'bg-green-100 text-green-800' :
                        work.source === 'marked-for-later' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {work.source === 'bookmarks' ? 'Bookmarks' :
                         work.source === 'marked-for-later' ? 'Marked for Later' :
                         'History'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{work.kudos}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{work.hits}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No works imported yet</p>
              <p className="text-sm text-gray-500">Import your AO3 data to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
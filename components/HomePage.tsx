// src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  Clock,
  Star,
  Users,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface Work {
  id: string;
  title: string;
  author: string;
  fandom: string;
  rating?: number;
  status: string;
  progress?: number;
  chapters?: string;
  wordCount?: number;
  kudos?: number;
  hits?: number;
  bookmarks?: number;
  comments?: number;
  publishedDate?: Date;
  updatedDate?: Date;
}

interface Stats {
  totalFics: number;
  wordsRead: number;
  currentlyReading: number;
  favorites: number;
  completed: number;
  totalKudos: number;
  totalHits: number;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalFics: 0,
    wordsRead: 0,
    currentlyReading: 0,
    favorites: 0,
    completed: 0,
    totalKudos: 0,
    totalHits: 0
  });
  const [recentActivity, setRecentActivity] = useState<Work[]>([]);
  const [currentlyReading, setCurrentlyReading] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get user's works from the session
      const sessionResponse = await fetch('/api/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.user) {
        console.log('No user session found');
        return;
      }

      const userId = sessionData.user.id;
      
      // Fetch real data from the database
      const libraryResponse = await fetch('/api/library');
      const libraryData = await libraryResponse.json();
      
      if (!libraryData.library) {
        console.log('No library data found');
        return;
      }

      // Convert database format to Work interface
      const realWorks: Work[] = libraryData.library.map((entry: any) => ({
        id: entry.fanwork_id,
        title: entry.fanworks?.title || 'Unknown Title',
        author: entry.fanworks?.author || 'Unknown Author',
        fandom: entry.fanworks?.fandom || 'Unknown Fandom',
        status: entry.reading_status || 'to-read',
        progress: entry.progress_percentage || 0,
        chapters: `${entry.current_chapter || 1}/${entry.fanworks?.chapters_total || '?'}`,
        wordCount: entry.fanworks?.word_count || 0,
        kudos: entry.fanworks?.kudos || 0,
        hits: entry.fanworks?.hits || 0,
        bookmarks: entry.fanworks?.bookmarks || 0,
        comments: entry.fanworks?.comments || 0,
        publishedDate: entry.fanworks?.published_date ? new Date(entry.fanworks.published_date) : undefined,
        updatedDate: entry.fanworks?.updated_date ? new Date(entry.fanworks.updated_date) : undefined
      }));

      // Calculate real stats from the database
      const calculatedStats: Stats = {
        totalFics: realWorks.length,
        wordsRead: realWorks.reduce((sum, work) => sum + (work.wordCount || 0), 0),
        currentlyReading: realWorks.filter(w => w.status === 'currently-reading').length,
        favorites: realWorks.filter(w => w.status === 'bookmarked').length,
        completed: realWorks.filter(w => w.status === 'completed').length,
        totalKudos: realWorks.reduce((sum, work) => sum + (work.kudos || 0), 0),
        totalHits: realWorks.reduce((sum, work) => sum + (work.hits || 0), 0)
      };

      setStats(calculatedStats);
      setCurrentlyReading(realWorks.filter(w => w.status === 'currently-reading').slice(0, 3));
      setRecentActivity(realWorks.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back! 📖
        </h1>
        <p className="text-gray-600">
          Ready to dive into your next great read?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Fics</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalFics}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Words Read</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.wordsRead.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Reading</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.currentlyReading}</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Favorites</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
        </div>
      </div>

      {/* Currently Reading */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Currently Reading</h2>
          <Link href="/library" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {currentlyReading.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentlyReading.map((fic) => (
              <div key={fic.id} className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-1">{fic.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {fic.author}</p>
                <p className="text-xs text-gray-500 mb-3">{fic.fandom}</p>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{fic.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fic.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{fic.chapters}</span>
                  <span>{fic.wordCount?.toLocaleString()} words</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No works in progress</h3>
            <p className="text-gray-600 mb-4">Start reading something from your library!</p>
            <Link href="/library" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Browse Library
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/library" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          {recentActivity.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">by {activity.author}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{activity.fandom}</p>
                    <p className="text-xs text-gray-400">Added recently</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/add" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add New Work</h3>
              <p className="text-sm text-gray-600">Manually add a fic to your library</p>
            </div>
          </div>
        </Link>

        <Link href="/discover" className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Discover</h3>
              <p className="text-sm text-gray-600">Find new works to read</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
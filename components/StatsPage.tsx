'use client';

// src/components/StatsPage.tsx
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BookOpen, 
  Clock, 
  Star, 
  TrendingUp, 
  Calendar,
  Target,
  Award,
  Heart
} from 'lucide-react';

interface StatsData {
  period: 'week' | 'month' | 'year';
  ficsRead: number;
  wordsRead: number;
  averageRating: number;
  readingStreak: number;
}

const StatsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock stats data
  const statsData: Record<string, StatsData> = {
    week: {
      period: 'week',
      ficsRead: 3,
      wordsRead: 145000,
      averageRating: 4.2,
      readingStreak: 5
    },
    month: {
      period: 'month',
      ficsRead: 12,
      wordsRead: 580000,
      averageRating: 4.1,
      readingStreak: 15
    },
    year: {
      period: 'year',
      ficsRead: 89,
      wordsRead: 4200000,
      averageRating: 4.3,
      readingStreak: 45
    }
  };

  // Mock chart data
  const topFandoms = [
    { name: 'Harry Potter', count: 25, words: 1200000 },
    { name: 'Marvel', count: 18, words: 890000 },
    { name: 'Sherlock Holmes', count: 15, words: 750000 },
    { name: 'My Hero Academia', count: 12, words: 580000 },
    { name: 'Supernatural', count: 10, words: 420000 },
    { name: 'Star Wars', count: 9, words: 380000 }
  ];

  const topShips = [
    { name: 'Harry Potter/Draco Malfoy', count: 15, percentage: 35 },
    { name: 'Steve Rogers/Bucky Barnes', count: 12, percentage: 28 },
    { name: 'Sherlock Holmes/John Watson', count: 8, percentage: 19 },
    { name: 'Bakugou Katsuki/Midoriya Izuku', count: 5, percentage: 12 },
    { name: 'Dean Winchester/Castiel', count: 3, percentage: 6 }
  ];

  const readingActivity = [
    { month: 'Jan', fics: 8, words: 320000 },
    { month: 'Feb', fics: 6, words: 280000 },
    { month: 'Mar', fics: 10, words: 450000 },
    { month: 'Apr', fics: 12, words: 520000 },
    { month: 'May', fics: 9, words: 380000 },
    { month: 'Jun', fics: 15, words: 620000 },
    { month: 'Jul', fics: 11, words: 490000 },
    { month: 'Aug', fics: 13, words: 580000 },
    { month: 'Sep', fics: 5, words: 220000 }
  ];

  const ratingDistribution = [
    { rating: '5 Stars', count: 35, color: '#10B981' },
    { rating: '4 Stars', count: 28, color: '#3B82F6' },
    { rating: '3 Stars', count: 18, color: '#F59E0B' },
    { rating: '2 Stars', count: 6, color: '#EF4444' },
    { rating: '1 Star', count: 2, color: '#6B7280' }
  ];

  const currentStats = statsData[selectedPeriod];

  const StatCard: React.FC<{ 
    icon: React.ComponentType<{ className?: string }>; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    color: string;
  }> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Reading Stats</h1>
        
        {/* Period Selector */}
        <div className="flex bg-white border rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          title="Fics Read"
          value={currentStats.ficsRead}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          title="Words Read"
          value={currentStats.wordsRead.toLocaleString()}
          color="bg-green-500"
        />
        <StatCard
          icon={Star}
          title="Average Rating"
          value={currentStats.averageRating}
          subtitle="out of 5 stars"
          color="bg-yellow-500"
        />
        <StatCard
          icon={Target}
          title="Reading Streak"
          value={`${currentStats.readingStreak} days`}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Fandoms Chart */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Fandoms</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topFandoms} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Ships */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Ships/Pairings</h2>
          <div className="space-y-4">
            {topShips.map((ship, index) => (
              <div key={ship.name} className="flex items-center">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {ship.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${ship.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">{ship.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reading Activity Over Time */}
        <div className="lg:col-span-2 bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reading Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readingActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="fics" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                name="Fics Read"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rating Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={ratingDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
              >
                {ratingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.rating}</span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reading Goals Section */}
      <div className="mt-8 bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">2024 Reading Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#10B981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 89/100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">89%</span>
              </div>
            </div>
            <p className="font-medium text-gray-900">Fics Goal</p>
            <p className="text-sm text-gray-600">89 of 100 fics</p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 4200000/5000000)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">84%</span>
              </div>
            </div>
            <p className="font-medium text-gray-900">Words Goal</p>
            <p className="text-sm text-gray-600">4.2M of 5M words</p>
          </div>

          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#8B5CF6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - 15/20)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">75%</span>
              </div>
            </div>
            <p className="font-medium text-gray-900">New Authors</p>
            <p className="text-sm text-gray-600">15 of 20 authors</p>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mt-8 bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="font-medium text-gray-900">Speed Reader</p>
              <p className="text-sm text-gray-600">Read 5 fics in one week</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Heart className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Fandom Explorer</p>
              <p className="text-sm text-gray-600">Read from 10 different fandoms</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Consistent Reader</p>
              <p className="text-sm text-gray-600">45-day reading streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;

'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Heart,
  Star,
  Clock,
  Users,
  Filter,
  X,
  Settings,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Fic {
  id: string;
  title: string;
  author: string;
  fandom: string;
  relationship: string;
  wordCount: number;
  chapters: string;
  status: 'Complete' | 'In Progress' | 'Abandoned';
  rating: 'G' | 'T' | 'M' | 'E' | 'NR';
  warnings: string[];
  tags: string[];
  summary: string;
  kudos: number;
  bookmarks: number;
  lastUpdated: string;
  url: string;
  recommendationReason: string;
}

interface BlockedContent {
  fandoms: string[];
  tags: string[];
  ratings: string[];
  warnings: string[];
}

const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('for-you');
  const [showFilters, setShowFilters] = useState(false);
  const [blockedContent, setBlockedContent] = useState<BlockedContent>({
    fandoms: ['Attack on Titan'],
    tags: ['Major Character Death', 'Graphic Violence'],
    ratings: [],
    warnings: ['Graphic Depictions Of Violence']
  });

  // Mock user reading history for recommendations
  const userReadingHistory = {
    topFandoms: ['Harry Potter', 'Marvel', 'Sherlock Holmes'],
    topShips: ['Harry Potter/Draco Malfoy', 'Steve Rogers/Bucky Barnes', 'Sherlock Holmes/John Watson'],
    favoriteGenres: ['Enemies to Lovers', 'Hurt/Comfort', 'Slow Burn', 'Angst with Happy Ending'],
    avgRating: 4.2,
    preferredLength: 'medium' // short (<10k), medium (10k-50k), long (50k+)
  };

  // Mock recommendations data
  const [recommendations] = useState<Fic[]>([
    {
      id: '1',
      title: 'The Phoenix and the Dragon',
      author: 'MysticalWriter',
      fandom: 'Harry Potter',
      relationship: 'Harry Potter/Draco Malfoy',
      wordCount: 85000,
      chapters: '20/20',
      status: 'Complete',
      rating: 'M',
      warnings: [],
      tags: ['Enemies to Lovers', 'Auror Harry', 'Malfoy Redemption', 'Slow Burn'],
      summary: 'Post-war Harry and Draco are forced to work together...',
      kudos: 12450,
      bookmarks: 3200,
      lastUpdated: '2024-08-15',
      url: 'https://archiveofourown.org/works/rec1',
      recommendationReason: 'Based on your love of Enemies to Lovers and Harry/Draco'
    },
    {
      id: '2',
      title: 'Winter&apos;s End',
      author: 'FrostWriter',
      fandom: 'Marvel',
      relationship: 'Steve Rogers/Bucky Barnes',
      wordCount: 65000,
      chapters: '15/15',
      status: 'Complete',
      rating: 'T',
      warnings: [],
      tags: ['Hurt/Comfort', 'PTSD', 'Recovery', 'Found Family'],
      summary: 'Bucky\'s journey to healing after the Winter Soldier...',
      kudos: 8900,
      bookmarks: 2100,
      lastUpdated: '2024-08-20',
      url: 'https://archiveofourown.org/works/rec2',
      recommendationReason: 'You rated similar Stucky hurt/comfort fics highly'
    }
  ]);

  const [crossFandomRecs] = useState<Fic[]>([
    {
      id: '3',
      title: 'The Detective\'s Heart',
      author: 'MysteryLover',
      fandom: 'BBC Sherlock',
      relationship: 'Sherlock Holmes/John Watson',
      wordCount: 45000,
      chapters: '12/12',
      status: 'Complete',
      rating: 'M',
      warnings: [],
      tags: ['Slow Burn', 'Case Fic', 'First Kiss', 'Emotional Hurt/Comfort'],
      summary: 'A particularly difficult case forces Sherlock to confront...',
      kudos: 6700,
      bookmarks: 1800,
      lastUpdated: '2024-08-10',
      url: 'https://archiveofourown.org/works/rec3',
      recommendationReason: 'Fans of enemies-to-lovers also love this slow burn'
    },
    {
      id: '4',
      title: 'Under Neon Lights',
      author: 'CyberpunkFan',
      fandom: 'Cyberpunk 2077',
      relationship: 'V/Johnny Silverhand',
      wordCount: 72000,
      chapters: '18/18',
      status: 'Complete',
      rating: 'E',
      warnings: [],
      tags: ['Enemies to Lovers', 'Slow Burn', 'Angst with Happy Ending'],
      summary: 'In Night City, trust is a luxury few can afford...',
      kudos: 4200,
      bookmarks: 950,
      lastUpdated: '2024-08-25',
      url: 'https://archiveofourown.org/works/rec4',
      recommendationReason: 'New fandom with your favorite tropes'
    }
  ]);

  const [trendingFics] = useState<Fic[]>([
    {
      id: '5',
      title: 'The Last Dance',
      author: 'PopularAuthor',
      fandom: 'The Witcher',
      relationship: 'Geralt of Rivia/Jaskier | Dandelion',
      wordCount: 120000,
      chapters: '25/25',
      status: 'Complete',
      rating: 'E',
      warnings: [],
      tags: ['Slow Burn', 'Mutual Pining', 'Hurt/Comfort', 'Happy Ending'],
      summary: 'Years of traveling together have led to this moment...',
      kudos: 15600,
      bookmarks: 4100,
      lastUpdated: '2024-09-01',
      url: 'https://archiveofourown.org/works/trending1',
      recommendationReason: 'Trending this week with 500+ new kudos'
    }
  ]);

  const tabs = [
    { id: 'for-you', label: 'For You', count: recommendations.length },
    { id: 'cross-fandom', label: 'New Fandoms', count: crossFandomRecs.length },
    { id: 'trending', label: 'Trending', count: trendingFics.length },
    { id: 'friends', label: 'Friends Activity', count: 8 }
  ];

  const ratings = ['G', 'T', 'M', 'E', 'NR'];
  const commonWarnings = [
    'Graphic Depictions Of Violence',
    'Major Character Death',
    'Rape/Non-Con',
    'Underage'
  ];

  const addToBlocked = (category: keyof BlockedContent, item: string) => {
    setBlockedContent(prev => ({
      ...prev,
      [category]: [...prev[category], item]
    }));
  };

  const removeFromBlocked = (category: keyof BlockedContent, item: string) => {
    setBlockedContent(prev => ({
      ...prev,
      [category]: prev[category].filter(i => i !== item)
    }));
  };

  const FicRecommendationCard: React.FC<{ fic: Fic }> = ({ fic }) => (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{fic.title}</h3>
            <p className="text-sm text-gray-600">by {fic.author}</p>
          </div>
          <button className="text-gray-400 hover:text-red-500 ml-2">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-2">
          <p className="text-sm text-purple-600 font-medium">{fic.fandom}</p>
          <p className="text-sm text-gray-700">{fic.relationship}</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>{fic.wordCount.toLocaleString()} words</span>
          <span>•</span>
          <span>{fic.chapters}</span>
          <span>•</span>
          <span className={`px-2 py-1 rounded ${
            fic.status === 'Complete' ? 'bg-green-100 text-green-800' :
            fic.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {fic.status}
          </span>
          <span>•</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
            {fic.rating}
          </span>
        </div>

        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{fic.summary}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {fic.kudos.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {fic.bookmarks.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {fic.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {tag}
            </span>
          ))}
          {fic.tags.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500">+{fic.tags.length - 3} more</span>
          )}
        </div>

        <div className="border-t pt-3">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 font-medium">{fic.recommendationReason}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors">
            Add to Library
          </button>
          <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
            Preview
          </button>
        </div>
      </div>
    </div>
  );

  const BlockedContentManager: React.FC = () => {
    const [newBlockedItem, setNewBlockedItem] = useState('');
    const [blockCategory, setBlockCategory] = useState<keyof BlockedContent>('tags');

    const handleAddBlocked = () => {
      if (newBlockedItem.trim()) {
        addToBlocked(blockCategory, newBlockedItem.trim());
        setNewBlockedItem('');
      }
    };

    return (
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Content Filters
        </h3>
        
        {/* Add new blocked item */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <select
              value={blockCategory}
              onChange={(e) => setBlockCategory(e.target.value as keyof BlockedContent)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="fandoms">Fandoms</option>
              <option value="tags">Tags</option>
              <option value="ratings">Ratings</option>
              <option value="warnings">Warnings</option>
            </select>
            <input
              type="text"
              placeholder="Add item to block..."
              value={newBlockedItem}
              onChange={(e) => setNewBlockedItem(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddBlocked()}
            />
            <button
              onClick={handleAddBlocked}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
            >
              Block
            </button>
          </div>
        </div>

        {/* Quick rating filters */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Maturity Ratings</h4>
          <div className="flex gap-2 flex-wrap">
            {ratings.map(rating => (
              <button
                key={rating}
                onClick={() => blockedContent.ratings.includes(rating) 
                  ? removeFromBlocked('ratings', rating)
                  : addToBlocked('ratings', rating)
                }
                className={`px-3 py-1 text-sm rounded-full border ${
                  blockedContent.ratings.includes(rating)
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {blockedContent.ratings.includes(rating) && <X className="w-3 h-3 inline mr-1" />}
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Quick warning filters */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Content Warnings</h4>
          <div className="flex gap-2 flex-wrap">
            {commonWarnings.map(warning => (
              <button
                key={warning}
                onClick={() => blockedContent.warnings.includes(warning) 
                  ? removeFromBlocked('warnings', warning)
                  : addToBlocked('warnings', warning)
                }
                className={`px-3 py-1 text-sm rounded-full border ${
                  blockedContent.warnings.includes(warning)
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {blockedContent.warnings.includes(warning) && <X className="w-3 h-3 inline mr-1" />}
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                {warning.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Blocked items display */}
        {Object.entries(blockedContent).map(([category, items]) => 
          items.length > 0 && (
            <div key={category} className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                Blocked {category}
              </h4>
              <div className="flex gap-2 flex-wrap">
                {items.map((item: string) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                  >
                    {item}
                    <button
                      onClick={() => removeFromBlocked(category as keyof BlockedContent, item)}
                      className="hover:text-red-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'for-you':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Recommended for You</h2>
              <p className="text-gray-600">Based on your reading history and preferences</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(fic => (
                <FicRecommendationCard key={fic.id} fic={fic} />
              ))}
            </div>
          </div>
        );
      
      case 'cross-fandom':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Explore New Fandoms</h2>
              <p className="text-gray-600">Discover great fics in fandoms you haven&apos;t explored yet</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crossFandomRecs.map(fic => (
                <FicRecommendationCard key={fic.id} fic={fic} />
              ))}
            </div>
          </div>
        );

      case 'trending':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Trending This Week</h2>
              <p className="text-gray-600">Popular fics that are gaining traction</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingFics.map(fic => (
                <FicRecommendationCard key={fic.id} fic={fic} />
              ))}
            </div>
          </div>
        );

      case 'friends':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Friends Activity</h2>
              <p className="text-gray-600">See what your friends are reading</p>
            </div>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No friend activity yet</h3>
              <p className="text-gray-600">Connect with friends to see their reading activity here</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Discover</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          {/* Reading Preferences Summary */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Your Reading Profile</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Favorite Fandoms:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userReadingHistory.topFandoms.slice(0, 2).map(fandom => (
                    <span key={fandom} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {fandom}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Favorite Tropes:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {userReadingHistory.favoriteGenres.slice(0, 2).map(genre => (
                    <span key={genre} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Average Rating: </span>
                <div className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{userReadingHistory.avgRating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && <BlockedContentManager />}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;

'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Grid, 
  List, 
  Search, 
  Filter,
  Star,
  Clock,
  CheckCircle,
  Heart,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Fic {
  id: string;
  title: string;
  author: string;
  author_url: string;
  fandoms: string[];
  relationships: string[];
  characters: string[];
  words: number;
  chapters_current: number;
  chapters_total: number;
  rating: string;
  warnings: string[];
  categories: string[];
  kudos: number;
  hits: number;
  bookmarks: number;
  comments: number;
  summary: string;
  url: string;
  status: 'to-read' | 'reading' | 'completed' | 'dropped' | 'want-to-read';
  progress: number;
  user_rating: number;
  user_notes: string;
  date_added: string;
  date_started: string;
  date_completed: string;
  source: 'bookmarks' | 'history' | 'marked-for-later';
  visit_count: number;
  date_visited: string;
  date_bookmarked: string;
  date_marked: string;
  additional_tags: string[];
}

interface Shelf {
  id: string;
  name: string;
  color: string;
  ficCount: number;
}

const LibraryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedShelf, setSelectedShelf] = useState<string>('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [fics, setFics] = useState<Fic[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);

  // Get user data and library from session and database
  React.useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setLoading(true);
        
        // Get user session
        const sessionResponse = await fetch('/api/session');
        const sessionData = await sessionResponse.json();

        if (sessionData.authenticated) {
          setUser(sessionData.user);
          
          // Fetch library data from database
          const libraryResponse = await fetch('/api/library');
          const libraryData = await libraryResponse.json();
          
          if (libraryData.works) {
            // Convert database entries to Fic format
            const realFics: Fic[] = libraryData.works.map((work: any) => ({
              id: work.id,
              title: work.title || 'Unknown Title',
              author: work.author || 'Unknown Author',
              author_url: work.author_url || '',
              fandoms: work.fandoms || [],
              relationships: work.relationships || [],
              characters: work.characters || [],
              words: work.words || 0,
              chapters_current: work.chapters_current || 1,
              chapters_total: work.chapters_total || 1,
              rating: work.rating || 'NR',
              warnings: work.warnings || [],
              categories: work.categories || [],
              kudos: work.kudos || 0,
              hits: work.hits || 0,
              bookmarks: work.bookmarks || 0,
              comments: work.comments || 0,
              summary: work.summary || 'No summary available',
              url: work.url || `https://archiveofourown.org/works/${work.id}`,
              status: work.status || 'to-read',
              progress: work.progress || 0,
              user_rating: work.user_rating || 0,
              user_notes: work.user_notes || '',
              date_added: work.date_added ? new Date(work.date_added).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              date_started: work.date_started ? new Date(work.date_started).toISOString().split('T')[0] : '',
              date_completed: work.date_completed ? new Date(work.date_completed).toISOString().split('T')[0] : '',
              source: work.source || 'history',
              visit_count: work.visit_count || 1,
              date_visited: work.date_visited ? new Date(work.date_visited).toISOString().split('T')[0] : '',
              date_bookmarked: work.date_bookmarked ? new Date(work.date_bookmarked).toISOString().split('T')[0] : '',
              date_marked: work.date_marked ? new Date(work.date_marked).toISOString().split('T')[0] : '',
              additional_tags: work.additional_tags || []
            }));
            
            setFics(realFics);
          }
        }
      } catch (error) {
        console.error('Failed to fetch library data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, []);



  // Default shelves
  const defaultShelves: Shelf[] = [
    { id: '1', name: 'Favorites', color: 'bg-red-100 text-red-800', ficCount: 0 },
    { id: '2', name: 'Currently Reading', color: 'bg-blue-100 text-blue-800', ficCount: 0 },
    { id: '3', name: 'Want to Read', color: 'bg-yellow-100 text-yellow-800', ficCount: 0 },
    { id: '4', name: 'Completed', color: 'bg-green-100 text-green-800', ficCount: 0 },
    { id: '5', name: 'Angst That Destroyed Me', color: 'bg-purple-100 text-purple-800', ficCount: 0 },
    { id: '6', name: 'Comfort Reads', color: 'bg-pink-100 text-pink-800', ficCount: 0 },
  ];

  // Update shelves with real counts
  React.useEffect(() => {
    if (fics.length > 0) {
      const updatedShelves = defaultShelves.map(shelf => ({
        ...shelf,
        ficCount: fics.filter(fic => fic.source === shelf.id).length
      }));
      setShelves(updatedShelves);
    } else {
      setShelves(defaultShelves);
    }
  }, [fics]);

  // Update fics when user data changes
  React.useEffect(() => {
    if (user) {
      // Library data is already fetched in the main useEffect
    }
  }, [user]);

  const filterTabs = [
    { id: 'all', label: 'All', icon: BookOpen, count: fics.length },
    { id: 'reading', label: 'Currently Reading', icon: Clock, count: fics.filter(f => f.status === 'reading').length },
    { id: 'want-to-read', label: 'Want to Read', icon: Heart, count: fics.filter(f => f.status === 'want-to-read').length },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: fics.filter(f => f.status === 'completed').length },
    { id: 'bookmarks', label: 'Bookmarks', icon: Heart, count: fics.filter(f => f.source === 'bookmarks').length },
    { id: 'marked-for-later', label: 'Marked for Later', icon: BookOpen, count: fics.filter(f => f.source === 'marked-for-later').length },
  ];

  const filteredFics = fics.filter(fic => {
    const matchesSearch = fic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fic.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fic.fandoms.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'bookmarks' && fic.source === 'bookmarks') ||
                         (activeFilter === 'marked-for-later' && fic.source === 'marked-for-later') ||
                         fic.status === activeFilter;

    const matchesShelf = !selectedShelf || fic.source === selectedShelf;

    return matchesSearch && matchesFilter && matchesShelf;
  });

  const updateProgress = (ficId: string, newProgress: number) => {
    console.log(`Updating fic ${ficId} to ${newProgress}% progress`);
    // This would update the database
  };

  const StarRating: React.FC<{ rating: number; onRate?: (rating: number) => void }> = ({ rating, onRate }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${onRate ? 'cursor-pointer' : ''} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={onRate ? () => onRate(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const FicCard: React.FC<{ fic: Fic }> = ({ fic }) => (
    <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{fic.title}</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-1">by {fic.author}</p>
        <p className="text-sm text-purple-600 mb-2">{fic.fandoms.join(', ')}</p>
        <p className="text-sm text-gray-700 mb-2">{fic.relationships.join(', ')}</p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>{fic.words.toLocaleString()} words</span>
          <span>•</span>
          <span>{fic.chapters_current}/{fic.chapters_total}</span>
          <span>•</span>
          <span className={`px-2 py-1 rounded ${
            fic.status === 'completed' ? 'bg-green-100 text-green-800' :
            fic.status === 'reading' ? 'bg-blue-100 text-blue-800' :
            fic.status === 'want-to-read' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {fic.status}
          </span>
        </div>

        {fic.status === 'reading' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{fic.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${fic.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <StarRating rating={fic.user_rating} />
          <div className="flex gap-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                fic.source === 'bookmarks' ? 'bg-green-100 text-green-800' :
                fic.source === 'marked-for-later' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'
              }`}
            >
              {fic.source === 'bookmarks' ? 'Bookmarks' :
               fic.source === 'marked-for-later' ? 'Marked for Later' :
               'History'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {fic.additional_tags?.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {tag}
            </span>
          ))}
          {fic.additional_tags && fic.additional_tags.length > 3 && (
            <span className="text-xs px-2 py-1 text-gray-500">+{fic.additional_tags.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );

  const FicListItem: React.FC<{ fic: Fic }> = ({ fic }) => (
    <div className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{fic.title}</h3>
            <button className="text-gray-400 hover:text-gray-600 ml-2">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600">by {fic.author}</p>
          <p className="text-sm text-purple-600 mb-1">{fic.fandoms.join(', ')}</p>
          <p className="text-sm text-gray-700 mb-2">{fic.relationships.join(', ')}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
            <span>{fic.words.toLocaleString()} words</span>
            <span>{fic.chapters_current}/{fic.chapters_total}</span>
            <span className={`px-2 py-1 rounded ${
              fic.status === 'completed' ? 'bg-green-100 text-green-800' :
              fic.status === 'reading' ? 'bg-blue-100 text-blue-800' :
              fic.status === 'want-to-read' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {fic.status}
            </span>
          </div>

          {fic.status === 'reading' && (
            <div className="mb-2 max-w-xs">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{fic.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${fic.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <StarRating rating={fic.user_rating} />
            <div className="flex gap-1">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  fic.source === 'bookmarks' ? 'bg-green-100 text-green-800' :
                  fic.source === 'marked-for-later' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                {fic.source === 'bookmarks' ? 'Bookmarks' :
                 fic.source === 'marked-for-later' ? 'Marked for Later' :
                 'History'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          {/* Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Filters</h2>
            <div className="space-y-2">
              {filterTabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`w-full flex items-center justify-between p-2 text-sm rounded-md transition-colors ${
                      activeFilter === tab.id
                        ? 'bg-purple-100 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shelves */}
          <div className="bg-white rounded-lg border p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Shelves</h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedShelf('')}
                className={`w-full text-left p-2 text-sm rounded-md transition-colors ${
                  !selectedShelf ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Shelves
              </button>
              {shelves.map(shelf => (
                <button
                  key={shelf.id}
                  onClick={() => setSelectedShelf(shelf.id)}
                  className={`w-full flex items-center justify-between p-2 text-sm rounded-md transition-colors ${
                    selectedShelf === shelf.id
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{shelf.name}</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {shelf.ficCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search fics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="dateAdded">Date Added</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="rating">Rating</option>
              <option value="wordCount">Word Count</option>
            </select>
          </div>

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredFics.length} {filteredFics.length === 1 ? 'fic' : 'fics'} found
            </p>
          </div>

          {/* Fics Grid/List */}
          {filteredFics.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No fics found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredFics.map(fic => 
                viewMode === 'grid' ? (
                  <FicCard key={fic.id} fic={fic} />
                ) : (
                  <FicListItem key={fic.id} fic={fic} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;

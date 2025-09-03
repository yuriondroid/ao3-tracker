'use client';

// src/components/ProfilePage.tsx
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Download, 
  Users, 
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  Target,
  Calendar,
  BookOpen,
  Star,
  Edit2,
  Camera
} from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  ao3Username: string;
  avatar: string;
  status: 'friends' | 'pending-sent' | 'pending-received';
  mutualFriends: number;
  joinDate: string;
  isOnline: boolean;
}

interface ReadingGoal {
  id: string;
  type: 'fics' | 'words' | 'authors';
  target: number;
  current: number;
  year: number;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'settings' | 'goals'>('profile');
  const [isPublicProfile, setIsPublicProfile] = useState(true);
  const [friendSearchTerm, setFriendSearchTerm] = useState('');

  // Mock user data
  const currentUser = {
    id: '1',
    username: 'FicLover2024',
    ao3Username: 'FicLover',
    email: 'user@example.com',
    avatar: '',
    bio: 'Avid fanfiction reader with a love for angst, hurt/comfort, and happy endings. Always looking for new fics to add to my ever-growing library!',
    joinDate: '2024-01-15',
    ao3Connected: true,
    totalFicsRead: 89,
    totalWordsRead: 4200000,
    averageRating: 4.3,
    currentStreak: 45,
    favoriteGenres: ['Angst', 'Hurt/Comfort', 'Romance', 'Alternative Universe'],
    favoriteFandoms: ['Harry Potter', 'Marvel', 'Sherlock Holmes'],
    isPublic: isPublicProfile
  };

  // Mock friends data
  const [friends] = useState<Friend[]>([
    {
      id: '1',
      username: 'BookwormBeth',
      ao3Username: 'Beth_Reads',
      avatar: '',
      status: 'friends',
      mutualFriends: 5,
      joinDate: '2023-12-01',
      isOnline: true
    },
    {
      id: '2',
      username: 'FanficFanatic',
      ao3Username: 'FicAddict',
      avatar: '',
      status: 'friends',
      mutualFriends: 3,
      joinDate: '2024-02-20',
      isOnline: false
    },
    {
      id: '3',
      username: 'NewReader123',
      ao3Username: 'NewToFic',
      avatar: '',
      status: 'pending-received',
      mutualFriends: 1,
      joinDate: '2024-08-15',
      isOnline: false
    }
  ]);

  // Mock reading goals
  const [readingGoals, setReadingGoals] = useState<ReadingGoal[]>([
    { id: '1', type: 'fics', target: 100, current: 89, year: 2024 },
    { id: '2', type: 'words', target: 5000000, current: 4200000, year: 2024 },
    { id: '3', type: 'authors', target: 20, current: 15, year: 2024 }
  ]);

  const handleFriendAction = (friendId: string, action: 'accept' | 'decline' | 'remove') => {
    console.log(`${action} friend ${friendId}`);
    // Handle friend actions
  };

  const updateReadingGoal = (goalId: string, newTarget: number) => {
    setReadingGoals(goals => 
      goals.map(goal => 
        goal.id === goalId ? { ...goal, target: newTarget } : goal
      )
    );
  };

  const ProfileInfo = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentUser.username}</h2>
                <p className="text-gray-600">@{currentUser.ao3Username} on AO3</p>
                <p className="text-sm text-gray-500">Joined {new Date(currentUser.joinDate).toLocaleDateString()}</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
            
            <p className="mt-4 text-gray-700 leading-relaxed">{currentUser.bio}</p>
            
            <div className="flex items-center gap-2 mt-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                currentUser.ao3Connected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentUser.ao3Connected ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    AO3 Connected
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    AO3 Not Connected
                  </>
                )}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                currentUser.isPublic 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentUser.isPublic ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Public Profile
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Private Profile
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reading Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{currentUser.totalFicsRead}</p>
          <p className="text-sm text-gray-600">Fics Read</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{(currentUser.totalWordsRead / 1000000).toFixed(1)}M</p>
          <p className="text-sm text-gray-600">Words Read</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{currentUser.averageRating}</p>
          <p className="text-sm text-gray-600">Avg Rating</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{currentUser.currentStreak}</p>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
      </div>

      {/* Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Genres</h3>
          <div className="flex flex-wrap gap-2">
            {currentUser.favoriteGenres.map(genre => (
              <span key={genre} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Fandoms</h3>
          <div className="flex flex-wrap gap-2">
            {currentUser.favoriteFandoms.map(fandom => (
              <span key={fandom} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {fandom}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const FriendsTab = () => (
    <div className="space-y-6">
      {/* Friends Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Friends</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <UserPlus className="w-4 h-4" />
            Find Friends
          </button>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search friends..."
            value={friendSearchTerm}
            onChange={(e) => setFriendSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">
            Friends ({friends.filter(f => f.status === 'friends').length})
          </h3>
        </div>
        <div className="divide-y">
          {friends.filter(f => f.status === 'friends').map(friend => (
            <div key={friend.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {friend.avatar ? (
                      <img 
                        src={friend.avatar} 
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {friend.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{friend.username}</p>
                  <p className="text-sm text-gray-600">@{friend.ao3Username}</p>
                  <p className="text-xs text-gray-500">{friend.mutualFriends} mutual friends</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleFriendAction(friend.id, 'remove')}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friend Requests */}
      {friends.some(f => f.status === 'pending-received') && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">
              Friend Requests ({friends.filter(f => f.status === 'pending-received').length})
            </h3>
          </div>
          <div className="divide-y">
            {friends.filter(f => f.status === 'pending-received').map(friend => (
              <div key={friend.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {friend.avatar ? (
                      <img 
                        src={friend.avatar} 
                        alt={friend.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{friend.username}</p>
                    <p className="text-sm text-gray-600">@{friend.ao3Username}</p>
                    <p className="text-xs text-gray-500">{friend.mutualFriends} mutual friends</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleFriendAction(friend.id, 'accept')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleFriendAction(friend.id, 'decline')}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ReadingGoalsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">2024 Reading Goals</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            <Target className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {readingGoals.map(goal => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const goalType = goal.type === 'fics' ? 'Fics' : goal.type === 'words' ? 'Words' : 'Authors';
            const displayCurrent = goal.type === 'words' ? `${(goal.current / 1000000).toFixed(1)}M` : goal.current.toString();
            const displayTarget = goal.type === 'words' ? `${(goal.target / 1000000).toFixed(1)}M` : goal.target.toString();
            
            return (
              <div key={goal.id} className="text-center p-4 border rounded-lg">
                <div className="relative w-24 h-24 mx-auto mb-4">
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
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{goalType} Goal</h3>
                <p className="text-sm text-gray-600 mb-2">{displayCurrent} of {displayTarget}</p>
                <button className="text-sm text-purple-600 hover:text-purple-700">Edit Goal</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal History */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal History</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">2023 Fics Goal</p>
              <p className="text-sm text-gray-600">Completed: 75 of 75 fics</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">2023 Words Goal</p>
              <p className="text-sm text-gray-600">Completed: 3.2M of 3M words</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsTab = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              defaultValue={currentUser.username}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              defaultValue={currentUser.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              defaultValue={currentUser.bio}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* AO3 Connection */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AO3 Connection</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Archive of Our Own Account</p>
            <p className="text-sm text-gray-600">
              {currentUser.ao3Connected 
                ? `Connected as @${currentUser.ao3Username}` 
                : 'Connect your AO3 account to access private fics'}
            </p>
          </div>
          <button className={`px-4 py-2 rounded-md ${
            currentUser.ao3Connected 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}>
            {currentUser.ao3Connected ? 'Disconnect' : 'Connect AO3'}
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Public Profile</p>
              <p className="text-sm text-gray-600">Allow others to see your profile and reading activity</p>
            </div>
            <button
              onClick={() => setIsPublicProfile(!isPublicProfile)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPublicProfile ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPublicProfile ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Show Reading Activity to Friends</p>
              <p className="text-sm text-gray-600">Let friends see what you&apos;re currently reading</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Friend Requests</p>
              <p className="text-sm text-gray-600">Get notified when someone sends you a friend request</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Reading Reminders</p>
              <p className="text-sm text-gray-600">Daily reminders to keep up your reading streak</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export My Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            <XCircle className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'friends' | 'settings' | 'goals')}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileInfo />}
      {activeTab === 'friends' && <FriendsTab />}
      {activeTab === 'goals' && <ReadingGoalsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};

export default ProfilePage;

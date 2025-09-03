import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Key, 
  BookOpen, 
  Clock, 
  Calendar,
  Infinity,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Heart,
  Bookmark
} from 'lucide-react';

interface OnboardingData {
  email: string;
  ao3Username: string;
  ao3Password: string;
  username: string;
  displayName: string;
  importScope: 'week' | 'month' | 'year' | 'all';
  includeBookmarks: boolean;
  includeMarkedForLater: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    email: '',
    ao3Username: '',
    ao3Password: '',
    username: '',
    displayName: '',
    importScope: 'month',
    includeBookmarks: true,
    includeMarkedForLater: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        if (!formData.ao3Username) newErrors.ao3Username = 'AO3 username is required';
        if (!formData.ao3Password) newErrors.ao3Password = 'AO3 password is required';
        break;
      
      case 2:
        if (!formData.username) newErrors.username = 'Username is required';
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) newErrors.username = 'Username can only contain letters, numbers, and underscores';
        
        if (!formData.displayName) newErrors.displayName = 'Display name is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    if (currentStep === 3) {
      setImporting(true)
      setImportProgress(0)

      try {
        // Call the parent's onComplete with the form data
        if (onComplete) {
          onComplete(formData)
        }
      } catch (error) {
        setImporting(false)
        console.error('Onboarding error:', error)
        alert('Onboarding failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    } else {
      nextStep()
    }
  }

  const importOptions = [
    {
      value: 'week' as const,
      label: 'Past Week',
      description: 'Import reading history from the last 7 days',
      icon: Clock,
      estimatedTime: '< 1 minute',
      ficCount: '~5-20 fics'
    },
    {
      value: 'month' as const,
      label: 'Past Month',
      description: 'Import reading history from the last 30 days',
      icon: Calendar,
      estimatedTime: '1-3 minutes',
      ficCount: '~20-100 fics'
    },
    {
      value: 'year' as const,
      label: 'Past Year',
      description: 'Import reading history from the last 12 months',
      icon: BookOpen,
      estimatedTime: '5-10 minutes',
      ficCount: '~100-500 fics'
    },
    {
      value: 'all' as const,
      label: 'All Time',
      description: 'Import reading history from the past 2 years (limited)',
      icon: Infinity,
      estimatedTime: '10-20 minutes',
      ficCount: '~200-1000 fics'
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Connect your AO3 account to get started</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateData('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AO3 Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.ao3Username}
                    onChange={(e) => updateData('ao3Username', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.ao3Username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your AO3 username"
                  />
                </div>
                {errors.ao3Username && <p className="text-red-500 text-sm mt-1">{errors.ao3Username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AO3 Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    value={formData.ao3Password}
                    onChange={(e) => updateData('ao3Password', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.ao3Password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your AO3 password"
                  />
                </div>
                {errors.ao3Password && <p className="text-red-500 text-sm mt-1">{errors.ao3Password}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  We use this to access your reading history and private/locked works. Your password is encrypted and never stored.
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Identity</h2>
              <p className="text-gray-600">How would you like to be known on this platform?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateData('username', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Choose a unique username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  This will be your unique identifier. Only letters, numbers, and underscores allowed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => updateData('displayName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="How should we address you?"
                />
                {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  This is how other users will see you. You can change this later.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Your Reading History</h2>
              <p className="text-gray-600">How much of your AO3 history would you like to import?</p>
            </div>

            <div className="space-y-4">
              {importOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    onClick={() => updateData('importScope', option.value)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.importScope === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        formData.importScope === option.value ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          formData.importScope === option.value ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{option.label}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>⏱️ {option.estimatedTime}</span>
                          <span>📚 {option.ficCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Additional Options</h3>
              
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={formData.includeBookmarks}
                  onChange={(e) => updateData('includeBookmarks', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-700">Include all bookmarks</span>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.includeMarkedForLater}
                  onChange={(e) => updateData('includeMarkedForLater', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Include "Marked for Later" works</span>
                </div>
              </label>

              <p className="text-xs text-blue-600 mt-2">
                ℹ️ Bookmarks and "Marked for Later" will only import up to 100 works each to avoid overwhelming the system.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> "All Time" is limited to the past 2 years of activity to prevent API overload. 
                    You can always add more works manually later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Account Details',
    'Profile Setup',
    'Import History'
  ];

  if (importing) {
    return <ImportProgress data={formData} progress={importProgress} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {stepTitles.map((title, index) => (
              <div
                key={index}
                className={`flex items-center ${index < stepTitles.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < currentStep
                      ? 'bg-purple-600 text-white'
                      : index + 1 === currentStep
                      ? 'bg-purple-100 text-purple-600 border-2 border-purple-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < stepTitles.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      index + 1 < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{stepTitles[currentStep - 1]}</p>
            <p className="text-xs text-gray-500">Step {currentStep} of {stepTitles.length}</p>
          </div>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 rounded-lg font-medium ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          {currentStep < stepTitles.length ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Start Import
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Import Progress Component
const ImportProgress: React.FC<{ data: OnboardingData; progress: number }> = ({ data, progress }) => {
  const [currentTask, setCurrentTask] = useState('Authenticating with AO3...');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const tasks = [
    'Authenticating with AO3...',
    'Accessing your reading history...',
    'Fetching bookmarks...',
    'Importing fanworks...',
    'Creating your library...',
    'Setting up recommendations...',
    'Finalizing your account...'
  ];

  React.useEffect(() => {
    const taskIndex = Math.floor((progress / 100) * tasks.length);
    
    if (taskIndex < tasks.length) {
      setCurrentTask(tasks[taskIndex]);
      
      if (taskIndex > completedTasks.length) {
        setCompletedTasks(prev => [...prev, tasks[taskIndex - 1]]);
      }
    }
  }, [progress]);

  const estimatedTimes = {
    'week': '30-60 seconds',
    'month': '2-3 minutes', 
    'year': '5-8 minutes',
    'all': '10-15 minutes'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting Up Your Library</h2>
          <p className="text-gray-600">
            Importing your {data.importScope === 'all' ? 'all-time' : `past ${data.importScope}`} reading history...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Estimated time: {estimatedTimes[data.importScope]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current task */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <span className="text-sm text-blue-800 font-medium">{currentTask}</span>
          </div>
        </div>

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Completed:</h3>
            {completedTasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-3 p-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-600">{task}</span>
              </div>
            ))}
          </div>
        )}

        {/* Import summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Import Settings:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Scope: {data.importScope === 'all' ? 'All time (2 years)' : `Past ${data.importScope}`}</li>
            {data.includeBookmarks && <li>• Including bookmarks (up to 100)</li>}
            {data.includeMarkedForLater && <li>• Including "Marked for Later" (up to 100)</li>}
          </ul>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Please don't close this window. This may take a few minutes depending on your library size.
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

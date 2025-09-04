'use client';
import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, AlertCircle, CheckCircle, ExternalLink, Book, Clock, Heart, User, Mail, Key, ArrowRight, ArrowLeft } from 'lucide-react';

interface FileUploadState {
  bookmarks: File | null;
  history: File | null;
  markedForLater: File | null;
}

interface ParsedData {
  bookmarks: any[];
  history: any[];
  markedForLater: any[];
}

interface FormData {
  email: string;
  username: string;
  password: string;
  displayName: string;
  importData?: ParsedData;
  totalWorks?: number;
}

interface OnboardingFlowProps {
  onComplete: (data: FormData) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    displayName: ''
  });
  const [files, setFiles] = useState<FileUploadState>({
    bookmarks: null,
    history: null,
    markedForLater: null
  });
  const [parsedData, setParsedData] = useState<ParsedData>({
    bookmarks: [],
    history: [],
    markedForLater: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const bookmarksRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLInputElement>(null);
  const markedRef = useRef<HTMLInputElement>(null);

  // Parse AO3 Bookmarks HTML
  const parseBookmarksHTML = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Find all work entries by looking for h4 headings with work links
    const workEntries = doc.querySelectorAll('h4.heading a[href*="/works/"]');
    
    return Array.from(workEntries).map(titleEl => {
      // Get the parent container that holds all the work information
      const workContainer = titleEl.closest('.header')?.parentElement || titleEl.parentElement?.parentElement;
      if (!workContainer) return null;
      
      // Extract work ID from URL
      const workId = titleEl.getAttribute('href')?.match(/\/works\/(\d+)/)?.[1] || '';
      
      // Get title and author
      const title = titleEl.textContent?.trim() || '';
      const authorEl = workContainer.querySelector('a[rel="author"]');
      const author = authorEl?.textContent?.trim() || '';
      const authorUrl = authorEl?.getAttribute('href') || '';
      
      // Get fandoms
      const fandomsEl = workContainer.querySelectorAll('.fandoms a.tag');
      const fandoms = Array.from(fandomsEl).map(el => el.textContent?.trim() || '');
      
      // Get rating, warnings, categories from required tags
      const ratingEl = workContainer.querySelector('.rating .text');
      const rating = ratingEl?.textContent?.trim() || '';
      
      const warningsEl = workContainer.querySelectorAll('.warnings a.tag');
      const warnings = Array.from(warningsEl).map(el => el.textContent?.trim() || '');
      
      const categoriesEl = workContainer.querySelectorAll('.category .text');
      const categories = Array.from(categoriesEl).map(el => el.textContent?.trim() || '');
      
      // Get relationships, characters, and freeform tags
      const relationshipsEl = workContainer.querySelectorAll('.relationships a.tag');
      const relationships = Array.from(relationshipsEl).map(el => el.textContent?.trim() || '');
      
      const charactersEl = workContainer.querySelectorAll('.characters a.tag');
      const characters = Array.from(charactersEl).map(el => el.textContent?.trim() || '');
      
      const tagsEl = workContainer.querySelectorAll('.freeforms a.tag');
      const tags = Array.from(tagsEl).map(el => el.textContent?.trim() || '');
      
      // Get stats
      const wordsEl = workContainer.querySelector('.words');
      const words = parseInt(wordsEl?.textContent?.replace(/,/g, '') || '0') || 0;
      
      const chaptersEl = workContainer.querySelector('.chapters');
      const chapters = chaptersEl?.textContent?.trim() || '1/1';
      
      // Get summary
      const summaryEl = workContainer.querySelector('.summary blockquote');
      const summary = summaryEl?.textContent?.trim() || '';
      
      // Get bookmark date
      const dateEl = workContainer.querySelector('.datetime');
      const dateBookmarked = dateEl?.textContent?.trim() || '';
      
      return {
        id: workId,
        title: title,
        author: author,
        author_url: authorUrl,
        url: titleEl.getAttribute('href') || '',
        fandoms: fandoms,
        rating: rating,
        warnings: warnings,
        categories: categories,
        relationships: relationships,
        characters: characters,
        tags: tags,
        words: words,
        chapters: chapters,
        summary: summary,
        date_bookmarked: dateBookmarked,
        source: 'bookmarks',
        status: 'want-to-read' // Default status for bookmarked works
      };
    }).filter(work => work && work.title && work.author);
  };

  // Parse AO3 History Extension JSON
  const parseHistoryJSON = (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      
      // Handle different possible formats from the extension
      const works = Array.isArray(data) ? data : data.history || data.works || [];
      
      return works.map((work: any) => {
        // Handle nested fandoms structure
        let fandoms = [];
        if (Array.isArray(work.fandoms)) {
          fandoms = work.fandoms.map((f: any) => typeof f === 'string' ? f : f.name || f).filter(Boolean);
        } else if (work.fandom) {
          fandoms = [work.fandom];
        }

        // Handle nested tags structure
        let tags = [];
        if (work.tags) {
          if (Array.isArray(work.tags)) {
            tags = work.tags;
          } else if (typeof work.tags === 'object') {
            // Extract tag names from nested structure
            tags = Object.values(work.tags).flat().map((tag: any) => 
              typeof tag === 'string' ? tag : tag.name || tag
            ).filter(Boolean);
          }
        }

        // Handle warnings
        let warnings = [];
        if (Array.isArray(work.warnings)) {
          warnings = work.warnings;
        } else if (work.warning) {
          warnings = [work.warning];
        }

        // Handle categories
        let categories = [];
        if (Array.isArray(work.categories)) {
          categories = work.categories;
        } else if (work.category) {
          categories = [work.category];
        }

        return {
          id: work.id || work.work_id || '',
          title: work.title || '',
          author: work.author || work.authors?.join(', ') || '',
          author_url: work.authorUrl || work.author_url || '',
          url: work.url || `https://archiveofourown.org/works/${work.id}`,
          fandoms: fandoms,
          rating: work.rating || '',
          warnings: warnings,
          categories: categories,
          relationships: work.relationships || work.pairings || [],
          characters: work.characters || [],
          tags: tags,
          words: parseInt(work.words) || 0,
          chapters: work.chapters || work.completion || '1/1',
          summary: work.summary || '',
          date_visited: work.date_visited || work.visited || work.last_read || '',
          visit_count: work.visit_count || work.visits || 1,
          source: 'history',
          status: 'completed' // Assume works in history have been read
        };
      });
    } catch (error) {
      throw new Error('Invalid JSON format in history file');
    }
  };

  // Parse Marked for Later JSON (similar to history)
  const parseMarkedForLaterJSON = (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      const works = Array.isArray(data) ? data : data.marked_for_later || data.works || [];
      
      return works.map((work: any) => {
        // Handle nested fandoms structure
        let fandoms = [];
        if (Array.isArray(work.fandoms)) {
          fandoms = work.fandoms.map((f: any) => typeof f === 'string' ? f : f.name || f).filter(Boolean);
        } else if (work.fandom) {
          fandoms = [work.fandom];
        }

        // Handle nested tags structure - this is the key fix
        let tags = [];
        if (work.tags) {
          if (Array.isArray(work.tags)) {
            tags = work.tags;
          } else if (typeof work.tags === 'object') {
            // Extract tag names from nested structure - flatten the arrays
            tags = Object.values(work.tags).flat().map((tag: any) => 
              typeof tag === 'string' ? tag : tag.name || tag
            ).filter(Boolean);
          }
        }

        // Handle warnings
        let warnings = [];
        if (Array.isArray(work.warnings)) {
          warnings = work.warnings;
        } else if (work.warning) {
          warnings = [work.warning];
        }

        // Handle categories
        let categories = [];
        if (Array.isArray(work.categories)) {
          categories = work.categories;
        } else if (work.category) {
          categories = [work.category];
        }

        return {
          id: work.id || work.work_id || '',
          title: work.title || '',
          author: work.author || work.authors?.join(', ') || '',
          author_url: work.authorUrl || work.author_url || '',
          url: work.url || `https://archiveofourown.org/works/${work.id}`,
          fandoms: fandoms,
          rating: work.rating || '',
          warnings: warnings,
          categories: categories,
          relationships: work.relationships || work.pairings || [],
          characters: work.characters || [],
          tags: tags,
          words: parseInt(work.words) || 0,
          chapters: work.chapters || work.completion || '1/1',
          summary: work.summary || '',
          date_marked: work.date_marked || work.marked || '',
          source: 'marked-for-later',
          status: 'to-read' // Default status for marked for later
        };
      });
    } catch (error) {
      throw new Error('Invalid JSON format in marked for later file');
    }
  };

  // Handle file uploads
  const handleFileUpload = async (type: keyof FileUploadState, file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    setErrors(prev => ({ ...prev, [type]: '' }));
    
    try {
      const content = await file.text();
      let parsed: any[] = [];
      
      if (type === 'bookmarks' && file.name.endsWith('.html')) {
        parsed = parseBookmarksHTML(content);
      } else if ((type === 'history' || type === 'markedForLater') && file.name.endsWith('.json')) {
        parsed = type === 'history' ? parseHistoryJSON(content) : parseMarkedForLaterJSON(content);
      } else {
        throw new Error(`Invalid file format for ${type}`);
      }
      
      setParsedData(prev => ({ ...prev, [type]: parsed }));
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [type]: error instanceof Error ? error.message : `Failed to parse ${type} file` 
      }));
      setParsedData(prev => ({ ...prev, [type]: [] }));
    }
  };

  const updateData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      
      if (!formData.username) newErrors.username = 'Username is required';
      else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
      if (!formData.displayName) newErrors.displayName = 'Display name is required';
    }

    if (step === 2) {
      const totalWorks = parsedData.bookmarks.length + parsedData.history.length + parsedData.markedForLater.length;
      if (totalWorks === 0) {
        newErrors.import = 'Please upload at least one file with valid data';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Update form data with import data
        const totalWorks = parsedData.bookmarks.length + parsedData.history.length + parsedData.markedForLater.length;
        setFormData(prev => ({
          ...prev,
          importData: parsedData,
          totalWorks
        }));
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === 3) {
      setImporting(true);
      setImportProgress(0);

      try {
        // Debug: Log the data being sent
        console.log('Onboarding data being sent:', {
          ...formData,
          importData: {
            bookmarks: parsedData.bookmarks,
            history: parsedData.history,
            markedForLater: parsedData.markedForLater
          }
        });

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setImportProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 500);

        // Call the parent's onComplete with the form data
        if (onComplete) {
          await onComplete({
            ...formData,
            importData: {
              bookmarks: parsedData.bookmarks,
              history: parsedData.history,
              markedForLater: parsedData.markedForLater
            }
          });
        }

        // Complete the progress
        clearInterval(progressInterval);
        setImportProgress(100);
      } catch (error) {
        setImporting(false);
        setImportProgress(0);
        console.error('Onboarding error:', error);
        alert('Onboarding failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      nextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Make an Account</h2>
              <p className="text-gray-600">Create your AO3 Tracker account</p>
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
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateData('username', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateData('password', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Choose a secure password"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => updateData('displayName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.displayName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="How you'll appear in the app"
                  />
                </div>
                {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Your AO3 Library</h2>
              <p className="text-gray-600 mb-6">
                Upload your AO3 data to automatically populate your library. You can upload one, two, or all three file types.
              </p>
            </div>

            {/* Installation Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">📋 Step-by-Step Instructions</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-blue-700">1. Install Browser Extension</h4>
                  <p className="text-sm text-blue-600 mb-2">
                    Install the AO3 History Exporter extension to export your reading history and marked for later list.
                  </p>
                  <a 
                    href="https://addons.mozilla.org/en-US/firefox/addon/ao3-history-exporter/"
                    target="_blank"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Firefox Extension
                  </a>
                  <br />
                  <a 
                    href="https://chrome.google.com/webstore/search/ao3%20history%20exporter"
                    target="_blank"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Chrome Extension (search "AO3 History Exporter")
                  </a>
                </div>
                
                <div>
                                     <h4 className="font-medium mb-2 text-blue-700">2. Export Your Data</h4>
                   <ul className="text-sm text-blue-600 space-y-1">
                     <li>• <strong>Bookmarks:</strong> Go to your bookmarks page, right-click → "Save As" → HTML file</li>
                     <li>• <strong>History:</strong> Use extension to export reading history as JSON</li>
                     <li>• <strong>Marked for Later:</strong> Use extension to export as JSON</li>
                   </ul>
                   <p className="text-xs text-blue-500 mt-2">
                     <strong>Note:</strong> Make sure you're logged into AO3 when saving bookmarks!
                   </p>
                </div>
              </div>
            </div>

            {/* Upload Sections */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Bookmarks Upload */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
                <div className="text-center">
                  <Book className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Bookmarks</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Export bookmarks page as HTML
                  </p>
                  
                  <input
                    ref={bookmarksRef}
                    type="file"
                    accept=".html"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload('bookmarks', e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => bookmarksRef.current?.click()}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 mb-2"
                  >
                    {files.bookmarks ? 'Change File' : 'Upload HTML'}
                  </button>
                  
                  {files.bookmarks && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">{files.bookmarks.name}</p>
                      <p className="text-xs text-green-600">{parsedData.bookmarks.length} works found</p>
                    </div>
                  )}
                  
                  {errors.bookmarks && (
                    <p className="text-xs text-red-600 mt-2">{errors.bookmarks}</p>
                  )}
                </div>
              </div>

              {/* History Upload */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                <div className="text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Reading History</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Export from browser extension as JSON
                  </p>
                  
                  <input
                    ref={historyRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload('history', e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => historyRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 mb-2"
                  >
                    {files.history ? 'Change File' : 'Upload JSON'}
                  </button>
                  
                  {files.history && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">{files.history.name}</p>
                      <p className="text-xs text-blue-600">{parsedData.history.length} works found</p>
                    </div>
                  )}
                  
                  {errors.history && (
                    <p className="text-xs text-red-600 mt-2">{errors.history}</p>
                  )}
                </div>
              </div>

              {/* Marked for Later Upload */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
                <div className="text-center">
                  <Heart className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Marked for Later</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Export from browser extension as JSON
                  </p>
                  
                  <input
                    ref={markedRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload('markedForLater', e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => markedRef.current?.click()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 mb-2"
                  >
                    {files.markedForLater ? 'Change File' : 'Upload JSON'}
                  </button>
                  
                  {files.markedForLater && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">{files.markedForLater.name}</p>
                      <p className="text-xs text-purple-600">{parsedData.markedForLater.length} works found</p>
                    </div>
                  )}
                  
                  {errors.markedForLater && (
                    <p className="text-xs text-red-600 mt-2">{errors.markedForLater}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {(parsedData.bookmarks.length > 0 || parsedData.history.length > 0 || parsedData.markedForLater.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-4">Import Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{parsedData.bookmarks.length}</div>
                    <div className="text-sm text-gray-600">Bookmarked Works</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{parsedData.history.length}</div>
                    <div className="text-sm text-gray-600">History Works</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{parsedData.markedForLater.length}</div>
                    <div className="text-sm text-gray-600">Marked for Later</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-xl font-bold">
                    Total: {parsedData.bookmarks.length + parsedData.history.length + parsedData.markedForLater.length} works
                  </div>
                </div>
              </div>
            )}

            {errors.import && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{errors.import}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={parsedData.bookmarks.length + parsedData.history.length + parsedData.markedForLater.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Import!</h2>
              <p className="text-gray-600">Review your import details and create your account</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Account Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Username:</span>
                  <span className="font-medium">{formData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Display Name:</span>
                  <span className="font-medium">{formData.displayName}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-blue-800">Import Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{parsedData.bookmarks.length}</div>
                  <div className="text-sm text-gray-600">Bookmarked Works</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{parsedData.history.length}</div>
                  <div className="text-sm text-gray-600">History Works</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{parsedData.markedForLater.length}</div>
                  <div className="text-sm text-gray-600">Marked for Later</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xl font-bold text-blue-800">
                  Total: {parsedData.bookmarks.length + parsedData.history.length + parsedData.markedForLater.length} works
                </div>
              </div>
            </div>

            {importing && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <h3 className="font-semibold text-green-800 mb-2">Creating Your Account...</h3>
                  <p className="text-green-600">Importing your AO3 library and setting up your account</p>
                  <div className="mt-4">
                    <div className="bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-green-600 mt-2">{importProgress}% complete</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={prevStep}
                disabled={importing}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={importing}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow;

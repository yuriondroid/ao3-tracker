'use client';

import Layout from '@/components/Layout'
import HomePage from '@/components/HomePage'
import LibraryPage from '@/components/LibraryPage'
import StatsPage from '@/components/StatsPage'
import ProfilePage from '@/components/ProfilePage'
import DiscoverPage from '@/components/DiscoverPage'
import FicEntryForm from '@/components/FicEntryForm'
import LoginForm from '@/components/LoginForm'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { useState, useEffect } from 'react'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Debug logging
  console.log('User:', user)
  console.log('Loading:', loading)
  console.log('Current page:', currentPage)

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/session')
        const data = await response.json()
        
        if (data.authenticated) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    // Check if user needs onboarding
    if (!userData.onboardingCompleted) {
      setShowOnboarding(true)
    }
  }

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      console.log('Starting onboarding for:', onboardingData.username)
      
      // Call the onboarding API
      const response = await fetch('/api/onboarding/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('Onboarding successful:', result)
        // Set the user data from the response
        setUser(result.user)
        setShowOnboarding(false)
        // Don't refresh the page - just update the state
      } else {
        console.error('Onboarding failed:', result.error)
        alert('Onboarding failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('Onboarding error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding if user needs it
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // Show onboarding flow or login for new users
  if (!user) {
    if (showOnboarding) {
      return <OnboardingFlow onComplete={handleOnboardingComplete} />
    }
    
    if (showLogin) {
      return <LoginForm onLogin={handleLogin} />
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Welcome to AO3 Tracker</h2>
            <p className="mt-2 text-gray-600">Track your fanfiction reading progress</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowOnboarding(true)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Create New Account
            </button>
            
            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show authenticated content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'library':
        return <LibraryPage />
      case 'stats':
        return <StatsPage />
      case 'profile':
        return <ProfilePage />
      case 'discover':
        return <DiscoverPage />
      case 'add':
        return (
          <div className="py-8">
            <FicEntryForm />
          </div>
        )
      default:
        return <HomePage />
    }
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

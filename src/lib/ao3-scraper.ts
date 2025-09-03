import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

export interface AO3Work {
  id: string
  title: string
  author: string
  authorUrl?: string
  fandoms: string[]
  relationships: string[]
  characters: string[]
  additionalTags: string[]
  rating: string
  warnings: string[]
  categories: string[]
  status: string
  chaptersPublished: number
  chaptersTotal: number | null
  wordCount: number
  language: string
  publishedDate: Date
  updatedDate: Date
  summary: string
  kudos: number
  comments: number
  bookmarks: number
  hits: number
  url?: string
}

export class AO3Scraper {
  private browser: any = null
  private page: any = null

  constructor() {}

  async initialize() {
    try {
      this.browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })
      this.page = await this.browser.newPage()
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    } catch (error) {
      console.error('AO3 Scraper: Failed to initialize browser:', error)
      throw new Error('Failed to initialize browser: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }

  // Improved authentication that tries multiple submission methods
  async authenticateWithCredentials(username: string, password: string, keepSession: boolean = false): Promise<{ success: boolean; sessionToken?: string; error?: string }> {
    if (!keepSession) {
      await this.initialize()
    }

    try {
      console.log('AO3 Scraper: Starting authentication for:', username)
      
      // Go to AO3 login page
      await this.page.goto('https://archiveofourown.org/users/login', { waitUntil: 'networkidle2' })
      console.log('AO3 Scraper: Loaded login page')
      
      // Wait for form elements with multiple possible selectors
      const loginSelectors = ['#user_login', 'input[name="user[login]"]', 'input[type="text"]']
      const passwordSelectors = ['#user_password', 'input[name="user[password]"]', 'input[type="password"]']
      
      let loginField = null
      let passwordField = null
      
      for (const selector of loginSelectors) {
        try {
          loginField = await this.page.$(selector)
          if (loginField) break
        } catch (e) {}
      }
      
      for (const selector of passwordSelectors) {
        try {
          passwordField = await this.page.$(selector)
          if (passwordField) break
        } catch (e) {}
      }
      
      if (!loginField || !passwordField) {
        console.log('AO3 Scraper: Could not find login form fields')
        return { success: false, error: 'Login form not found' }
      }
      
      // Clear any existing values
      await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"]')
        inputs.forEach((input: any) => input.value = '')
      })
      
      // Fill the form
      await loginField.type(username)
      await passwordField.type(password)
      console.log('AO3 Scraper: Filled login form')
      
      // Try multiple submission methods
      let submitted = false
      
      // Method 1: Try clicking the submit button with multiple selectors
      const submitSelectors = [
        'input[type="submit"]',
        'button[type="submit"]',
        '.submit',
        'input[value*="Log"]',
        'input[value*="Sign"]',
        'button:contains("Log")',
        'button:contains("Sign")'
      ]
      
      for (const selector of submitSelectors) {
        try {
          const submitButton = await this.page.$(selector)
          if (submitButton) {
            await submitButton.click()
            console.log('AO3 Scraper: Clicked submit button with selector:', selector)
            submitted = true
            break
          }
        } catch (e) {
          console.log('AO3 Scraper: Submit button click failed for selector:', selector)
        }
      }
      
      // Method 2: Try pressing Enter on the password field
      if (!submitted) {
        try {
          await passwordField.click()
          await this.page.keyboard.press('Enter')
          console.log('AO3 Scraper: Pressed Enter on password field')
          submitted = true
        } catch (e) {
          console.log('AO3 Scraper: Enter key failed, trying form submission')
        }
      }
      
      // Method 3: Try submitting the form directly
      if (!submitted) {
        try {
          await this.page.evaluate(() => {
            const forms = document.querySelectorAll('form')
            for (const form of forms) {
              if (form.querySelector('input[type="password"]')) {
                form.submit()
                return true
              }
            }
            return false
          })
          console.log('AO3 Scraper: Submitted form directly')
          submitted = true
        } catch (e) {
          console.log('AO3 Scraper: Direct form submission failed')
        }
      }
      
      // Method 4: Try clicking any button that might be submit
      if (!submitted) {
        try {
          const buttons = await this.page.$$('button, input[type="submit"]')
          for (const button of buttons) {
            try {
              await button.click()
              console.log('AO3 Scraper: Clicked a button')
              submitted = true
              break
            } catch (e) {}
          }
        } catch (e) {
          console.log('AO3 Scraper: Button clicking failed')
        }
      }
      
      if (!submitted) {
        return { success: false, error: 'Could not submit login form' }
      }
      
      // Wait for navigation with a longer timeout
      try {
        await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 })
        console.log('AO3 Scraper: Navigation completed')
      } catch (e) {
        console.log('AO3 Scraper: Navigation timeout, but continuing...')
      }
      
      // Check if we're still on login page (failed)
      const currentUrl = this.page.url()
      console.log('AO3 Scraper: Current URL after login:', currentUrl)
      
      if (currentUrl.includes('/login')) {
        // Check for error messages
        const errorSelectors = ['.error', '.flash.error', '.alert-error', '.notice.error', '.alert', '.message.error']
        for (const selector of errorSelectors) {
          try {
            const errorElement = await this.page.$(selector)
            if (errorElement) {
              const errorText = await this.page.evaluate((el: Element) => el.textContent, errorElement)
              console.log('AO3 Scraper: Login error found:', errorText)
              return { success: false, error: errorText || 'Invalid credentials' }
            }
          } catch (e) {}
        }
        
        // Check if we're still on the login form
        const loginForm = await this.page.$('input[type="text"]')
        if (loginForm) {
          return { success: false, error: 'Still on login page - authentication failed' }
        }
        
        return { success: false, error: 'Invalid credentials' }
      }
      
      // Check if we're redirected to the user's profile page (success)
      if (currentUrl.includes(`/users/${username}`)) {
        console.log('AO3 Scraper: Successfully redirected to user profile!')
      }
      
      // Success! Get session cookie
      const cookies = await this.page.cookies()
      const sessionCookie = cookies.find((cookie: any) => cookie.name === '_otwarchive_session')
      
      if (sessionCookie) {
        console.log('AO3 Scraper: Authentication successful!')
        return { success: true, sessionToken: sessionCookie.value }
      }
      
      // If we got here but no session cookie, check if we're logged in by looking for logout link
      const logoutSelectors = ['a[href*="logout"]', 'a[href*="signout"]', 'a:contains("Logout")', 'a:contains("Sign out")']
      for (const selector of logoutSelectors) {
        try {
          const logoutLink = await this.page.$(selector)
          if (logoutLink) {
            console.log('AO3 Scraper: Found logout link - authentication successful!')
            return { success: true, sessionToken: 'authenticated' }
          }
        } catch (e) {}
      }
      
      return { success: false, error: 'No session token found' }
    } catch (error) {
      console.error('AO3 Scraper: Authentication error:', error)
      return { success: false, error: 'Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error') }
    } finally {
      if (!keepSession) {
        await this.cleanup()
      }
    }
  }

  // Get user's actual reading history from AO3
  async getUserHistory(username: string, password: string, scope: string = 'month'): Promise<AO3Work[]> {
    await this.initialize()
    const works: AO3Work[] = []

    try {
      // First authenticate and keep the session alive
      const authResult = await this.authenticateWithCredentials(username, password, true)
      if (!authResult.success) {
        console.log('AO3 Scraper: Authentication failed:', authResult.error)
        return []
      }
      
      console.log('AO3 Scraper: Authentication successful, now scraping user history')
      
      // Get user's history page
      console.log('AO3 Scraper: Accessing readings page...')
      await this.page.goto(`https://archiveofourown.org/users/${username}/readings`, { waitUntil: 'networkidle2' })
      
      const html = await this.page.content()
      const $ = cheerio.load(html)
      
      // Get works from history
      $('.work.blurb').each((_, element) => {
        const work = this.parseWorkElement($, element)
        if (work) {
          works.push(work)
        }
      })
      
      console.log('AO3 Scraper: Found', works.length, 'works in readings history')
      
      // Also get bookmarks
      console.log('AO3 Scraper: Accessing bookmarks page...')
      await this.page.goto(`https://archiveofourown.org/users/${username}/bookmarks`, { waitUntil: 'networkidle2' })
      const bookmarksHtml = await this.page.content()
      const $bookmarks = cheerio.load(bookmarksHtml)
      
      $bookmarks('.work.blurb').each((_, element) => {
        const work = this.parseWorkElement($bookmarks, element)
        if (work) {
          work.status = 'bookmarked'
          works.push(work)
        }
      })
      
      console.log('AO3 Scraper: Found', $bookmarks('.work.blurb').length, 'bookmarks')
      
      // Get marked for later
      console.log('AO3 Scraper: Accessing marked for later page...')
      await this.page.goto(`https://archiveofourown.org/users/${username}/marked_for_later`, { waitUntil: 'networkidle2' })
      const markedHtml = await this.page.content()
      const $marked = cheerio.load(markedHtml)
      
      $marked('.work.blurb').each((_, element) => {
        const work = this.parseWorkElement($marked, element)
        if (work) {
          work.status = 'marked_for_later'
          works.push(work)
        }
      })
      
      console.log('AO3 Scraper: Found', $marked('.work.blurb').length, 'marked for later works')
      console.log('AO3 Scraper: Successfully scraped', works.length, 'works from user history')
      return works
    } catch (error) {
      console.error('Error getting user history:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }

  // Helper method to parse work elements
  private parseWorkElement($: any, element: any): AO3Work | null {
    const $el = $(element)
    
    const workLink = $el.find('h4.heading a').attr('href')
    const workIdMatch = workLink?.match(/\/works\/(\d+)/)
    
    if (!workIdMatch) return null
    
    const workId = workIdMatch[1]
    const title = $el.find('h4.heading a').text().trim()
    const author = $el.find('.byline a').first().text().trim()
    const fandoms = $el.find('.fandoms a').map((_: any, el: any) => $(el).text().trim()).get()
    const relationships = $el.find('.relationships a').map((_: any, el: any) => $(el).text().trim()).get()
    const characters = $el.find('.characters a').map((_: any, el: any) => $(el).text().trim()).get()
    const additionalTags = $el.find('.freeforms a').map((_: any, el: any) => $(el).text().trim()).get()
    const rating = $el.find('.rating a').text().trim()
    const warnings = $el.find('.warnings a').map((_: any, el: any) => $(el).text().trim()).get()
    const categories = $el.find('.category a').map((_: any, el: any) => $(el).text().trim()).get()
    
    // Get stats
    const statsText = $el.find('.stats').text()
    const wordCountMatch = statsText.match(/(\d+(?:,\d+)*)\s*words/)
    const wordCount = wordCountMatch ? parseInt(wordCountMatch[1].replace(/,/g, '')) : 0
    
    const kudosMatch = statsText.match(/(\d+(?:,\d+)*)\s*kudos/)
    const kudos = kudosMatch ? parseInt(kudosMatch[1].replace(/,/g, '')) : 0
    
    const hitsMatch = statsText.match(/(\d+(?:,\d+)*)\s*hits/)
    const hits = hitsMatch ? parseInt(hitsMatch[1].replace(/,/g, '')) : 0
    
    const bookmarksMatch = statsText.match(/(\d+(?:,\d+)*)\s*bookmarks/)
    const bookmarks = bookmarksMatch ? parseInt(bookmarksMatch[1].replace(/,/g, '')) : 0
    
    const commentsMatch = statsText.match(/(\d+(?:,\d+)*)\s*comments/)
    const comments = commentsMatch ? parseInt(commentsMatch[1].replace(/,/g, '')) : 0
    
    // Get chapter info
    const chapterText = $el.find('.chapters').text()
    const chapterMatch = chapterText.match(/(\d+)\/(\d+|\?)/)
    const chaptersPublished = chapterMatch ? parseInt(chapterMatch[1]) : 1
    const chaptersTotal = chapterMatch && chapterMatch[2] !== '?' ? parseInt(chapterMatch[2]) : null
    
    // Get dates
    const dateText = $el.find('.datetime').text()
    const publishedDate = new Date()
    const updatedDate = new Date()
    
    return {
      id: workId,
      title: title || 'Untitled',
      author: author || 'Anonymous',
      authorUrl: $el.find('.byline a').first().attr('href') || '',
      fandoms: fandoms,
      relationships: relationships,
      characters: characters,
      additionalTags: additionalTags,
      rating: rating || 'NR',
      warnings: warnings,
      categories: categories,
      status: 'to-read',
      chaptersPublished: chaptersPublished,
      chaptersTotal: chaptersTotal,
      wordCount: wordCount,
      language: 'English',
      publishedDate: publishedDate,
      updatedDate: updatedDate,
      summary: $el.find('.summary').text().trim() || '',
      kudos: kudos,
      comments: comments,
      bookmarks: bookmarks,
      hits: hits,
      url: `https://archiveofourown.org/works/${workId}`
    }
  }

  // Get some sample works for testing (no authentication needed)
  async getSampleWorks(): Promise<AO3Work[]> {
    await this.initialize()
    const works: AO3Work[] = []

    try {
      // Go to AO3 homepage and get some popular works
      await this.page.goto('https://archiveofourown.org/works', { waitUntil: 'networkidle2' })
      
      const html = await this.page.content()
      const $ = cheerio.load(html)
      
      // Get first 5 works from the homepage
      $('.work.blurb').slice(0, 5).each((_, element) => {
        const work = this.parseWorkElement($, element)
        if (work) {
          works.push(work)
        }
      })
      
      console.log('AO3 Scraper: Successfully scraped', works.length, 'works')
      return works
    } catch (error) {
      console.error('Error getting sample works:', error)
      return []
    } finally {
      await this.cleanup()
    }
  }

  // Database methods
  private getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    return createClient(supabaseUrl, supabaseServiceKey)
  }

  async saveWorkToDatabase(work: any, userId: string) {
    try {
      const supabase = this.getSupabaseClient()
      
      console.log('AO3 Scraper: Saving work to database:', work.title)
      
      // First, save or update the fanwork
      const { data: fanwork, error: fanworkError } = await supabase
        .from('fanworks')
        .upsert({
          ao3_work_id: work.id,
          title: work.title,
          author: work.author,
          fandom: work.fandoms?.[0] || 'Unknown',
          relationship: work.relationships?.[0] || null,
          additional_tags: work.additionalTags || [],
          rating: work.rating,
          warnings: work.warnings || [],
          category: work.categories?.[0] || null,
          status: work.status,
          chapters_published: work.chaptersPublished,
          chapters_total: work.chaptersTotal,
          word_count: work.wordCount,
          language: work.language || 'English',
          published_date: work.publishedDate,
          updated_date: work.updatedDate,
          summary: work.summary,
          kudos: work.kudos,
          comments: work.comments,
          bookmarks: work.bookmarks,
          hits: work.hits,
          last_scraped: new Date().toISOString()
        }, {
          onConflict: 'ao3_work_id'
        })
      
      if (fanworkError) {
        console.error('AO3 Scraper: Failed to save fanwork:', fanworkError)
        throw fanworkError
      }

      // Get the fanwork ID
      const { data: savedFanwork } = await supabase
        .from('fanworks')
        .select('id')
        .eq('ao3_work_id', work.id)
        .single()

      if (!savedFanwork) {
        throw new Error('Failed to get saved fanwork ID')
      }

      // Then, create or update the user library entry
      const { data: libraryEntry, error: libraryError } = await supabase
        .from('user_library')
        .upsert({
          user_id: userId,
          fanwork_id: savedFanwork.id,
          reading_status: 'want-to-read',
          progress_percentage: 0,
          current_chapter: 1,
          date_added: new Date().toISOString()
        }, {
          onConflict: 'user_id,fanwork_id'
        })

      if (libraryError) {
        console.error('AO3 Scraper: Failed to save library entry:', libraryError)
        throw libraryError
      }

      console.log('AO3 Scraper: Successfully saved work to database')
      return { fanwork, libraryEntry }
    } catch (error) {
      console.error('AO3 Scraper: Failed to save work to database:', error)
      throw error
    }
  }

  async createDefaultShelvesForUser(userId: string) {
    try {
      const supabase = this.getSupabaseClient()
      
      const defaultShelves = [
        { name: 'Currently Reading', color: '#3b82f6' },
        { name: 'Want to Read', color: '#10b981' },
        { name: 'Completed', color: '#8b5cf6' },
        { name: 'Favorites', color: '#f59e0b' },
        { name: 'Dropped', color: '#ef4444' }
      ]

      for (const shelf of defaultShelves) {
        const { error } = await supabase
          .from('user_shelves')
          .insert({
            user_id: userId,
            name: shelf.name,
            color: shelf.color,
            is_public: false
          })
        
        if (error && !error.message.includes('duplicate key')) {
          console.error('AO3 Scraper: Failed to create shelf:', error)
        }
      }

      console.log('AO3 Scraper: Created default shelves for user')
    } catch (error) {
      console.error('AO3 Scraper: Failed to create default shelves:', error)
    }
  }
}

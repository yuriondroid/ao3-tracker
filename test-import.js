const fs = require('fs');
const { JSDOM } = require('jsdom');

// Test the parsing functions
function parseBookmarksHTML(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;
  
  // Find all work entries by looking for h4 headings with work links
  const workEntries = doc.querySelectorAll('h4.heading a[href*="/works/"]');
  
  console.log('Found', workEntries.length, 'work entries');
  
  return Array.from(workEntries).map((titleEl, index) => {
    // Get the parent container that holds all the work information
    const workContainer = titleEl.closest('.header')?.parentElement || titleEl.parentElement?.parentElement;
    if (!workContainer) {
      console.log(`Entry ${index}: No work container found`);
      return null;
    }
    
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
    
    console.log(`Entry ${index}: ID=${workId}, Title="${title}", Author="${author}"`);
    
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
      words: 0,
      chapters: '1/1',
      kudos: 0,
      hits: 0,
      bookmarks: 0,
      summary: '',
      date_bookmarked: '',
      source: 'bookmarks',
      status: 'want-to-read'
    };
  }).filter(work => work && work.title && work.author);
}

function parseMarkedForLaterJSON(jsonContent) {
  try {
    const data = JSON.parse(jsonContent);
    const works = Array.isArray(data) ? data : data.marked_for_later || data.works || [];
    
    console.log('Parsing marked for later JSON, found', works.length, 'works');
    
    return works.map((work, index) => {
      // Handle nested fandoms structure
      let fandoms = [];
      if (Array.isArray(work.fandoms)) {
        fandoms = work.fandoms.map((f) => typeof f === 'string' ? f : f.name || f).filter(Boolean);
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
          tags = Object.values(work.tags).flat().map((tag) => 
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

      console.log(`Work ${index}: ID=${work.id}, Title="${work.title}", Author="${work.author}"`);

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
        kudos: parseInt(work.kudos) || 0,
        hits: parseInt(work.hits) || 0,
        bookmarks: parseInt(work.bookmarks) || 0,
        summary: work.summary || '',
        date_marked: work.date_marked || work.marked || '',
        source: 'marked-for-later',
        status: 'to-read'
      };
    });
  } catch (error) {
    console.error('Error parsing marked for later JSON:', error);
    throw new Error('Invalid JSON format in marked for later file');
  }
}

// Test with actual files
try {
  console.log('=== Testing Bookmarks HTML ===');
  const bookmarksHTML = fs.readFileSync('ao3_bookmarks.html', 'utf8');
  const bookmarks = parseBookmarksHTML(bookmarksHTML);
  console.log('Parsed bookmarks:', bookmarks.length);
  
  console.log('\n=== Testing Marked for Later JSON ===');
  const markedForLaterJSON = fs.readFileSync('ao3_markedforlater.json', 'utf8');
  const markedForLater = parseMarkedForLaterJSON(markedForLaterJSON);
  console.log('Parsed marked for later:', markedForLater.length);
  
  console.log('\n=== Sample Data ===');
  if (bookmarks.length > 0) {
    console.log('Sample bookmark:', JSON.stringify(bookmarks[0], null, 2));
  }
  if (markedForLater.length > 0) {
    console.log('Sample marked for later:', JSON.stringify(markedForLater[0], null, 2));
  }
  
} catch (error) {
  console.error('Test failed:', error);
}

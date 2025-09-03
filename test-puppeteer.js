const puppeteer = require('puppeteer');

async function testPuppeteer() {
  let browser;
  try {
    console.log('Testing Puppeteer...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    console.log('Navigating to AO3...');
    await page.goto('https://archiveofourown.org', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log('AO3 title:', title);
    
    // Check if we can see the login form
    const loginLink = await page.$('a[href*="login"]');
    if (loginLink) {
      console.log('Found login link - AO3 is accessible');
    } else {
      console.log('No login link found');
    }
    
    console.log('Puppeteer test successful!');
  } catch (error) {
    console.error('Puppeteer test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPuppeteer();

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        console.log('--- STARTING UI VERIFICATION ---');
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        let hasErrors = false;
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('PAGE ERROR LOG:', msg.text());
                hasErrors = true;
            }
        });
        page.on('pageerror', err => {
            console.log('UNCAUGHT PAGE ERROR:', err.toString());
            hasErrors = true;
        });
        
        // 1. Load root
        await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 2000)); // wait for JS to execute and render UI
        console.log('Loaded URL:', page.url());
        
        // Ensure we are redirected to login if unauthenticated
        if (page.url().includes('login')) {
            console.log('SUCCESS: Unauthenticated user was redirected to Login.');
        } else {
            console.log('WARNING: User was NOT redirected to login.');
        }
        
        // Take a screenshot of the login page
        await page.setViewport({ width: 1280, height: 800 });
        const loginScreenshotPath = 'C:\\Users\\sivar\\.gemini\\antigravity-ide\\brain\\2e6f61cb-81f1-40e4-9c38-29419813d1e6\\scratch\\login_preview.png';
        await page.screenshot({ path: loginScreenshotPath, fullPage: true });
        console.log('Screenshot of Login page saved to artifacts scratch folder.');

        console.log('--- UI VERIFICATION COMPLETE ---');
        console.log('Errors found:', hasErrors);
        
        await browser.close();
    } catch (e) {
        console.error('TEST FAILED WITH ERROR:', e);
        process.exit(1);
    }
})();

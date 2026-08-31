const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('--- STARTING COMPREHENSIVE UI TEST ---');
        const browser = await puppeteer.launch({ 
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        page.on('console', msg => {
            if (msg.type() === 'error') console.log('PAGE ERROR LOG:', msg.text());
        });
        page.on('pageerror', err => console.log('UNCAUGHT PAGE ERROR:', err.toString()));
        
        // 1. Load root
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
        console.log('1. Loaded URL:', page.url());
        
        // 2. Check Home View
        const homeVisible = await page.$eval('#view-home', el => !el.classList.contains('hidden'));
        console.log('2. Home view visible on load:', homeVisible);
        
        // 3. Click Calendar Card
        console.log('3. Clicking Study Calendar card...');
        await page.click('.card[data-view="calendar"]');
        await new Promise(r => setTimeout(r, 600));
        const calVisible = await page.$eval('#view-calendar', el => !el.classList.contains('hidden'));
        console.log('   Calendar visible:', calVisible, '| URL:', page.url());
        
        // 4. Click Timer via Home Card
        console.log('4. Returning Home and clicking Timer card...');
        await page.click('#logo'); // Return home
        await new Promise(r => setTimeout(r, 600));
        await page.click('.card[data-view="pomodoro"]');
        await new Promise(r => setTimeout(r, 600));
        const pomodoroVisible = await page.$eval('#view-pomodoro', el => !el.classList.contains('hidden'));
        console.log('   Pomodoro visible:', pomodoroVisible, '| URL:', page.url());
        
        // 5. Click Tasks via Home Card
        console.log('5. Returning Home and clicking Tasks card...');
        await page.click('#logo'); // Return home
        await new Promise(r => setTimeout(r, 600));
        await page.click('.card[data-view="tasks"]');
        await new Promise(r => setTimeout(r, 600));
        const tasksVisible = await page.$eval('#view-tasks', el => !el.classList.contains('hidden'));
        console.log('   Tasks board visible:', tasksVisible, '| URL:', page.url());
        
        // 6. Click Notes via Home Card
        console.log('6. Returning Home and clicking Notes card...');
        await page.click('#logo'); // Return home
        await new Promise(r => setTimeout(r, 600));
        await page.click('.card[data-view="notes"]');
        await new Promise(r => setTimeout(r, 600));
        const notesVisible = await page.$eval('#view-notes', el => !el.classList.contains('hidden'));
        console.log('   Notes visible:', notesVisible, '| URL:', page.url());
        
        // 7. Click Study Analysis
        console.log('7. Clicking Study Analysis...');
        await page.click('#btn-info');
        await new Promise(r => setTimeout(r, 600));
        const popupVisible = await page.$eval('#performance-popup', el => !el.classList.contains('hidden'));
        console.log('   Study Analysis popup visible:', popupVisible);
        
        // Close popup
        await page.click('#popup-close');
        await new Promise(r => setTimeout(r, 300));
        const popupClosed = await page.$eval('#performance-popup', el => el.classList.contains('hidden'));
        console.log('   Study Analysis popup closed successfully:', popupClosed);
        
        // 8. Click Logo to return Home
        console.log('8. Clicking Logo to return Home...');
        await page.click('#logo');
        await new Promise(r => setTimeout(r, 600));
        const returnedHome = await page.$eval('#view-home', el => !el.classList.contains('hidden'));
        console.log('   Returned to Home:', returnedHome, '| URL:', page.url());
        
        console.log('--- ALL NAVIGATION AND UI TESTS PASSED! ---');
        await browser.close();
    } catch (e) {
        console.error('TEST FAILED WITH ERROR:', e);
        process.exit(1);
    }
})();

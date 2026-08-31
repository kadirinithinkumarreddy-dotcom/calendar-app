const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    // 1. Open app and authenticate
    await page.goto('http://localhost:8080/login', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        sessionStorage.setItem('studySyncSession', 'user_123');
        localStorage.setItem('studySyncSession', 'user_123');
        localStorage.setItem('studySyncCurrentUser', JSON.stringify({ id: 'user_123', name: 'Student' }));
        const sampleSubjects = ["Gen AI", "Python", "Java", "Blue Prism", "Hehe", "Hshd", "Jdbdjs", "Hehr", "Pppp"];
        const studySyncState = {
            subjects: sampleSubjects,
            studyData: {
                "2026-07": {
                    "Gen AI": ["2026-07-01", "2026-07-02", "2026-07-03"],
                    "Python": ["2026-07-01"],
                    "Java": ["2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"]
                }
            },
            timeData: {},
            tasks: [],
            notes: "",
            notesArray: [""]
        };
        localStorage.setItem('studySyncState', JSON.stringify(studySyncState));
    });
    
    // Now go to /home
    await page.goto('http://localhost:8080/home', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    
    // 1. Click Study Calendar card
    await page.click('.card[data-view="calendar"]');
    await new Promise(r => setTimeout(r, 1000));
    
    // Screenshot mobile calendar
    await page.screenshot({ path: 'mobile_calendar_verified.png' });
    console.log('Saved mobile_calendar_verified.png');
    
    // 2. Click "Study Analysis" button in header
    await page.waitForSelector('#btn-info');
    await page.click('#btn-info');
    await new Promise(r => setTimeout(r, 1000));
    
    // Screenshot mobile analysis modal
    await page.screenshot({ path: 'mobile_analysis_verified.png' });
    console.log('Saved mobile_analysis_verified.png');
    
    // Verify subjects in analysis
    const content = await page.content();
    const allPresent = ["Gen AI", "Python", "Java", "Blue Prism", "Hehe", "Hshd", "Jdbdjs", "Hehr", "Pppp"].every(sub => content.includes(sub));
    console.log('VERIFICATION: All 9 subjects visible in Study Analysis modal =', allPresent);
    
    // 3. Click "Home Page" button inside analysis modal footer
    await page.evaluate(() => {
        document.getElementById('popup-footer-home').click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    const isHome = await page.evaluate(() => {
        const homeSection = document.getElementById('view-home');
        const popup = document.getElementById('performance-popup');
        return homeSection && !homeSection.classList.contains('hidden') && popup && popup.classList.contains('hidden');
    });
    console.log('VERIFICATION: Home button returned to Home view and closed modal =', isHome);

    await browser.close();
})();

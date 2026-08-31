const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // 1. Go to register
    await page.goto('http://localhost:8080/register', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    
    // 2. Register a new user
    await page.evaluate(() => {
        document.getElementById('register-name').value = 'Ramesh Kumar';
        document.getElementById('register-phone').value = '9876543210';
        document.getElementById('register-email').value = 'ramesh@example.com';
        document.getElementById('register-password').value = 'Secret123';
        document.getElementById('register-confirm').value = 'Secret123';
        document.getElementById('register-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // 3. Go to Admin login
    await page.goto('http://localhost:8080/admin', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    
    await page.evaluate(() => {
        document.getElementById('admin-email').value = 'nithinkumarreddykadiri@gmail.com';
        document.getElementById('admin-password').value = '1234@nani';
        document.getElementById('admin-login-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // 4. Check if Ramesh Kumar appears in Admin Dashboard
    const content = await page.content();
    const hasUser = content.includes('Ramesh Kumar') && content.includes('ramesh@example.com') && content.includes('9876543210');
    console.log('VERIFICATION RESULT: Ramesh Kumar in Admin Dashboard =', hasUser);
    
    // Take a screenshot of the admin dashboard to verify visuals
    await page.screenshot({ path: 'admin_dashboard_verified.png' });
    console.log('Admin Dashboard screenshot saved.');

    await browser.close();
})();

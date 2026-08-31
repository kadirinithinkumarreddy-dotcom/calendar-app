const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('app.js', 'utf8');

const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;
const document = window.document;

window.alert = console.log;
window.confirm = () => true;

const scriptEl = document.createElement('script');
scriptEl.textContent = 'window.Chart = function() { this.destroy = function(){}; };';
document.head.appendChild(scriptEl);

const appScript = document.createElement('script');
appScript.textContent = script;
document.body.appendChild(appScript);

setTimeout(() => {
    try {
        console.log('--- TEST 1: Initial View ---');
        console.log('Home View Hidden?', document.getElementById('view-home').classList.contains('hidden'));
        console.log('Calendar View Hidden?', document.getElementById('view-calendar').classList.contains('hidden'));
        
        console.log('--- TEST 2: Click Study Calendar ---');
        const calendarCard = document.querySelector('.card[data-view="calendar"]');
        if (calendarCard) {
            calendarCard.click();
            console.log('Home View Hidden?', document.getElementById('view-home').classList.contains('hidden'));
            console.log('Calendar View Hidden?', document.getElementById('view-calendar').classList.contains('hidden'));
            console.log('Checkbox HTML snippet:', document.getElementById('tracker-body').innerHTML.substring(0, 100));
        } else {
            console.log('Calendar card not found!');
        }
        
    } catch (e) {
        console.error('Test Error:', e);
    }
}, 500);

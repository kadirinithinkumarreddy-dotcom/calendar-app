const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (error) => {
  console.log("ERROR:", error);
});
virtualConsole.on("log", (log) => {
  console.log("LOG:", log);
});

const dom = new JSDOM(html, { 
    runScripts: "dangerously", 
    resources: "usable",
    url: "http://localhost:8084/" 
});

setTimeout(() => {
    console.log("DOM loaded");
    const doc = dom.window.document;
    console.log("pathname:", dom.window.location.pathname);
    
    // Simulate click on calendar card
    const card = doc.querySelector('.card[data-view="calendar"]');
    if (card) {
        console.log("Found calendar card, clicking...");
        card.click();
        
        setTimeout(() => {
            console.log("After click pathname:", dom.window.location.pathname);
            const viewCalendar = doc.getElementById('view-calendar');
            console.log("Calendar view hidden?", viewCalendar.classList.contains('hidden'));
        }, 500);
    } else {
        console.log("Calendar card not found");
    }
}, 2000);

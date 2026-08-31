const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

const dashboardLogic = `
let chartInstance = null;
let performancePopup, btnCheckPerformance, popupClose;

function updatePerformanceDashboard() {
    if (!performancePopup) performancePopup = document.getElementById('performance-popup');
    if (!performancePopup || performancePopup.classList.contains('hidden')) return;

    const monthKey = getMonthKey(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    let daysStudiedSet = new Set();
    let subjectStats = {};
    
    state.subjects.forEach(sub => {
        subjectStats[sub] = { studied: 0, total: daysInMonth };
        if (state.studyData[monthKey] && state.studyData[monthKey][sub]) {
            state.studyData[monthKey][sub].forEach(dateStr => {
                daysStudiedSet.add(dateStr);
            });
            subjectStats[sub].studied = state.studyData[monthKey][sub].length;
        }
    });

    const daysStudied = daysStudiedSet.size;
    const daysMissed = daysInMonth - daysStudied;
    const overallPercentage = daysInMonth === 0 ? 0 : Math.round((daysStudied / daysInMonth) * 100);

    document.getElementById('stat-total-days').textContent = daysInMonth;
    document.getElementById('stat-days-studied').textContent = daysStudied;
    document.getElementById('stat-days-missed').textContent = daysMissed;
    
    document.getElementById('chart-center-text').textContent = \`\${overallPercentage}%\`;
    const ctx = document.getElementById('overall-progress-chart');
    if (ctx && typeof Chart !== 'undefined') {
        if (chartInstance) chartInstance.destroy();
        
        let color = '#10b981'; // success
        if (overallPercentage < 30) color = '#ef4444'; // danger
        else if (overallPercentage < 70) color = '#f59e0b'; // warning
        
        chartInstance = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Missed'],
                datasets: [{
                    data: [overallPercentage, 100 - overallPercentage],
                    backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                cutout: '80%',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                }
            }
        });
    }

    const list = document.getElementById('subject-progress-list');
    if (list) {
        list.innerHTML = '';
        state.subjects.forEach(sub => {
            const stat = subjectStats[sub];
            const pct = stat.total === 0 ? 0 : Math.round((stat.studied / stat.total) * 100);
            
            const item = document.createElement('div');
            item.style.marginBottom = '0.5rem';
            
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.fontSize = '0.9rem';
            header.style.marginBottom = '0.25rem';
            header.innerHTML = \`<span>\${sub}</span><span>\${pct}%</span>\`;
            
            const barContainer = document.createElement('div');
            barContainer.style.height = '6px';
            barContainer.style.background = 'rgba(255,255,255,0.1)';
            barContainer.style.borderRadius = '3px';
            barContainer.style.overflow = 'hidden';
            
            const barFill = document.createElement('div');
            barFill.style.height = '100%';
            barFill.style.width = \`\${pct}%\`;
            barFill.style.borderRadius = '3px';
            if (pct < 30) barFill.style.background = 'var(--accent-danger, #ef4444)';
            else if (pct < 70) barFill.style.background = 'var(--accent-warning, #f59e0b)';
            else barFill.style.background = 'var(--accent-success, #10b981)';
            
            barContainer.appendChild(barFill);
            item.appendChild(header);
            item.appendChild(barContainer);
            list.appendChild(item);
        });
    }
}
`;

if (!js.includes('updatePerformanceDashboard')) {
    js += '\n\n' + dashboardLogic;
}

js = js.replace(/function initDOM\(\) \{/g, 'function initDOM() {');
js = js.replace(/const navMenu = document\.getElementById\('nav-menu'\);/g, "const navMenu = document.getElementById('nav-menu');\n    performancePopup = document.getElementById('performance-popup');\n    btnCheckPerformance = document.getElementById('btn-check-performance');\n    popupClose = document.getElementById('popup-close');");
js = js.replace(/function setupEventListeners\(\) \{/g, "function setupEventListeners() {\n    if(btnCheckPerformance) btnCheckPerformance.addEventListener('click', () => { performancePopup.classList.remove('hidden'); updatePerformanceDashboard(); });\n    if(popupClose) popupClose.addEventListener('click', () => performancePopup.classList.add('hidden'));");
js = js.replace(/function toggleCheckbox\(subject, dateStr\) \{([\s\S]*?)renderStudyCalendar\(\);/g, (match, p1) => {
    return 'function toggleCheckbox(subject, dateStr) {' + p1 + 'renderStudyCalendar();\n    updatePerformanceDashboard();';
});

fs.writeFileSync('app.js', js);
console.log("Successfully patched app.js!");

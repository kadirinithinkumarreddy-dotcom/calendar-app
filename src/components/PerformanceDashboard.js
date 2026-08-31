import { state, AppState } from '../utils/state.js?v=1787992689755';
import { formatMonthKey, getDaysInMonth } from '../utils/helpers.js?v=1787992689755';

let chartInstance = null;

export function updatePerformanceDashboard() {
    const monthKey = formatMonthKey(AppState.currentYear, AppState.currentMonth);
    const daysInMonth = getDaysInMonth(AppState.currentMonth, AppState.currentYear);
    
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

    const elTotal = document.getElementById('stat-total-days');
    const elStudied = document.getElementById('stat-days-studied');
    const elMissed = document.getElementById('stat-days-missed');
    const countBadge = document.getElementById('subject-count-badge');
    
    if(elTotal) elTotal.textContent = daysInMonth;
    if(elStudied) elStudied.textContent = daysStudied;
    if(elMissed) elMissed.textContent = daysMissed;
    if(countBadge) countBadge.textContent = state.subjects.length;

    const canvas = document.getElementById('overall-progress-chart');
    if(canvas) {
        const existingChart = Chart.getChart ? Chart.getChart(canvas) : null;
        if (existingChart) existingChart.destroy();
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        chartInstance = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Studied', 'Missed'],
                datasets: [{
                    data: [daysStudied, daysMissed],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
        const centerTxt = document.getElementById('chart-center-text');
        if(centerTxt) centerTxt.textContent = overallPercentage + '%';
    }

    const subjectList = document.getElementById('subject-progress-list');
    if(subjectList) {
        subjectList.innerHTML = '';
        
        if (state.subjects.length === 0) {
            subjectList.innerHTML = `
                <div style="text-align:center; padding:1.5rem; color:var(--text-secondary); font-size:0.9rem; background:var(--bg-main); border-radius:var(--radius-sm); border:1px dashed var(--border-color);">
                    <i class="fa-solid fa-book-open" style="font-size:1.5rem; margin-bottom:0.5rem; opacity:0.5; display:block;"></i>
                    No subjects in Study Calendar yet.
                </div>
            `;
            return;
        }

        state.subjects.forEach(sub => {
            const stat = subjectStats[sub] || { studied: 0, total: daysInMonth };
            const pct = daysInMonth === 0 ? 0 : Math.round((stat.studied / daysInMonth) * 100);
            
            const timeSeconds = state.timeData[sub] || 0;
            const hours = Math.floor(timeSeconds / 3600);
            const minutes = Math.floor((timeSeconds % 3600) / 60);
            const timeStr = hours > 0 ? `${hours}h ${minutes}m` : (minutes > 0 ? `${minutes}m` : '');

            let barColor = 'var(--accent-primary)';
            if (pct >= 80) barColor = '#10b981';
            else if (pct >= 40) barColor = '#6366f1';
            else if (pct > 0) barColor = '#f59e0b';
            else barColor = 'var(--border-color)';
            
            const item = document.createElement('div');
            item.style.background = 'var(--bg-main)';
            item.style.padding = '0.75rem 1rem';
            item.style.borderRadius = 'var(--radius-sm)';
            item.style.border = '1px solid var(--border-color)';
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.gap = '0.4rem';
            
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-weight:600; font-size:0.9rem; color:var(--text-primary);">${sub}</span>
                        ${timeStr ? `<span style="font-size:0.75rem; color:var(--text-muted); background:var(--bg-surface); padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-clock" style="font-size:0.7rem; margin-right:3px;"></i>${timeStr}</span>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-size:0.8rem; color:var(--text-secondary);">${stat.studied}/${daysInMonth} d</span>
                        <span style="font-size:0.85rem; font-weight:700; color:${barColor}; min-width:38px; text-align:right;">${pct}%</span>
                    </div>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden;">
                    <div style="width:${Math.max(pct, 0)}%; height:100%; background:${barColor}; border-radius:3px; transition:width 0.3s ease;"></div>
                </div>
            `;
            subjectList.appendChild(item);
        });
    }
}

export function initPerformanceDashboard() {
    const performancePopup = document.getElementById('performance-popup');
    
    // Helper to close popup
    const closePopup = () => {
        if (performancePopup) performancePopup.classList.add('hidden');
    };

    // Helper to go to Home
    const goToHome = () => {
        closePopup();
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        const homeNav = document.querySelector('.btn-nav[data-view="home"]');
        if (homeNav) {
            homeNav.dispatchEvent(event);
        } else {
            const hiddenLink = document.createElement('a');
            hiddenLink.className = 'btn-nav';
            hiddenLink.dataset.view = 'home';
            document.body.appendChild(hiddenLink);
            hiddenLink.dispatchEvent(event);
            document.body.removeChild(hiddenLink);
        }
    };

    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-info') || e.target.id === 'btn-info') {
            e.preventDefault();
            if (performancePopup) {
                performancePopup.classList.remove('hidden');
                updatePerformanceDashboard();
            }
        }
        
        if (e.target.closest('#popup-close') || e.target.id === 'popup-close' ||
            e.target.closest('#popup-footer-close') || e.target.id === 'popup-footer-close') {
            e.preventDefault();
            closePopup();
        }

        if (e.target.closest('#popup-go-home') || e.target.id === 'popup-go-home' ||
            e.target.closest('#popup-footer-home') || e.target.id === 'popup-footer-home') {
            e.preventDefault();
            goToHome();
        }
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === performancePopup) {
            closePopup();
        }
    });
}

// Application State
const DEFAULT_SUBJECTS = ["SQL", "Gen AI", "Python", "Java", "Blue Prism"];

let state = {
    subjects: [],
    studyData: {}, // Format: { "YYYY-MM": { "SubjectName": ["YYYY-MM-DD", ...] } }
    notes: ""
};

// Current view state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM Elements
const navMenu = document.getElementById('nav-menu');
const views = document.querySelectorAll('.view');
const btnNavHome = document.querySelector('.btn-nav[data-view="home"]');
const logo = document.getElementById('logo');
const cards = document.querySelectorAll('.card');

const notesTextarea = document.getElementById('notes-textarea');

const currentMonthDisplay = document.getElementById('current-month-display');
const btnPrevMonth = document.getElementById('prev-month');
const btnNextMonth = document.getElementById('next-month');
const trackerHeaderRow = document.getElementById('tracker-header-row');
const trackerBody = document.getElementById('tracker-body');

const modal = document.getElementById('subject-modal');
const modalTitle = document.getElementById('modal-title');
const subjectInput = document.getElementById('subject-input');
const editSubjectIndex = document.getElementById('edit-subject-index');
const btnAddSubject = document.getElementById('btn-add-subject');
const btnModalClose = document.getElementById('modal-close');
const btnModalCancel = document.getElementById('modal-cancel');
const btnModalSave = document.getElementById('modal-save');

// Initialization
function init() {
    loadData();
    setupEventListeners();
    renderStudyCalendar();
}

// Data Management
function loadData() {
    const savedData = localStorage.getItem('studySyncData');
    if (savedData) {
        state = JSON.parse(savedData);
    } else {
        state.subjects = [...DEFAULT_SUBJECTS];
    }
    
    // Set notes
    notesTextarea.value = state.notes || "";
}

function saveData() {
    localStorage.setItem('studySyncData', JSON.stringify(state));
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    btnNavHome.addEventListener('click', () => switchView('home'));
    logo.addEventListener('click', () => switchView('home'));
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });

    // Notes auto-save
    notesTextarea.addEventListener('input', (e) => {
        state.notes = e.target.value;
        saveData();
    });

    // Calendar Controls
    btnPrevMonth.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderStudyCalendar();
    });

    btnNextMonth.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderStudyCalendar();
    });

    // Modal Controls
    btnAddSubject.addEventListener('click', () => openModal());
    btnModalClose.addEventListener('click', closeModal);
    btnModalCancel.addEventListener('click', closeModal);
    btnModalSave.addEventListener('click', saveSubject);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Save subject on Enter key
    subjectInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveSubject();
    });
}

// View Management
function switchView(viewId) {
    // Hide all views
    views.forEach(view => view.classList.add('hidden'));
    
    // Show target view
    document.getElementById(`view-${viewId}`).classList.remove('hidden');
    
    // Toggle nav menu visibility
    if (viewId === 'home') {
        navMenu.classList.add('hidden');
    } else {
        navMenu.classList.remove('hidden');
        if (viewId === 'calendar') {
            renderStudyCalendar(); // Re-render when opening just in case
        }
    }
}

// Calendar Logic
function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

function getMonthName(month) {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    return months[month];
}

function formatMonthKey(year, month) {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function formatDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderStudyCalendar() {
    currentMonthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const monthKey = formatMonthKey(currentYear, currentMonth);
    
    // Initialize month data if it doesn't exist
    if (!state.studyData[monthKey]) {
        state.studyData[monthKey] = {};
    }
    
    renderHeader(daysInMonth);
    renderBody(daysInMonth, monthKey);
}

function renderHeader(daysInMonth) {
    trackerHeaderRow.innerHTML = '<th class="subject-col">Subjects</th>';
    
    for (let i = 1; i <= daysInMonth; i++) {
        const th = document.createElement('th');
        th.textContent = i;
        trackerHeaderRow.appendChild(th);
    }
}

function renderBody(daysInMonth, monthKey) {
    trackerBody.innerHTML = '';
    
    state.subjects.forEach((subject, index) => {
        const tr = document.createElement('tr');
        
        // Subject Cell
        const tdSubject = document.createElement('td');
        tdSubject.className = 'subject-col';
        
        const subjectName = document.createElement('span');
        subjectName.textContent = subject;
        
        const actions = document.createElement('div');
        actions.className = 'subject-actions';
        
        const editBtn = document.createElement('i');
        editBtn.className = 'fa-solid fa-pen action-icon';
        editBtn.onclick = () => openModal(index);
        
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fa-solid fa-trash action-icon delete';
        deleteBtn.onclick = () => deleteSubject(index);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        tdSubject.appendChild(subjectName);
        tdSubject.appendChild(actions);
        tr.appendChild(tdSubject);
        
        // Ensure subject array exists in month data
        if (!state.studyData[monthKey][subject]) {
            state.studyData[monthKey][subject] = [];
        }
        
        const checkedDays = state.studyData[monthKey][subject];
        
        // Days Checkboxes
        for (let i = 1; i <= daysInMonth; i++) {
            const dateKey = formatDateKey(currentYear, currentMonth, i);
            
            const tdDate = document.createElement('td');
            tdDate.className = 'tracker-cell';
            
            const wrapper = document.createElement('label');
            wrapper.className = 'checkbox-wrapper';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'habit-checkbox';
            checkbox.checked = checkedDays.includes(dateKey);
            
            checkbox.addEventListener('change', (e) => {
                handleCheckboxChange(subject, dateKey, monthKey, e.target.checked);
            });
            
            wrapper.appendChild(checkbox);
            tdDate.appendChild(wrapper);
            tr.appendChild(tdDate);
        }
        
        trackerBody.appendChild(tr);
    });
}

function handleCheckboxChange(subject, dateKey, monthKey, isChecked) {
    if (!state.studyData[monthKey][subject]) {
        state.studyData[monthKey][subject] = [];
    }
    
    const subjectData = state.studyData[monthKey][subject];
    
    if (isChecked) {
        if (!subjectData.includes(dateKey)) {
            subjectData.push(dateKey);
        }
    } else {
        const index = subjectData.indexOf(dateKey);
        if (index > -1) {
            subjectData.splice(index, 1);
        }
    }
    
    saveData();
}

// Subject Management Modal
function openModal(editIndex = -1) {
    if (editIndex > -1) {
        modalTitle.textContent = 'Edit Subject';
        subjectInput.value = state.subjects[editIndex];
        editSubjectIndex.value = editIndex;
    } else {
        modalTitle.textContent = 'Add Subject';
        subjectInput.value = '';
        editSubjectIndex.value = '';
    }
    modal.classList.remove('hidden');
    subjectInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    subjectInput.value = '';
    editSubjectIndex.value = '';
}

function saveSubject() {
    const subjectName = subjectInput.value.trim();
    if (!subjectName) return;
    
    const editIndex = editSubjectIndex.value;
    
    if (editIndex !== '') {
        // Edit existing
        const oldSubject = state.subjects[editIndex];
        state.subjects[editIndex] = subjectName;
        
        // Update historical data keys if subject name changes
        if (oldSubject !== subjectName) {
            for (const month in state.studyData) {
                if (state.studyData[month][oldSubject]) {
                    state.studyData[month][subjectName] = state.studyData[month][oldSubject];
                    delete state.studyData[month][oldSubject];
                }
            }
        }
    } else {
        // Add new
        if (!state.subjects.includes(subjectName)) {
            state.subjects.push(subjectName);
        } else {
            alert('Subject already exists!');
            return;
        }
    }
    
    saveData();
    renderStudyCalendar();
    closeModal();
}

function deleteSubject(index) {
    const subjectName = state.subjects[index];
    if (confirm(`Are you sure you want to delete "${subjectName}"? This will not remove past checkmarks but it won't show in the calendar anymore.`)) {
        state.subjects.splice(index, 1);
        saveData();
        renderStudyCalendar();
    }
}

// Run app
document.addEventListener('DOMContentLoaded', init);
// --- Performance Dashboard Added Code ---
let performancePopup, btnInfo, popupClose;
let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    performancePopup = document.getElementById('performance-popup');
    btnInfo = document.getElementById('btn-info');
    popupClose = document.getElementById('popup-close');
    
    if(btnInfo) {
        btnInfo.addEventListener('click', () => {
            if(performancePopup) {
                performancePopup.classList.remove('hidden');
                updatePerformanceDashboard();
            }
        });
    }
    if(popupClose) {
        popupClose.addEventListener('click', () => {
            if(performancePopup) {
                performancePopup.classList.add('hidden');
            }
        });
    }
});

const originalSaveData = saveData;
saveData = function() {
    originalSaveData();
    if (typeof updatePerformanceDashboard === 'function') {
        updatePerformanceDashboard();
    }
};

const originalRenderStudyCalendar = renderStudyCalendar;
renderStudyCalendar = function() {
    originalRenderStudyCalendar();
    if (typeof updatePerformanceDashboard === 'function') {
        updatePerformanceDashboard();
    }
};


function updatePerformanceDashboard() {
    const monthKey = formatMonthKey(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    
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
    if(elTotal) elTotal.textContent = daysInMonth;
    if(elStudied) elStudied.textContent = daysStudied;
    if(elMissed) elMissed.textContent = daysMissed;

    const ctx = document.getElementById('overall-progress-chart');
    if(ctx) {
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(ctx, {
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
        state.subjects.forEach(sub => {
            const stat = subjectStats[sub];
            const pct = daysInMonth === 0 ? 0 : Math.round((stat.studied / daysInMonth) * 100);
            const div = document.createElement('div');
            div.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:0.25rem; font-size:0.85rem; color:var(--text-secondary);"><span>${sub}</span><span>${pct}%</span></div><div style="width:100%; height:6px; background:var(--bg-card); border-radius:3px; overflow:hidden;"><div style="width:${pct}%; height:100%; background:var(--accent-primary); border-radius:3px;"></div></div>`;
            subjectList.appendChild(div);
        });
    }
}


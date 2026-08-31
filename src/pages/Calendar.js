import { state, AppState, saveData } from '../utils/state.js?v=1787992689755';
import { formatMonthKey, getDaysInMonth, formatDateKey, showToast, customConfirm } from '../utils/helpers.js?v=1787992689755';
import { openModal } from '../components/SubjectModal.js?v=1787992689755';
import { updatePerformanceDashboard } from '../components/PerformanceDashboard.js?v=1787992689755';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const Calendar = {
    mount() {
        const view = document.getElementById('view-calendar');
        if (view) view.classList.remove('hidden');
        
        // Always set calendar to current real-world month on mount
        this.initDate();
        
        if (!this.initialized) {
            const btnAddSubject = document.getElementById('btn-add-subject');
            
            if(btnAddSubject) {
                btnAddSubject.addEventListener('click', () => openModal(-1, () => this.renderStudyCalendar()));
            }
            
            this.initialized = true;
        }
        
        this.renderStudyCalendar();
    },

    initDate(date = new Date()) {
        AppState.currentMonth = date.getMonth();
        AppState.currentYear = date.getFullYear();
        const monthDisplay = document.getElementById('current-month-display');
        if(monthDisplay) {
            monthDisplay.textContent = `${MONTH_NAMES[AppState.currentMonth]} ${AppState.currentYear}`;
        }
    },

    renderStudyCalendar() {
        const trackerHeader = document.getElementById('tracker-header-row');
        const trackerBody = document.getElementById('tracker-body');
        if (!trackerHeader || !trackerBody) return;
        
        const daysInMonth = getDaysInMonth(AppState.currentMonth, AppState.currentYear);
        const monthKey = formatMonthKey(AppState.currentYear, AppState.currentMonth);
        
        if (!state.studyData[monthKey]) {
            state.studyData[monthKey] = {};
        }

        // Render Header
        trackerHeader.innerHTML = '<th class="tracker-cell subject-col">Subject</th>';
        for (let i = 1; i <= daysInMonth; i++) {
            const th = document.createElement('th');
            th.className = 'tracker-cell';
            th.textContent = i;
            trackerHeader.appendChild(th);
        }

        // Render Body
        trackerBody.innerHTML = '';
        if (state.subjects.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = daysInMonth + 1;
            td.className = 'tracker-cell';
            td.textContent = 'No subjects added yet. Click "Add Subject" to begin.';
            td.style.textAlign = 'center';
            td.style.color = 'var(--text-secondary)';
            tr.appendChild(td);
            trackerBody.appendChild(tr);
            updatePerformanceDashboard();
            return;
        }

        const today = new Date();
        const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

        state.subjects.forEach((subject, index) => {
            const tr = document.createElement('tr');
            
            // Subject Cell
            const tdSubject = document.createElement('td');
            tdSubject.className = 'tracker-cell subject-col';
            // Override the broken flex from CSS on td
            tdSubject.style.display = 'table-cell'; 
            tdSubject.style.verticalAlign = 'middle';
            
            const cellWrapper = document.createElement('div');
            cellWrapper.style.display = 'flex';
            cellWrapper.style.justifyContent = 'space-between';
            cellWrapper.style.alignItems = 'center';
            cellWrapper.style.width = '100%';
            
            const subjectName = document.createElement('span');
            subjectName.textContent = subject;
            subjectName.style.fontWeight = '500';
            subjectName.style.color = 'var(--text-primary)';
            
            const actions = document.createElement('div');
            actions.className = 'subject-actions';
            // Make them faintly visible and nicely spaced
            actions.style.opacity = '0.5';
            actions.style.display = 'flex';
            actions.style.gap = '0.75rem';
            actions.style.alignItems = 'center';
            
            // Hover effect to full opacity
            actions.addEventListener('mouseover', () => actions.style.opacity = '1');
            actions.addEventListener('mouseout', () => actions.style.opacity = '0.5');
            
            const editBtn = document.createElement('i');
            editBtn.className = 'fa-solid fa-pen action-icon';
            editBtn.title = "Edit Subject";
            editBtn.style.fontSize = '0.85rem';
            editBtn.onclick = () => openModal(index, () => this.renderStudyCalendar());
            
            const deleteBtn = document.createElement('i');
            deleteBtn.className = 'fa-solid fa-trash action-icon delete';
            deleteBtn.title = "Delete Subject";
            deleteBtn.style.fontSize = '0.85rem';
            deleteBtn.onclick = async () => {
                const confirmed = await customConfirm(`Are you sure you want to delete "${subject}"? This won't remove past checkmarks.`);
                if (confirmed) {
                    state.subjects.splice(index, 1);
                    saveData();
                    this.renderStudyCalendar();
                }
            };
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            
            cellWrapper.appendChild(subjectName);
            cellWrapper.appendChild(actions);
            tdSubject.appendChild(cellWrapper);
            tr.appendChild(tdSubject);
            
            if (!state.studyData[monthKey][subject]) {
                state.studyData[monthKey][subject] = [];
            }
            
            const checkedDays = state.studyData[monthKey][subject];
            
            // Days Checkboxes
            for (let i = 1; i <= daysInMonth; i++) {
                const dateKey = formatDateKey(AppState.currentYear, AppState.currentMonth, i);
                
                const tdDate = document.createElement('td');
                tdDate.className = 'tracker-cell';
                
                const wrapper = document.createElement('label');
                wrapper.className = 'checkbox-wrapper';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'habit-checkbox';
                checkbox.checked = checkedDays.includes(dateKey);
                
                checkbox.addEventListener('click', (e) => {
                    const clickDate = new Date(AppState.currentYear, AppState.currentMonth, i);
                    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    
                    if (clickDate < todayNoTime) {
                        e.preventDefault();
                        showToast("You can't access previous dates.");
                    } else if (clickDate > todayNoTime) {
                        e.preventDefault();
                        showToast("You can't access future dates.");
                    }
                });
                
                checkbox.addEventListener('change', (e) => {
                    this.handleCheckboxChange(subject, dateKey, monthKey, e.target.checked);
                });
                
                wrapper.appendChild(checkbox);
                tdDate.appendChild(wrapper);
                tr.appendChild(tdDate);
            }
            
            trackerBody.appendChild(tr);
        });
        
        updatePerformanceDashboard();
    },
    
    handleCheckboxChange(subject, dateKey, monthKey, isChecked) {
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
        updatePerformanceDashboard();
    }
};

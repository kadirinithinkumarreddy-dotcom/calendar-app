import { state } from '../utils/state.js?v=1787992689755';
import { showToast, escapeHTML } from '../utils/helpers.js?v=1787992689755';

export const Home = {
    mount() {
        const view = document.getElementById('view-home');
        if (view) {
            view.classList.remove('hidden');
        }
        
        if (!this.initialized) {
            const themeToggleBtn = document.getElementById('theme-toggle-btn');
            if (themeToggleBtn) {
                // Set initial icon based on body class
                if (document.body.classList.contains('light-mode')) {
                    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                }
                
                themeToggleBtn.addEventListener('click', () => {
                    document.body.classList.toggle('light-mode');
                    const isLight = document.body.classList.contains('light-mode');
                    
                    if (isLight) {
                        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                        localStorage.setItem('studySyncTheme', 'light');
                    } else {
                        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
                        localStorage.setItem('studySyncTheme', 'dark');
                    }
                });
            }
            this.initialized = true;
        }

        this.checkDeadlines();
    },

    checkDeadlines() {
        if (!state.tasks || state.tasks.length === 0) return;

        const getLocalYYYYMMDD = (dateObj) => {
            return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        };

        const today = new Date();
        const todayStr = getLocalYYYYMMDD(today);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = getLocalYYYYMMDD(tomorrow);

        const dueTasks = state.tasks.filter(t => 
            (t.deadline === tomorrowStr || t.deadline === todayStr) && 
            t.status !== 'done'
        );

        if (dueTasks.length > 0) {
            let reminders = JSON.parse(localStorage.getItem('dailyReminders') || '{"date": "", "count": 0}');
            if (reminders.date !== todayStr) {
                reminders = { date: todayStr, count: 0 };
            }
            
            if (reminders.count < 3) {
                reminders.count++;
                localStorage.setItem('dailyReminders', JSON.stringify(reminders));
                
                const msgs = dueTasks.map(t => {
                    const dueWhen = t.deadline === todayStr ? "TODAY" : "tomorrow";
                    return `<strong>${escapeHTML(t.subject) || 'Task'}</strong>: "${escapeHTML(t.text)}" is due <strong>${dueWhen}</strong>!`;
                });
                const fullMsg = msgs.join("<br><br>");
                
                this.showPersistentReminder(fullMsg);
            }
        }
    },

    showPersistentReminder(message) {
        // Prevent stacking
        if (document.getElementById('deadline-reminder-popup')) return;

        const toast = document.createElement('div');
        toast.id = 'deadline-reminder-popup';
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
                <div>
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--accent-danger);"><i class="fa-solid fa-clock"></i> Reminder</h4>
                    <p style="margin: 0; font-size: 0.95rem; color: var(--text-primary); line-height: 1.5;">${message}</p>
                </div>
                <button class="btn-icon" style="color: var(--text-muted); padding: 0;" onclick="this.closest('#deadline-reminder-popup').remove()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        toast.style.position = 'fixed';
        toast.style.top = '100px'; 
        toast.style.right = '20px';
        toast.style.background = 'var(--bg-surface)';
        toast.style.padding = '1.25rem';
        toast.style.borderRadius = 'var(--radius-md)';
        toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(245, 158, 11, 0.2)';
        toast.style.borderLeft = '4px solid var(--accent-danger)';
        toast.style.zIndex = '10000';
        toast.style.maxWidth = '350px';
        
        document.body.appendChild(toast);
        
        // Auto remove after 0.75 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s';
                setTimeout(() => toast.remove(), 500);
            }
        }, 750);
    }
};

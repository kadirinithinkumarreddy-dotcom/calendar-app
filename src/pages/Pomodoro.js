import { state, saveData } from '../utils/state.js?v=1787992689755';
import { updatePerformanceDashboard } from '../components/PerformanceDashboard.js?v=1787992689755';
import { formatDateKey, customConfirm } from '../utils/helpers.js?v=1787992689755';

const MODES = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

export const Pomodoro = {
    timerInterval: null,
    timeLeft: MODES.focus,
    totalTime: MODES.focus, // Track total for progress ring
    isRunning: false,
    currentMode: 'focus',
    elapsedSinceLastSave: 0,

    mount() {
        const view = document.getElementById('view-pomodoro');
        if (view) view.classList.remove('hidden');
        
        if (!this.initialized) {
            this.timeDisplay = document.getElementById('pomodoro-time');
            this.progressRing = document.getElementById('pomodoro-progress-ring');
            this.subjectSelect = document.getElementById('pomodoro-subject');
            this.btnStart = document.getElementById('btn-pomodoro-start');
            this.btnReset = document.getElementById('btn-pomodoro-reset');
            
            this.btnFocus = document.getElementById('btn-mode-focus');
            this.btnShort = document.getElementById('btn-mode-short');
            this.btnLong = document.getElementById('btn-mode-long');
            
            this.btnMinus = document.getElementById('btn-pomodoro-minus');
            this.btnPlus = document.getElementById('btn-pomodoro-plus');
            
            this.btnStart.addEventListener('click', () => this.toggleTimer());
            this.btnReset.addEventListener('click', () => this.resetTimer());
            
            this.btnFocus.addEventListener('click', () => this.setMode('focus'));
            this.btnShort.addEventListener('click', () => this.setMode('short'));
            this.btnLong.addEventListener('click', () => this.setMode('long'));
            
            this.btnMinus.addEventListener('click', () => this.adjustTime(-60));
            this.btnPlus.addEventListener('click', () => this.adjustTime(60));
            
            this.initialized = true;
        }
        
        this.populateSubjects();
        this.updateDisplay();
    },
    
    populateSubjects() {
        if (!this.subjectSelect) return;
        this.subjectSelect.innerHTML = '';
        
        if (state.subjects.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No subjects added. Add them in Calendar.';
            this.subjectSelect.appendChild(option);
            this.subjectSelect.disabled = true;
            return;
        }
        
        this.subjectSelect.disabled = false;
        state.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            this.subjectSelect.appendChild(option);
        });
    },

    async setMode(mode) {
        if (this.isRunning) {
            if (!(await customConfirm("A timer is currently running. Switch modes anyway?"))) return;
        }
        
        this.stopTimer();
        this.currentMode = mode;
        this.timeLeft = MODES[mode];
        this.totalTime = MODES[mode];
        this.elapsedSinceLastSave = 0;
        
        // Update UI
        [this.btnFocus, this.btnShort, this.btnLong].forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-primary)';
            btn.className = 'btn-secondary';
        });
        
        const activeBtn = mode === 'focus' ? this.btnFocus : (mode === 'short' ? this.btnShort : this.btnLong);
        
        // Define colors per mode
        let modeColor = 'var(--accent-primary)'; // default indigo
        if (mode === 'short') modeColor = 'var(--accent-success)'; // green
        if (mode === 'long') modeColor = '#3b82f6'; // blue
        
        activeBtn.style.background = modeColor;
        activeBtn.style.color = 'white';
        activeBtn.className = 'btn-primary';
        
        if (this.progressRing) {
            this.progressRing.style.stroke = modeColor;
            this.progressRing.style.filter = `drop-shadow(0 0 8px ${modeColor})`;
        }
        
        this.updateDisplay();
    },

    adjustTime(seconds) {
        // Prevent dropping below 1 minute unless it's already lower
        if (this.timeLeft + seconds < 60 && seconds < 0 && this.timeLeft >= 60) {
            this.timeLeft = 60;
            this.totalTime = 60;
        } else if (this.timeLeft + seconds > 0) {
            this.timeLeft += seconds;
            this.totalTime += seconds; // adjust total so ring doesn't break
        }
        this.updateDisplay();
    },

    toggleTimer() {
        if (this.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer() {
        if (this.timeLeft <= 0) return;
        
        this.isRunning = true;
        this.btnStart.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
        
        // Initialize AudioContext during user interaction to bypass autoplay restrictions
        this.initAudio();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            // Only track elapsed time for Focus mode if a subject is selected
            if (this.currentMode === 'focus' && this.subjectSelect.value) {
                this.elapsedSinceLastSave++;
                // Save time in chunks (e.g., every 5 seconds) to avoid spamming localStorage, or wait until pause
            }
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.flushTimeData();
                this.playNotification();
            }
        }, 1000);
    },

    stopTimer() {
        this.isRunning = false;
        this.btnStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
        clearInterval(this.timerInterval);
        this.flushTimeData();
    },

    resetTimer() {
        if (this.isRunning) this.stopTimer();
        this.timeLeft = this.totalTime; // Reset back to whatever they customized it to
        this.elapsedSinceLastSave = 0;
        this.updateDisplay();
    },
    
    flushTimeData() {
        if (this.elapsedSinceLastSave > 0 && this.currentMode === 'focus') {
            const subject = this.subjectSelect.value;
            if (subject) {
                if (!state.timeData[subject]) {
                    state.timeData[subject] = 0;
                }
                state.timeData[subject] += this.elapsedSinceLastSave;
                saveData();
                updatePerformanceDashboard();
            }
            this.elapsedSinceLastSave = 0;
        }
    },

    updateDisplay() {
        if (!this.timeDisplay) return;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.progressRing) {
            // Circumference of circle is 565.48 (2 * pi * 90)
            const circumference = 565.48;
            const percentage = this.timeLeft / this.totalTime;
            const dashoffset = circumference - (percentage * circumference);
            this.progressRing.style.strokeDashoffset = dashoffset;
        }
    },
    
    initAudio() {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
        } catch (e) {
            console.error("Audio Context initialization failed", e);
        }
    },
    
    playNotification() {
        // Play sound using initialized AudioContext
        try {
            if (!this.audioCtx) this.initAudio();
            
            const osc = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            // Pleasant "ding" sound
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5 note
            osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.5); // Drop to A4
            
            gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);
            
            osc.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.5);
        } catch(e) {
            console.error("Notification sound failed", e);
        }
        
        // Simple visual ping or sound when timer ends
        const existingToast = document.getElementById('calendar-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.id = 'calendar-toast';
        toast.textContent = "Timer Complete!";
        toast.style.position = 'fixed';
        toast.style.top = '100px';
        toast.style.right = '20px';
        toast.style.background = 'var(--accent-primary)';
        toast.style.color = '#fff';
        toast.style.padding = '1rem 2rem';
        toast.style.borderRadius = 'var(--radius-md)';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        toast.style.zIndex = '9999';
        toast.style.fontWeight = 'bold';
        
        document.body.appendChild(toast);
        setTimeout(() => {
            if (document.body.contains(toast)) document.body.removeChild(toast);
        }, 4000);
    }
};

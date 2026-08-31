import { state, saveData } from '../utils/state.js?v=1787992689755';
import { customConfirm } from '../utils/helpers.js?v=1787992689755';
import { showToast, escapeHTML } from '../utils/helpers.js?v=1787992689755';

export const Kanban = {
    initialized: false,
    draggedTask: null,

    mount() {
        const view = document.getElementById('view-tasks');
        if (view) view.classList.remove('hidden');
        
        if (!this.initialized) {
            this.btnAdd = document.getElementById('btn-add-task');
            this.modal = document.getElementById('task-modal');
            this.modalClose = document.getElementById('task-modal-close');
            this.modalCancel = document.getElementById('task-modal-cancel');
            this.modalSave = document.getElementById('task-modal-save');
            
            this.inputDesc = document.getElementById('task-input-text');
            this.inputSubj = document.getElementById('task-input-subject');
            this.inputPriority = document.getElementById('task-input-priority');
            this.inputDeadline = document.getElementById('task-input-deadline');
            
            this.dropzones = [
                document.getElementById('drop-todo'),
                document.getElementById('drop-progress'),
                document.getElementById('drop-done')
            ];
            
            this.setupEventListeners();
            this.initialized = true;
        }
        
        this.populateSubjectDropdown();
        this.renderTasks();
    },

    setupEventListeners() {
        // Modal toggles
        this.btnAdd.addEventListener('click', () => {
            this.inputDesc.value = '';
            this.inputDeadline.value = '';
            this.inputSubj.value = '';
            this.inputPriority.value = 'medium';
            
            // Set min deadline to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            this.inputDeadline.min = tomorrow.toISOString().split('T')[0];
            
            this.modal.classList.remove('hidden');
            this.inputDesc.focus();
        });
        
        const closeModal = () => this.modal.classList.add('hidden');
        this.modalClose.addEventListener('click', closeModal);
        this.modalCancel.addEventListener('click', closeModal);
        
        // Save Task
        this.modalSave.addEventListener('click', () => {
            const desc = this.inputDesc.value.trim();
            if (!desc) {
                showToast("Please enter a task description.");
                return;
            }
            
            const selectedDeadline = this.inputDeadline.value;
            if (selectedDeadline) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                
                if (selectedDeadline < tomorrowStr) {
                    showToast("Deadline must be a future date!");
                    return;
                }
            }
            
            const newTask = {
                id: 'task_' + Date.now(),
                text: escapeHTML(desc),
                subject: this.inputSubj.value || null,
                priority: this.inputPriority.value || 'medium',
                deadline: this.inputDeadline.value || null,
                status: 'todo' // Default status
            };
            
            if (!state.tasks) state.tasks = [];
            state.tasks.push(newTask);
            saveData();
            this.renderTasks();
            closeModal();
        });
        
        // Drag and Drop Zones (Removed for button interactions)
    },

    populateSubjectDropdown() {
        this.inputSubj.innerHTML = '<option value="">-- No Subject --</option>';
        state.subjects.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            this.inputSubj.appendChild(opt);
        });
    },

    updateTaskStatus(taskId, newStatus) {
        const task = state.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            saveData();
            this.renderTasks();
        }
    },

    async deleteTask(taskId) {
        if(await customConfirm("Are you sure you want to delete this task?")) {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
            saveData();
            this.renderTasks();
        }
    },

    renderTasks() {
        // Clear columns
        this.dropzones.forEach(zone => zone.innerHTML = '');
        
        let counts = { todo: 0, progress: 0, done: 0 };
        const today = new Date().toISOString().split('T')[0];
        
        if (state.tasks) {
            state.tasks.forEach(task => {
                const colId = `drop-${task.status}`;
                const zone = document.getElementById(colId);
                
                if (zone) {
                    counts[task.status]++;
                    
                    const card = document.createElement('div');
                    card.className = 'task-card';
                    card.dataset.id = task.id;
                    
                    let subjectHtml = task.subject ? `<span class="task-subject-tag">${escapeHTML(task.subject)}</span>` : `<span></span>`;
                    
                    let priorityColor = task.priority === 'high' ? 'var(--accent-danger)' : (task.priority === 'low' ? 'var(--accent-success)' : '#f59e0b');
                    let priorityHtml = `
                        <span class="task-priority-tag date-picker-trigger" style="background: ${priorityColor}22; color: ${priorityColor}; cursor: pointer; position: relative;" title="Click to set deadline">
                            <i class="fa-solid fa-clock"></i>
                            <input type="date" class="hidden-date-input" style="position: absolute; opacity: 0; width: 1px; height: 1px; bottom: 0; left: 0; pointer-events: none;" value="${task.deadline || ''}">
                        </span>
                    `;
                    
                    let deadlineHtml = '';
                    if (task.deadline) {
                        const isOverdue = task.deadline < today && task.status !== 'done';
                        deadlineHtml = `<span class="task-deadline ${isOverdue ? 'overdue' : ''}"><i class="fa-regular fa-clock"></i> ${task.deadline}</span>`;
                    }
                    
                    let moveControlsHtml = `<div class="task-move-controls">`;
                    if (task.status === 'todo') {
                        moveControlsHtml += `<button class="task-move-btn" data-action="progress" title="Start Task"><i class="fa-solid fa-arrow-right"></i></button>`;
                    } else if (task.status === 'progress') {
                        moveControlsHtml += `<button class="task-move-btn" data-action="todo" title="Move back to To Do"><i class="fa-solid fa-arrow-left"></i></button>`;
                        moveControlsHtml += `<button class="task-move-btn" data-action="done" title="Complete Task"><i class="fa-solid fa-check"></i></button>`;
                    } else if (task.status === 'done') {
                        moveControlsHtml += `<button class="task-move-btn" data-action="progress" title="Reopen Task"><i class="fa-solid fa-arrow-left"></i></button>`;
                    }
                    moveControlsHtml += `</div>`;
                    
                    card.innerHTML = `
                        <div class="task-card-header">
                            <div style="display: flex; gap: 0.5rem;">
                                ${priorityHtml}
                                ${subjectHtml}
                            </div>
                            <button class="task-delete-btn" title="Delete Task"><i class="fa-solid fa-trash"></i></button>
                        </div>
                        <div class="task-text">${escapeHTML(task.text)}</div>
                        <div class="task-footer">
                            ${deadlineHtml}
                            ${moveControlsHtml}
                        </div>
                    `;
                    
                    card.querySelector('.task-delete-btn').addEventListener('click', () => this.deleteTask(task.id));
                    card.querySelectorAll('.task-move-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const newStatus = btn.dataset.action;
                            this.updateTaskStatus(task.id, newStatus);
                        });
                    });
                    
                    const dateTrigger = card.querySelector('.date-picker-trigger');
                    const dateInput = card.querySelector('.hidden-date-input');
                    if (dateTrigger && dateInput) {
                        dateTrigger.addEventListener('click', () => {
                            dateInput.showPicker();
                        });
                        dateInput.addEventListener('change', (e) => {
                            if (e.target.value) {
                                task.deadline = e.target.value;
                                saveData();
                                this.renderTasks();
                            }
                        });
                    }
                    
                    zone.appendChild(card);
                }
            });
        }
        
        // Add Empty States
        this.dropzones.forEach(zone => {
            if (zone.children.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'kanban-empty-state';
                empty.innerHTML = `<i class="fa-solid fa-inbox"></i><p>Drop tasks here</p>`;
                zone.appendChild(empty);
            }
        });
        
        // Update counts
        document.getElementById('count-todo').textContent = counts.todo;
        document.getElementById('count-progress').textContent = counts.progress;
        document.getElementById('count-done').textContent = counts.done;
    }
};

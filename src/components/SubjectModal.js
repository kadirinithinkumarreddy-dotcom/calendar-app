import { state, saveData } from '../utils/state.js?v=1787992689755';

export function openModal(editIndex = -1, onSaveCallback) {
    const modalTitle = document.getElementById('modal-title');
    const subjectInput = document.getElementById('subject-input');
    const editSubjectIndex = document.getElementById('edit-subject-index');
    const modal = document.getElementById('subject-modal');

    if (editIndex > -1) {
        modalTitle.textContent = 'Edit Subject';
        subjectInput.value = state.subjects[editIndex];
        editSubjectIndex.value = editIndex;
    } else {
        modalTitle.textContent = 'Add Subject';
        subjectInput.value = '';
        editSubjectIndex.value = '';
    }
    
    // Store callback to invoke when saving
    modal.dataset.onSave = onSaveCallback ? 'true' : 'false';
    window.__subjectModalCallback = onSaveCallback;
    
    modal.classList.remove('hidden');
    subjectInput.focus();
}

export function closeModal() {
    const modal = document.getElementById('subject-modal');
    const subjectInput = document.getElementById('subject-input');
    const editSubjectIndex = document.getElementById('edit-subject-index');
    
    modal.classList.add('hidden');
    subjectInput.value = '';
    editSubjectIndex.value = '';
}

export function saveSubject() {
    const subjectInput = document.getElementById('subject-input');
    const editSubjectIndex = document.getElementById('edit-subject-index');
    
    const subjectName = subjectInput.value.trim();
    if (!subjectName) return;
    
    const editIndex = editSubjectIndex.value;
    
    if (editIndex !== '') {
        // Edit existing
        const oldName = state.subjects[editIndex];
        state.subjects[editIndex] = subjectName;
        
        // Update history if name changed
        if (oldName !== subjectName) {
            for (const monthKey in state.studyData) {
                if (state.studyData[monthKey][oldName]) {
                    state.studyData[monthKey][subjectName] = state.studyData[monthKey][oldName];
                    delete state.studyData[monthKey][oldName];
                }
            }
        }
    } else {
        // Add new
        if (!state.subjects.includes(subjectName)) {
            state.subjects.push(subjectName);
        }
    }
    
    saveData();
    closeModal();
    
    if (window.__subjectModalCallback) {
        window.__subjectModalCallback();
    }
}

export function initSubjectModal() {
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');
    const subjectInput = document.getElementById('subject-input');
    const modal = document.getElementById('subject-modal');
    
    if(modalClose) modalClose.addEventListener('click', closeModal);
    if(modalCancel) modalCancel.addEventListener('click', closeModal);
    if(modalSave) modalSave.addEventListener('click', saveSubject);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Save subject on Enter key
    if(subjectInput) subjectInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveSubject();
    });
}

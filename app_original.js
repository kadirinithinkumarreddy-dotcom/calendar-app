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

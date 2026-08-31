import { state, saveData } from '../utils/state.js?v=1787992689755';
import { customConfirm, sanitizeHTML } from '../utils/helpers.js?v=1787992689755';

let currentPage = 0;

export const Notes = {
    mount() {
        const view = document.getElementById('view-notes');
        if (view) {
            view.classList.remove('hidden');
            view.style.overflowY = 'hidden'; 
        }
        
        if (!state.notesArray || state.notesArray.length === 0) {
            state.notesArray = state.notes ? [state.notes] : [""];
        }

        if (view) {
            view.innerHTML = `
                <div class="view-header" style="margin-bottom: 1rem;">
                    <h2 style="margin: 0; font-size: 2rem;">Notes & Tasks</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.25rem;">Auto-saved locally. Max 3 pages.</p>
                </div>
                
                <div id="notes-tab-bar" style="display: flex; gap: 0.25rem; border-bottom: 2px solid var(--accent-primary); margin-bottom: 1rem; padding: 0 0.5rem;">
                    <!-- Tabs populated by JS -->
                </div>

                <div id="single-note-container" style="display: flex; flex-direction: column; flex: 1; padding-bottom: 2rem;">
                    <!-- Active note editor populated by JS -->
                </div>
            `;
        }

        const tabBar = document.getElementById('notes-tab-bar');
        const editorContainer = document.getElementById('single-note-container');

        if (currentPage >= state.notesArray.length) {
            currentPage = Math.max(0, state.notesArray.length - 1);
        }

        const renderView = () => {
            if (!editorContainer || !tabBar) return;

            // Render Tab Bar
            tabBar.innerHTML = '';
            
            state.notesArray.forEach((_, idx) => {
                const tab = document.createElement('button');
                tab.innerText = `Note ${idx + 1}`;
                
                // Tab styling
                tab.style.padding = '0.5rem 1.5rem';
                tab.style.fontSize = '0.95rem';
                tab.style.fontWeight = '500';
                tab.style.border = 'none';
                tab.style.borderTopLeftRadius = '8px';
                tab.style.borderTopRightRadius = '8px';
                tab.style.cursor = 'pointer';
                tab.style.transition = 'background 0.2s';
                
                if (currentPage === idx) {
                    tab.style.background = 'var(--accent-primary)';
                    tab.style.color = '#ffffff';
                } else {
                    tab.style.background = 'var(--bg-surface)';
                    tab.style.color = 'var(--text-secondary)';
                    tab.addEventListener('mouseover', () => tab.style.color = 'var(--text-primary)');
                    tab.addEventListener('mouseout', () => tab.style.color = 'var(--text-secondary)');
                }

                tab.addEventListener('click', () => {
                    currentPage = idx;
                    renderView();
                });
                
                tabBar.appendChild(tab);
            });

            // Add "+" button if under limit
            if (state.notesArray.length < 3) {
                const btnAdd = document.createElement('button');
                btnAdd.innerHTML = '<i class="fa-solid fa-plus"></i>';
                btnAdd.title = "Add Note Page";
                btnAdd.style.padding = '0.5rem 1rem';
                btnAdd.style.border = 'none';
                btnAdd.style.background = 'transparent';
                btnAdd.style.color = 'var(--text-secondary)';
                btnAdd.style.fontSize = '1.1rem';
                btnAdd.style.cursor = 'pointer';
                btnAdd.style.display = 'flex';
                btnAdd.style.alignItems = 'center';
                
                btnAdd.addEventListener('mouseover', () => btnAdd.style.color = 'var(--accent-primary)');
                btnAdd.addEventListener('mouseout', () => btnAdd.style.color = 'var(--text-secondary)');

                btnAdd.addEventListener('click', () => {
                    state.notesArray.push("");
                    currentPage = state.notesArray.length - 1; // Jump to new page
                    saveData();
                    renderView();
                });
                
                tabBar.appendChild(btnAdd);
            }

            // Render the active note editor
            editorContainer.innerHTML = '';
            
            const noteDiv = document.createElement('div');
            noteDiv.style.display = 'flex';
            noteDiv.style.flexDirection = 'column';
            noteDiv.style.flex = '1';
            noteDiv.style.height = '100%';

            const toolbar = document.createElement('div');
            toolbar.className = 'rich-text-toolbar';
            toolbar.style.display = 'flex';
            toolbar.style.gap = '0.5rem';
            toolbar.style.marginBottom = '0.5rem';
            toolbar.style.background = 'var(--bg-surface)';
            toolbar.style.padding = '0.5rem';
            toolbar.style.border = '1px solid var(--border-color)';
            toolbar.style.borderRadius = 'var(--radius-sm)';
            toolbar.style.justifyContent = 'space-between';

            const toolsDiv = document.createElement('div');
            toolsDiv.style.display = 'flex';
            toolsDiv.style.gap = '0.5rem';
            toolsDiv.innerHTML = `
                <button class="btn-icon rtf-btn" data-command="bold" title="Bold"><i class="fa-solid fa-bold"></i></button>
                <button class="btn-icon rtf-btn" data-command="italic" title="Italic"><i class="fa-solid fa-italic"></i></button>
                <button class="btn-icon rtf-btn" data-command="insertUnorderedList" title="Bullet Points"><i class="fa-solid fa-list-ul"></i></button>
                <button class="btn-icon rtf-btn" data-command="hiliteColor" data-value="yellow" title="Highlight (Yellow)"><i class="fa-solid fa-highlighter"></i></button>
            `;
            toolbar.appendChild(toolsDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '0.5rem';

            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn-secondary';
            downloadBtn.style.padding = '0.25rem 0.75rem';
            downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download';
            downloadBtn.title = `Download Note ${currentPage + 1}`;
            downloadBtn.addEventListener('click', () => {
                const content = state.notesArray[currentPage] || "";
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                const textContent = tempDiv.innerText || tempDiv.textContent || "";
                
                const blob = new Blob([textContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Note_${currentPage + 1}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            });
            actionsDiv.appendChild(downloadBtn);

            if (state.notesArray.length > 1) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-icon';
                deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="color: var(--accent-danger);"></i>';
                deleteBtn.title = "Delete This Note";
                deleteBtn.addEventListener('click', async () => {
                    const confirmed = await customConfirm(`Are you sure you want to delete Note ${currentPage + 1}?`);
                    if (confirmed) {
                        state.notesArray.splice(currentPage, 1);
                        if (currentPage >= state.notesArray.length) {
                            currentPage = Math.max(0, state.notesArray.length - 1);
                        }
                        saveData();
                        renderView();
                    }
                });
                actionsDiv.appendChild(deleteBtn);
            }
            
            toolbar.appendChild(actionsDiv);

            const textarea = document.createElement('div');
            textarea.id = 'notes-textarea-active';
            textarea.className = 'notes-editor-box';
            textarea.contentEditable = "true";
            textarea.setAttribute('placeholder', `Start typing on Note ${currentPage + 1}...`);
            textarea.style.flex = '1';
            textarea.style.minHeight = '0'; 
            textarea.innerHTML = state.notesArray[currentPage] || "";

            textarea.addEventListener('input', (e) => {
                state.notesArray[currentPage] = sanitizeHTML(e.target.innerHTML);
                saveData();
            });

            toolsDiv.querySelectorAll('.rtf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const command = btn.dataset.command;
                    const value = btn.dataset.value || null;
                    document.execCommand(command, false, value);
                    textarea.focus();
                    state.notesArray[currentPage] = sanitizeHTML(textarea.innerHTML);
                    saveData();
                });
            });

            noteDiv.appendChild(toolbar);
            noteDiv.appendChild(textarea);
            editorContainer.appendChild(noteDiv);
        };

        renderView();
    }
};

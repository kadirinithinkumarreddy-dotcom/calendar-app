import { supabase } from './supabaseClient.js?v=1787992689755';
import { getCurrentUser } from './auth.js?v=1787992689755';

export const DEFAULT_SUBJECTS = ["SQL", "Gen AI", "Python", "Java", "Blue Prism"];

const LOCAL_STORAGE_KEY = 'studySyncState';

export const state = {
    subjects: [...DEFAULT_SUBJECTS],
    studyData: {}, // Format: { "YYYY-MM": { "SubjectName": ["YYYY-MM-DD", ...] } }
    timeData: {}, // Format: { "SubjectName": totalSeconds }
    tasks: [], // Format: [{ id, text, status, deadline, subject }]
    notes: "",
    notesArray: [""]
};

export const AppState = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

export async function loadData() {
    // 1. Always load from localStorage first for instant rendering
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state.subjects = (parsed.subjects && parsed.subjects.length > 0) ? parsed.subjects : [...DEFAULT_SUBJECTS];
            state.studyData = parsed.studyData || {};
            state.timeData = parsed.timeData || {};
            state.tasks = parsed.tasks || [];
            state.notes = parsed.notes || "";
            state.notesArray = parsed.notesArray || (parsed.notes ? [parsed.notes] : [""]);
        }
    } catch (e) {
        console.warn('Error reading from localStorage:', e);
    }

    // 2. If logged in via Supabase, fetch latest cloud data
    try {
        const user = await getCurrentUser();
        if (user && user.id && !user.id.startsWith('local_') && !user.id.startsWith('guest_')) {
            const { data, error } = await supabase
                .from('user_data')
                .select('state')
                .eq('id', user.id)
                .single();

            if (!error && data && data.state) {
                const parsed = data.state;
                state.subjects = parsed.subjects || state.subjects;
                state.studyData = parsed.studyData || state.studyData;
                state.timeData = parsed.timeData || state.timeData;
                state.tasks = parsed.tasks || state.tasks;
                state.notes = parsed.notes || state.notes;
                state.notesArray = parsed.notesArray || state.notesArray;
                
                // Keep localStorage in sync
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
            }
        }
    } catch (err) {
        console.warn('Could not sync with Supabase cloud state:', err);
    }
}

export async function saveData() {
    // 1. Immediately persist to localStorage
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }

    // 2. Sync to Supabase in the background if logged in
    try {
        const user = await getCurrentUser();
        if (user && user.id && !user.id.startsWith('local_') && !user.id.startsWith('guest_')) {
            await supabase
                .from('user_data')
                .upsert({
                    id: user.id,
                    state: state
                });
        }
    } catch (err) {
        // Silently catch cloud sync failures so local app is never interrupted
        console.warn('Background Supabase save skipped:', err);
    }
}

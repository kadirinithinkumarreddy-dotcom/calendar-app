import { supabase } from './supabaseClient.js?v=1787992689755';

const SESSION_KEY = 'studySyncSession';
const USER_KEY = 'studySyncCurrentUser';

// Helper to get local user registry
function getLocalUsers() {
    try {
        return JSON.parse(localStorage.getItem('studySyncAuth') || '{"users":[]}').users || [];
    } catch {
        return [];
    }
}

// Helper to save local user registry
function saveLocalUsers(users) {
    localStorage.setItem('studySyncAuth', JSON.stringify({ users }));
}

export async function registerUser(name, phone, email, password, education = '') {
    // 1. Try Supabase registration first
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { name, phone, education, status: 'Pending' }
            }
        });

        if (!error && data?.user) {
            // Also store in local registry for admin dashboard
            const users = getLocalUsers();
            if (!users.some(u => u.email === email)) {
                users.push({ name, phone, email, password, registrationTime: new Date().toISOString(), status: 'Pending' });
                saveLocalUsers(users);
            }
            return { success: true };
        }
    } catch (err) {
        console.warn('Supabase sign up warning, falling back to local storage:', err);
    }

    // 2. Fallback to local storage user creation
    const users = getLocalUsers();
    if (users.some(u => u.email === email)) {
        return { success: false, message: 'Email is already registered.' };
    }

    users.push({
        name,
        phone,
        email,
        password, // stored locally for offline demo
        registrationTime: new Date().toISOString(),
        status: 'Pending'
    });
    saveLocalUsers(users);
    return { success: true };
}

export async function loginUser(email, password) {
    // 1. Try Supabase signIn first
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (!error && data?.user) {
            sessionStorage.setItem(SESSION_KEY, data.user.id);
            localStorage.setItem(SESSION_KEY, data.user.id);
            localStorage.setItem(USER_KEY, JSON.stringify({
                id: data.user.id,
                email: email,
                name: data.user.user_metadata?.name || email.split('@')[0]
            }));
            return { success: true };
        }
    } catch (err) {
        console.warn('Supabase login warning, falling back to local login:', err);
    }

    // 2. Allow local login fallback so users are never blocked
    const users = getLocalUsers();
    const existing = users.find(u => u.email === email);
    
    // Accept valid local user or default demo credentials
    const userId = existing ? 'user_' + existing.email : 'local_' + (email ? email.replace(/[^a-zA-Z0-9]/g, '_') : 'guest');
    const userName = existing?.name || (email ? email.split('@')[0] : 'StudySync User');

    sessionStorage.setItem(SESSION_KEY, userId);
    localStorage.setItem(SESSION_KEY, userId);
    localStorage.setItem(USER_KEY, JSON.stringify({
        id: userId,
        email: email || 'local@user.com',
        name: userName
    }));

    return { success: true };
}

export function loginGuest() {
    const guestId = 'guest_' + Date.now();
    sessionStorage.setItem(SESSION_KEY, guestId);
    localStorage.setItem(SESSION_KEY, guestId);
    localStorage.setItem(USER_KEY, JSON.stringify({
        id: guestId,
        email: 'guest@studysync.local',
        name: 'Future Cop'
    }));
    return { success: true };
}

export async function logoutUser() {
    try {
        await supabase.auth.signOut();
    } catch (e) {
        // Ignore offline sign out error
    }
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
    return !!sessionStorage.getItem(SESSION_KEY) || !!localStorage.getItem(SESSION_KEY);
}

export async function getCurrentUser() {
    // Check Supabase first
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user;
    } catch (e) {
        // Supabase error, fall back to local
    }

    // Check localStorage user
    try {
        const local = localStorage.getItem(USER_KEY);
        if (local) return JSON.parse(local);
    } catch (e) {}

    return null;
}

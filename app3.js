// Supabase Initialization
const SUPABASE_URL = 'https://sysgangasppievuogetp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5c2dhbmdhc3BwaWV2dW9nZXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzE4NDQsImV4cCI6MjEwMDIwNzg0NH0.9YBslrpzFf2Q8JHTqADLactpAQZrT2NfppTkVsfRdpg';
let supabase = null;
let authClient = null;

try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        authClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }
} catch (e) {
    console.error("Supabase init error:", e);
}

// Application State
const DEFAULT_SUBJECTS = ["SQL", "Gen AI", "Python", "Java", "Blue Prism"];

let currentUser = null;
let userProfile = null;
let subjectMap = {}; 

let state = {
    subjects: [],
    studyData: {}, 
    notes: ""
};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM Elements - using helper function to avoid crashes
function getEl(id) {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element with ID '${id}' not found!`);
    return el;
}

// Global elements
// navMenu declared below
// views declared below
// btnNavHome declared below
// logo declared below
// cards declared below
// cardAdminLogin declared below
// btnLogout declared below

// Notes & Calendar
// notesTextarea declared below
// currentMonthDisplay declared below
// btnPrevMonth declared below
// btnNextMonth declared below
// trackerHeaderRow declared below
// trackerBody declared below

// Standard Auth
// authOverlay declared below
// authTitle declared below
// authError declared below
// authEmail declared below
// authPassword declared below
// btnAuthSubmit declared below
// authToggleLink declared below
// authToggleText declared below
let isLoginMode = true;

// Admin Auth
// adminLoginModal declared below
// adminModalClose declared below
// adminAuthError declared below
// adminAuthEmail declared below
// adminAuthPassword declared below
// btnAdminLogin declared below

// Admin Dashboard
// pendingUsersList declared below
// newAdminEmail declared below
// newAdminPassword declared below
// newAdminConfirm declared below
// btnCreateAdmin declared below
// adminCreateMsg declared below

// Modals & Performance
// modal declared below
// modalTitle declared below
// subjectInput declared below
// editSubjectIndex declared below
// btnAddSubject declared below
// btnModalClose declared below
// btnModalCancel declared below
// btnModalSave declared below
// performancePopup declared below
// btnCheckPerformance declared below
// popupClose declared below
// performanceFilter declared below
let performanceChart = null;

let navMenu;
let views;
let btnNavHome;
let logo;
let cards;
let cardAdminLogin;
let btnLogout;
let notesTextarea;
let currentMonthDisplay;
let btnPrevMonth;
let btnNextMonth;
let trackerHeaderRow;
let trackerBody;
let authOverlay;
let authTitle;
let authError;
let authEmail;
let authPassword;
let btnAuthSubmit;
let authToggleLink;
let authToggleText;
let adminLoginModal;
let adminModalClose;
let adminAuthError;
let adminAuthEmail;
let adminAuthPassword;
let btnAdminLogin;
let pendingUsersList;
let newAdminEmail;
let newAdminPassword;
let newAdminConfirm;
let btnCreateAdmin;
let adminCreateMsg;
let modal;
let modalTitle;
let subjectInput;
let editSubjectIndex;
let btnAddSubject;
let btnModalClose;
let btnModalCancel;
let btnModalSave;
let performancePopup;
let btnCheckPerformance;
let popupClose;
    let performanceFilter;

function initDOM() {
    navMenu = getEl('nav-menu');
    views = document.querySelectorAll('.view');
    btnNavHome = document.querySelector('.btn-nav[data-view="home"]');
    logo = getEl('logo');
    cards = document.querySelectorAll('.card');
    cardAdminLogin = getEl('card-admin-login');
    btnLogout = getEl('btn-logout');
    notesTextarea = getEl('notes-textarea');
    currentMonthDisplay = getEl('current-month-display');
    btnPrevMonth = getEl('prev-month');
    btnNextMonth = getEl('next-month');
    trackerHeaderRow = getEl('tracker-header-row');
    trackerBody = getEl('tracker-body');
    authOverlay = getEl('auth-overlay');
    authTitle = getEl('auth-title');
    authError = getEl('auth-error');
    authEmail = getEl('auth-email');
    authPassword = getEl('auth-password');
    btnAuthSubmit = getEl('btn-auth-submit');
    authToggleLink = getEl('auth-toggle-link');
    authToggleText = getEl('auth-toggle-text');
    adminLoginModal = getEl('admin-login-modal');
    adminModalClose = getEl('admin-modal-close');
    adminAuthError = getEl('admin-auth-error');
    adminAuthEmail = getEl('admin-auth-email');
    adminAuthPassword = getEl('admin-auth-password');
    btnAdminLogin = getEl('btn-admin-login');
    pendingUsersList = getEl('pending-users-list');
    newAdminEmail = getEl('new-admin-email');
    newAdminPassword = getEl('new-admin-password');
    newAdminConfirm = getEl('new-admin-confirm');
    btnCreateAdmin = getEl('btn-create-admin');
    adminCreateMsg = getEl('admin-create-msg');
    modal = getEl('subject-modal');
    modalTitle = getEl('modal-title');
    subjectInput = getEl('subject-input');
    editSubjectIndex = getEl('edit-subject-index');
    btnAddSubject = getEl('btn-add-subject');
    btnModalClose = getEl('modal-close');
    btnModalCancel = getEl('modal-cancel');
    btnModalSave = getEl('modal-save');
    performancePopup = getEl('performance-popup');
    btnCheckPerformance = getEl('btn-check-performance');
    popupClose = getEl('popup-close');
    performanceFilter = getEl('performance-filter');
}

function init() {
    initDOM();
    try {
        if (!window.supabase) {
            alert("Database connection failed to load. Please check your internet or ad-blocker.");
            return;
        }
        setupEventListeners();
        checkAuthSession();
    } catch (err) {
        console.error("Initialization Error:", err);
        alert("An error occurred starting the app. Please do a Hard Refresh (Ctrl+F5).");
    }
}

// ---------------------------------------------------------
// AUTHENTICATION & AUTHORIZATION
// ---------------------------------------------------------
async function checkAuthSession() {
    if (!supabase) {
        if (authOverlay) authOverlay.classList.add('hidden');
        await loadDataFromSupabase();
        switchView('home');
        return;
    }
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error("Session fetch error", error);
            if (authOverlay) authOverlay.classList.remove('hidden');
            return;
        }
        
        if (session) {
            await handleSuccessfulLogin(session.user);
        } else {
            if (authOverlay) authOverlay.classList.remove('hidden');
        }
    } catch (err) {
        console.error("Check Auth Error:", err);
        if (authOverlay) authOverlay.classList.remove('hidden');
    }
}

async function handleSuccessfulLogin(user) {
    currentUser = user;
    
    try {
        // Fetch profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (error) {
            console.error(error);
            await supabase.auth.signOut();
            showAuthError("Error fetching user profile. Have you run the SQL script?");
            if (authOverlay) authOverlay.classList.remove('hidden');
            return;
        }
        
        userProfile = profile;
        
        if (profile.role === 'admin') {
            if (authOverlay) authOverlay.classList.add('hidden');
            if (adminLoginModal) adminLoginModal.classList.add('hidden');
            await loadDataFromSupabase(); // Admin needs data too!
            switchView('home');
            if (adminLoginModal && !adminLoginModal.classList.contains('hidden')) {
                switchView('admin-dashboard');
            }
        } else {
            if (profile.status === 'pending') {
                await supabase.auth.signOut();
                showAuthError("Your account is awaiting administrator approval.");
                if (authOverlay) authOverlay.classList.remove('hidden');
                return;
            } else if (profile.status === 'rejected') {
                await supabase.auth.signOut();
                showAuthError("Your registration has been rejected.");
                if (authOverlay) authOverlay.classList.remove('hidden');
                return;
            }
            
            if (authOverlay) authOverlay.classList.add('hidden');
            if (adminLoginModal) adminLoginModal.classList.add('hidden');
            await loadDataFromSupabase();
            switchView('home');
        }
    } catch (err) {
        console.error("Login Handle Error:", err);
    }
}

function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
}
function showAdminAuthError(msg) {
    adminAuthError.textContent = msg;
    adminAuthError.classList.remove('hidden');
}

// ---------------------------------------------------------
// ADMIN DASHBOARD
// ---------------------------------------------------------
async function loadAdminDashboard() {
    if (!userProfile || userProfile.role !== 'admin') {
        alert("Access denied.");
        return;
    }
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .eq('role', 'user');
        
    pendingUsersList.innerHTML = '';
    
    if (error) {
        console.error(error);
        pendingUsersList.innerHTML = '<tr><td colspan="4">Error loading users</td></tr>';
        return;
    }
    
    if (data.length === 0) {
        pendingUsersList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No pending requests</td></tr>';
        return;
    }
    
    data.forEach(user => {
        const tr = document.createElement('tr');
        const date = new Date(user.created_at).toLocaleDateString();
        
        tr.innerHTML = `
            <td>${user.email}</td>
            <td>${date}</td>
            <td><span class="status-badge pending">Pending</span></td>
            <td>
                <button class="btn-small btn-approve" onclick="updateUserStatus('${user.id}', 'approved')">Approve</button>
                <button class="btn-small btn-reject" onclick="updateUserStatus('${user.id}', 'rejected')">Reject</button>
            </td>
        `;
        pendingUsersList.appendChild(tr);
    });
}

window.updateUserStatus = async function(userId, newStatus) {
    if (!confirm(`Are you sure you want to ${newStatus} this user?`)) return;
    
    const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);
        
    if (error) {
        alert("Error updating user: " + error.message);
    } else {
        loadAdminDashboard();
    }
}

async function handleAdminCreation() {
    const email = newAdminEmail.value.trim();
    const pwd = newAdminPassword.value;
    const confirmPwd = newAdminConfirm.value;
    
    adminCreateMsg.textContent = '';
    
    if (!email || !pwd || !confirmPwd) {
        adminCreateMsg.style.color = 'var(--accent-danger)';
        adminCreateMsg.textContent = 'All fields are required.';
        return;
    }
    
    if (pwd !== confirmPwd) {
        adminCreateMsg.style.color = 'var(--accent-danger)';
        adminCreateMsg.textContent = 'Passwords do not match.';
        return;
    }
    
    btnCreateAdmin.disabled = true;
    btnCreateAdmin.textContent = 'Creating...';
    
    try {
        // Use secondary client so we don't log out the current admin
        const { data, error } = await authClient.auth.signUp({
            email: email,
            password: pwd
        });
        
        if (error) throw error;
        
        if (data.user) {
            // Update profile to admin and approved immediately using our main admin token
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'admin', status: 'approved' })
                .eq('id', data.user.id);
                
            if (profileError) throw profileError;
            
            adminCreateMsg.style.color = 'var(--accent-success)';
            adminCreateMsg.textContent = 'Administrator successfully created!';
            
            newAdminEmail.value = '';
            newAdminPassword.value = '';
            newAdminConfirm.value = '';
        }
    } catch (err) {
        adminCreateMsg.style.color = 'var(--accent-danger)';
        adminCreateMsg.textContent = err.message;
    } finally {
        btnCreateAdmin.disabled = false;
        btnCreateAdmin.textContent = 'Create Admin';
    }
}

// ---------------------------------------------------------
// DATA MANAGEMENT (Standard Users)
// ---------------------------------------------------------
async function loadDataFromSupabase() {
    if (!currentUser || !supabase) {
        console.log('Using Local Storage fallback');
        const localState = localStorage.getItem('studySyncState');
        if (localState) {
            state = JSON.parse(localState);
        } else {
            state.subjects = [...DEFAULT_SUBJECTS];
        }
        if (performancePopup && !performancePopup.classList.contains('hidden')) updatePerformanceDashboard();
        return;
    }
    
    try {
        const { data: subjectsData, error: subjectsError } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', currentUser.id);
            
        if (subjectsError) throw subjectsError;
        
        state.subjects = [];
        subjectMap = {};
        
        if (subjectsData && subjectsData.length > 0) {
            subjectsData.forEach(sub => {
                state.subjects.push(sub.name);
                subjectMap[sub.name] = sub.id;
            });
        } else {
            for (const sub of DEFAULT_SUBJECTS) {
                await addSubjectToSupabase(sub);
            }
        }
        
        const { data: notesData } = await supabase
            .from('notes')
            .select('content')
            .eq('user_id', currentUser.id)
            .maybeSingle(); 
            
        if (notesError && notesError.code !== 'PGRST116') throw notesError; 
            
        if (notesData) {
            state.notes = notesData.content;
        } else {
            state.notes = "";
            await supabase.from('notes').insert({ user_id: currentUser.id, content: "" });
        }
        notesTextarea.value = state.notes;
        
    } catch (err) {
        console.error("Error loading data from Supabase:", err);
    }
}

// ---------------------------------------------------------
// EVENT LISTENERS
// ---------------------------------------------------------
function setupEventListeners() {

    // Auth Toggles (User)
    const handleAuthToggle = (e) => {
        if (e) e.preventDefault();
        isLoginMode = !isLoginMode;
        authTitle.textContent = isLoginMode ? 'Log In' : 'Sign Up';
        btnAuthSubmit.textContent = isLoginMode ? 'Log In' : 'Sign Up';
        authToggleText.innerHTML = isLoginMode 
            ? `Don't have an account? <a href="#" id="auth-toggle-link" style="color: var(--accent-primary); text-decoration: none;">Sign Up</a>`
            : `Already have an account? <a href="#" id="auth-toggle-link" style="color: var(--accent-primary); text-decoration: none;">Log In</a>`;
        
        document.getElementById('auth-toggle-link').addEventListener('click', handleAuthToggle);
        authError.classList.add('hidden');
    };
    
    if(authToggleLink) authToggleLink.addEventListener('click', handleAuthToggle);

    btnAuthSubmit.addEventListener('click', async () => {
        if (!supabase) return showAuthError("Database unavailable.");
        const email = authEmail.value.trim();
        const password = authPassword.value;
        if (!email || !password) return showAuthError("Please enter both email and password.");
        
        btnAuthSubmit.disabled = true;
        btnAuthSubmit.textContent = 'Loading...';
        authError.classList.add('hidden');
        
        try {
            if (isLoginMode) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // session check handles success
            } else {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user && data.user.identities && data.user.identities.length === 0) {
                    throw new Error("Email already registered. Please log in.");
                }
                alert("Registration successful! Your account is now pending admin approval.");
            }
            authEmail.value = '';
            authPassword.value = '';
        } catch (error) {
            showAuthError(error.message);
        } finally {
            btnAuthSubmit.disabled = false;
            btnAuthSubmit.textContent = isLoginMode ? 'Log In' : 'Sign Up';
        }
    });

    // Admin Card Click
    cardAdminLogin.addEventListener('click', () => {
        adminLoginModal.classList.remove('hidden');
        adminAuthError.classList.add('hidden');
        adminAuthEmail.value = '';
        adminAuthPassword.value = '';
    });
    
    adminModalClose.addEventListener('click', () => {
        adminLoginModal.classList.add('hidden');
    });

    // Admin Login Submit
    btnAdminLogin.addEventListener('click', async () => {
        if (!supabase) return showAdminAuthError("Database unavailable.");
        const email = adminAuthEmail.value.trim();
        const password = adminAuthPassword.value;
        
        if (!email || !password) return showAdminAuthError("Enter credentials.");
        
        btnAdminLogin.disabled = true;
        btnAdminLogin.textContent = 'Loading...';
        adminAuthError.classList.add('hidden');
        
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            // The onAuthStateChange will handle verifying if they are an admin
            adminAuthEmail.value = '';
            adminAuthPassword.value = '';
        } catch (error) {
            showAdminAuthError(error.message);
        } finally {
            btnAdminLogin.disabled = false;
            btnAdminLogin.textContent = 'Admin Login';
        }
    });

    // Logout
    btnLogout.addEventListener('click', async () => {
        if (supabase) await supabase.auth.signOut();
    });

    // Supabase Auth State Change
    if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                handleSuccessfulLogin(session.user);
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                userProfile = null;
                state = { subjects: [], studyData: {}, notes: "" };
                notesTextarea.value = "";
                trackerBody.innerHTML = '';
                switchView('home');
                adminLoginModal.classList.add('hidden');
                authOverlay.classList.remove('hidden');
            }
        });
    }

    // Admin Dashboard Actions
    btnCreateAdmin.addEventListener('click', handleAdminCreation);

    // Navigation
    btnNavHome.addEventListener('click', () => switchView('home'));
    if (getEl('btn-home-top')) getEl('btn-home-top').addEventListener('click', () => switchView('home'));
    logo.addEventListener('click', () => switchView('home'));
    
    cards.forEach(card => {
        if(card.id !== 'card-admin-login') {
            card.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                if (view) switchView(view);
            });
        }
    });

    // Notes auto-save
    let noteSaveTimeout;
    notesTextarea.addEventListener('input', (e) => {
        state.notes = e.target.value;
        clearTimeout(noteSaveTimeout);
        noteSaveTimeout = setTimeout(async () => {
            if (!currentUser || !supabase) {
                localStorage.setItem('studySyncState', JSON.stringify(state));
                return;
            }
            if (currentUser && userProfile && userProfile.role !== 'admin') {
                try {
                    const { data } = await supabase.from('notes').select('id').eq('user_id', currentUser.id).single();
                    if (data) {
                        await supabase.from('notes').update({ content: state.notes }).eq('user_id', currentUser.id);
                    } else {
                        await supabase.from('notes').insert({ user_id: currentUser.id, content: state.notes });
                    }
                } catch(e) {}
            }
        }, 1000);
    });

    // Calendar Controls
    btnPrevMonth.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderStudyCalendar();
        if (!performancePopup.classList.contains('hidden')) updatePerformanceDashboard();
    });

    btnNextMonth.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderStudyCalendar();
        if (!performancePopup.classList.contains('hidden')) updatePerformanceDashboard();
    });

    // Modal Controls
    btnAddSubject.addEventListener('click', () => openModal());
    btnModalClose.addEventListener('click', closeModal);
    btnModalCancel.addEventListener('click', closeModal);
    btnModalSave.addEventListener('click', saveSubject);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    subjectInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveSubject();
    });
    
    btnCheckPerformance.addEventListener('click', () => {
        performancePopup.classList.remove('hidden');
        updatePerformanceDashboard();
    });
    
    popupClose.addEventListener('click', () => {
        performancePopup.classList.add('hidden');
    });
    
    if (performanceFilter) {
        performanceFilter.addEventListener('change', updatePerformanceDashboard);
    }
}

function switchView(viewId) {
    if (viewId === 'admin-dashboard') {
        if (!userProfile || userProfile.role !== 'admin') {
            alert('Access Denied: You must be an administrator.');
            return;
        }
        loadAdminDashboard();
    }
    
    views.forEach(view => view.classList.add('hidden'));
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.remove('hidden');
    
    if (viewId === 'home') {
        if (navMenu) navMenu.classList.add('hidden');
        if (getEl('btn-home-top')) getEl('btn-home-top').classList.add('hidden');
    } else {
        if (navMenu) navMenu.classList.remove('hidden');
        if (getEl('btn-home-top')) getEl('btn-home-top').classList.remove('hidden');
        if (viewId === 'calendar') {
            if (btnCheckPerformance) btnCheckPerformance.classList.remove('hidden');
            renderStudyCalendar();
        } else {
            if (btnCheckPerformance) btnCheckPerformance.classList.add('hidden');
            if (performancePopup) performancePopup.classList.add('hidden');
        }
    }
}

// ---------------------------------------------------------
// CALENDAR RENDERING & LOGIC
// ---------------------------------------------------------
function getDaysInMonth(month, year) { return new Date(year, month + 1, 0).getDate(); }
function getMonthName(month) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[month];
}
function formatMonthKey(year, month) { return `${year}-${String(month + 1).padStart(2, '0')}`; }
function formatDateKey(year, month, day) { return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }

function renderStudyCalendar() {
    if (!currentUser) return;
    currentMonthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const monthKey = formatMonthKey(currentYear, currentMonth);
    
    if (!state.studyData[monthKey]) state.studyData[monthKey] = {};
    
    trackerHeaderRow.innerHTML = '<th class="subject-col">Subjects</th>';
    for (let i = 1; i <= daysInMonth; i++) {
        const th = document.createElement('th'); th.textContent = i;
        trackerHeaderRow.appendChild(th);
    }
    
    trackerBody.innerHTML = '';
    state.subjects.forEach((subject, index) => {
        const tr = document.createElement('tr');
        
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
        
        if (!state.studyData[monthKey][subject]) state.studyData[monthKey][subject] = [];
        const checkedDays = state.studyData[monthKey][subject];
        
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

async function handleCheckboxChange(subject, dateKey, monthKey, isChecked) {
    if (!state.studyData[monthKey][subject]) state.studyData[monthKey][subject] = [];
    
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
    
    if (!currentUser || !supabase) {
        localStorage.setItem('studySyncState', JSON.stringify(state));
        if (performancePopup && !performancePopup.classList.contains('hidden')) updatePerformanceDashboard();
        return;
    }
    
    const subId = subjectMap[subject];
    if (!subId) return; 
    
    try {
        if (isChecked) {
            await supabase.from('study_logs').insert({ user_id: currentUser.id, subject_id: subId, date: dateKey });
        } else {
            await supabase.from('study_logs').delete()
                .eq('user_id', currentUser.id)
                .eq('subject_id', subId)
                .eq('date', dateKey);
        }
    } catch (err) {
        console.error(err);
    }
    
    if (performancePopup && !performancePopup.classList.contains('hidden')) updatePerformanceDashboard();
}

async function addSubjectToSupabase(subjectName) {
    if (!currentUser || !supabase) {
        if (!state.subjects.includes(subjectName)) state.subjects.push(subjectName);
        localStorage.setItem('studySyncState', JSON.stringify(state));
        return;
    }
    
    const { data, error } = await supabase
        .from('subjects')
        .insert({ user_id: currentUser.id, name: subjectName })
        .select()
        .single();
        
    if (data) {
        if (!state.subjects.includes(subjectName)) state.subjects.push(subjectName);
        subjectMap[subjectName] = data.id;
    }
}

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

async function saveSubject() {
    const subjectName = subjectInput.value.trim();
    if (!subjectName) return;
    
    const editIndex = editSubjectIndex.value;
    try {
        if (editIndex !== '') {
            const oldSubject = state.subjects[editIndex];
            const subId = subjectMap[oldSubject];
            if (subId) {
                await supabase.from('subjects').update({ name: subjectName }).eq('id', subId);
                state.subjects[editIndex] = subjectName;
                subjectMap[subjectName] = subId;
                delete subjectMap[oldSubject];
                for (const month in state.studyData) {
                    if (state.studyData[month][oldSubject]) {
                        state.studyData[month][subjectName] = state.studyData[month][oldSubject];
                        delete state.studyData[month][oldSubject];
                    }
                }
            }
        } else {
            if (!state.subjects.includes(subjectName)) {
                await addSubjectToSupabase(subjectName);
            } else {
                alert('Subject already exists!');
                return;
            }
        }
    } catch (err) {
        console.error(err);
    }
    renderStudyCalendar();
    closeModal();
}

async function deleteSubject(index) {
    const subjectName = state.subjects[index];
    if (confirm(`Are you sure you want to delete "${subjectName}"?`)) {
        const subId = subjectMap[subjectName];
        if (subId) {
            try {
                await supabase.from('subjects').delete().eq('id', subId);
                state.subjects.splice(index, 1);
                delete subjectMap[subjectName];
                for (const month in state.studyData) {
                    if (state.studyData[month][subjectName]) {
                        delete state.studyData[month][subjectName];
                    }
                }
                renderStudyCalendar();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// Performance Dashboard
function updatePerformanceDashboard() {
    const filter = performanceFilter ? performanceFilter.value : 'month';
    let totalDays = 0;
    let validDates = new Set();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (filter === 'month') {
        totalDays = getDaysInMonth(currentMonth, currentYear);
        for (let i = 1; i <= totalDays; i++) {
            validDates.add(formatDateKey(currentYear, currentMonth, i));
        }
    } else if (filter === 'week') {
        totalDays = 7;
        // Get start of week (Sunday)
        const d = new Date(today);
        d.setDate(d.getDate() - d.getDay());
        for (let i = 0; i < 7; i++) {
            validDates.add(formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setDate(d.getDate() + 1);
        }
    } else if (filter === 'year') {
        const isLeap = (currentYear % 4 === 0 && currentYear % 100 !== 0) || (currentYear % 400 === 0);
        totalDays = isLeap ? 366 : 365;
        const d = new Date(currentYear, 0, 1);
        for (let i = 0; i < totalDays; i++) {
            validDates.add(formatDateKey(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setDate(d.getDate() + 1);
        }
    }
    
    let studiedDates = new Set();
    let subjectCounts = {};
    
    state.subjects.forEach(subject => {
        subjectCounts[subject] = 0;
        // Aggregate across all months in studyData
        for (const monthKey in state.studyData) {
            if (state.studyData[monthKey][subject]) {
                state.studyData[monthKey][subject].forEach(date => {
                    if (validDates.has(date)) {
                        studiedDates.add(date);
                        subjectCounts[subject]++;
                    }
                });
            }
        }
    });
    
    const daysStudied = studiedDates.size;
    const daysMissed = totalDays - daysStudied;
    const overallPercentage = totalDays === 0 ? 0 : Math.round((daysStudied / totalDays) * 1000) / 10;
    
    getEl('stat-total-days').textContent = totalDays;
    getEl('stat-days-studied').textContent = daysStudied;
    getEl('stat-days-missed').textContent = daysMissed;
    
    getEl('chart-center-text').querySelector('.percentage').textContent = `${overallPercentage}%`;
    
    const ctx = getEl('overall-progress-chart').getContext('2d');
    if (performanceChart) performanceChart.destroy();
    
    performanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Studied', 'Missed'],
            datasets: [{ data: [daysStudied, daysMissed], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0, hoverOffset: 4 }]
        },
        options: {
            cutout: '75%', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
    
    const list = getEl('subject-progress-list');
    list.innerHTML = '';
    state.subjects.forEach(subject => {
        const checkedDays = subjectCounts[subject];
        const percent = totalDays === 0 ? 0 : Math.round((checkedDays / totalDays) * 100);
        
        const item = document.createElement('div');
        item.className = 'subject-progress-item';
        item.innerHTML = `<span class="subject-name">${subject}</span><span class="subject-percent">${checkedDays}/${totalDays} (${percent}%)</span>`;
        list.appendChild(item);
    });
}

// Initialize App Safely
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

import { Home } from './pages/Home.js?v=1787992689755';
import { Notes } from './pages/Notes.js?v=1787992689755';
import { Calendar } from './pages/Calendar.js?v=1787992689755';
import { Login } from './pages/Login.js?v=1787992689755';
import { Register } from './pages/Register.js?v=1787992689755';
import { Admin } from './pages/Admin.js?v=1787992689755';
import { AdminDashboard } from './pages/AdminDashboard.js?v=1787992689755';
import { Pomodoro } from './pages/Pomodoro.js?v=1787992689755';
import { Kanban } from './pages/Kanban.js?v=1787992689755';
import { isLoggedIn, logoutUser, getCurrentUser } from './utils/auth.js?v=1787992689755';
import { isAdminLoggedIn } from './utils/adminAuth.js?v=1787992689755';

// Map routes to their respective page components
const routes = {
    '/home': Home,
    '/note': Notes,
    '/calendar': Calendar,
    '/login': Login,
    '/register': Register,
    '/admin': Admin,
    '/admin/dashboard': AdminDashboard,
    '/pomodoro': Pomodoro,
    '/tasks': Kanban
};

export class Router {
    constructor() {
        this.navMenu = document.getElementById('nav-menu');
        this.appHeader = document.querySelector('.app-header');
        this.appContainer = document.querySelector('.content-area');
        
        // Expose router globally
        window.appRouter = this;
        window.navigateTo = (path) => this.navigate(path);
        
        // Listen to browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
        
        // Global click delegator for all navigation links and cards
        document.addEventListener('click', (e) => {
            // Handle Logout click
            if (e.target.closest('#btn-logout') || e.target.id === 'btn-logout') {
                e.preventDefault();
                logoutUser().then(() => {
                    this.navigate('/login');
                });
                return;
            }

            const btnNav = e.target.closest('.btn-nav');
            const card = e.target.closest('.card');
            
            if (btnNav || card) {
                const targetEl = btnNav || card;
                const view = targetEl.dataset.view;
                
                if (view) {
                    e.preventDefault();
                    let path = `/${view}`;
                    if (view === 'notes') path = '/note';
                    this.navigate(path);
                }
            }
            
            // Special case for logo -> Navigate to Home
            if (e.target.matches('#logo') || e.target.closest('#logo')) {
                e.preventDefault();
                this.navigate('/home');
            }
        });
    }

    init() {
        // Handle initial route on page load - always start at login
        let path = window.location.pathname;
        if (path === '/' || path === '/index.html') {
            path = '/login';
            window.history.replaceState(null, '', path);
        }
        this.handleRoute(path);
    }

    navigate(path) {
        if (window.location.pathname !== path) {
            window.history.pushState(null, '', path);
        }
        this.handleRoute(path);
    }

    updateNav(currentPath) {
        if (!this.navMenu) return;

        // If on auth pages, show minimal header
        if (currentPath === '/login' || currentPath === '/register' || currentPath === '/admin') {
            this.navMenu.innerHTML = `
                <button class="btn-nav" data-view="home"><i class="fa-solid fa-house"></i> Enter App</button>
            `;
            return;
        }

        // When inside app, show full modern navigation bar
        this.navMenu.innerHTML = `
            <button class="btn-nav ${currentPath === '/home' ? 'active' : ''}" data-view="home" title="Home"><i class="fa-solid fa-house"></i> Home</button>
            <button class="btn-nav" id="btn-info" title="Study Analysis"><i class="fa-solid fa-chart-pie"></i> Analysis</button>
            <button class="btn-nav btn-logout-nav" id="btn-logout" title="Log Out" style="color: var(--accent-danger);"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
        `;
    }

    handleRoute(path) {
        // Fallback for protected admin dashboard
        if (path === '/admin/dashboard' && !isAdminLoggedIn()) {
            this.navigate('/admin');
            return;
        }

        // Protect main app routes
        const protectedRoutes = ['/home', '/note', '/calendar', '/pomodoro', '/tasks'];
        if (protectedRoutes.includes(path) && !isLoggedIn()) {
            this.navigate('/login');
            return;
        }

        // Hide all views first
        const views = document.querySelectorAll('.view');
        views.forEach(view => view.classList.add('hidden'));

        // Update active navigation state
        this.updateNav(path);

        // Load the appropriate component
        const component = routes[path];
        
        if (component && typeof component.mount === 'function') {
            component.mount();
        } else {
            // 404 Fallback
            this.navigate(isLoggedIn() ? '/home' : '/login');
        }

        // Scroll to top of view
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

import { Router } from './router.js?v=1787992689755';
import { loadData } from './utils/state.js?v=1787992689755';
import { initSubjectModal } from './components/SubjectModal.js?v=1787992689755';
import { initPerformanceDashboard } from './components/PerformanceDashboard.js?v=1787992689755';

async function bootstrap() {
    // 1. Initialize State
    await loadData();

    // 2. Initialize Components/Modals
    initSubjectModal();
    initPerformanceDashboard();

    // Initialize Theme
    const savedTheme = localStorage.getItem('studySyncTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    // 3. Initialize Router
    const appRouter = new Router();
    appRouter.init();
}

// Application entry point
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

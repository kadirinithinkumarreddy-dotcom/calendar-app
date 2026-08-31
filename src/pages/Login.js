import { loginUser, loginGuest } from '../utils/auth.js?v=1787992689755';
import { loadData } from '../utils/state.js?v=1787992689755';

export const Login = {
    mount() {
        let view = document.getElementById('view-login');
        if (!view) {
            view = document.createElement('section');
            view.id = 'view-login';
            view.className = 'view';
            view.innerHTML = `
                <!-- Top Right Logo -->
                <img src="/assets/ap-police-logo.png" alt="Police Emblem" style="position: absolute; top: 20px; right: 30px; max-width: 140px; filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4)); z-index: 10;" />
                
                <div style="display: flex; justify-content: center; align-items: center; width: 100%; flex: 1; padding: 2rem 1rem;">
                    <div style="width: 100%; max-width: 420px; background: rgba(30, 41, 59, 0.75); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: 0 10px 30px var(--shadow-color); border: 1px solid rgba(255, 255, 255, 0.1);">
                        <div class="welcome-text" style="text-align: center; margin-bottom: 1rem;">
                            <h2 style="font-size: 1.85rem; margin-bottom: 0.35rem; background: linear-gradient(135deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome Back</h2>
                            <p style="color: var(--text-secondary); margin-top: 0; font-size: 0.95rem;">Login to track your study goals</p>
                        </div>
                        <form id="login-form" style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div id="login-error" style="color: var(--accent-danger); font-size: 0.85rem; text-align: center; display: none;"></div>
                            <div>
                                <label for="login-email" style="display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.9rem;">Email</label>
                                <input type="email" id="login-email" style="width: 100%; padding: 0.6rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" value="nithinkumarreddykadiri@gmail.com" required>
                            </div>
                            <div>
                                <label for="login-password" style="display: block; margin-bottom: 0.25rem; font-weight: 500; font-size: 0.9rem;">Password</label>
                                <input type="password" id="login-password" style="width: 100%; padding: 0.6rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" value="1234@nani" required>
                            </div>
                            <button type="submit" class="btn-primary" id="btn-login-submit" style="width: 100%; justify-content: center; padding: 0.6rem; font-size: 0.95rem; margin-top: 0.25rem;">
                                <i class="fa-solid fa-right-to-bracket"></i> Login
                            </button>

                            <div style="text-align: center; font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">
                                Don't have an account? <a href="#" class="btn-nav" data-view="register" style="color: var(--accent-primary); text-decoration: underline; font-weight: 500;">Register here</a>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- Hidden Admin Shortcut -->
                <i class="fa-solid fa-shield btn-nav" data-view="admin" style="position: absolute; bottom: 15px; right: 15px; color: rgba(255,255,255,0.15); font-size: 1.25rem; cursor: pointer;" title="Admin Portal"></i>
            `;
            document.querySelector('.content-area').appendChild(view);

            // Attach Login Form Submit
            document.getElementById('login-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const pass = document.getElementById('login-password').value;
                const submitBtn = document.getElementById('btn-login-submit');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';

                try {
                    const result = await loginUser(email, pass);
                    if (result.success) {
                        await loadData();
                        if (window.navigateTo) {
                            window.navigateTo('/home');
                        } else {
                            window.location.pathname = '/home';
                        }
                    } else {
                        const errEl = document.getElementById('login-error');
                        errEl.textContent = result.message || 'Login failed.';
                        errEl.style.display = 'block';
                    }
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
                }
            });


        }
        view.classList.remove('hidden');
    }
};

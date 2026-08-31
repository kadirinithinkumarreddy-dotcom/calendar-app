import { loginAdmin } from '../utils/adminAuth.js?v=1787992689755';

export const Admin = {
    mount() {
        let view = document.getElementById('view-admin');
        if (!view) {
            view = document.createElement('section');
            view.id = 'view-admin';
            view.className = 'view';
            view.innerHTML = `
                <div class="welcome-text" style="text-align: center; margin-bottom: 2rem;">
                    <h2>Admin Login</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">Access the admin portal</p>
                </div>
                <div style="max-width: 400px; margin: 0 auto; background: var(--bg-surface); padding: 2rem; border-radius: var(--radius-md); box-shadow: 0 4px 6px var(--shadow-color);">
                    <form id="admin-login-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div id="admin-login-error" style="color: var(--accent-danger); font-size: 0.9rem; text-align: center; display: none;"></div>
                        <div>
                            <label for="admin-email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Admin Email</label>
                            <input type="email" id="admin-email" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required>
                        </div>
                        <div>
                            <label for="admin-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
                            <input type="password" id="admin-password" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Login as Admin</button>
                    </form>
                </div>
            `;
            document.querySelector('.content-area').appendChild(view);

            // Attach event listener for login
            document.getElementById('admin-login-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = document.getElementById('admin-email').value.trim();
                const pass = document.getElementById('admin-password').value;
                
                const result = loginAdmin(email, pass);
                
                if (result.success) {
                    // Clear inputs
                    document.getElementById('admin-email').value = '';
                    document.getElementById('admin-password').value = '';
                    document.getElementById('admin-login-error').style.display = 'none';
                    
                    // Navigate to admin dashboard
                    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
                    const hiddenLink = document.createElement('a');
                    hiddenLink.className = 'btn-nav';
                    hiddenLink.dataset.view = 'admin/dashboard';
                    document.body.appendChild(hiddenLink);
                    hiddenLink.dispatchEvent(event);
                    document.body.removeChild(hiddenLink);
                } else {
                    const errEl = document.getElementById('admin-login-error');
                    errEl.textContent = result.message;
                    errEl.style.display = 'block';
                }
            });
        }
        view.classList.remove('hidden');
    }
};

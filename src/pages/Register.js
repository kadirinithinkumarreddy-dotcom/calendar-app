import { registerUser } from '../utils/auth.js?v=1787992689755';

export const Register = {
    mount() {
        let view = document.getElementById('view-register');
        if (!view) {
            view = document.createElement('section');
            view.id = 'view-register';
            view.className = 'view';
            view.innerHTML = `
                <div class="welcome-text" style="text-align: center; margin-bottom: 2rem;">
                    <h2>Create an Account</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem;">Join StudySync today</p>
                </div>
                <div style="max-width: 400px; margin: 0 auto; background: var(--bg-surface); padding: 2rem; border-radius: var(--radius-md); box-shadow: 0 4px 6px var(--shadow-color);">
                    <form id="register-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div id="register-error" style="color: var(--accent-danger); font-size: 0.9rem; text-align: center; display: none;"></div>
                        <div>
                            <label for="register-name" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Full Name</label>
                            <input type="text" id="register-name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required>
                        </div>
                        <div>
                            <label for="register-phone" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Phone Number</label>
                            <input type="tel" id="register-phone" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required pattern="[0-9]{10}" maxlength="10" title="Must be exactly 10 digits">
                        </div>
                        <div>
                            <label for="register-email" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email Address</label>
                            <input type="email" id="register-email" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required>
                        </div>

                        <div>
                            <label for="register-password" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
                            <input type="password" id="register-password" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required>
                        </div>
                        <div>
                            <label for="register-confirm" style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Confirm Password</label>
                            <input type="password" id="register-confirm" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-body); color: var(--text-primary);" required>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Register</button>
                    </form>
                    <div style="text-align: center; margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
                        Already have an account? <a href="#" class="btn-nav" data-view="login" style="color: var(--accent-primary); text-decoration: none; font-weight: 500;">Login here</a>
                    </div>
                </div>
                <!-- Registration Success Modal -->
                <div id="register-success-modal" class="modal hidden">
                    <div class="modal-content" style="max-width: 400px; text-align: center;">
                        <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
                            <div style="font-size: 3rem; color: #10b981; margin-bottom: 1rem; width: 100%;"><i class="fa-solid fa-circle-check"></i></div>
                        </div>
                        <div class="modal-body">
                            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Success!</h3>
                            <p style="color: var(--text-secondary); line-height: 1.5; font-size: 1rem;">Thank you for your registration. Within 24 hours, you can log in.</p>
                        </div>
                        <div class="modal-footer" style="justify-content: center; border-top: none;">
                            <button class="btn-primary" id="btn-register-ok" style="width: 100%; justify-content: center;">OK</button>
                        </div>
                    </div>
                </div>
            `;
            document.querySelector('.content-area').appendChild(view);

            // Attach event listener
            document.getElementById('register-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('register-name').value.trim();
                const phone = document.getElementById('register-phone').value.trim();
                const email = document.getElementById('register-email').value.trim();
                const pass = document.getElementById('register-password').value;
                const confirm = document.getElementById('register-confirm').value;
                
                const errEl = document.getElementById('register-error');
                
                if (!/^\d{10}$/.test(phone)) {
                    errEl.textContent = "Phone number must be exactly 10 digits.";
                    errEl.style.display = 'block';
                    return;
                }

                if (pass !== confirm) {
                    errEl.textContent = "Passwords do not match.";
                    errEl.style.display = 'block';
                    return;
                }
                
                const result = await registerUser(name, phone, email, pass, '');
                
                if (result.success) {
                    const modal = document.getElementById('register-success-modal');
                    modal.classList.remove('hidden');
                    
                    document.getElementById('btn-register-ok').addEventListener('click', () => {
                        modal.classList.add('hidden');
                        
                        document.getElementById('register-name').value = '';
                        document.getElementById('register-phone').value = '';
                        document.getElementById('register-email').value = '';
                        document.getElementById('register-password').value = '';
                        document.getElementById('register-confirm').value = '';
                        errEl.style.display = 'none';
                        
                        // Trigger router navigation to login
                        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
                        const hiddenLink = document.createElement('a');
                        hiddenLink.className = 'btn-nav';
                        hiddenLink.dataset.view = 'login';
                        document.body.appendChild(hiddenLink);
                        hiddenLink.dispatchEvent(event);
                        document.body.removeChild(hiddenLink);
                    }, { once: true });
                } else {
                    errEl.textContent = result.message;
                    errEl.style.display = 'block';
                }
            });
        }
        view.classList.remove('hidden');
    }
};

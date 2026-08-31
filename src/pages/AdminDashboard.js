import { registerNewAdmin } from '../utils/adminAuth.js?v=1787992689755';

export const AdminDashboard = {
    currentFilter: 'all',

    mount() {
        let view = document.getElementById('view-admin-dashboard');
        if (!view) {
            view = document.createElement('section');
            view.id = 'view-admin-dashboard';
            view.className = 'view';
            document.querySelector('.content-area').appendChild(view);
        }
        
        // Always re-render so it shows up-to-date users
        this.renderView(view);
        view.classList.remove('hidden');
    },
    
    renderView(view) {
        let authData = { users: [] };
        if (localStorage.getItem('studySyncAuth')) {
            try {
                authData = JSON.parse(localStorage.getItem('studySyncAuth'));
                if (!Array.isArray(authData.users)) authData.users = [];
            } catch (e) {
                authData = { users: [] };
            }
        }
        
        const allUsers = authData.users.map((user, index) => ({
            ...user,
            originalIndex: index,
            status: user.status || 'Pending'
        }));

        const totalCount = allUsers.length;
        const pendingCount = allUsers.filter(u => u.status === 'Pending').length;
        const approvedCount = allUsers.filter(u => u.status === 'Approved').length;

        let filteredUsers = allUsers;
        if (this.currentFilter === 'pending') {
            filteredUsers = allUsers.filter(u => u.status === 'Pending');
        } else if (this.currentFilter === 'approved') {
            filteredUsers = allUsers.filter(u => u.status === 'Approved');
        }
        
        let usersHtml = '';
        if (filteredUsers.length === 0) {
            usersHtml = `
                <tr>
                    <td colspan="6" style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
                        <i class="fa-solid fa-users-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
                        No users found in this category.
                    </td>
                </tr>
            `;
        } else {
            usersHtml = filteredUsers.map((user) => {
                const isPending = user.status === 'Pending';
                const statusBadge = isPending 
                    ? `<span style="display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-clock" style="margin-right: 4px;"></i>Pending</span>`
                    : `<span style="display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3);"><i class="fa-solid fa-circle-check" style="margin-right: 4px;"></i>Approved</span>`;

                const actionBtns = `
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        ${isPending ? `
                            <button class="btn-primary btn-approve" data-index="${user.originalIndex}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: #10b981; border: none; border-radius: var(--radius-sm); cursor: pointer; color: white; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                        ` : ''}
                        <button class="btn-primary btn-reject" data-index="${user.originalIndex}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; background: #ef4444; border: none; border-radius: var(--radius-sm); cursor: pointer; color: white; display: inline-flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-trash"></i> ${isPending ? 'Reject' : 'Delete'}
                        </button>
                    </div>
                `;
                
                return `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.15s ease;">
                        <td style="padding: 0.75rem 1rem; font-weight: 500;">${user.name || '-'}</td>
                        <td style="padding: 0.75rem 1rem; color: var(--text-secondary);">${user.email || user.username || '-'}</td>
                        <td style="padding: 0.75rem 1rem;">${user.phone ? `<a href="tel:${user.phone}" style="color: var(--accent-primary); text-decoration: none;">${user.phone}</a>` : '-'}</td>
                        <td style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">${user.registrationTime ? new Date(user.registrationTime).toLocaleString() : '-'}</td>
                        <td style="padding: 0.75rem 1rem;">${statusBadge}</td>
                        <td style="padding: 0.75rem 1rem;">${actionBtns}</td>
                    </tr>
                `;
            }).join('');
        }

        view.innerHTML = `
            <div class="welcome-text" style="text-align: center; margin-top: 1.5rem; margin-bottom: 1.5rem;">
                <h2>Admin Portal & Registrations</h2>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">View and manage all registered student and user accounts</p>
            </div>

            <!-- Stats Bar -->
            <div style="max-width: 900px; width: 95%; margin: 0 auto 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
                <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; box-shadow: 0 2px 4px var(--shadow-color);">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Total Registered</div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-primary);">${totalCount}</div>
                </div>
                <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; box-shadow: 0 2px 4px var(--shadow-color);">
                    <div style="font-size: 0.85rem; color: #f59e0b; margin-bottom: 0.25rem;">Pending Approvals</div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: #f59e0b;">${pendingCount}</div>
                </div>
                <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center; box-shadow: 0 2px 4px var(--shadow-color);">
                    <div style="font-size: 0.85rem; color: #10b981; margin-bottom: 0.25rem;">Approved Users</div>
                    <div style="font-size: 1.75rem; font-weight: 700; color: #10b981;">${approvedCount}</div>
                </div>
            </div>
            
            <!-- Table Container -->
            <div style="max-width: 900px; width: 95%; margin: 0 auto 3rem; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: 0 4px 6px var(--shadow-color); overflow: hidden;">
                <!-- Filter Tabs -->
                <div style="display: flex; gap: 0.5rem; padding: 1rem; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02); flex-wrap: wrap;">
                    <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all" style="padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: ${this.currentFilter === 'all' ? 'var(--accent-primary)' : 'transparent'}; color: ${this.currentFilter === 'all' ? '#fff' : 'var(--text-primary)'}; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
                        All Users (${totalCount})
                    </button>
                    <button class="filter-tab ${this.currentFilter === 'pending' ? 'active' : ''}" data-filter="pending" style="padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: ${this.currentFilter === 'pending' ? '#f59e0b' : 'transparent'}; color: ${this.currentFilter === 'pending' ? '#fff' : 'var(--text-primary)'}; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
                        Pending (${pendingCount})
                    </button>
                    <button class="filter-tab ${this.currentFilter === 'approved' ? 'active' : ''}" data-filter="approved" style="padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: ${this.currentFilter === 'approved' ? '#10b981' : 'transparent'}; color: ${this.currentFilter === 'approved' ? '#fff' : 'var(--text-primary)'}; cursor: pointer; font-size: 0.85rem; font-weight: 500;">
                        Approved (${approvedCount})
                    </button>
                </div>

                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 650px;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.05);">
                                <th style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">Name</th>
                                <th style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">Email</th>
                                <th style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">Phone</th>
                                <th style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">Registered Date</th>
                                <th style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">Status</th>
                                <th style="padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--text-secondary);">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usersHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Filter tabs listeners
        view.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentFilter = e.currentTarget.dataset.filter;
                this.renderView(view);
            });
        });

        // Attach action listeners
        view.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index, 10);
                this.updateStatus(index, 'Approved');
            });
        });
        
        view.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index, 10);
                this.updateStatus(index, 'Rejected');
            });
        });
    },
    
    updateStatus(index, newStatus) {
        const authData = JSON.parse(localStorage.getItem('studySyncAuth') || '{"users":[]}');
        if (authData && authData.users && authData.users[index]) {
            if (newStatus === 'Rejected') {
                authData.users.splice(index, 1);
            } else {
                authData.users[index].status = newStatus;
            }
            localStorage.setItem('studySyncAuth', JSON.stringify(authData));
            this.renderView(document.getElementById('view-admin-dashboard'));
        }
    }
};

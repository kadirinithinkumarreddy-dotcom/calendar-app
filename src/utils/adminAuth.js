export function loginAdmin(email, password) {
    let adminData = [];
    if (localStorage.getItem('studySyncAdmins')) {
        adminData = JSON.parse(localStorage.getItem('studySyncAdmins'));
    }
    
    // Forcefully ensure the required admin is in the database, even if they have old localStorage state
    const requiredEmail = 'nithinkumarreddykadiri@gmail.com';
    const requiredPass = '1234@nani';
    if (!adminData.find(a => a.email === requiredEmail)) {
        adminData.push({ email: requiredEmail, password: requiredPass });
        localStorage.setItem('studySyncAdmins', JSON.stringify(adminData));
    }

    const admin = adminData.find(a => a.email === email && a.password === password);
    
    if (admin) {
        sessionStorage.setItem('studySyncAdminSession', email);
        return { success: true };
    }
    return { success: false, message: 'Invalid admin credentials' };
}

export function registerNewAdmin(email, password) {
    if (!localStorage.getItem('studySyncAdmins')) {
        localStorage.setItem('studySyncAdmins', JSON.stringify([{ email: 'nithinkumarreddykadiri@gmail.com', password: '1234@nani' }]));
    }
    const adminData = JSON.parse(localStorage.getItem('studySyncAdmins'));
    
    if (adminData.find(a => a.email === email)) {
        return { success: false, message: 'Admin email already exists' };
    }
    
    adminData.push({ email, password });
    localStorage.setItem('studySyncAdmins', JSON.stringify(adminData));
    return { success: true };
}

export function isAdminLoggedIn() {
    return !!sessionStorage.getItem('studySyncAdminSession');
}

export function logoutAdmin() {
    sessionStorage.removeItem('studySyncAdminSession');
}

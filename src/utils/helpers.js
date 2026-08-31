export function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

export function formatMonthKey(year, month) {
    return `${year}-${month}`;
}

export function formatDateKey(year, month, day) {
    return `${year}-${month}-${day}`;
}

export function showToast(message, duration = 750) {
    let existingToast = document.getElementById('custom-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '150px';
    toast.style.right = '20px';
    toast.style.background = 'var(--bg-surface)';
    toast.style.color = 'var(--text-primary)';
    toast.style.padding = '1rem 1.5rem';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4), 0 0 15px rgba(99, 102, 241, 0.2)';
    toast.style.border = '2px solid var(--accent-primary)';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = '500';
    toast.style.transition = 'opacity 0.3s ease';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration); 
}

export function sanitizeHTML(htmlString) {
    if (!htmlString) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    const scripts = tempDiv.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }
    
    const allElements = tempDiv.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        for (let j = el.attributes.length - 1; j >= 0; j--) {
            const attr = el.attributes[j];
            if (attr.name.toLowerCase().startsWith('on')) {
                el.removeAttribute(attr.name);
            }
        }
    }
    
    return tempDiv.innerHTML;
}

export function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '10000';
        overlay.style.backdropFilter = 'blur(4px)';
        const modal = document.createElement('div');
        modal.style.background = 'var(--bg-surface)';
        modal.style.padding = '2rem';
        modal.style.borderRadius = 'var(--radius-md)';
        modal.style.border = '1px solid var(--border-color)';
        modal.style.boxShadow = 'var(--shadow-lg)';
        modal.style.maxWidth = '400px';
        modal.style.width = '90%';
        modal.style.textAlign = 'center';
        const text = document.createElement('p');
        text.textContent = message;
        text.style.color = 'var(--text-primary)';
        text.style.fontSize = '1.05rem';
        text.style.marginBottom = '1.5rem';
        text.style.lineHeight = '1.5';
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'center';
        btnContainer.style.gap = '1rem';
        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Cancel';
        btnCancel.className = 'btn-secondary';
        const btnOk = document.createElement('button');
        btnOk.textContent = 'Continue';
        btnOk.className = 'btn-primary';
        btnOk.style.background = 'var(--accent-danger)';
        btnCancel.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };
        btnOk.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        btnContainer.appendChild(btnCancel);
        btnContainer.appendChild(btnOk);
        modal.appendChild(text);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}
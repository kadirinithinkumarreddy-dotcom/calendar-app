const fs = require('fs');
const path = require('path');
const version = '?v=' + Date.now();

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') processDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Fix import paths
            let updated = content.replace(/(import.*?from\s+['"])(.*?)(['"])/g, (match, p1, p2, p3) => {
                if (p2.startsWith('.') || p2.startsWith('/src')) {
                    const cleanPath = p2.split('?')[0];
                    return p1 + cleanPath + version + p3;
                }
                return match;
            });
            
            // Fix script src tags
            updated = updated.replace(/(<script.*?src=['"])(.*?)(['"])/g, (match, p1, p2, p3) => {
                if (p2.startsWith('/src') || p2.startsWith('./src')) {
                    const cleanPath = p2.split('?')[0];
                    return p1 + cleanPath + version + p3;
                }
                return match;
            });
            
            if (content !== updated) {
                fs.writeFileSync(fullPath, updated);
                console.log('Updated imports in', fullPath);
            }
        }
    }
}
processDir('.');
console.log('Cache busting applied to all files.');

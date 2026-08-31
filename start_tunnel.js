const localtunnel = require('localtunnel');

async function start() {
    try {
        const tunnel = await localtunnel({ port: 8080 });
        console.log('TUNNEL_URL:' + tunnel.url);
        
        tunnel.on('close', () => {
            console.log('Tunnel closed. Reconnecting in 3s...');
            setTimeout(start, 3000);
        });
        
        tunnel.on('error', (err) => {
            console.error('Tunnel error:', err.message);
        });
    } catch (e) {
        console.error('Failed to start tunnel, retrying in 3s:', e.message);
        setTimeout(start, 3000);
    }
}

start();

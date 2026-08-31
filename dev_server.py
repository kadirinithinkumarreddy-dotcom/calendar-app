import http.server
import os

PORT = 8080

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        # Resolve file path
        path = self.translate_path(self.path)
        # If requested path is not an existing file and not a static asset, serve index.html (SPA routing)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path.split('?')[0]):
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    server = http.server.ThreadingHTTPServer(("", PORT), SPAHandler)
    server.daemon_threads = True
    print(f"Serving at http://0.0.0.0:{PORT} (SPA enabled, Multi-Threaded, No-Cache)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

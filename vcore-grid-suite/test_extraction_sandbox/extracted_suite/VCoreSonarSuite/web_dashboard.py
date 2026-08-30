import http.server
import socketserver
import json
import os
from datetime import datetime

PORT = 8081
LOG_FILE = "vcore_croquis_estructural.json"

class VCoreHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/vcore_croquis':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
            except:
                payload = {}
            
            entry = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "tipo": payload.get("tipo", "croquis"),
                "gps_lat": payload.get("lat", 0.0),
                "gps_lon": payload.get("lon", 0.0),
                "estructura_puntos": payload.get("puntos", [])
            }
            
            with open(LOG_FILE, "w") as f:
                json.dump(entry, f, indent=4)
            
            response = json.dumps({"status": "SUCCESS"}).encode('utf-8')
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(response)
        else:
            super().do_POST()

with socketserver.TCPServer(("", PORT), VCoreHandler) as httpd:
    print(f"[INFO] VCORE GRID SUITE Croquis Server activo en http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Servidor detenido.")

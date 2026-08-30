from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
            action = payload.get("action", "chassis_balance")
            
            # Simulación / Ejecución de motores core en Python
            if action == "chassis_balance":
                weight = payload.get("weight", 1200)
                front_ratio = payload.get("front_ratio", 0.55)
                result = {
                    "status": "success",
                    "front_load_kg": weight * front_ratio,
                    "rear_load_kg": weight * (1 - front_ratio),
                    "optimal_stiffness": (weight * 9.81) / 4
                }
            else:
                result = {"status": "error", "message": "Accion de calculo no reconocida."}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode('utf-8'))

        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

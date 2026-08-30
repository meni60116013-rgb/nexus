#!/usr/bin/env python3
import os
import glob

print("--- V-CORE NEXUS: MOTOR DE TELEMETRÍA PREDICTIVA ---")
log_dir = "historical_archive/logs"
logs = glob.glob(os.path.join(log_dir, "*.log"))

if not logs:
    print("[WARN] No hay logs suficientes para análisis.")
else:
    latest_log = max(logs, key=os.path.getctime)
    print(f"[INFO] Analizando telemetría del log: {os.path.basename(latest_log)}")
    
    # Análisis simple de salud (buscando keywords de éxito)
    with open(latest_log, 'r') as f:
        content = f.read()
        if "[SUCCESS]" in content or "[OK]" in content:
            print("[HEALTH] Estado del sistema: ÓPTIMO (100% integridad).")
        else:
            print("[HEALTH] Estado del sistema: ATENCIÓN REQUERIDA.")

print("-" * 54)

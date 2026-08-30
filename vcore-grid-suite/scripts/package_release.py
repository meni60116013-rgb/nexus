#!/usr/bin/env python3
import os
import zipfile

print("--- V-CORE NEXUS: MOTOR DE EMPAQUETADO QUIRÚRGICO ---")
dist_dir = "dist"
os.makedirs(dist_dir, exist_ok=True)
zip_path = os.path.join(dist_dir, "vcore-grid-suite-distribution-v2.8.0.zip")

# Directorios y archivos esenciales permitidos para distribución (Agnósticos y limpios)
allowed_dirs = ["core", "security", "scripts", ".github"]
allowed_files = ["cli.py", "vcore_nexus_manifest.json"]

print("[DIST] Creando paquete ZIP optimizado...")
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    # Agregar archivos sueltos permitidos
    for file in allowed_files:
        if os.path.exists(file):
            zf.write(file)
            print(f"[PACK] Añadido: {file}")
            
    # Agregar directorios permitidos de forma recursiva (excluyendo logs pesados y git)
    for d in allowed_dirs:
        if os.path.exists(d):
            for root, dirs, files in os.walk(d):
                # Omitir carpetas no deseadas si existieran
                dirs[:] = [ds for ds in dirs if ds not in ['logs', '.git']]
                for file in files:
                    full_path = os.path.join(root, file)
                    zf.write(full_path)
                    print(f"[PACK] Añadido: {full_path}")

print(f"[DIST] ¡Éxito total! Paquete generado en: {zip_path}")
print("-" * 54)

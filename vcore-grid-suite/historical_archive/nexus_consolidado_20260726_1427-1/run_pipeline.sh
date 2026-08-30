#!/bin/bash
set +H

echo "[*] Sincronizando código fuente con GitHub..."
git add -A
git commit -m "Sync code for build: $(date +'%Y-%m-%d %H:%M:%S')"
git push origin main || { echo "[!] Error al hacer push."; exit 1; }

echo "[*] Disparando compilación remota..."
gh workflow run build.yml

echo "[*] Esperando a que el servidor asigne un ID de ejecución..."
sleep 6

RUN_ID=""
attempts=0
while [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; do
  sleep 4
  RUN_ID=$(gh run list --workflow=build.yml --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || echo "")
  attempts=$((attempts+1))
  if [ $attempts -gt 20 ]; then
    echo "[!] Tiempo de espera agotado obteniendo el RUN_ID."
    exit 1
  fi
  echo -n "."
done

echo ""
echo "[+] Monitoreando compilación en la nube (ID: $RUN_ID)..."
gh run watch "$RUN_ID"

echo "[*] Descargando el APK..."
mkdir -p ~/nexus_apk
rm -rf ~/nexus_apk/*
gh run download "$RUN_ID" -n app-debug -D ~/nexus_apk

echo "[+] Copiando APK a la memoria interna (Carpeta Descargas)..."
find ~/nexus_apk -name "*.apk" -exec cp {} /storage/shared/Download/vcore-debug.apk \;

echo "[v] ¡Proceso completado con éxito! Archivo listo en 'Descargas/vcore-debug.apk'."

#!/bin/bash
# vcore_sign_setup.sh
# Automatiza la configuración de firma release para V-core Nexux
# Autor: Manuel de Jesús Ovalle Carrillo

set -e
cd ~/nexus_vcore

echo "[1/5] Verificando archivo app/build.gradle..."
if [ ! -f app/build.gradle ]; then
  echo "ERROR: No se encontró app/build.gradle. Abortando."
  exit 1
fi

echo "[2/5] Respaldando build.gradle actual..."
cp app/build.gradle app/build.gradle.bak

echo "[3/5] Verificando si ya existe signingConfigs..."
if grep -q "signingConfigs" app/build.gradle; then
  echo "Ya existe un bloque signingConfigs. No se modifica automáticamente."
  echo "Revisa app/build.gradle manualmente contra build-gradle-signing-snippet.txt"
else
  echo "Agregando signingConfigs y referencia en buildTypes..."
  python3 - <<'PYEOF'
import re

with open("app/build.gradle", "r") as f:
    content = f.read()

signing_block = '''    signingConfigs {
        release {
            storeFile file("release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }

'''

# Insertar signingConfigs justo después de la apertura de android {
content = re.sub(r'(android\s*\{)', r'\1\n' + signing_block, content, count=1)

# Insertar signingConfig dentro de release { } si no está
if "signingConfig signingConfigs.release" not in content:
    content = re.sub(
        r'(release\s*\{)',
        r'\1\n            signingConfig signingConfigs.release',
        content,
        count=1
    )

with open("app/build.gradle", "w") as f:
    f.write(content)

print("build.gradle actualizado.")
PYEOF
fi

echo "[4/5] Reemplazando workflow de GitHub Actions..."
mkdir -p .github/workflows
cp build-release.yml .github/workflows/build-release.yml

echo "[5/5] Verificando .gitignore para no subir el keystore decodificado..."
if ! grep -q "release.keystore" .gitignore 2>/dev/null; then
  echo "app/release.keystore" >> .gitignore
fi

echo ""
echo "=== LISTO ==="
echo "Revisa los cambios con: git diff app/build.gradle"
echo "Si todo se ve bien, corre:"
echo "  git add ."
echo "  git commit -m 'Configura firma release automatizada'"
echo "  git push origin main"
echo ""
echo "El APK firmado quedará disponible como artifact 'nexus-release-signed'"
echo "en la pestaña Actions de GitHub tras el push."

#!/bin/bash

# 🚀 Setup completo para APK firmado listo para distribución
# Este script automatiza TODO lo necesario

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() { echo -e "${BLUE}════════════════════════════════════════${NC}\n$1\n${BLUE}════════════════════════════════════════${NC}\n"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; exit 1; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# 1. VERIFICAR REQUISITOS
print_header "PASO 1: Verificando requisitos..."

command -v keytool &>/dev/null || print_error "keytool no instalado (incluido en Java JDK)"
command -v base64 &>/dev/null || print_error "base64 no encontrado"
command -v git &>/dev/null || print_error "git no encontrado"
command -v curl &>/dev/null || print_error "curl no encontrado"

print_success "Todas las herramientas están disponibles"

# 2. GENERAR KEYSTORE
print_header "PASO 2: Generando Keystore..."

if [ -f "app/release.keystore" ]; then
    print_info "El keystore ya existe"
    read -p "¿Reemplazarlo? (s/n): " -n 1 -r
    echo
    [ ! $REPLY =~ ^[Ss]$ ] && print_info "Usando keystore existente" || rm app/release.keystore
fi

if [ ! -f "app/release.keystore" ]; then
    read -sp "Contraseña del keystore: " KEYSTORE_PASSWORD
    echo
    read -sp "Contraseña de la clave: " KEY_PASSWORD
    echo
    read -p "Nombre completo: " CN
    read -p "Organización: " ORG
    
    keytool -genkey -v -keystore app/release.keystore \
        -keyalg RSA -keysize 2048 -validity 9125 \
        -alias "nexus_vcore_key" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "CN=$CN, OU=Development, O=$ORG, L=Mexico, ST=Mexico, C=MX"
    
    print_success "Keystore generado"
else
    print_success "Keystore existente"
fi

# 3. CODIFICAR A BASE64
print_header "PASO 3: Codificando keystore a BASE64..."

KEYSTORE_BASE64=$(base64 < app/release.keystore | tr -d '\n')
echo "$KEYSTORE_BASE64" > /tmp/keystore-base64.txt

print_success "Keystore codificado"
print_info "Guardado en: /tmp/keystore-base64.txt"

# 4. AGREGAR SECRETOS A GITHUB
print_header "PASO 4: Agregando secretos a GitHub..."

if [ -z "$GITHUB_TOKEN" ]; then
    print_error "GITHUB_TOKEN no configurada. Usa: export GITHUB_TOKEN=tu_token"
fi

REPO_OWNER="meni60116013-rgb"
REPO_NAME="nexux_vcore"

# Obtener clave pública del repo
get_public_key() {
    curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" \
        | grep -o '"key":"[^"]*' | head -1 | cut -d'"' -f4
}

get_key_id() {
    curl -s -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" \
        | grep -o '"key_id":"[^"]*' | head -1 | cut -d'"' -f4
}

# Función para agregar secreto
add_secret() {
    local NAME=$1
    local VALUE=$2
    
    print_info "Agregando secreto: $NAME"
    
    PUBLIC_KEY=$(get_public_key)
    KEY_ID=$(get_key_id)
    
    [ -z "$PUBLIC_KEY" ] && print_error "No se pudo obtener clave pública"
    
    # Cifrar con Python
    ENCRYPTED=$(python3 << EOF
import base64, json
from nacl.public import PublicKey, SealedBox

pub_key_b64 = "$PUBLIC_KEY"
secret_value = "$VALUE"

pub_key = PublicKey(base64.b64decode(pub_key_b64))
box = SealedBox(pub_key)
encrypted = box.encrypt(secret_value.encode())

print(base64.b64encode(encrypted.ciphertext).decode())
EOF
)
    
    curl -s -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -d "{\"encrypted_value\":\"$ENCRYPTED\",\"key_id\":\"$KEY_ID\"}" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$NAME" > /dev/null
    
    print_success "$NAME agregado"
}

add_secret "KEYSTORE_FILE" "$KEYSTORE_BASE64"
add_secret "KEYSTORE_PASSWORD" "$KEYSTORE_PASSWORD"
add_secret "KEY_ALIAS" "nexus_vcore_key"
add_secret "KEY_PASSWORD" "$KEY_PASSWORD"

# 5. GUARDAR BACKUP
print_header "PASO 5: Respaldando keystore..."

mkdir -p ~/.nexus-backup
cp app/release.keystore ~/.nexus-backup/release.keystore
chmod 600 ~/.nexus-backup/release.keystore

print_success "Backup guardado en: ~/.nexus-backup/release.keystore"
print_warning "⚠️  IMPORTANTE: Copia este archivo a un lugar seguro"

# 6. COMMIT Y PUSH
print_header "PASO 6: Enviando cambios a GitHub..."

git add .gitignore
git commit -m "Configura firma automatizada para APK" || print_info "Sin cambios para hacer commit"
git push origin main || print_info "Repo ya actualizado"

print_success "Cambios enviados"

# 7. DISPARAR BUILD
print_header "PASO 7: Disparando workflow..."

curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/build_nexux.yml/dispatches" \
    -d '{"ref":"main"}' > /dev/null

print_success "Workflow disparado"

# RESUMEN
print_header "✨ ¡LISTO! Aquí está el resumen:"

cat << EOF
${GREEN}✓ Keystore generado y codificado
✓ Secretos agregados a GitHub
✓ Backup guardado en ~/.nexus-backup/
✓ Cambios enviados a GitHub
✓ Workflow disparado${NC}

📍 Próximos pasos:

1. Abre: https://github.com/$REPO_OWNER/$REPO_NAME/actions
2. Espera a que el workflow "V-core Nexux Build & Release" termine
3. Descarga el APK firmado desde:
   - Artifacts: https://github.com/$REPO_OWNER/$REPO_NAME/actions
   - Releases: https://github.com/$REPO_OWNER/$REPO_NAME/releases

💾 Tu APK estará disponible automáticamente en cada push a 'main'

${YELLOW}⚠️  NO OLVIDES:
- El keystore NO debe subirse a GitHub
- Guarda una copia segura del keystore
- Los secretos están cifrados en GitHub${NC}
EOF

echo ""

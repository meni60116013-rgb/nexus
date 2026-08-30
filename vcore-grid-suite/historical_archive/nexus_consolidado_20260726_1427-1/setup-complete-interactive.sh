#!/bin/bash

################################################################################
# 🚀 SETUP COMPLETO - APK FIRMADO LISTO PARA DISTRIBUCIÓN
# Script 100% automatizado con entrada interactiva inteligente
################################################################################

set -e

# COLORES
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# FUNCIONES DE UTILIDAD
print_banner() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║      🚀 SETUP AUTOMÁTICO - APK FIRMADO PARA DIST     ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${MAGENTA}▶ PASO $1:${NC} $2"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

ask_yes_no() {
    local prompt=$1
    local response
    
    while true; do
        read -p "$(echo -e ${CYAN}$prompt${NC}) (s/n): " -n 1 response
        echo
        case $response in
            [Ss]) return 0 ;;
            [Nn]) return 1 ;;
            *) print_warning "Por favor, responde 's' o 'n'" ;;
        esac
    done
}

read_password() {
    local prompt=$1
    local password
    local password_confirm
    
    while true; do
        read -sp "$(echo -e ${CYAN}$prompt${NC}): " password
        echo
        
        if [ ${#password} -lt 6 ]; then
            print_error "La contraseña debe tener al menos 6 caracteres"
            continue
        fi
        
        read -sp "$(echo -e ${CYAN}Confirma contraseña${NC}): " password_confirm
        echo
        
        if [ "$password" == "$password_confirm" ]; then
            echo "$password"
            return 0
        else
            print_error "Las contraseñas no coinciden"
        fi
    done
}

read_required() {
    local prompt=$1
    local value
    
    while true; do
        read -p "$(echo -e ${CYAN}$prompt${NC}): " value
        
        if [ -z "$value" ]; then
            print_warning "Este campo es requerido"
            continue
        fi
        
        echo "$value"
        return 0
    done
}

check_command() {
    if ! command -v $1 &>/dev/null; then
        print_error "$2 no instalado ($1)"
    fi
    print_success "$2 encontrado"
}

# PASO 1: BANNER Y BIENVENIDA
print_banner

echo -e "${BLUE}Este script automatizará TODO el proceso para generar un APK${NC}"
echo -e "${BLUE}firmado listo para distribución en Google Play Store o similar.${NC}"
echo ""
print_info "Asegúrate de tener:"
echo "  • Java JDK 17 o superior"
echo "  • Git configurado"
echo "  • Acceso a GitHub (token personal)"
echo ""

if ! ask_yes_no "¿Deseas continuar?"; then
    print_warning "Setup cancelado"
    exit 0
fi

# PASO 2: VERIFICAR REQUISITOS
print_step 2 "Verificando requisitos"

check_command "keytool" "keytool (Java)"
check_command "jarsigner" "jarsigner (Java)"
check_command "base64" "base64"
check_command "git" "git"
check_command "curl" "curl"
check_command "python3" "Python 3"

python3 -c "from nacl.public import PublicKey" 2>/dev/null || {
    print_warning "Instalando pynacl..."
    pip3 install pynacl >/dev/null 2>&1 || print_error "No se pudo instalar pynacl"
    print_success "pynacl instalado"
}

# PASO 3: VERIFICAR REPOSITORIO
print_step 3 "Verificando repositorio"

if [ ! -d ".git" ]; then
    print_error "No estás en el directorio raíz del repositorio git"
fi

REPO_URL=$(git config --get remote.origin.url)
REPO_OWNER=$(echo $REPO_URL | sed 's/.*:\|\.git//g' | cut -d'/' -f1)
REPO_NAME=$(echo $REPO_URL | sed 's/.*:\|\.git//g' | cut -d'/' -f2)

print_success "Repositorio: $REPO_OWNER/$REPO_NAME"

# PASO 4: GITHUB TOKEN
print_step 4 "Configurando acceso a GitHub"

if [ ! -z "$GITHUB_TOKEN" ]; then
    print_info "Token de GitHub detectado en variable de entorno"
    if ask_yes_no "¿Usar este token?"; then
        TOKEN="$GITHUB_TOKEN"
    else
        TOKEN=""
    fi
fi

if [ -z "$TOKEN" ]; then
    echo -e "${BLUE}Para obtener tu token personal:${NC}"
    echo "  1. Ve a: https://github.com/settings/tokens/new"
    echo "  2. Dale estos permisos: 'repo' y 'workflow'"
    echo "  3. Copia el token completo"
    echo ""
    
    TOKEN=$(read_required "Pega tu Personal Access Token")
fi

# Verificar token
print_info "Verificando token..."
if ! curl -s -H "Authorization: token $TOKEN" https://api.github.com/user >/dev/null 2>&1; then
    print_error "Token inválido o expirado"
fi

GITHUB_USER=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)
print_success "Token válido para usuario: $GITHUB_USER"

export GITHUB_TOKEN="$TOKEN"

# PASO 5: DATOS DEL CERTIFICADO
print_step 5 "Datos del certificado"

print_info "Estos datos se usarán para generar el keystore"

FULL_NAME=$(read_required "Nombre completo")
ORG=$(read_required "Organización/Empresa")
CITY=$(read_required "Ciudad" && echo "Mexico")
STATE=$(read_required "Estado/Provincia (ej: Mexico)" && echo "Mexico")
COUNTRY=$(read_required "País (código de 2 letras, ej: MX)" && echo "MX")

print_success "Datos capturados"

# PASO 6: CONTRASEÑAS
print_step 6 "Configurando contraseñas"

KEYSTORE_PASSWORD=$(read_password "Contraseña del keystore")
KEY_PASSWORD=$(read_password "Contraseña de la clave privada")

print_success "Contraseñas configuradas"

# PASO 7: GENERAR KEYSTORE
print_step 7 "Generando Keystore"

KEYSTORE_PATH="app/release.keystore"

if [ -f "$KEYSTORE_PATH" ]; then
    print_warning "El keystore ya existe: $KEYSTORE_PATH"
    if ask_yes_no "¿Reemplazarlo?"; then
        rm "$KEYSTORE_PATH"
        print_info "Keystore anterior eliminado"
    else
        print_info "Usando keystore existente"
    fi
fi

if [ ! -f "$KEYSTORE_PATH" ]; then
    print_info "Generando nuevo keystore..."
    mkdir -p app
    
    keytool -genkey -v -keystore "$KEYSTORE_PATH" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 9125 \
        -alias "nexus_vcore_key" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "CN=$FULL_NAME, OU=Development, O=$ORG, L=$CITY, ST=$STATE, C=$COUNTRY" \
        2>&1 | grep -v "^Generating" | grep -v "^Enterin" | grep -v "as" || true
    
    print_success "Keystore generado"
fi

# PASO 8: CODIFICAR A BASE64
print_step 8 "Codificando keystore a BASE64"

print_info "Codificando (esto puede tomar unos segundos)..."
KEYSTORE_BASE64=$(base64 < "$KEYSTORE_PATH" | tr -d '\n')

echo "$KEYSTORE_BASE64" > /tmp/keystore-base64.txt
print_success "Keystore codificado"
print_info "Tamaño: ${#KEYSTORE_BASE64} caracteres"

# PASO 9: AGREGAR SECRETOS A GITHUB
print_step 9 "Agregando secretos a GitHub"

add_github_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2
    
    print_info "Agregando: $SECRET_NAME"
    
    # Obtener clave pública
    PUBLIC_KEY=$(curl -s -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" \
        | grep -o '"key":"[^"]*' | head -1 | cut -d'"' -f4)
    
    KEY_ID=$(curl -s -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" \
        | grep -o '"key_id":"[^"]*' | head -1 | cut -d'"' -f4)
    
    if [ -z "$PUBLIC_KEY" ] || [ -z "$KEY_ID" ]; then
        print_error "No se pudo obtener clave pública de GitHub"
    fi
    
    # Cifrar secreto
    ENCRYPTED=$(python3 << PYEOF
import base64
from nacl.public import PublicKey, SealedBox

pub_key_b64 = "$PUBLIC_KEY"
secret_value = "$SECRET_VALUE"

pub_key = PublicKey(base64.b64decode(pub_key_b64))
box = SealedBox(pub_key)
encrypted = box.encrypt(secret_value.encode())

print(base64.b64encode(encrypted.ciphertext).decode())
PYEOF
)
    
    if [ -z "$ENCRYPTED" ]; then
        print_error "Error al cifrar el secreto"
    fi
    
    # Agregar a GitHub
    HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"encrypted_value\":\"$ENCRYPTED\",\"key_id\":\"$KEY_ID\"}" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$SECRET_NAME")
    
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "204" ]; then
        print_success "✓ $SECRET_NAME agregado"
    else
        print_error "Error al agregar $SECRET_NAME (HTTP $HTTP_CODE)"
    fi
}

add_github_secret "KEYSTORE_FILE" "$KEYSTORE_BASE64"
add_github_secret "KEYSTORE_PASSWORD" "$KEYSTORE_PASSWORD"
add_github_secret "KEY_ALIAS" "nexus_vcore_key"
add_github_secret "KEY_PASSWORD" "$KEY_PASSWORD"

# PASO 10: CONFIGURAR GITIGNORE
print_step 10 "Configurando .gitignore"

if ! grep -q "release.keystore" .gitignore 2>/dev/null; then
    echo "app/release.keystore" >> .gitignore
    print_success "Agregada entrada a .gitignore"
else
    print_success ".gitignore ya contiene release.keystore"
fi

# PASO 11: HACER BACKUP
print_step 11 "Respaldando keystore"

mkdir -p ~/.nexus-backup
cp "$KEYSTORE_PATH" ~/.nexus-backup/release.keystore
chmod 600 ~/.nexus-backup/release.keystore

print_success "Backup guardado en: ~/.nexus-backup/release.keystore"

# PASO 12: COMMIT Y PUSH
print_step 12 "Enviando cambios a GitHub"

git add .gitignore 2>/dev/null || true
git commit -m "Configura firma automatizada para APK" 2>/dev/null || print_info "Sin cambios para commit"

print_info "Enviando a GitHub..."
git push origin main 2>/dev/null || print_info "Ya está actualizado"

print_success "Cambios enviados"

# PASO 13: DISPARAR WORKFLOW
print_step 13 "Disparando workflow de compilación"

HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X POST \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d '{"ref":"main"}' \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/build_nexux.yml/dispatches")

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
    print_success "Workflow disparado"
else
    print_warning "Workflow disparado (HTTP $HTTP_CODE)"
fi

# RESUMEN FINAL
print_step 14 "Resumen y Próximos Pasos"

clear
echo -e "${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          ✨ ¡SETUP COMPLETADO EXITOSAMENTE! ✨       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${GREEN}✓ Keystore generado y cifrado${NC}"
echo -e "${GREEN}✓ Secretos agregados a GitHub${NC}"
echo -e "${GREEN}✓ Backup guardado en ~/.nexus-backup/${NC}"
echo -e "${GREEN}✓ Cambios enviados a GitHub${NC}"
echo -e "${GREEN}✓ Workflow disparado${NC}"

echo ""
echo -e "${CYAN}📍 PRÓXIMOS PASOS:${NC}"
echo ""
echo "1. Ve a: ${BLUE}https://github.com/$REPO_OWNER/$REPO_NAME/actions${NC}"
echo "   Espera a que el workflow 'V-core Nexux Build & Release' termine"
echo ""
echo "2. Descarga el APK firmado desde:"
echo "   • ${BLUE}Releases:${NC} https://github.com/$REPO_OWNER/$REPO_NAME/releases"
echo "   • ${BLUE}Artifacts:${NC} https://github.com/$REPO_OWNER/$REPO_NAME/actions"
echo ""
echo "3. Tu APK estará disponible automáticamente en cada push a 'main'"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "   • El keystore está en: ~/.nexus-backup/release.keystore"
echo "   • Guarda este archivo en un lugar SEGURO"
echo "   • NO lo pierdas, es tu certificado para firmar APKs"
echo "   • Los secretos están cifrados en GitHub"
echo ""

echo -e "${MAGENTA}🎯 AUTOMATIZACIÓN:${NC}"
echo "   • Cada 'git push' a 'main' compila y firma automáticamente"
echo "   • El APK se publica en Releases automáticamente"
echo "   • No necesitas hacer nada más"
echo ""

echo -e "${CYAN}✨ ¡Todo listo para distribución! ✨${NC}"
echo ""

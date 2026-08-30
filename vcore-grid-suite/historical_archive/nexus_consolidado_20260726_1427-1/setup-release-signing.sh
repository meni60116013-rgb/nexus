#!/bin/bash
set -e

# ANSI Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
REPO_OWNER="meni60116013-rgb"
REPO_NAME="nexux_vcore"
KEYSTORE_PATH="app/release.keystore"
KEYSTORE_ALIAS="nexus-key"
KEYSTORE_VALIDITY=10950  # 30 años
GITHUB_TOKEN="${GITHUB_TOKEN}"

# Helper functions
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_prerequisites() {
    print_header "VERIFICANDO REQUISITOS"
    
    # Verificar jarsigner
    if ! command -v jarsigner &> /dev/null; then
        print_error "jarsigner no está instalado"
        exit 1
    fi
    print_success "jarsigner encontrado"
    
    # Verificar keytool
    if ! command -v keytool &> /dev/null; then
        print_error "keytool no está instalado"
        exit 1
    fi
    print_success "keytool encontrado"
    
    # Verificar git
    if ! command -v git &> /dev/null; then
        print_error "git no está instalado"
        exit 1
    fi
    print_success "git encontrado"
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado"
        exit 1
    fi
    print_success "curl encontrado"
    
    # Verificar base64
    if ! command -v base64 &> /dev/null; then
        print_error "base64 no está instalado"
        exit 1
    fi
    print_success "base64 encontrado"
    
    # Verificar GITHUB_TOKEN
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN no está configurada"
        print_info "Configúrala con: export GITHUB_TOKEN=your_token"
        exit 1
    fi
    print_success "GITHUB_TOKEN configurada"
}

generate_keystore() {
    print_header "GENERANDO KEYSTORE"
    
    if [ -f "$KEYSTORE_PATH" ]; then
        print_warning "El keystore ya existe: $KEYSTORE_PATH"
        read -p "¿Deseas reemplazarlo? (s/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_info "Usando keystore existente"
            return 0
        fi
        rm "$KEYSTORE_PATH"
    fi
    
    print_info "Ingresa los datos para el certificado:"
    read -p "Contraseña del keystore (≥6 caracteres): " -s KEYSTORE_PASSWORD
    echo
    
    read -p "Contraseña de la clave privada (≥6 caracteres): " -s KEY_PASSWORD
    echo
    
    read -p "Nombre y Apellido: " -r CN
    read -p "Organización: " -r ORG
    read -p "Ciudad: " -r CITY
    read -p "Estado/Provincia: " -r STATE
    read -p "País (código de 2 letras): " -r COUNTRY
    
    # Generar keystore
    keytool -genkey -v -keystore "$KEYSTORE_PATH" \
        -keyalg RSA -keysize 2048 -validity $KEYSTORE_VALIDITY \
        -alias "$KEYSTORE_ALIAS" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "CN=$CN, OU=Engineering, O=$ORG, L=$CITY, ST=$STATE, C=$COUNTRY"
    
    print_success "Keystore generado: $KEYSTORE_PATH"
    
    # Guardar credenciales temporalmente para GitHub
    export KEYSTORE_PASSWORD
    export KEY_PASSWORD
}

add_gitignore_entry() {
    print_header "CONFIGURANDO .GITIGNORE"
    
    if ! grep -q "release.keystore" .gitignore 2>/dev/null; then
        echo "app/release.keystore" >> .gitignore
        print_success "Agregada entrada a .gitignore"
    else
        print_success ".gitignore ya contiene release.keystore"
    fi
}

create_workflow() {
    print_header "CREANDO WORKFLOW DE GITHUB ACTIONS"
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/build-release.yml << 'EOF'
name: Build and Sign Release APK

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  actions: read

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Decode Keystore
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > app/release.keystore
      
      - name: Build Release APK
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
        run: |
          chmod +x gradlew
          ./gradlew assembleRelease
      
      - name: List APK files
        run: |
          ls -lah app/build/outputs/apk/release/ || echo "No APK found"
      
      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: nexus-release-signed
          path: app/build/outputs/apk/release/app-release.apk
          retention-days: 30
          if-no-files-found: warn
      
      - name: Create Release
        if: success()
        uses: softprops/action-gh-release@v1
        with:
          files: app/build/outputs/apk/release/app-release.apk
          draft: true
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Clean up keystore
        if: always()
        run: rm -f app/release.keystore
EOF
    
    print_success "Workflow creado: .github/workflows/build-release.yml"
}

add_github_secrets() {
    print_header "AGREGANDO SECRETOS A GITHUB"
    
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN no está configurada"
        return 1
    fi
    
    # Codificar keystore a base64
    print_info "Codificando keystore a base64..."
    KEYSTORE_BASE64=$(base64 < "$KEYSTORE_PATH" | tr -d '\n')
    
    # Función auxiliar para agregar secreto
    add_secret() {
        local SECRET_NAME=$1
        local SECRET_VALUE=$2
        
        print_info "Agregando secreto: $SECRET_NAME"
        
        # Obtener la clave pública del repositorio
        PUBLIC_KEY=$(curl -s \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" \
            | grep -o '"key":"[^"]*' | cut -d'"' -f4)
        
        KEY_ID=$(curl -s \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" \
            | grep -o '"key_id":"[^"]*' | cut -d'"' -f4)
        
        if [ -z "$PUBLIC_KEY" ] || [ -z "$KEY_ID" ]; then
            print_error "No se pudo obtener la clave pública"
            return 1
        fi
        
        # Cifrar el valor del secreto con sodium
        ENCRYPTED=$(echo -n "$SECRET_VALUE" | base64 | \
            python3 -c "
import sys, base64
from nacl import pwhash, secret, utils
from nacl.public import PublicKey, SealedBox

key_str = '$PUBLIC_KEY'
msg = sys.stdin.read().strip()

# Decodificar la clave pública
pub_key = PublicKey(base64.b64decode(key_str))

# Cifrar el mensaje
box = SealedBox(pub_key)
encrypted = box.encrypt(base64.b64decode(msg))

# Retornar base64 del cifrado
print(base64.b64encode(encrypted.ciphertext).decode())
" 2>/dev/null)
        
        if [ -z "$ENCRYPTED" ]; then
            print_error "Error al cifrar secreto: $SECRET_NAME"
            return 1
        fi
        
        # Crear/actualizar secreto
        curl -s -X PUT \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            -d "{\"encrypted_value\":\"$ENCRYPTED\",\"key_id\":\"$KEY_ID\"}" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$SECRET_NAME" > /dev/null
        
        print_success "Secreto agregado: $SECRET_NAME"
    }
    
    # Agregar todos los secretos
    add_secret "KEYSTORE_BASE64" "$KEYSTORE_BASE64"
    add_secret "KEYSTORE_PASSWORD" "$KEYSTORE_PASSWORD"
    add_secret "KEY_ALIAS" "$KEYSTORE_ALIAS"
    add_secret "KEY_PASSWORD" "$KEY_PASSWORD"
}

commit_and_push() {
    print_header "ENVIANDO CAMBIOS A GITHUB"
    
    print_info "Agregando archivos al git..."
    git add .github/workflows/build-release.yml .gitignore
    
    print_info "Realizando commit..."
    git commit -m "Configura firma release automatizada

- Agrega workflow de GitHub Actions para compilar APK firmado
- Secretos cifrados para credenciales de firma
- Artefacto disponible en releases" || print_warning "No hay cambios para hacer commit"
    
    print_info "Enviando a GitHub..."
    git push origin main || print_warning "Error al hacer push (¿ya está actualizado?)"
    
    print_success "Cambios enviados a GitHub"
}

trigger_workflow() {
    print_header "DISPARANDO WORKFLOW DE COMPILACIÓN"
    
    print_info "Esperando a que el workflow sea procesado..."
    sleep 5
    
    # Obtener el workflow ID
    WORKFLOW_ID=$(curl -s \
        -H "Authorization: token $GITHUB_TOKEN" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows" \
        | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -z "$WORKFLOW_ID" ]; then
        print_error "No se pudo encontrar el workflow"
        return 1
    fi
    
    # Disparar workflow
    curl -s -X POST \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -d '{"ref":"main"}' \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/build-release.yml/dispatches" > /dev/null
    
    print_success "Workflow disparado"
    print_info "Ver progreso en: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
}

show_summary() {
    print_header "RESUMEN DEL PROCESO"
    
    echo -e "${GREEN}✓ Keystore generado${NC}"
    echo -e "${GREEN}✓ Secretos configurados en GitHub${NC}"
    echo -e "${GREEN}✓ Workflow de compilación creado${NC}"
    echo -e "${GREEN}✓ Cambios enviados a GitHub${NC}"
    echo -e "${GREEN}✓ Workflow disparado${NC}"
    
    echo ""
    print_info "APK firmado disponible en: https://github.com/$REPO_OWNER/$REPO_NAME/releases"
    print_info "O descárgalo desde Actions: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
    echo ""
    print_warning "IMPORTANTE: El keystore NO fue subido a GitHub (está en .gitignore)"
    print_warning "Guarda una copia segura de: $KEYSTORE_PATH"
}

main() {
    print_header "SETUP AUTOMATIZADO - FIRMA RELEASE APK"
    
    check_prerequisites
    generate_keystore
    add_gitignore_entry
    create_workflow
    add_github_secrets
    commit_and_push
    trigger_workflow
    show_summary
    
    print_header "¡LISTO!"
    print_success "Tu APK será compilado y firmado automáticamente en cada push a main"
}

main "$@"

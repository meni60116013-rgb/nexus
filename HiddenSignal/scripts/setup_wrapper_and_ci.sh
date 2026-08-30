#!/bin/bash
set -e

echo "=== [1/3] Generando wrapper de Gradle ==="
if command -v gradle &> /dev/null; then
    gradle wrapper
else
    pkg install gradle -y && gradle wrapper
fi

echo "=== [2/3] Configurando permisos de ejecutable en Git ==="
chmod +x gradlew
git update-index --chmod=+x gradlew

echo "=== [3/3] Creando flujo de trabajo optimizado para GitHub Actions ==="
mkdir -p .github/workflows

cat << 'WORKFLOW' > .github/workflows/build.yml
name: Build APK

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout repositorio
      uses: actions/checkout@v4

    - name: Configurar JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Dar permisos de ejecución a gradlew
      run: chmod +x gradlew

    - name: Compilar APK Debug en la nube
      run: ./gradlew assembleDebug --no-daemon

    - name: Subir Artifact APK
      uses: actions/upload-artifact@v4
      with:
        name: app-debug
        path: app/build/outputs/apk/debug/app-debug.apk
WORKFLOW

git add gradlew gradlew.bat gradle/ .github/workflows/build.yml
git commit -m "fix(ci): restaurado gradle wrapper y flujo de compilacion automatica"
git push origin main

echo "=== ¡Proceso completado exitosamente! El wrapper y la CI han sido actualizados en GitHub ==="

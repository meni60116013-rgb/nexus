#!/bin/bash
set -e

echo "=== Generando archivos mínimos del wrapper en local ==="
mkdir -p gradle/wrapper

# Crear gradlew script ejecutable
cat << 'GRADLEW' > gradlew
#!/bin/sh
exec gradle "$@"
GRADLEW
chmod +x gradlew

# Crear gradle-wrapper.properties básico
cat << 'PROPS' > gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
PROPS

echo "=== Subiendo cambios livianos a GitHub ==="
git add gradlew gradle/wrapper/gradle-wrapper.properties
git commit -m "fix(ci): wrapper liviano creado sin descargas locales"
git push origin main

echo "=== ¡Sincronización ligera completada! ==="

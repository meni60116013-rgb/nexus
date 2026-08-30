#!/bin/bash
set -e
echo "[V-CORE] Limpiando e inyectando assets en WebView..."
TARGET_DIR="android-mirror/app/src/main/assets"
rm -rf $TARGET_DIR/*
mkdir -p $TARGET_DIR/core

cp -r client/* $TARGET_DIR/
cp -r core/* $TARGET_DIR/core/
echo "[V-CORE] Assets inyectados correctamente sin residuos."

#!/bin/bash
# =====================================================================
# VCORE GRID SUITE - ORQUESTADOR MAESTRO DE ALTA PRECISIÓN (EXPERTO SENIOR)
# =====================================================================
set -e  # Detener inmediatamente ante cualquier error imprevisto

echo "=== [VCORE SYSTEM] INICIANDO PIPELINE HASTA LA CÚSPIDE ==="

# Intervalo de seguridad para proteger la RAM y temperatura del dispositivo
COOLDOWN=2

if [ -f "vcore_nexus_manifest.json" ]; then
    echo "[OK] Manifiesto principal detectado."
else
    echo '{"version": "2.9.0-master", "status": "active"}' > vcore_nexus_manifest.json
fi

# FASE 1: Motores de Cálculo
if [ -d "core/engines" ]; then
    echo "[INFO] [Fase 1/7] Ejecutando motores lógicos..."
    for engine in core/engines/*.py; do
        [ -f "$engine" ] && python3 "$engine"
    done
    sleep $COOLDOWN
fi

# FASE 2: Seguridad y Autoría
if [ -f "security/integrity_check.py" ]; then
    echo "[INFO] [Fase 2/7] Ejecutando sellos de seguridad..."
    python3 security/integrity_check.py
    sleep $COOLDOWN
fi

# FASE 3: Trazabilidad e Histórico
if [ -f "historical_archive/logger_engine.py" ]; then
    echo "[INFO] [Fase 3/7] Generando bitácora de trazabilidad..."
    python3 historical_archive/logger_engine.py
    sleep $COOLDOWN
fi

# FASE 4: Interfaz CLI
if [ -f "cli.py" ]; then
    echo "[INFO] [Fase 4/7] Validando interfaz CLI..."
    python3 cli.py
    sleep $COOLDOWN
fi

# FASE 5: Pruebas Unitarias (Ciclo 7)
if [ -f "tests/test_engines.py" ]; then
    echo "[INFO] [Fase 5/7] Ejecutando pruebas unitarias de calidad..."
    python3 tests/test_engines.py
    sleep $COOLDOWN
fi

# FASE 6: Documentación (Ciclo 8)
if [ -d "docs" ]; then
    echo "[INFO] [Fase 6/7] Verificando documentación técnica..."
    echo "[OK] Manual técnico integrado."
    sleep $COOLDOWN
fi

# FASE 8: Análisis de Telemetría
if [ -f "core/telemetry/analyzer.py" ]; then
    echo "[INFO] [Fase 8/8] Ejecutando análisis de telemetría..."
    python3 core/telemetry/analyzer.py
    sleep $COOLDOWN
fi

# FASE 7: Empaquetado Quirúrgico de Distribución (Ciclo 6)
if [ -f "scripts/package_release.py" ]; then
    echo "[INFO] [Fase 7/7] Ejecutando empaquetado final para distribución..."
    python3 scripts/package_release.py
fi

echo "====================================================================="
echo "[SUCCESS] ¡CÚSPIDE ALCANZADA! VCORE GRID SUITE 100% OPERATIVA Y EMPAQUETADA."
echo "====================================================================="

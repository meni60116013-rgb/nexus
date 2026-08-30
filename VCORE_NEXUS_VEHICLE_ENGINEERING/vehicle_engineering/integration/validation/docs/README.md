# Validation Orchestrator

## Bloque Maestro #5

Centraliza la validación estructural del:

`VCORE_ENGINEERING_SNAPSHOT`

### Valida

- Schema
- Vehicle identity
- Mass
- Center of gravity
- Geometry
- Vehicle systems
- Performance

### No valida física directamente

Los cálculos físicos continúan siendo responsabilidad de:

- Engineering Engine
- Suspension / Dynamics Engine
- Powertrain / Performance Engine
- otros engines especializados

### Arquitectura

Vehicle Core
    |
Motorcycle Core
    |
Vehicle Systems
    |
Engineering Engines
    |
Engineering Snapshot
    |
Validation Orchestrator
    |
Validation Report

Tests ligeros: PASS.

Compilación local: NO REALIZADA.

Compilación pesada: GitHub Actions.

main: INTACTO.

# VCORE NEXUS — SOURCE OF TRUTH POLICY

## Estado

Este documento se genera durante MASTER BLOCK 02.

## Regla

Ningún repositorio secundario se considera automáticamente fuente de verdad.

La fuente de verdad se determinará por:

1. integridad Git;
2. estado remoto;
3. contenido funcional;
4. existencia de CI/CD;
5. existencia de Factory;
6. cobertura de ingeniería;
7. ausencia de modificaciones no controladas;
8. capacidad de reproducibilidad.

## Protección

`VCORE_PLATFORM_FUSION` contiene modificaciones/eliminaciones locales masivas.
No se debe ejecutar:

- git reset --hard
- git clean
- git restore .
- git checkout -- .
- force push
- eliminación masiva

hasta realizar recuperación/proveniencia explícita.

## Android

No se permite compilación Android/Gradle local.

La compilación Android será ejecutada exclusivamente mediante GitHub Actions.

## Integración

La integración definitiva será realizada mediante commits explícitos y verificables.

Nunca se copiarán indiscriminadamente árboles históricos completos.

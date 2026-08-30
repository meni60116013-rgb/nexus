# Vehicle Systems Integration

## Bloque Maestro #3

Integra los sistemas configurables de la motocicleta:

- Wheels
- Suspension
- Brakes
- Powertrain

## Arquitectura

Motorcycle Core
        |
        v
Vehicle Systems
        |
        v
Vehicle Engineering Integration
        |
        +--> Engineering Engine
        |
        +--> Powertrain / Performance Engine
        |
        v
Engineering Snapshot

## Regla

Vehicle Systems no duplica física.

La configuración y los parámetros pertenecen a esta capa.
Los cálculos especializados permanecen en sus engines.

## Estado

Tests: PASS

Compilación local: NO REALIZADA.

GitHub Actions: compilación pesada.

main: INTACTO.

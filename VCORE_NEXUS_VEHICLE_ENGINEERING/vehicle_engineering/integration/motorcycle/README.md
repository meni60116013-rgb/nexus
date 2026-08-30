# Motorcycle Core Integration

## Bloque Maestro #2

Integra la configuración específica de motocicleta con el
Universal Vehicle Core y la Vehicle Engineering Foundation.

## Responsabilidades

Motorcycle Core:

- Identidad de motocicleta
- Wheelbase
- Ruedas
- Suspensión
- Frenos
- Parámetros específicos

Vehicle Engineering Foundation:

- Masa
- Centro de gravedad
- Geometría calculada
- Performance
- Validación

## Regla arquitectónica

Este módulo NO contiene cálculos físicos duplicados.

Su función es:

`Motorcycle Configuration -> Vehicle Integration -> Engineering Engines`

## Estado

Validación local ligera: PASS.

Compilación local: NO REALIZADA.

Compilación pesada: GitHub Actions.

Rama:
`vehicle-engineering-foundation`

`main`: intacto.

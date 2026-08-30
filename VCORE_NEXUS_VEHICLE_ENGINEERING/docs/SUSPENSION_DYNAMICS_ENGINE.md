# Suspension / Dynamics Engine

Motor preliminar de suspensión y dinámica vehicular.

## Suspensión

Incluye:

- Horquilla delantera.
- Suspensión trasera.
- Recorrido.
- Sag.
- Relación de movimiento.
- Carrera del amortiguador.
- Modelo lineal de resorte.

## Dinámica

Incluye:

- Transferencia longitudinal de carga.
- Fuerza lateral.
- Momento de rolido.
- Fuerza dinámica resultante.
- Cinemática básica rueda/amortiguador.

## Arquitectura

VEHICLE
→ FRAME
→ SUSPENSION
→ DYNAMICS
→ FUTURE ADVANCED ANALYSIS

## Estado

Los cálculos son preliminares y sirven como base
del modelo de ingeniería.

No constituyen por sí mismos validación FEM/FEA,
homologación ni certificación.

## Compilación

No se ejecuta compilación local.

La ejecución de pruebas queda destinada a GitHub Actions.

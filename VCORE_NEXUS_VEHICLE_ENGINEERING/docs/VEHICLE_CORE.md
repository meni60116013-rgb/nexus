# Vehicle Core

Núcleo de definición de vehículos de VCORE NEXUS.

## Capas

- `model/` — entidades principales del vehículo.
- `schema/` — validación de datos.
- `geometry/` — geometría estructural.
- `materials/` — materiales de ingeniería.
- `components/` — arquitectura de componentes.

## Estado inicial

El vehículo nace como `DRAFT`.

Flujo previsto:

DRAFT
→ ENGINEERING
→ VALIDATION
→ RELEASE

## Principio arquitectónico

El dispositivo móvil actúa como interfaz ligera.

El procesamiento pesado y las validaciones futuras se ejecutarán
en el núcleo cloud/GitHub Actions según corresponda.

No se realiza compilación local.

# Modulo Sync

Este modulo encapsula toda la logica de sincronizacion offline-first para planeaciones.

## Estructura

- config/: constantes y configuracion de API/sync.
- services/: acceso de bajo nivel para sincronizar, persistir y procesar pendientes.
- hooks/: estado y ciclo de vida de sincronizacion.
- providers/: contexto React para exponer operaciones y estado al resto de la app.
- index.ts: exportaciones publicas del modulo.

## Regla de arquitectura

- `src/hooks` y `src/services` son capas globales de la app (viewmodels y servicios compartidos por dominios).
- `src/sync/*` es un dominio encapsulado. Sus carpetas con nombres similares NO son duplicados, son capas internas del dominio sync.

## Convencion recomendada

- Si la logica es especifica de sincronizacion, crearla dentro de `src/sync/*`.
- Si la logica es transversal de multiples modulos, ubicarla en `src/hooks`, `src/services` o `src/utils`.

# Resumen Ejecutivo Vigente - PlanearIA

## Vision

PlanearIA es una plataforma docente offline-first construida como monolito modular. La meta es cero friccion: cada modulo debe sentirse como una herramienta que el profesor ya conoce, sobre una experiencia visual de primer nivel.

Experiencias madre:

- Planeaciones: Word/Docs.
- Classroom: grupos, alumnos, materiales, actividades, entregas, asistencia y calificaciones.
- Canva/Genially: diseno didactico visual.
- Excel: listas, asistencia, calificaciones y registros libres.
- WhatsApp docente: contactos, chat y colaboracion.
- Reportes: analitica y gamificacion en un hub separado.

## Contexto real

- Proyecto desarrollado por un estudiante/desarrollador solo.
- No esta en produccion y no tiene usuarios reales; existe una demo hosteada (web Vercel + APK Android) para pruebas.
- Se permiten refactors fuertes si reducen legacy y mejoran la experiencia.
- Presupuesto bajo/cero: priorizar local-first, free tiers y decisiones simples.
- Laptop del desarrollador: Ryzen 7, RTX 4060 y 64 GB RAM; puede servir como laboratorio local potente.

## Estado actual

- Planeaciones esta cerrada como primera gran refactorizacion. Fase 9 aprobada con editor tipo Word/Docs, selector de plantillas, IA gateway, fallback local, exportacion y flujo moderno.
- Pasos Iniciales esta cerrado como plan de organizacion: GitHub Product OS, CI inicial, entorno local y secuencia de planes.
- Classroom esta cerrado como experiencia base.
- Infraestructura Local/CI/Deploy Basico quedo cerrado; Fases 0 a 7 completadas con scripts, CI, backend smoke, demo low-cost y preparacion SQLite.
- Storage Local SQLite y Migracion Offline quedo cerrado para entrega academica: SQLite esta instalado como infraestructura opt-in con schema, adapter, migracion, sync queue y rollback; AsyncStorage sigue como default.
- Sincronizacion offline-first quedo unificada: motor por entidad con push/pull cross-device, endurecimiento de backend (JWT obligatorio y aislamiento por `userId` en rutas academicas, cola idempotente, `/api/unidades`) y UX de estado de red (banner offline/servidor caido). Detalle en `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`.
- Demo hosteada activa: web en `https://planearia-web.vercel.app/` y APK Android en Releases de GitHub.
- Auth/Seguridad y Sesion Real esta en ejecucion: Fases 0-6 completadas y validadas en CI (typecheck, lint, jest, backend smoke y aislamiento en verde); Fases 7-8 en cierre, con email real, datos sociales y validacion manual pendientes.
- UX/UI Global, Excel/Listas, Canva, WhatsApp docente, Reportes, Configuracion/Accesibilidad real y activacion SQLite como default quedan como decisiones posteriores.

## Stack actual

- React Native 0.81.5 + Expo 54.
- TypeScript 5.9.
- React Navigation 7.
- Context + hooks ViewModel.
- AsyncStorage como persistencia local default y rollback.
- SQLite/Expo SQLite como infraestructura opt-in para datos academicos relacionales y sync queue.
- Backend Node serverless en `backend/api` (Vercel).
- MongoDB Atlas free tier.
- IA gateway multi-provider en backend.
- Jest + Testing Library.

## Proximo paso recomendado

1. Cerrar el plan activo de Auth (email real, datos sociales, validacion manual).
2. Iniciar `Plan Maestro: UX/UI y Navegacion Global`. Ver `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`.

## Reglas de direccion

- No crear pantallas aisladas sin entrada, salida y CTA claro.
- No duplicar flujos entre hubs legacy y modulos nuevos.
- No acoplar pantallas nuevas directamente a AsyncStorage; usar ports/repositories compatibles con SQLite.
- No gastar en servicios hasta que exista demo/piloto que lo justifique.
- Todo plan maestro debe seguir `Documentacion/01-planes-maestros/meta_guia_planes.md`.

## Documentos vigentes principales

- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`
- `Documentacion/02-operacion/ENTORNO_LOCAL.md`

## Documentos no vigentes

La documentacion antigua de navegacion y resumen 2025, y el README principal anterior, se movieron a `Documentacion/99-archivo/`. Pueden consultarse como historia, pero no deben usarse para implementar rutas, pantallas o planes nuevos.

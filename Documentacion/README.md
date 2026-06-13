# Documentacion PlanearIA v4.2

Esta carpeta contiene la documentacion tecnica, estrategica y operativa de PlanearIA.

PlanearIA esta evolucionando de app de planeaciones a plataforma integral para docentes. La regla vigente es cero friccion: experiencias familiares tipo Word/Docs, Classroom, Canva, Excel, WhatsApp docente y reportes, sobre una base offline-first.

## Lectura Rapida

Si eres una IA o agente nuevo, lee en este orden:

1. `00-fundamentos/RESUMEN_EJECUTIVO.md` (estado vigente y reglas de direccion).
2. `00-fundamentos/VISION_ACTUAL.md` (manifiesto de producto y modulos objetivo).
3. `00-fundamentos/ARQUITECTURA.md` (stack, MVVM, offline-first, backend).
4. `00-fundamentos/FLUJO_SINCRONIZACION.md` (sync offline-first cross-device).
5. `00-fundamentos/ROADMAP_PLANES_MAESTROS.md` (que se hizo y cual es el proximo plan).
6. `01-planes-maestros/meta_guia_planes.md` antes de crear o ejecutar cualquier plan.
7. `02-operacion/ENTORNO_LOCAL.md` y `02-operacion/GUIA_PRUEBAS.md` para levantar y validar.

## Mapa del repositorio

| Ruta | Contenido |
| --- | --- |
| `App.tsx`, `src/` | Frontend React Native/Expo: pantallas, hooks ViewModel, context, services, sync y navegacion. |
| `backend/` | Funciones Node serverless (Vercel) y librerias (auth, IA gateway). |
| `types/` | Tipos TypeScript centralizados. |
| `Documentacion/` | Fundamentos, planes maestros, operacion, validacion, referencia, analisis IA y archivo. |
| `context/` | Ground truth por modulo, capturas, referencias open source y evidencias de fases. |
| `.agents/skills/` | Skills del proyecto (writing-style, token-efficiency). |

## Estructura de la documentacion

| Carpeta | Uso |
| --- | --- |
| `00-fundamentos/` | Vision vigente, arquitectura, resumen ejecutivo, flujo de sync, roadmap y mapa de modulos. |
| `01-planes-maestros/` | Meta guia obligatoria, plan activo (Auth) y carpeta `cerrados/` con los planes ya cerrados. |
| `02-operacion/` | Entorno local, GitHub Product OS, guia de pruebas, deploy hosteado y changelogs. |
| `03-validacion/` | Checklists manuales de cierre. |
| `04-referencia/` | Mapa de navegacion vigente y componentes preservados. |
| `05-analisis-ia/` | Opiniones y revisiones de IA conservadas como contexto, no como fuente unica. |
| `99-archivo/` | Documentacion legacy archivada; no usar para implementar. |

## Estado Actual

- Planeaciones: cerrado como experiencia Word/Docs. Fase 9 aprobada.
- Pasos Iniciales: cerrado como organizacion de GitHub, CI inicial y entorno.
- Classroom: cerrado. Fases 0 a 10, validacion final e issue #8 completados.
- Infraestructura Local/CI/Deploy Basico: cerrado; Fases 0 a 7 completadas.
- Storage Local SQLite y Migracion Offline: cerrado para entrega academica; SQLite opt-in con rollback, AsyncStorage sigue default.
- Sincronizacion offline-first: motor unificado por entidad, push/pull cross-device, endurecimiento backend (JWT + aislamiento por `userId`, cola idempotente) y UX de estado de red. Ver `02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`.
- Despliegue de demo: web hosteada en Vercel (`https://planearia-web.vercel.app/`) y APK Android en Releases.
- Auth/Seguridad y Sesion Real: en ejecucion; Fases 0-6 completadas y validadas en CI; 7-8 en cierre.
- UX/UI Global, Excel/Listas, Canva, WhatsApp docente, Reportes, Configuracion/Accesibilidad y activacion SQLite como default quedan como planes futuros.

## Proximo plan recomendado

El detalle y la secuencia completa viven en `00-fundamentos/ROADMAP_PLANES_MAESTROS.md`. En resumen:

1. Cerrar el plan activo `Auth, Seguridad y Sesion Real` (email real, datos sociales, validacion manual).
2. Iniciar `Plan Maestro: UX/UI y Navegacion Global` para fijar sistema visual, tokens, navegacion y accesibilidad antes de construir mas modulos.

## Documentos Principales

### Fundamentos

| Documento | Descripcion |
| --- | --- |
| `00-fundamentos/RESUMEN_EJECUTIVO.md` | Estado vigente y reglas de direccion. |
| `00-fundamentos/VISION_ACTUAL.md` | Manifiesto de producto: Word, Classroom, Canva, Excel, WhatsApp y reportes. |
| `00-fundamentos/ARQUITECTURA.md` | Stack, MVVM, offline-first, backend y convenciones. |
| `00-fundamentos/MAPA_MODULOS_ACTUALES.md` | Inventario de modulos y experiencias madre. |
| `00-fundamentos/ROADMAP_PLANES_MAESTROS.md` | Orden, estado y proximo plan recomendado. |
| `00-fundamentos/FLUJO_SINCRONIZACION.md` | Sync offline-first y relacion AsyncStorage/MongoDB. |

### Planes Maestros

| Documento | Estado |
| --- | --- |
| `01-planes-maestros/meta_guia_planes.md` | Vigente; instructivo obligatorio para crear planes. |
| `01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | En ejecucion; Fases 0-6 completadas, 7-8 en cierre. |
| `01-planes-maestros/PLANES MAESTROS AUDITADOS.md` | Retrospectiva de Classroom y regla de ground truth por fase. |
| `01-planes-maestros/cerrados/` | Planes cerrados (Planeaciones, Classroom, Pasos Iniciales, Infraestructura, SQLite). Ver `cerrados/README.md`. |

### Operacion y Validacion

| Documento | Descripcion |
| --- | --- |
| `02-operacion/ENTORNO_LOCAL.md` | Levantar frontend/backend local y configurar env vars. |
| `02-operacion/GITHUB_PRODUCT_OS.md` | Ramas, Project, labels, milestones, issues y criterio de merge. |
| `02-operacion/GUIA_PRUEBAS.md` | Guia vigente de validacion tecnica/manual. |
| `02-operacion/DEPLOY_DEMO_HOSTEADA.md` | Despliegue de la demo web/APK hosteada. |
| `02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md` | Changelog de la sesion de sincronizacion offline. |
| `03-validacion/CHECKLIST_VALIDACION_MANUAL_FASE9.md` | Cierre manual de Planeaciones Fase 9. |
| `03-validacion/CHECKLIST_VALIDACION_MANUAL_AUTH.md` | Validacion manual del plan de Auth. |

### Referencia

| Documento | Descripcion |
| --- | --- |
| `04-referencia/MAPA_NAVEGACION_ACTUAL.md` | Navegacion vigente resumida. |
| `04-referencia/COMPONENTES_PRESERVADOS.md` | Componentes visuales a preservar como referencia. |
| `../context/README.md` | Protocolo para ground truth, capturas y referencias por modulo. |
| `../context/referencias-opensource/README.md` | Repos open source curados y referencias pendientes. |

## Reglas para Futuras IAs

- Leer `01-planes-maestros/meta_guia_planes.md` antes de crear cualquier plan.
- Leer `01-planes-maestros/PLANES MAESTROS AUDITADOS.md` como retrospectiva de lo que fallo en Classroom.
- Si el modulo busca paridad alta con Word, Classroom, Excel, Canva o WhatsApp, crear/citar ground truth por fase en `context/<modulo>-ground-truth/`.
- Consultar `context/referencias-opensource/README.md` y pedir URLs de repos si faltan referencias open source.
- No cerrar fases visuales de paridad alta solo por pasar TypeScript/lint/tests; exigir validacion manual contra capturas/referencias.
- No crear rutas/pantallas aisladas sin mapa de navegacion.
- No duplicar flujos entre Contenido, Classroom y pantallas legacy.
- Toda pantalla nueva parte de una pantalla madre responsiva/adaptativa mobile-first; excepcion `.web.tsx`/`.native.tsx` solo si el modulo lo justifica.
- Todo plan nuevo que toque datos academicos asume SQLite como infraestructura opt-in y evita lecturas directas a AsyncStorage; usar ports/repositories.
- Mantener tracking markdown `[ ]`, `[~]`, `[x]` en planes.
- Documentar costos y free tiers antes de proponer infraestructura o IA nueva.
- Preservar contexto importante antes de borrar o archivar documentos.

## Documentacion Archivada

`99-archivo/` contiene documentos legacy de noviembre 2025 y el README principal anterior. Se conservan por historia, pero no deben guiar implementaciones nuevas.

## Stack Vigente

- React Native 0.81.5 + Expo 54.
- TypeScript 5.9.
- React Navigation 7.
- Context + hooks ViewModel (MVVM).
- AsyncStorage default productivo; SQLite/Expo SQLite opt-in para datos relacionales academicos y sync queue.
- Backend Node serverless en `backend/api` (Vercel).
- MongoDB Atlas free tier.
- IA gateway multi-provider en backend.
- Jest + Testing Library.

**Ultima actualizacion:** 2026-06-12
**Version documental:** 4.2

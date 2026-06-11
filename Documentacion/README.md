# Documentacion PlanearIA v4.1

Esta carpeta contiene la documentacion tecnica, estrategica y operativa de PlanearIA.

PlanearIA esta evolucionando de app de planeaciones a plataforma integral para docentes. La regla vigente es cero friccion: experiencias familiares tipo Word/Docs, Classroom, Canva, Excel, WhatsApp docente y reportes.

## Lectura Rapida

Si eres una IA o agente nuevo, lee en este orden:

1. `00-fundamentos/RESUMEN_EJECUTIVO.md`
2. `00-fundamentos/VISION_ACTUAL.md`
3. `00-fundamentos/ARQUITECTURA.md`
4. `01-planes-maestros/meta_guia_planes.md`
5. `01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md` si vas a tocar storage local, offline-first o datos academicos relacionales
6. `02-operacion/ENTORNO_LOCAL.md`
7. `02-operacion/GUIA_PRUEBAS.md`

## Estructura

| Carpeta | Uso |
| --- | --- |
| `00-fundamentos/` | Vision vigente, arquitectura, resumen ejecutivo, roadmap de planes y mapa de modulos. |
| `01-planes-maestros/` | Planes ejecutables y meta guia obligatoria. |
| `02-operacion/` | GitHub Product OS, entorno local y pruebas vigentes. |
| `03-validacion/` | Checklists manuales de cierre. |
| `04-referencia/` | Mapas actuales y componentes preservados. |
| `05-analisis-ia/` | Opiniones/revisiones de IA conservadas como contexto, no como fuente unica. |
| `99-archivo/` | Documentacion legacy 2025 archivada; no usar para implementar. |

## Estado Actual

- Planeaciones: cerrado como experiencia Word/Docs. Fase 9 aprobada.
- Pasos Iniciales: cerrado como organizacion de GitHub, CI inicial y entorno.
- Classroom: cerrado. Fases 0 a 10, validacion final e issue #8 completados.
- Infraestructura Local/CI/Deploy Basico: cerrado; Fases 0 a 7 completadas.
- Storage Local SQLite y Migracion Offline: cerrado para entrega academica; SQLite quedo como infraestructura opt-in con rollback, AsyncStorage sigue default.
- UX/UI Global: pendiente, se hara cuando existan mas flujos funcionales.
- Auth/Seguridad y Sesion Real: plan creado; pendiente de ejecucion.
- Excel/Canva/WhatsApp/Reportes: pendientes de planes futuros.

## Documentos Principales

### Fundamentos

| Documento | Descripcion |
| --- | --- |
| `00-fundamentos/RESUMEN_EJECUTIVO.md` | Estado vigente y reglas de direccion. |
| `00-fundamentos/VISION_ACTUAL.md` | Manifiesto de producto: Word, Classroom, Canva, Excel, WhatsApp y reportes. |
| `00-fundamentos/ARQUITECTURA.md` | Stack, MVVM, offline-first, backend y convenciones. |
| `00-fundamentos/MAPA_MODULOS_ACTUALES.md` | Inventario de modulos y experiencias madre. |
| `00-fundamentos/ROADMAP_PLANES_MAESTROS.md` | Orden y estado de planes maestros. |
| `00-fundamentos/FLUJO_SINCRONIZACION.md` | Sync offline-first y relacion AsyncStorage/MongoDB. |

### Planes Maestros

| Documento | Estado |
| --- | --- |
| `01-planes-maestros/meta_guia_planes.md` | Vigente; instructivo obligatorio para crear planes. |
| `01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | Creado; pendiente de ejecucion. |
| `01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md` | Cerrado; Fases 0 a 7 completadas. |
| `01-planes-maestros/PLAN_STORAGE_LOCAL_SQLITE_MIGRACION_OFFLINE.md` | Cerrado para entrega academica; SQLite opt-in con rollback. |
| `01-planes-maestros/PLAN_CLASSROOM.md` | Cerrado; #8 completado. |
| `01-planes-maestros/PLAN_PASOS_INICIALES.md` | Cerrado. |
| `01-planes-maestros/plan_planeaciones.md` | Cerrado; referencia de calidad. |
| `01-planes-maestros/PLANEACIONES_IA_EDITOR_FASE9.md` | Soporte de cierre IA/editor de Planeaciones. |
| `01-planes-maestros/PLANES MAESTROS AUDITADOS.md` | Auditoria de Classroom y regla de ground truth por fase para futuros planes. |

### Operacion y Validacion

| Documento | Descripcion |
| --- | --- |
| `02-operacion/GITHUB_PRODUCT_OS.md` | Ramas, Project, labels, milestones, issues y criterio de merge. |
| `02-operacion/ENTORNO_LOCAL.md` | Levantar frontend/backend local y configurar env vars. |
| `02-operacion/GUIA_PRUEBAS.md` | Guia vigente de validacion tecnica/manual. |
| `03-validacion/CHECKLIST_VALIDACION_MANUAL_FASE9.md` | Cierre manual de Planeaciones Fase 9. |

### Referencia

| Documento | Descripcion |
| --- | --- |
| `04-referencia/MAPA_NAVEGACION_ACTUAL.md` | Navegacion vigente resumida. |
| `04-referencia/COMPONENTES_PRESERVADOS.md` | Componentes visuales a preservar como referencia. |
| `../context/README.md` | Protocolo para ground truth, capturas y referencias por modulo. |
| `../context/referencias-opensource/README.md` | Repos open source curados y referencias pendientes. |

## Documentacion Archivada

`99-archivo/` contiene documentos legacy de noviembre 2025. Se conservan por historia, pero no deben guiar implementaciones nuevas.

Archivados principales:

- `RESUMEN_LEGACY_2025.md`
- `DIAGRAMA_NAVEGACION_LEGACY_2025.md`
- `MAPA_NAVEGACION_LEGACY_2025.md`
- `GUIA_PRUEBAS_LEGACY_2025.md`

## Reglas para Futuras IAs

- Leer `01-planes-maestros/meta_guia_planes.md` antes de crear cualquier plan.
- Leer `01-planes-maestros/PLANES MAESTROS AUDITADOS.md` como retrospectiva de lo que fallo en Classroom.
- Si el modulo busca paridad alta con Word, Classroom, Excel, Canva o WhatsApp, crear/citar ground truth por fase en `context/<modulo>-ground-truth/`.
- Consultar `context/referencias-opensource/README.md` y pedir URLs de repos si faltan referencias open source para el modulo.
- No cerrar fases visuales de paridad alta solo por pasar TypeScript/lint/tests; exigir validacion manual contra capturas/referencias.
- No crear rutas/pantallas aisladas sin mapa de navegacion.
- No duplicar flujos entre Contenido, Classroom y pantallas legacy.
- Todo plan nuevo que toque datos academicos debe asumir SQLite como infraestructura disponible opt-in y evitar nuevas lecturas directas a AsyncStorage; usar ports/repositories.
- Mantener tracking markdown `[ ]`, `[~]`, `[x]` en planes.
- Crear issues de GitHub solo para epicas/fases activas, no para todo el backlog futuro.
- Cada fase ejecutable debe registrar su bloque `GitHub/CI - Fase X` con issue/Project item, milestone, labels, scripts y estado del tablero.
- Documentar costos y free tiers antes de proponer infraestructura o IA nueva.
- Preservar contexto importante antes de borrar o archivar documentos.

## Stack Vigente

- React Native 0.81.5 + Expo 54.
- TypeScript 5.9.
- React Navigation 7.
- Context + hooks ViewModel.
- AsyncStorage sigue como default productivo; SQLite/Expo SQLite ya existe como infraestructura opt-in para datos relacionales academicos y sync queue.
- Backend Node en `backend/api`.
- MongoDB Atlas/free tier.
- IA gateway multi-provider en backend.
- Jest + Testing Library.

**Ultima actualizacion:** Junio 2026
**Version documental:** 4.1

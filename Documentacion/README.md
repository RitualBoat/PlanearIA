# Documentacion PlanearIA

Esta carpeta contiene la documentacion vigente, operativa e historica del proyecto. Su proposito es que una IA, Claude, Codex o un colaborador humano pueda entender rapidamente que es PlanearIA, que ya existe, que esta cerrado, que sigue activo y hacia donde va el producto.

## Lectura Rapida Para Claude

Leer en este orden antes de auditar o proponer planes:

1. `00-fundamentos/RESUMEN_EJECUTIVO.md`
2. `00-fundamentos/VISION_ACTUAL.md`
3. `00-fundamentos/ARQUITECTURA.md`
4. `00-fundamentos/IA_CHATBOT_LLM.md`
5. `00-fundamentos/FLUJO_SINCRONIZACION.md`
6. `00-fundamentos/MAPA_MODULOS_ACTUALES.md`
7. `00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
8. `00-fundamentos/IHC_DISCOVERY_DOCENTE.md`
9. `01-planes-maestros/meta_guia_planes.md` (v3: planes = Blueprint + backlog de changes OpenSpec)
10. `01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (plan activo de UX/UI)

Si hay contradiccion entre documentos, gana este orden:

1. Codigo real.
2. `00-fundamentos/`.
3. Plan maestro activo.
4. Documentos operativos.
5. Planes cerrados e historicos.
6. Analisis de IA archivados o no ejecutables.

## Vision Vigente

PlanearIA esta evolucionando hacia una suite docente offline-first. La regla central es cero friccion: el profesor debe poder hacer su trabajo completo sin cambiar entre Word, Excel, ChatGPT/Gemini, Classroom, Canva, WhatsApp, calendarios, carpetas y archivos sueltos.

Experiencias objetivo:

- Inicio / Sistema Operativo Docente.
- Asistente IA / ChatGPT Docente: chat propio con adjuntos, documentos, recursos, clases, correcciones IA y acciones confirmables.
- Office Docente (Word + Excel): documentos, planeaciones, hojas, listas, rubricas, asistencia, calificaciones e import/export.
- Classroom / Clases.
- Canva / Genially Docente.
- WhatsApp Docente / Comunidad Profesional.
- Calendario.
- Reportes, analitica y gamificacion.
- Cuenta, seguridad, preferencias y accesibilidad.

## Mapa Del Repositorio

| Ruta | Contenido |
| --- | --- |
| `App.tsx`, `src/` | Frontend React Native/Expo: pantallas, hooks ViewModel, context, services, sync, navegacion, temas y tests. |
| `backend/` | Backend Node serverless para Vercel: router unico, rutas, auth, MongoDB e IA gateway. |
| `types/` | Tipos TypeScript compartidos por dominios. |
| `Documentacion/` | Fundamentos, planes, operacion, validacion, referencia, analisis IA y archivo historico. |
| `context/` | Ground truth, referencias open source, evidencias y material por modulo/experiencia. |
| `.github/workflows/` | CI y CD. |

## Estructura De La Documentacion

| Carpeta | Uso |
| --- | --- |
| `00-fundamentos/` | Fuente de verdad vigente: vision, arquitectura, sync, mapa de modulos y roadmap. |
| `01-planes-maestros/` | Meta guia obligatoria, plan activo y planes cerrados. |
| `02-operacion/` | Entorno local, pruebas, deploy, GitHub Product OS y changelogs. |
| `03-validacion/` | Checklists manuales de cierre. |
| `04-referencia/` | Referencias vivas: navegacion actual y componentes preservados. |
| `05-analisis-ia/` | Opiniones de IA conservadas como contexto historico/no ejecutable. |
| `06-diagramas/` | Diagramas Mermaid de arquitectura, app, CI/CD y sync. |
| `99-archivo/` | Documentacion legacy o borradores antiguos. No usar para implementar. |

## Estado Actual

- Planeaciones: cerrado como base funcional tipo documento; en la vision nueva pasa a ser parte de Office Docente.
- Classroom: cerrado como base funcional para clases, grupos, unidades, materiales, actividades, alumnos, entregas, asistencia y calificaciones.
- Infraestructura local/CI/deploy basico: cerrado.
- Storage SQLite/migracion offline: cerrado como infraestructura opt-in; AsyncStorage sigue siendo default.
- Sync offline-first: motor global por entidad en `src/sync`, con `SyncContext`, `SyncStatusBanner`, push/pull, JWT y `userId`.
- Auth/Seguridad/Sesion Real: plan activo/en cierre; ya existen JWT, refresh tokens, SecureStore nativo, AsyncStorage web, sesiones y roles base. Pendientes principales: email real, datos sociales completos, validacion manual y sincronizacion final de GitHub Product OS.
- Demo/CD: GitHub Actions construye solo el APK Android standalone cuando cambian rutas reales de app/backend/build; despliegue web/backend se maneja por Vercel con `ignoreCommand`.
- Metodologia de trabajo: SDD con OpenSpec. Los planes maestros son Blueprint + backlog de changes; las
  tareas tecnicas viven en el `tasks.md` de cada change y las specs archivadas en `openspec/specs/` son
  la verdad de comportamiento. Ver `01-planes-maestros/meta_guia_planes.md` (v3) y la seccion OpenSpec de `CLAUDE.md`.
- UX/UI Global: plan ACTIVO (`01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`). Define la suite
  (Escritorio, NotasPLAN/CalcuPLAN/PresentaPLAN, Clases, AsistePLAN, DiseñaPLAN, ConectaPLAN, AgendaPLAN,
  ReportaPLAN), la navegacion adaptativa y el backlog de changes por olas.

## Proximo Paso Recomendado

1. Cerrar formalmente `PLAN_AUTH_SEGURIDAD_SESION_REAL.md` con validacion manual, email real o decision explicita de diferirlo, y tracking GitHub actualizado.
2. Ejecutar la Ola 0 del `PLAN_UXUI_NAVEGACION_GLOBAL.md` con el ciclo SDD (`/opsx:propose` del change
   `theming-runtime` es el piloto natural del flujo OpenSpec).
3. Aplicar las entrevistas IHC (`00-fundamentos/IHC_DISCOVERY_DOCENTE.md`, seccion 5) cuando exista el
   prototipo de Escritorio + Crear (Ola 2).

## Documentos Principales

| Documento | Descripcion |
| --- | --- |
| `00-fundamentos/RESUMEN_EJECUTIVO.md` | Estado vigente y reglas de direccion. |
| `00-fundamentos/VISION_ACTUAL.md` | Vision de producto: una suite docente conectada. |
| `00-fundamentos/ARQUITECTURA.md` | Stack, MVVM, backend, storage, sync y reglas tecnicas. |
| `00-fundamentos/IA_CHATBOT_LLM.md` | Vision y reglas para Asistente IA tipo ChatGPT/Gemini, adjuntos, solicitudes en segundo plano, AI Gateway y LM Studio. |
| `00-fundamentos/MAPA_MODULOS_ACTUALES.md` | Inventario de carpetas actuales mapeadas a experiencias objetivo. |
| `00-fundamentos/ROADMAP_PLANES_MAESTROS.md` | Orden recomendado de planes. |
| `00-fundamentos/FLUJO_SINCRONIZACION.md` | Motor offline-first vigente. |
| `00-fundamentos/IHC_DISCOVERY_DOCENTE.md` | Proto-personas, recorridos, guion de entrevistas y checklist Nielsen. |
| `01-planes-maestros/meta_guia_planes.md` | Instructivo obligatorio v3: planes SDD con OpenSpec. |
| `01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` | Plan activo: blueprint y backlog de changes UX/UI. |
| `01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | Plan activo/en cierre. |
| `02-operacion/ENTORNO_LOCAL.md` | Como levantar app/backend. |
| `02-operacion/GUIA_PRUEBAS.md` | Validaciones tecnicas/manuales. |
| `02-operacion/DEPLOY_DEMO_HOSTEADA.md` | Guia para web/backend en Vercel y CD del APK Android. |

## Reglas Para Futuras IAs

- Leer `meta_guia_planes.md` antes de escribir un plan maestro.
- Leer `VISION_ACTUAL.md` antes de proponer UX/UI.
- Usar `src/sync` para cualquier dato academico sincronizable.
- Mantener MVVM: pantallas delgadas, hooks ViewModel, Context/Services para estado e I/O.
- Todo dato multiusuario debe aislarse por `userId`.
- IA solo via backend y con fallback/costo controlado.
- Asistente IA y proveedores locales/cloud siempre via AI Gateway; nunca directo desde frontend.
- Las correcciones IA no deben sobrescribir originales; deben entregarse como copia, borrador, resumen o comparacion revisable.
- No copiar codigo open source sin revisar licencia, stack y compatibilidad.
- Ground truth obligatorio para experiencias de paridad alta: Office, Classroom, Canva/Genially y WhatsApp.
- No cerrar UX/UI de alta paridad solo con tests automaticos; pedir validacion manual.
- Los planes cerrados son evidencia funcional, no candados visuales.
- Los documentos en `99-archivo/` y borradores antiguos no son fuente vigente.

## Version

- Ultima actualizacion: 2026-07-04.
- Version documental: 5.0 (adopcion SDD/OpenSpec, plan UX/UI activo, IHC discovery, nombres de suite).

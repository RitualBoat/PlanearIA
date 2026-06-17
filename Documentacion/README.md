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
8. `01-planes-maestros/meta_guia_planes.md`
9. `prompt_mejorado.md`

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
- Asistente IA / ChatGPT Docente: chat propio con adjuntos, documentos, recursos, clases y acciones confirmables.
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
- Demo/CD: web bundle y APK standalone se construyen en GitHub Actions; despliegue web/backend se maneja por Vercel.
- UX/UI Global: siguiente plan recomendado para fijar navegacion, sistema visual, accesibilidad y blueprint de experiencias conectadas.

## Proximo Plan Recomendado

1. Cerrar formalmente `PLAN_AUTH_SEGURIDAD_SESION_REAL.md` con validacion manual, email real o decision explicita de diferirlo, y tracking GitHub actualizado.
2. Iniciar `Plan Maestro: UX/UI y Navegacion Global`.
3. Dentro de ese plan, decidir la arquitectura de experiencias: Asistente IA, Office Docente, Classroom, Canva, WhatsApp, Calendario, Reportes y Cuenta/Accesibilidad.
4. Solo despues crear subplanes de implementacion por experiencia o subexperiencia.

## Documentos Principales

| Documento | Descripcion |
| --- | --- |
| `00-fundamentos/RESUMEN_EJECUTIVO.md` | Estado vigente y reglas de direccion. |
| `00-fundamentos/VISION_ACTUAL.md` | Vision de producto: una suite docente conectada. |
| `00-fundamentos/ARQUITECTURA.md` | Stack, MVVM, backend, storage, sync y reglas tecnicas. |
| `00-fundamentos/IA_CHATBOT_LLM.md` | Vision y reglas para Asistente IA tipo ChatGPT/Gemini, adjuntos, AI Gateway y LM Studio. |
| `00-fundamentos/MAPA_MODULOS_ACTUALES.md` | Inventario de carpetas actuales mapeadas a experiencias objetivo. |
| `00-fundamentos/ROADMAP_PLANES_MAESTROS.md` | Orden recomendado de planes. |
| `00-fundamentos/FLUJO_SINCRONIZACION.md` | Motor offline-first vigente. |
| `01-planes-maestros/meta_guia_planes.md` | Instructivo obligatorio para crear o ejecutar planes. |
| `01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md` | Plan activo/en cierre. |
| `02-operacion/ENTORNO_LOCAL.md` | Como levantar app/backend. |
| `02-operacion/GUIA_PRUEBAS.md` | Validaciones tecnicas/manuales. |
| `02-operacion/DEPLOY_DEMO_HOSTEADA.md` | Guia para Vercel, web y APK. |
| `prompt_mejorado.md` | Prompt listo para pedir a Claude la auditoria UX/UI global. |

## Reglas Para Futuras IAs

- Leer `meta_guia_planes.md` antes de escribir un plan maestro.
- Leer `VISION_ACTUAL.md` antes de proponer UX/UI.
- Usar `src/sync` para cualquier dato academico sincronizable.
- Mantener MVVM: pantallas delgadas, hooks ViewModel, Context/Services para estado e I/O.
- Todo dato multiusuario debe aislarse por `userId`.
- IA solo via backend y con fallback/costo controlado.
- Asistente IA y proveedores locales/cloud siempre via AI Gateway; nunca directo desde frontend.
- No copiar codigo open source sin revisar licencia, stack y compatibilidad.
- Ground truth obligatorio para experiencias de paridad alta: Office, Classroom, Canva/Genially y WhatsApp.
- No cerrar UX/UI de alta paridad solo con tests automaticos; pedir validacion manual.
- Los planes cerrados son evidencia funcional, no candados visuales.
- Los documentos en `99-archivo/` y borradores antiguos no son fuente vigente.

## Version

- Ultima actualizacion: 2026-06-17.
- Version documental: 4.4.

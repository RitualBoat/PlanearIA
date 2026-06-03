# Documentacion PlanearIA v4.0

Esta carpeta contiene la documentacion tecnica y estrategica de PlanearIA.

PlanearIA esta evolucionando de una app de planeaciones a una plataforma integral para docentes. La documentacion debe explicar no solo que se va a hacer, sino tambien que existe hoy, como se conecta cada modulo y que reglas deben seguir futuras refactorizaciones.

---

## Documentos Vigentes

### Vision, Arquitectura y Planes

| Documento | Descripcion |
| --------- | ----------- |
| [VISION_ACTUAL.md](./VISION_ACTUAL.md) | Manifiesto vigente de cero friccion: experiencias Word, Classroom, Canva, Excel, WhatsApp y reportes. |
| [PLAN_PASOS_INICIALES.md](./PLAN_PASOS_INICIALES.md) | Plan rector activo para organizacion del proyecto, GitHub/GitHub Projects, entorno local, CI y secuencia de futuros planes maestros. |
| [PLAN_CLASSROOM.md](./PLAN_CLASSROOM.md) | Plan maestro listo para ejecutar: fusionar grupos, alumnos, materiales, actividades, entregables, asistencia, calificaciones y reportes operativos en una experiencia tipo Classroom. |
| [GITHUB_PRODUCT_OS.md](./GITHUB_PRODUCT_OS.md) | Guia operativa de ramas, Project, labels, milestones, templates y criterio de merge. |
| [ENTORNO_LOCAL.md](./ENTORNO_LOCAL.md) | Guia de desarrollo local para frontend/backend, IP LAN en celular fisico, env vars e IA local temporal. |
| [MAPA_MODULOS_ACTUALES.md](./MAPA_MODULOS_ACTUALES.md) | Fotografia inicial de pantallas, tabs, rutas y experiencias madre para preparar Classroom. |
| [meta_guia_planes.md](./meta_guia_planes.md) | Guia maestra para crear futuros planes de refactorizacion o construccion de modulos. Define estructura, tracking, reglas de IA, offline-first, bajo costo, navegacion y UX/UI global. |
| [INFRAESTRUCTURA_SUGERIDA.md](./INFRAESTRUCTURA_SUGERIDA.md) | Estrategia de infraestructura realista para un estudiante: monolito modular, desarrollo local, bajo costo y despliegue gradual. |
| [OPINION_DE_IA_TRAS_LEER_META_GUIA_PLANEACIONES.md](./OPINION_DE_IA_TRAS_LEER_META_GUIA_PLANEACIONES.md) | Analisis estrategico posterior a la meta guia y nueva vision del producto. |
| [REVISION-GPT-TRAS-LEER-ARCHIVOS-DOCUMENTACION.md](./REVISION-GPT-TRAS-LEER-ARCHIVOS-DOCUMENTACION.md) | Revision adicional de documentacion fundacional y alineacion estrategica. |
| [PLANEACIONES_IA_EDITOR_FASE9.md](./PLANEACIONES_IA_EDITOR_FASE9.md) | Auditoria real de IA en Planeaciones y criterio de aceptacion del editor tipo Word/Docs para cierre de Fase 9. |
| [CHECKLIST_VALIDACION_MANUAL_FASE9.md](./CHECKLIST_VALIDACION_MANUAL_FASE9.md) | Checklist manual E2E para cerrar formalmente la Fase 9 del modulo de Planeaciones. |
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Arquitectura del sistema, stack tecnologico, capas MVVM y decisiones tecnicas. |
| [FLUJO_SINCRONIZACION.md](./FLUJO_SINCRONIZACION.md) | Flujo de datos offline-first y sincronizacion con MongoDB Atlas. |
| [DIAGRAMA_NAVEGACION.md](./DIAGRAMA_NAVEGACION.md) | Diagrama visual del flujo de navegacion. |
| [MAPA_NAVEGACION.md](./MAPA_NAVEGACION.md) | Mapa de rutas y relaciones entre modulos. |
| [RESUMEN.md](./RESUMEN.md) | Resumen general del proyecto. |

### Testing

| Documento | Descripcion |
| --------- | ----------- |
| [GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md) | Guia de testing funcional e integracion. |

---

## Estado General de la App

PlanearIA ya cuenta con una base funcional y varios modulos implementados o parcialmente implementados. La vision vigente reorganiza esos modulos en experiencias docentes familiares: Planeaciones como Word/Docs, Grupos/Recursos como Classroom, Diseno Didactico como Canva, Listas como Excel, Mensajeria como WhatsApp profesional y Reportes como hub separado.

- Auth: login, registro y recuperacion de contrasena.
- Navegacion: tabs principales y stack navigator.
- Planeaciones: modelo V2, contexto, editor tipo Word/Docs, escaner, exportacion, copiloto IA y Fase 9 cerrada como primera gran refactorizacion.
- Contenido: hub transversal para planeaciones, recursos, entregables y plantillas.
- Recursos didacticos: biblioteca, lista y creacion de recursos.
- Recursos evaluables: tareas, entregables, calificacion y asignacion de recursos desde grupos.
- Grupos: dashboard, lista, detalle, reportes, importacion, exportacion y tareas.
- Alumnos: CRUD, detalle, notas, importacion, exportacion y reportes.
- Asistencia: registro e historial.
- Calificaciones: captura y promedios.
- Plantillas: biblioteca, lista, detalle y editor.
- Feed/red social: posts, detalle, retos, preguntas y resultados.
- Social/contactos: buscador de perfiles, contactos e invitaciones.
- Chat: lista de conversaciones y pantalla de conversacion.
- Notificaciones: contexto, pantalla y servicio push.
- Cuenta/perfil/accesibilidad: perfil, roles, terminos, tema, fuente y daltonismo.
- Onboarding y ayuda.
- Infraestructura: backend serverless, MongoDB Atlas, AsyncStorage y sync local/remoto.

La app no esta en produccion y no tiene usuarios reales, por lo que los planes pueden proponer cambios fuertes si reducen legacy y mejoran la experiencia.

---

## Planes Activos y Cerrados

El plan rector inicial actual es:

**[PLAN_PASOS_INICIALES.md](./PLAN_PASOS_INICIALES.md)**

El siguiente plan maestro listo para ejecucion es:

**[PLAN_CLASSROOM.md](./PLAN_CLASSROOM.md)**

El plan cerrado de Planeaciones queda como referencia de calidad:

**[plan_planeaciones.md](./plan_planeaciones.md)**

Estado actual:

- Fase 0 completada: limpieza legacy.
- Fase 1 completada: tipos V2 y migracion base.
- Fase 2 completada: capa de datos y sync con `PlaneacionesContext`.
- Fase 3 completada: editor base con Tentap/toolbars/modo responsive.
- Fase 4 completada: DocEditor, secciones modulares y wizard/lista V2.
- Fase 5 completada: escaner de plantillas PDF/DOCX y flujo desde plantilla V2.
- Fase 6 completada: endpoint copiloto, servicio/hook y AIToolbar integrada.
- Fase 7 completada: exportacion PDF/DOCX V2, navegacion DocEditor/EscanerPlantilla y Mi Contenido conectado.
- Fase 8 completada: limpieza y validaciones tecnicas.
- Fase 9 completada/cerrada el 2026-05-30: auditoria y correccion funcional del flujo real, editor tipo Word/Docs, web/movil, IA, plantillas default y navegacion sin legacy.
- Nueva prioridad: cerrar `PLAN_PASOS_INICIALES.md` con CI remoto y ejecutar despues `PLAN_CLASSROOM.md` cuando el usuario confirme el inicio del siguiente ciclo.

---

## Modulos que Deben Considerarse en Planes Futuros

La `meta_guia_planes.md` registra el estado y directrices para estos modulos:

1. Planeaciones.
2. Contenido / Hub de Recursos.
3. Recursos Didacticos / Biblioteca.
4. Recursos Evaluables / Tareas / Entregables.
5. Grupos.
6. Alumnos.
7. Asistencia.
8. Calificaciones.
9. Plantillas.
10. Feed / Red Social Educativa.
11. Social / Contactos.
12. Chat / Mensajeria.
13. Notificaciones.
14. Cuenta, Perfil, Configuracion y Accesibilidad.
15. Auth / Seguridad.
16. Onboarding y Ayuda.
17. Infraestructura, Sync y Backend.
18. UX/UI y Navegacion Global.

---

## Reglas para Futuros Planes

Toda IA o persona que cree un nuevo plan debe leer primero:

- [README.md](../README.md).
- [Documentacion/README.md](./README.md).
- [ARQUITECTURA.md](./ARQUITECTURA.md).
- [FLUJO_SINCRONIZACION.md](./FLUJO_SINCRONIZACION.md).
- [meta_guia_planes.md](./meta_guia_planes.md).
- [plan_planeaciones.md](./plan_planeaciones.md) como ejemplo de calidad.
- [PLAN_PASOS_INICIALES.md](./PLAN_PASOS_INICIALES.md) como plan rector actual.

Cada plan debe incluir:

- Analisis del estado real del codigo.
- Inventario de archivos afectados.
- Modelo de datos objetivo.
- Arquitectura MVVM y offline-first.
- Limpieza de legacy.
- UX/UI objetivo y mapa de navegacion.
- Reglas de IA, prompts, API keys, fallbacks y costos.
- Consideraciones de bajo presupuesto.
- Fases numeradas con tracking `[ ]`, `[~]`, `[x]`.
- Validacion tecnica, manual y de navegacion.

---

## Consideraciones Especiales

### Bajo costo

El proyecto lo construye un estudiante trabajando solo. Antes de proponer infraestructura, IA, hosting, email, storage, push o monitoreo, se deben evaluar costos, free tiers y alternativas simples.

### Vision de cero friccion

La vision vigente esta en `VISION_ACTUAL.md`: PlanearIA debe sentirse como Word/Docs para planeaciones, Classroom para grupos/recursos, Canva para diseno didactico, Excel para listas y WhatsApp profesional para comunicacion docente. Los planes futuros deben fusionar modulos en esas experiencias madre y evitar pantallas aisladas.

### Navegacion y UX/UI global

Cada modulo debe quedar accesible desde rutas claras. Ningun plan debe crear pantallas aisladas, flujos duplicados o botones sin destino. Si la navegacion global empieza a romperse, debe crearse un plan dedicado: `Plan Maestro: UX/UI y Navegacion Global - PlanearIA`.

El plan global de UX/UI debe usar las 10 heuristicas de Jakob Nielsen, clasificar hallazgos con severidad `0` a `4` y priorizar cero friccion, carga cognitiva baja, accesibilidad, consistencia visual y tokens centralizados en `ThemeContext` o equivalente.

### Seguridad pragmatica y low-cost

El plan de Auth/Seguridad debe asumir presupuesto cero o bajo costo. Debe contemplar RBAC con roles `Dev/Desarrollador`, `Admin`, `Docente` y `Alumno`; validacion real en backend/APIs/queries; rate limiting en endpoints criticos; `bcrypt`, JWT, secretos en variables de entorno, CORS/cabeceras seguras y compatibilidad con local/free tiers como Render, Vercel, EAS y MongoDB Atlas M0.

### Offline-first

AsyncStorage es la fuente local inmediata; MongoDB Atlas es persistencia remota. Cada modulo debe definir claves locales, sync, conflictos, borradores, reintentos y estados offline.

### IA

La IA debe tener uso pedagogico claro, fallback si no hay API key, validacion humana y documentacion de costos. Para Planeaciones ya existe un gateway multi-provider en backend (`backend/lib/aiGateway.js`) con limite por accion (`AI_MAX_REQUESTS_PER_ACTION`, default 10); futuros modulos deben reutilizarlo o justificar por que necesitan otro flujo. El modo dev puede ampliar el limite con `AI_DEV_MODE=true`, pero debe mostrar advertencia y nunca sustituir los limites de invitados/usuarios registrados.

---

## Stack Tecnologico

- React Native 0.81.5 + Expo 54.
- TypeScript 5.9.2.
- React Navigation 7.x.
- AsyncStorage.
- MongoDB Atlas M0.
- Vercel serverless.
- Monolito modular y desarrollo local primero.
- JWT auth con `userId` isolation.
- Jest + Testing Library.
- Tentap/TipTap/WebView para editor enriquecido.

---

**Ultima actualizacion:** Mayo 2026

**Version:** 4.0

**Branch:** development

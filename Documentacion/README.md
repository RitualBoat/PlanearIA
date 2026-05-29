# Documentacion PlanearIA v4.0

Esta carpeta contiene la documentacion tecnica y estrategica de PlanearIA.

PlanearIA esta evolucionando de una app de planeaciones a una plataforma integral para docentes. La documentacion debe explicar no solo que se va a hacer, sino tambien que existe hoy, como se conecta cada modulo y que reglas deben seguir futuras refactorizaciones.

---

## Documentos Vigentes

### Vision, Arquitectura y Planes

| Documento | Descripcion |
| --------- | ----------- |
| [meta_guia_planes.md](./meta_guia_planes.md) | Guia maestra para crear futuros planes de refactorizacion o construccion de modulos. Define estructura, tracking, reglas de IA, offline-first, bajo costo, navegacion y UX/UI global. |
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

PlanearIA ya cuenta con una base funcional y varios modulos implementados o parcialmente implementados:

- Auth: login, registro y recuperacion de contrasena.
- Navegacion: tabs principales y stack navigator.
- Planeaciones: modelo V2, contexto, editor, escaner, exportacion y copiloto IA en refactorizacion activa.
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

## Plan de Refactorizacion Activo

El plan activo del modulo de Planeaciones esta en la raiz del proyecto:

**[plan_planeaciones.md](../plan_planeaciones.md)**

Estado actual:

- Fase 0 completada: limpieza legacy.
- Fase 1 completada: tipos V2 y migracion base.
- Fase 2 completada: capa de datos y sync con `PlaneacionesContext`.
- Fase 3 completada: editor base con Tentap/toolbars/modo responsive.
- Fase 4 completada: DocEditor, secciones modulares y wizard/lista V2.
- Fase 5 completada: escaner de plantillas PDF/DOCX y flujo desde plantilla V2.
- Fase 6 completada: endpoint copiloto, servicio/hook y AIToolbar integrada.
- Fase 7 completada: exportacion PDF/DOCX V2, navegacion DocEditor/EscanerPlantilla y Mi Contenido conectado.
- Fase 8 mayormente completada: limpieza y validaciones tecnicas.
- Fase 9 pendiente/en preparacion: auditoria y correccion funcional del flujo real, editor tipo Word/Docs, web/movil, IA, plantillas default y navegacion sin legacy.

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
- [plan_planeaciones.md](../plan_planeaciones.md) como ejemplo de calidad.

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

### Navegacion y UX/UI global

Cada modulo debe quedar accesible desde rutas claras. Ningun plan debe crear pantallas aisladas, flujos duplicados o botones sin destino. Si la navegacion global empieza a romperse, debe crearse un plan dedicado: `Plan Maestro: UX/UI y Navegacion Global - PlanearIA`.

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
- JWT auth con `userId` isolation.
- Jest + Testing Library.
- Tentap/TipTap/WebView para editor enriquecido.

---

**Ultima actualizacion:** Mayo 2026

**Version:** 4.0

**Branch:** development

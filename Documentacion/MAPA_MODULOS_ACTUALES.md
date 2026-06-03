# Mapa de Modulos Actuales - PlanearIA

> Estado: fotografia inicial para preparar el Plan Maestro Classroom y la poda de legacy.

## Tabs principales actuales

- `FeedTab` -> `FeedScreen`.
- `ContenidoTab` -> `ContenidoScreen`.
- `GruposTab` -> `GruposDashboardScreen`.
- `SocialTab` -> `SocialScreen`.
- `ConfiguracionTab` -> `CuentaScreen`.

## Experiencias madre objetivo

| Experiencia madre | Modulos actuales relacionados | Decision inicial |
| --- | --- | --- |
| Word/Docs | `planeaciones`, `plantillas` | Planeaciones queda cerrada Fase 9; plantillas se retomara en Canva/UX. |
| Classroom | `grupos`, `alumnos`, `tareas`, `biblioteca`, `asistencia`, `calificaciones`, `contenido` | Siguiente plan maestro. Fusionar flujos academicos en una experiencia central. |
| Canva/Genially | `biblioteca`, `plantillas`, recursos visuales futuros | Congelar hasta tener Classroom base, salvo demo visual. |
| Excel | `alumnos`, `asistencia`, `calificaciones`, import/export | Plan posterior a Classroom base. |
| WhatsApp docente | `chat`, `social`, `feed`, `notificaciones` | Reorientar red social pesada hacia comunicacion directa. |
| Reportes | `reportes grupo`, `reportes alumno`, calificaciones, asistencia | Dejar al final; depende de datos reales. |
| Cuenta/Auth | `auth`, `cuenta`, `perfil`, `onboarding`, `ayuda` | Endurecer antes de beta real. |

## Inventario por carpeta

| Carpeta | Pantallas principales | Clasificacion inicial |
| --- | --- | --- |
| `planeaciones` | Crear, DocEditor, Escaner, Importar, Exportar, Lista | Mantener como modulo referencia Word/Docs. |
| `contenido` | Hub de contenido | Mantener como entrada transversal; revisar en UX global. |
| `grupos` | Dashboard, lista, crear, detalle, importar, reportes, tareas | Fusionar en Classroom. |
| `alumnos` | Lista, crear, detalle, notas, importar/exportar, reportes | Fusionar en Classroom/Excel. |
| `tareas` y `grupos/tareas` | Entregables, crear/asignar/detalle/calificar | Fusionar en Classroom. |
| `biblioteca` | Recursos didacticos, lista, crear | Fusionar en Classroom y despues Canva. |
| `asistencia` | Registrar, historial | Fusionar en Classroom/Excel. |
| `calificaciones` | Capturar, promedios | Fusionar en Classroom/Excel. |
| `plantillas` | Biblioteca, lista, detalle, editor | Congelar hasta plan Canva/Plantillas. |
| `feed` | Feed, post, retos, preguntas | Congelar/reorientar hacia colaboracion docente. |
| `social` | Social, buscador perfiles | Base para WhatsApp docente/contactos. |
| `chat` | Chat, conversacion | Base para WhatsApp docente. |
| `notificaciones` | Notificaciones | Mantener transversal. |
| `cuenta` y `perfil` | Cuenta, editar perfil, admin roles, terminos, perfil | Mantener; endurecer en Auth/Seguridad. |
| `auth` | Login, registro, recuperar contrasena | Endurecer antes de beta real. |
| `onboarding` y `ayuda` | Onboarding, ayuda | Actualizar cuando cambien flujos principales. |

## Decision record inicial

- Primero se planifica Classroom porque concentra mayor valor diario y conecta grupos, alumnos, recursos, tareas, asistencia y calificaciones.
- UX/UI Global queda como plan transversal, pero su pulido fuerte debe esperar a que los modulos funcionales principales existan.
- Infraestructura/Auth se endurecen antes de beta con usuarios reales, no antes de tener una demo local consistente.
- Feed/social no se elimina ahora; se congela hasta decidir WhatsApp docente/comunidad.
- Ningun modulo nuevo debe quedar aislado: debe tener entrada, salida, CTA principal y estado offline/error.

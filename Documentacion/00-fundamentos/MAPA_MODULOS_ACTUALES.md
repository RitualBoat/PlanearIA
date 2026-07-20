# Mapa de Modulos Actuales - PlanearIA

Este documento es una fotografia del codigo actual. No define la UX objetivo. Sirve para que una IA entienda que carpetas existen y como deberian mapearse a la vision nueva.

Fuente tecnica de verdad:

- `src/navigation/routeManifest.ts`
- `src/navigation/AppShell.tsx`
- `src/navigation/StackNavigator.tsx`
- `src/screens/`
- `src/context/`
- `src/sync/`

## Hubs Actuales

Desde el change `app-shell-navegacion` (#81) la navegacion primaria son cinco hubs, cada uno un stack con
historial propio, sobre una raiz de nueve rutas.

| Hub | Ruta | Landing | Lectura vigente |
| --- | --- | --- | --- |
| Inicio | `InicioTab` | `Escritorio` | Ruta inicial de la app; dock hacia las demas experiencias. El Escritorio completo llega en Ola 2. |
| Office | `OfficeTab` | `OfficeHome` | Planeaciones, recursos, plantillas y biblioteca transversal. |
| Clases | `ClasesTab` | `ClassroomHome` | Entrada al Classroom funcional. |
| Asistente | `AsistenteTab` | `AsistenteHome` | Espacio del Copiloto IA; la conversacion completa llega en Ola 3. |
| Mas | `MasTab` | `MasHome` | Cuenta, perfil, comunicacion y comunidad. |

Las cinco tabs anteriores (`FeedTab`, `ContenidoTab`, `GruposTab`, `SocialTab`, `ConfiguracionTab`) ya no
existen como navegacion primaria. Ninguna pantalla se elimino: `Feed` y `Social` viven como rutas dentro de
`MasTab`, `Contenido` dentro de `OfficeTab`, y `Cuenta` dentro de `MasTab`. Son superficies legacy
alcanzables desde su hub, no destinos de diseno.

Detalle completo por hub, rutas de raiz y reglas de navegacion cruzada:
`Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`.

## Experiencias Objetivo

| Experiencia objetivo | Carpetas actuales relacionadas | Decision vigente |
| --- | --- | --- |
| Inicio / Sistema Operativo Docente | `feed`, `contenido`, `classroom`, `notificaciones`, futuros widgets | No existe como experiencia objetivo aun; debe definirse en UX/UI Global. |
| Asistente IA / ChatGPT Docente | `backend/lib/aiGateway.js`, endpoints IA de planeaciones/classroom, futuros `screens/ai` o panel contextual | No existe como experiencia completa; debe definirse como chat propio con adjuntos desde Office, Classroom y Canva. |
| Office Docente | `planeaciones`, `plantillas`, `alumnos`, `asistencia`, `calificaciones`, import/export | Unifica Word + Excel: documentos, hojas, listas, rubricas, asistencia y calificaciones. |
| Classroom / Clases | `classroom`, `grupos`, `alumnos`, `tareas`, `biblioteca`, `asistencia`, `calificaciones` | Cerrado como base funcional; puede redisenarse visualmente desde cero. |
| Canva / Genially Docente | `biblioteca`, `plantillas`, recursos visuales futuros | Futuro editor/experiencia visual; no duplicar biblioteca sin decision. |
| WhatsApp Docente | `social`, `chat`, `feed`, `notificaciones` | Reorientar hacia comunicacion profesional y colaboracion docente. |
| Calendario | no hay carpeta principal dedicada | Plan futuro conectado con clases, planeaciones, actividades y entregas. |
| Reportes | reportes de grupo/alumno, `calificaciones`, `asistencia`, `entregables` | Depende de datos reales; no saturar la experiencia diaria. |
| Cuenta / Accesibilidad / Seguridad | `auth`, `cuenta`, `perfil`, `onboarding`, `ayuda` | Auth activo/en cierre; UX/Accesibilidad pendiente de plan global o dedicado. |

## Inventario Por Carpeta

| Carpeta | Que contiene hoy | Como debe interpretarse |
| --- | --- | --- |
| `planeaciones` | Crear, lista, importar, exportar, escaner, `DocEditor` | Base documental de Office Docente. Cerrado funcionalmente, no visualmente intocable. |
| `plantillas` | Biblioteca/lista/detalle/editor de plantillas generales | Decidir si vive en Office, Canva o biblioteca transversal. |
| `contenido` | Hub transversal | Puede cambiar radicalmente; evitar que compita con Office/Classroom. |
| `classroom` | Home y grupo con tablon/trabajo/personas | Base funcional de Classroom. |
| `grupos` | Flujos legacy y soporte alrededor de grupos/tareas/reportes | Puente tecnico; no debe dominar la UX objetivo si Classroom lo reemplaza. |
| `alumnos` | CRUD, detalle, notas, import/export, reportes | Debe vivir contextual en Classroom y tabular en Office. |
| `asistencia` | Registrar/historial | Contextual en Classroom y/o hoja de Office. |
| `calificaciones` | Captura/promedios | Contextual en Classroom y/o hoja de Office. |
| `tareas` | Entregables/lista | Contextual en Classroom. |
| `biblioteca` | Recursos didacticos/lista/crear | Puede ser biblioteca transversal o parte de Classroom/Canva. |
| `feed` | Posts, retos, detalle | Congelar o reducir si distrae; posible comunidad futura. |
| `social` | Busqueda de perfiles/contactos | Base para WhatsApp Docente. |
| `chat` | Chats y conversaciones | Base para WhatsApp Docente. |
| futuros `ai` / `asistente` | No existe carpeta dedicada | Futura experiencia ChatGPT/Gemini Docente; debe reutilizar `aiGateway` y objetos existentes. |
| `notificaciones` | Notificaciones internas/push | Transversal. |
| `auth` | Login, registro, recuperar | Base de Auth/Seguridad. |
| `cuenta` | Perfil, roles, sesiones, terminos, preferencias | Cuenta/seguridad/accesibilidad. |
| `perfil` | Perfil publico | Decidir relacion con Cuenta y WhatsApp Docente. |
| `onboarding`, `ayuda` | Primer uso y soporte | Actualizar despues de UX/UI Global. |

## Decisiones Vigentes

- Office Docente debe reemplazar la separacion conceptual Word vs Excel.
- Asistente IA / ChatGPT Docente debe existir como experiencia conversacional propia, pero todas sus acciones deben ser confirmables.
- Classroom organiza y asigna; no debe crear todo.
- Contenido/Biblioteca/Plantillas no deben duplicar Office, Classroom o Canva.
- Feed/social no son prioridad si no ayudan al trabajo docente.
- Todo nuevo dato academico sincronizable debe usar `src/sync`.
- Toda pantalla nueva debe funcionar en web, tablet y movil desde una pantalla madre salvo excepcion justificada.
- Los planes cerrados prueban que algo funciona; no impiden redisenar UX/UI desde cero.

## Deuda A Considerar En UX/UI Global

- Definir la navegacion objetivo de cada experiencia interna (el shell y sus hubs ya estan resueltos por #81).
- ~~Definir que pasa con `ContenidoTab`~~: resuelto por la decision D6. Su funcion pasa a la biblioteca dentro de Office (ruta `Contenido` en `OfficeTab`) mas el selector transversal Asignar/Adjuntar.
- ~~Decidir si Office Docente sera tab, hub, workspace o herramienta contextual~~: resuelto por #81. Es el hub `OfficeTab`.
- ~~Decidir si el Asistente IA sera tab, panel lateral, command palette o accion flotante contextual~~: resuelto por la decision D4. Es el hub `AsistenteTab`; su superficie conversacional llega con `asistente-ia-base` (Ola 3).
- Decidir si WhatsApp Docente reemplaza Social/Chat/parte del Feed.
- Decidir si Plantillas es global, parte de Office o parte de Canva.
- Consolidar accesibilidad real y preferencias.
- Evitar botones sin destino, scroll roto y paridad desigual web/movil.

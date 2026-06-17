# Resumen Ejecutivo Vigente - PlanearIA

## Que Es

PlanearIA es una app educativa offline-first para docentes mexicanos. Esta construida con React Native, Expo, TypeScript, backend Node serverless en Vercel y MongoDB Atlas.

La vision vigente es crear una suite docente conectada: el profesor debe poder crear, organizar, asignar, comunicar y dar seguimiento sin cambiar entre herramientas externas.

## Vision De Producto

PlanearIA no debe sentirse como una coleccion de modulos sueltos. Debe sentirse como un solo lugar de trabajo docente:

- Inicio / Sistema Operativo Docente.
- Office Docente (Word + Excel).
- Classroom / Clases.
- Canva / Genially Docente.
- WhatsApp Docente.
- Calendario.
- Reportes.
- Cuenta, seguridad y accesibilidad.

La IA debe conectar el flujo de forma silenciosa: detectar contenido, sugerir clase/unidad/fecha, proponer tareas o recursos y pedir confirmacion antes de guardar cambios importantes.

## Estado Real Del Proyecto

- Desarrollador principal: estudiante universitario trabajando solo.
- Estado: desarrollo activo con demo hosteada y APK standalone para pruebas.
- No asumir producto lanzado a usuarios reales.
- Presupuesto: bajo/cero; priorizar local-first, free tiers y soluciones simples.
- Se permiten refactors fuertes de UX/UI si reducen legacy y alinean la app con la vision.

## Funcionalidad Cerrada O Base

- Planeaciones: Fase 9 cerrada. Existe editor tipo documento, plantillas, import/export, escaner y asistencia IA. En la vision nueva se interpreta como parte de Office Docente.
- Classroom: cerrado como base funcional. Incluye clases, unidades, materiales, actividades, alumnos, entregas, asistencia, calificaciones y flujo contextual.
- Infraestructura local/CI/deploy basico: cerrado.
- SQLite/storage: cerrado como infraestructura opt-in. AsyncStorage sigue como default productivo.
- Sync offline-first: motor global por entidad en `src/sync`, orquestado por `SyncContext`.
- Backend: router unico serverless, rutas academicas con JWT, `userId`, MongoDB e indices idempotentes.
- Auth: JWT, refresh tokens, sesiones, SecureStore nativo, AsyncStorage web, modo invitado/dev y roles base ya existen.
- CD: build web y APK standalone en GitHub Actions.

## Trabajo Activo O Pendiente

- Cerrar formalmente `Auth, Seguridad y Sesion Real`: email real, datos sociales pendientes, validacion manual y tracking GitHub.
- Crear el `Plan Maestro: UX/UI y Navegacion Global`.
- Definir sistema visual, navegacion objetivo y arquitectura de experiencias.
- Decidir como se implementa Office Docente: documentos + hojas/listas + asignacion inteligente a Classroom.
- Despues de UX/UI Global, crear subplanes por experiencia o subexperiencia.

## Stack Vigente

- React Native 0.81.5 + Expo 54.
- TypeScript 5.9.
- React Navigation 7.
- Context + hooks ViewModel.
- AsyncStorage default.
- Expo SQLite opt-in.
- Expo SecureStore en nativo para tokens; AsyncStorage en web.
- Backend Node serverless en `backend/api/index.js` + `backend/routes`.
- MongoDB Atlas M0.
- IA gateway multi-provider en backend.
- Jest + Testing Library.
- GitHub Actions CI/CD.

## Reglas De Direccion

- No crear pantallas aisladas sin entrada, salida y CTA claro.
- No duplicar flujos entre Office, Classroom, Contenido y rutas legacy.
- No llamar modelos IA desde frontend.
- No crear colas/clientes HTTP paralelos si el dato puede usar `src/sync`.
- No activar SQLite como default sin plan, validacion y rollback.
- No borrar claves `@planearia:*` sin migracion controlada.
- Todo dato multiusuario debe filtrar por `userId`.
- Todo plan maestro debe seguir `Documentacion/01-planes-maestros/meta_guia_planes.md`.

## Documentos Vigentes Principales

- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
- `Documentacion/prompt_mejorado.md`

## Documentos Historicos

`Documentacion/99-archivo/` conserva documentos legacy y borradores antiguos. Sirven para historia, no para implementar.

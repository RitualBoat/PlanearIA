# Resumen Ejecutivo Vigente - PlanearIA

## Que Es

PlanearIA es una app educativa offline-first para docentes mexicanos. Esta construida con React Native, Expo, TypeScript, backend Node serverless en Vercel y MongoDB Atlas.

La vision vigente es crear una suite docente conectada: el profesor puede crear, organizar, asignar, comunicar y dar seguimiento sin cambiar entre herramientas externas.

## Vision De Producto

PlanearIA se presenta como un solo lugar de trabajo docente:

- Inicio / Sistema Operativo Docente.
- Asistente IA / ChatGPT Docente.
- Office Docente: documentos, hojas y presentaciones.
- Classroom / Clases.
- Canva / Genially Docente.
- WhatsApp Docente.
- Calendario.
- Reportes.
- Cuenta, seguridad y accesibilidad.

La IA conecta el flujo con sugerencias silenciosas dentro de cada experiencia y un Asistente IA tipo ChatGPT/Gemini para conversar con documentos, recursos, clases y archivos adjuntos. En todos los casos pide confirmacion antes de guardar, asignar, enviar, sobrescribir o modificar datos importantes.

## Estado Real Del Proyecto

- Desarrollador principal: estudiante universitario trabajando solo.
- Estado: desarrollo activo con demo hosteada y APK standalone para pruebas.
- No asumir producto lanzado a usuarios reales.
- Presupuesto: bajo/cero; priorizar local-first, free tiers y soluciones simples.
- Se permiten refactors fuertes de UX/UI si reducen legacy y alinean la app con la vision.

## Funcionalidad Cerrada O Base

- Planeaciones: base funcional de Office Docente.
- Classroom: base funcional para clases, unidades, materiales, actividades, alumnos, entregas, asistencia y calificaciones.
- IA actual: gateway multi-provider OpenAI-compatible en backend.
- Infraestructura local/CI/deploy basico: base vigente.
- SQLite/storage: infraestructura opt-in; AsyncStorage sigue como default productivo.
- Sync offline-first: motor global por entidad en `src/sync`, orquestado por `SyncContext`.
- Backend: router unico serverless, rutas academicas con JWT, `userId`, MongoDB e indices idempotentes.
- Auth: JWT, refresh tokens, sesiones, SecureStore nativo, AsyncStorage web, modo invitado/dev y roles base.

## Trabajo Activo O Pendiente

- Cerrar formalmente Auth, Seguridad y Sesion Real.
- Ejecutar el Plan Maestro UX/UI y Navegacion Global.
- Definir sistema visual, navegacion objetivo y arquitectura de experiencias.
- Definir el Asistente IA conversacional: historial, adjuntos, tareas en segundo plano, permisos, costos, proveedores y fallback.

## Reglas De Direccion

- No crear pantallas aisladas sin entrada, salida y CTA claro.
- No duplicar flujos entre Office, Classroom, Contenido y rutas legacy.
- No llamar modelos IA desde frontend.
- No conectar LM Studio ni proveedores cloud directo desde frontend; todo debe pasar por backend/AI Gateway.
- No sobrescribir documentos originales con resultados IA; generar copia, borrador, resumen o comparacion revisable.
- No crear colas/clientes HTTP paralelos si el dato puede usar `src/sync`.
- No activar SQLite como default sin plan, validacion y rollback.
- No borrar claves `@planearia:*` sin migracion controlada.
- Todo dato multiusuario debe filtrar por `userId`.
- Todo plan maestro sigue `Documentacion/01-planes-maestros/meta_guia_planes.md`.

## Documentos Vigentes Principales

- `Documentacion/00-fundamentos/VISION_ACTUAL.md`
- `Documentacion/00-fundamentos/ARQUITECTURA.md`
- `Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md`
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`
- `Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`
- `Documentacion/01-planes-maestros/meta_guia_planes.md`
- `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md`
- `Documentacion/05-context-engineering/README.md`

## Documentos Historicos

Los documentos legacy y borradores antiguos viven en respaldo externo del usuario. Sirven para historia si el usuario los aporta, no para implementar.

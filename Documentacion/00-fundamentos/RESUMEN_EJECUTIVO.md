# Resumen Ejecutivo Vigente - PlanearIA

## Que Es

PlanearIA es una app educativa offline-first para docentes mexicanos. Esta construida con React Native, Expo, TypeScript, backend Node serverless en Vercel y MongoDB Atlas.

La vision vigente es crear una suite docente conectada: el profesor debe poder crear, organizar, asignar, comunicar y dar seguimiento sin cambiar entre herramientas externas.

## Vision De Producto

PlanearIA no debe sentirse como una coleccion de modulos sueltos. Debe sentirse como un solo lugar de trabajo docente:

- Inicio / Sistema Operativo Docente.
- Asistente IA / ChatGPT Docente.
- Office Docente (Word + Excel).
- Classroom / Clases.
- Canva / Genially Docente.
- WhatsApp Docente.
- Calendario.
- Reportes.
- Cuenta, seguridad y accesibilidad.

La IA debe conectar el flujo de dos maneras: sugerencias silenciosas dentro de cada experiencia y un Asistente IA tipo ChatGPT/Gemini para conversar con documentos, recursos, clases y archivos adjuntos. La IA silenciosa tambien puede pedir permiso para mandar una tarea al LLM de PlanearIA en segundo plano, por ejemplo correcciones de un documento. En todos los casos debe pedir confirmacion antes de guardar, asignar, enviar, sobrescribir o modificar datos importantes.

## Estado Real Del Proyecto

- Desarrollador principal: estudiante universitario trabajando solo.
- Estado: desarrollo activo con demo hosteada y APK standalone para pruebas.
- No asumir producto lanzado a usuarios reales.
- Presupuesto: bajo/cero; priorizar local-first, free tiers y soluciones simples.
- Se permiten refactors fuertes de UX/UI si reducen legacy y alinean la app con la vision.

## Funcionalidad Cerrada O Base

- Planeaciones: Fase 9 cerrada. Existe editor tipo documento, plantillas, import/export, escaner y asistencia IA. En la vision nueva se interpreta como parte de Office Docente.
- Classroom: cerrado como base funcional. Incluye clases, unidades, materiales, actividades, alumnos, entregas, asistencia, calificaciones y flujo contextual.
- IA actual: gateway multi-provider OpenAI-compatible en backend, con endpoints de planeaciones/Classroom. La vision nueva agrega un Asistente IA conversacional propio y soporte planificado para proveedores locales como LM Studio via `AI_GATEWAY_PROVIDERS`.
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
- Decidir donde vive el Asistente IA: tab, panel lateral, accion flotante, command palette o espacio contextual.
- Definir plan tecnico de chat IA: historial, adjuntos, solicitudes en segundo plano, permisos, costos, proveedores cloud/locales y fallback.
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
- IA gateway multi-provider en backend, extensible a proveedores custom OpenAI-compatible como LM Studio en entorno local.
- Jest + Testing Library.
- GitHub Actions CI/CD.

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

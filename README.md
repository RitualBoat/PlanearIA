# PlanearIA

PlanearIA es una plataforma educativa para docentes mexicanos construida con React Native, Expo y TypeScript. Su objetivo es reducir la carga administrativa del profesor con una app offline-first, familiar y conectada: crear, organizar, asignar, comunicar y dar seguimiento sin saltar entre pestanas, archivos, chats y herramientas externas.

## Vision

La vision vigente ya no es "muchos modulos separados". PlanearIA apunta a ser una suite docente:

| Experiencia objetivo               | Proposito                                                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inicio / Sistema Operativo Docente | Pendientes, clases del dia, documentos recientes, estado de sync y sugerencias IA.                                                                             |
| Asistente IA / ChatGPT Docente     | Chat propio tipo ChatGPT/Gemini con adjuntos desde Office, Classroom y Canva; recibe borradores, correcciones y acciones confirmables generadas por IA.       |
| Office Docente                     | Documentos, planeaciones, plantillas, hojas, listas, asistencia, calificaciones, rubricas e import/export. Une Word + Excel como una sola experiencia escolar. |
| Classroom / Clases                 | Cursos, unidades, materiales, actividades, alumnos, entregas y seguimiento operativo.                                                                          |
| Canva / Genially Docente           | Creacion visual de materiales, presentaciones, infografias, actividades y recursos imprimibles.                                                                |
| WhatsApp Docente                   | Contactos, conversaciones, envio de recursos y colaboracion profesional entre docentes.                                                                        |
| Calendario                         | Vista temporal de clases, sesiones, tareas, entregas y recordatorios.                                                                                          |
| Reportes                           | Analitica, avance, alumnos en riesgo y gamificacion prudente.                                                                                                  |
| Cuenta / Accesibilidad / Seguridad | Perfil, sesiones, roles, privacidad, preferencias y accesibilidad real.                                                                                        |

La promesa de producto es:

> Creo algo, PlanearIA entiende que es, me sugiere donde va, lo asigno, le doy seguimiento y obtengo reportes sin salir de la app.

## Estado Actual

PlanearIA ya tiene una base funcional importante:

- Auth funcional con JWT, sesiones, refresh token, modo invitado/dev y aislamiento por `userId`.
- Classroom base cerrado: clases, unidades, materiales, actividades, alumnos, entregas, asistencia y calificaciones contextuales.
- Planeaciones Fase 9 cerrada: editor tipo documento, plantillas, import/export, IA via backend y fallback.
- Motor global offline-first en `src/sync`: cola por entidad, push/pull cross-device, eventos de refresco y UX de estado de red.
- Backend Node serverless en Vercel con router unico, rutas academicas aisladas por JWT y MongoDB Atlas.
- IA centralizada en backend mediante `backend/lib/aiGateway.js`, con vision de Asistente IA propio, solicitudes en segundo plano y proveedores cloud/locales OpenAI-compatible.
- CI con typecheck, lint, Jest y backend smoke.
- CD con APK Android standalone publicado como artifact/release de GitHub; GitHub Actions y Vercel no corren por cambios solo de docs.

La app sigue en desarrollo activo. No debe asumirse como producto lanzado a usuarios reales. La demo hosteada y el APK sirven para validacion, clases, pruebas con profesor y beta controlada.

## Stack

- React Native 0.81.5 + Expo 54.
- TypeScript 5.9.
- React Navigation 7.
- React Context + hooks como ViewModels (MVVM pragmatico).
- `react-native-web` para web.
- AsyncStorage como persistencia local default.
- Expo SQLite instalado como infraestructura opt-in para datos relacionales/sync queue, no default.
- Backend Node serverless en `backend/api/index.js` + `backend/routes`.
- MongoDB Atlas M0.
- GitHub Actions para CI/CD.

## Mapa Rapido Del Repo

```text
PlanearIA/
  src/                    App React Native: screens, hooks/ViewModels, context, services, sync, navigation
  backend/                API serverless Node/Vercel, rutas, auth, IA gateway y utilidades backend
  Documentacion/          Vision, arquitectura, planes maestros, operacion, referencias y archivo historico
  context/                Ground truth, referencias y handoffs usados como memoria tecnica
  assets/                 Imagenes, iconos y recursos estaticos de la app
  types/                  Tipos compartidos del frontend
  shared/                 Codigo compartido cuando aplica entre frontend/backend
  scripts/                Scripts auxiliares del proyecto
  .github/                Workflows CI/CD, templates e instrucciones para Copilot
  .claude/                Reglas compartidas para Claude Code
  .agents/skills/         Skills locales ignoradas por Git; apoyo opcional, no fuente de verdad
```

La fuente de verdad para entender el producto es `Documentacion/` + `CLAUDE.md`. Carpetas generadas o locales como `node_modules/`, `.expo/`, `.vercel/`, `.venv/` y `dist/` no deben usarse como referencia arquitectonica.

## Como Levantar Local

Instala dependencias:

```bash
npm install
npm run backend:install
```

Levanta web:

```bash
npm run web
```

Levanta backend local:

```bash
npm run backend:dev
```

Validacion rapida:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run backend:check
```

Contexto rapido con CodeGraph MCP:

```bash
npm run codegraph:status
npm run codegraph:explore -- "how does SyncContext reach entitySync and syncEngine?"
```

MCPs compartidos del proyecto: CodeGraph, Figma, Context7, GitHub, Vercel, Expo, Playwright y
PlanearIA SQLite read-only. Para
levantar Expo con capacidades MCP locales durante desarrollo:

```bash
npm run start:mcp
```

Inspeccion segura de SQLite local opt-in:

```bash
npm run sqlite:inspect -- sync-queue --db C:\ruta\planearia_classroom.db
```

Detalles completos:

- [Entorno local](./Documentacion/02-operacion/ENTORNO_LOCAL.md)
- [Guia de pruebas](./Documentacion/02-operacion/GUIA_PRUEBAS.md)
- [Deploy demo hosteada](./Documentacion/02-operacion/DEPLOY_DEMO_HOSTEADA.md)
- [MCPs y flujos de IA](./Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md)
- [CodeGraph MCP](./Documentacion/02-operacion/CODEGRAPH_MCP.md)

## Documentacion Para IAs y Colaboradores

Leer en este orden:

1. [Documentacion/README.md](./Documentacion/README.md)
2. [Resumen ejecutivo](./Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md)
3. [Vision actual](./Documentacion/00-fundamentos/VISION_ACTUAL.md)
4. [Arquitectura](./Documentacion/00-fundamentos/ARQUITECTURA.md)
5. [IA, chatbot y LLM propio](./Documentacion/00-fundamentos/IA_CHATBOT_LLM.md)
6. [Flujo de sincronizacion](./Documentacion/00-fundamentos/FLUJO_SINCRONIZACION.md)
7. [Roadmap de planes maestros](./Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md)
8. [Meta guia de planes](./Documentacion/01-planes-maestros/meta_guia_planes.md)
9. [Prompt mejorado para Claude](./Documentacion/prompt_mejorado.md)

## Reglas Importantes

- No crear pantallas aisladas sin ruta, entrada, salida y CTA claro.
- No duplicar flujos entre Contenido, Classroom, Office Docente y pantallas legacy.
- No llamar IA desde frontend; toda IA pasa por backend.
- No conectar ChatGPT/Gemini/LM Studio directo desde frontend; el Asistente IA debe pasar por `aiGateway`.
- No sobrescribir documentos con correcciones IA; generar copia, resumen, borrador o comparacion revisable.
- No crear clientes HTTP o colas propias si el dato es sincronizable; usar `src/sync`.
- No activar SQLite como default ni borrar claves `@planearia:*` sin plan, validacion y rollback.
- No tratar planes cerrados como vision visual intocable: son evidencia funcional, no limite UX.

## Version Documental

- Estado documental: 2026-06-17.
- Vision vigente: suite docente conectada con Office Docente + Asistente IA + Classroom + IA silenciosa/contextual.

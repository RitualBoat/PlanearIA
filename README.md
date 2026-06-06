# PlanearIA - Plataforma Inteligente para Docentes

<div align="center">

![Version](https://img.shields.io/badge/version-4.1-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.34-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6.svg)

PlanearIA es una plataforma educativa offline-first para ayudar a docentes a crear, organizar, evaluar y compartir recursos con asistencia de IA.

[Vision](#vision-del-producto) | [Estado](#estado-actual) | [Modulos](#modulos-de-la-app) | [Arquitectura](#arquitectura) | [Roadmap](#roadmap) | [Documentacion](#documentacion)

</div>

---

## Vision del Producto

PlanearIA nace como una app para planeaciones educativas, pero su objetivo es crecer hasta convertirse en una plataforma integral para docentes con una regla central: **cero friccion**. Un profesor no deberia sentir que aprende software nuevo, sino que abre herramientas familiares dentro de un solo ecosistema.

La vision actual organiza el producto por experiencias:

- **Planeaciones = Word/Docs:** crear, importar, editar y exportar planeaciones como documentos reales, con IA pedagogica y plantillas.
- **Grupos y recursos = Classroom:** clases, unidades, alumnos, materiales/enlaces/archivos asignados, actividades evaluables ligeras, entregas y calificacion contextual en un flujo unico.
- **Diseno didactico = Canva/Genially:** crear presentaciones, examenes visuales, actividades y materiales desde un editor visual opcional.
- **Listas y registros = Excel:** hojas/listas libres para asistencia, calificaciones, notas y registros sincronizables con Classroom.
- **Mensajeria docente = WhatsApp profesional:** contactos, chat y envio de recursos entre docentes.
- **Reportes = hub separado:** analisis y gamificacion sin saturar la experiencia diaria.

La arquitectura objetivo es monolito modular, desarrollo local primero, bajo costo y despliegue gradual.

---

## Estado Actual

PlanearIA esta en desarrollo activo. No esta en produccion y no tiene usuarios reales, asi que el proyecto permite refactors grandes cuando ayuden a limpiar legacy, simplificar flujos o mejorar la experiencia.

Lo que ya existe:

- App React Native + Expo con soporte Android, iOS y web.
- Navegacion principal con tabs y stack navigator.
- Login, registro y recuperacion de contrasena.
- Arquitectura MVVM basada en screens, hooks ViewModel, contexts y services.
- Persistencia local con AsyncStorage y estrategia offline-first.
- Backend Node en `backend/api` con MongoDB Atlas/free tier.
- Modulos funcionales o parcialmente funcionales para planeaciones, recursos, grupos, alumnos, asistencia, calificaciones, plantillas, feed social, contactos, chat, notificaciones, cuenta, onboarding y ayuda.
- Sistema de documentacion por carpetas y planes maestros de refactorizacion.

Estado del trabajo principal:

- Planeaciones cerro Fase 9 como primera gran refactorizacion terminada.
- Pasos Iniciales quedo cerrado como cimiento de GitHub Product OS, CI inicial y entorno local.
- Classroom quedo cerrado: Fases 0 a 10, validacion final y issue consolidado #8 completados.
- Infraestructura Local/CI/Deploy Basico es el plan activo nuevo.
- `Documentacion/01-planes-maestros/meta_guia_planes.md` define el estandar para futuros planes.

---

## Modulos de la App

| Modulo | Estado actual | Vision |
| ------ | ------------- | ------ |
| Planeaciones | Fase 9 completada. Hay modelo V2, editor tipo Word/Docs, escaner, exportacion, plantilla default robusta, copiloto IA y flujo moderno. | Mantener como experiencia Word/Docs e integrarla con Classroom y plantillas/diseno. |
| Contenido / Hub de Recursos | Hub transversal para planeaciones, recursos, entregables y plantillas. | Centro claro, sin flujos duplicados ni rutas legacy escondidas. |
| Classroom / Grupos | Cerrado como experiencia tipo Classroom/Classroomio. | Experiencia tipo Classroom con cursos, tablon, trabajo por secciones, personas, materiales asignados y actividades con calificacion contextual. |
| Recursos Didacticos / Biblioteca | Existen lista, creacion, contexto y ViewModels. | Gestionar diapositivas, PDFs, videos, notas, mapas mentales y lineas de tiempo. |
| Recursos Evaluables / Tareas / Entregables | Hay tareas dentro de grupos, entregables, calificacion y asignacion de recursos. | Examenes, trabajos, rubricas, proyectos, revision, asignacion y calificacion conectada con alumnos. |
| Alumnos | CRUD, detalle, notas, importacion, exportacion y reportes. | Perfil academico completo conectado a Classroom y Excel/Listas. |
| Asistencia | Registro e historial. | Control rapido por grupo, reportes y sync offline robusto. |
| Calificaciones | Captura y promedios. | Calificaciones conectadas con rubricas, entregables, reportes y analitica. |
| Plantillas | Biblioteca, lista, detalle y editor legacy/generico. | Plantillas reutilizables, importables, compartibles y sanitizadas. |
| Feed / Red Social | Feed, posts, retos y preguntas. | Queda en segundo plano; futuro enfoque en comunicacion directa docente. |
| Social / Contactos | Buscador de perfiles e invitaciones. | Base para WhatsApp docente. |
| Chat / Mensajeria | Lista de chats y conversacion. | Mensajeria docente con adjuntos educativos y sync estable. |
| Cuenta/Auth/Seguridad | Auth y cuenta existen, pero seguridad real esta pendiente. | JWT, RBAC Dev/Admin/Docente/Alumno, rate limiting, bcrypt y secrets seguros. |
| Infraestructura | Local-first, backend Node, MongoDB Atlas/free tier, CI inicial. | Bajo costo, deploy gradual y opcion futura de self-hosting local/Docker. |
| UX/UI Global | Reglas en meta guia, pulido final pendiente. | Nielsen, severidad 0-4, accesibilidad, tokens y navegacion sin friccion. |

---

## Principios de Producto

- **Offline-first:** la app debe funcionar sin internet y sincronizar despues.
- **Docente primero:** cada flujo debe ahorrar tiempo real a un profesor.
- **IA como copiloto:** la IA propone, mejora, revisa o transforma; el docente conserva control.
- **Editor real, no solo formularios:** los modulos de creacion deben evolucionar hacia experiencias tipo herramienta profesional.
- **Navegacion cuidada:** cada modulo debe tener entradas, salidas, CTAs y rutas claras.
- **Sin legacy innecesario:** si una pantalla vieja duplica una nueva, se elimina, oculta o redirige.
- **Bajo costo:** priorizar free tiers, servicios simples y despliegues que un estudiante pueda mantener.
- **Escalable sin sobredisenar:** construir profesionalmente, pero sin complejidad prematura.
- **Seguridad pragmatica:** RBAC real en backend, rate limiting, bcrypt, JWT y secretos fuera del frontend.
- **UX/UI con rigor IHC:** el plan global de UX/UI debe usar heuristicas de Jakob Nielsen y severidad 0-4.

---

## Arquitectura

| Capa | Tecnologia | Descripcion |
| ---- | ---------- | ----------- |
| Frontend | React Native 0.81.5 + Expo 54 | App cross-platform para Android, iOS y web. |
| Lenguaje | TypeScript 5.9.2 | Tipado estatico y modelos compartidos. |
| Navegacion | React Navigation 7.x | Stack navigator y bottom tabs. |
| Estado | React Context + hooks | MVVM: screens delgadas, hooks como ViewModels. |
| Storage local | AsyncStorage | Fuente local actual para offline-first. |
| Storage futuro | SQLite/Expo SQLite | Recomendado para datos relacionales/pesados. |
| Backend | Node en `backend/api` | Endpoints por modulo. |
| Base de datos | MongoDB Atlas/free tier | Persistencia remota de bajo costo. |
| Auth | JWT | Aislamiento por `userId` en endpoints. |
| Sync | `src/sync` + endpoints `/api/sync` | Sincronizacion local/remota. |
| Editor | Tentap/TipTap/WebView | Base para editor enriquecido tipo Docs/Word. |
| Testing | Jest + Testing Library | Tests unitarios y de integracion. |

Patron base:

```text
Screen/View -> hook ViewModel -> Context/Service -> Storage/API -> MongoDB Atlas
```

---

## IA en PlanearIA

La IA se usa como una capa de asistencia, no como sustituto del docente.

Casos previstos o en evolucion:

- Generar borradores de planeaciones.
- Sugerir actividades, evaluaciones y rubricas.
- Mejorar redaccion pedagogica.
- Revisar coherencia curricular.
- Escanear plantillas importadas y vaciar datos personales.
- Autocompletar campos o texto en editores.
- Resumir, transformar o adaptar recursos.

El backend ya cuenta con un gateway IA multi-provider para Planeaciones (`backend/lib/aiGateway.js`) y un limite por accion configurable (`AI_MAX_REQUESTS_PER_ACTION`, default 10). Los nuevos modulos deben intentar reutilizar esa capa antes de crear integraciones aisladas.

---

## Estrategia de Refactorizacion

Cada modulo importante debe tener su propio plan maestro, siguiendo `Documentacion/01-planes-maestros/meta_guia_planes.md`.

Regla nueva despues de la auditoria Classroom: los planes de experiencias madre no pueden quedarse en "tipo Word", "tipo Classroom", "tipo Excel" o "tipo Canva". Deben declarar nivel de paridad y citar ground truth por fase:

- `Clon/paridad alta`: Word/Docs, Classroom/Classroomio, Excel/Sheets, Canva/Genially y WhatsApp profesional.
- Cada fase UX debe citar capturas en `context/<modulo>-ground-truth/` y referencias en `context/referencias-opensource/`.
- Si faltan capturas o repos open source, el plan debe pedirlos antes de implementar pantallas.
- Una fase visual de paridad alta no se cierra solo con TypeScript/tests; requiere validacion manual contra referencias.

Planes actuales:

| Plan | Archivo | Estado |
| ---- | ------- | ------ |
| Infraestructura Local, CI y Deploy Basico | [`Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md`](./Documentacion/01-planes-maestros/PLAN_INFRAESTRUCTURA_LOCAL_CI_DEPLOY.md) | Activo; Fase 0 completada, Fase 1 pendiente. |
| Classroom / Grupos y Recursos | [`Documentacion/01-planes-maestros/PLAN_CLASSROOM.md`](./Documentacion/01-planes-maestros/PLAN_CLASSROOM.md) | Cerrado; #8 completado. |
| Planeaciones | [`Documentacion/01-planes-maestros/plan_planeaciones.md`](./Documentacion/01-planes-maestros/plan_planeaciones.md) | Cerrado. Fase 9 aprobada. |
| Pasos iniciales | [`Documentacion/01-planes-maestros/PLAN_PASOS_INICIALES.md`](./Documentacion/01-planes-maestros/PLAN_PASOS_INICIALES.md) | Cerrado como cimiento organizativo. |
| Meta guia de planes | [`Documentacion/01-planes-maestros/meta_guia_planes.md`](./Documentacion/01-planes-maestros/meta_guia_planes.md) | Vigente, define reglas para futuros planes. |
| Planes auditados | [`Documentacion/01-planes-maestros/PLANES MAESTROS AUDITADOS.md`](./Documentacion/01-planes-maestros/PLANES%20MAESTROS%20AUDITADOS.md) | Retrospectiva de Classroom; origen del contrato de ground truth por fase. |
| Roadmap de planes | [`Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md`](./Documentacion/00-fundamentos/ROADMAP_PLANES_MAESTROS.md) | Indice de planes futuros. |

---

## Roadmap

### Corto plazo

- Crear el `Plan Maestro: Infraestructura Local, CI y Deploy Basico` como siguiente cimiento.
- Mantener GitHub Product OS alineado con fases activas.
- Ejecutar Fase 1 de infraestructura: scripts reproducibles para desarrollador solo.

### Mediano plazo

- Consolidar Classroom como organizador/asignador y usarlo como fuente real para futuros planes de Excel/Listas, calificacion avanzada, reportes y UX/UI global.
- Crear plan UX/UI y Navegacion Global cuando el flujo funcional principal este estable.
- Preparar plan de infraestructura local/CI/deploy basico.
- Endurecer Auth y Seguridad antes de beta con usuarios reales.

### Largo plazo

- Evaluar infraestructura final: free tier cloud, servidor local/self-hosted, VPS economico, Vercel/Render/Railway, Docker o hibrido segun costo y facilidad de entrega.
- Preparar despliegue web y distribucion en app stores.
- Crear landing page y documentacion de lanzamiento.
- Agregar analitica, crash reporting y monitoreo basico.

---

## Instalacion

### Prerrequisitos

```bash
node --version
npm --version
```

### Setup

```bash
git clone https://github.com/RitualBoat/PlanearIA.git
cd PlanearIA
npm install
npm run backend:install
```

### Ejecutar

```bash
npm start
npm run start:dev
npm run android
npm run ios
npm run web
npm run backend:dev
```

Notas:

- `npm run start:dev` es recomendado para funciones nativas avanzadas.
- `npm run backend:dev` levanta el backend serverless local desde `backend/` usando la dependencia local de Vercel.
- iOS requiere Mac + Xcode.
- Algunas funciones push o nativas pueden requerir dev build, no solo Expo Go.

### Variables de entorno

```bash
cp .env.example .env
npm run backend:install
copy backend\.env.example backend\.env.local
```

Configurar endpoints y secretos solo en archivos locales ignorados por Git:

- App: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_SECRET`, `EXPO_PUBLIC_ALLOW_NATIVE_LOCALHOST`.
- Backend: `API_SECRET`, `JWT_SECRET`, `MONGODB_URI`, proveedores IA y limites.
- Las API keys privadas de IA nunca deben ir en variables `EXPO_PUBLIC_*`.

Para celular fisico, usar la IP LAN de la laptop en `EXPO_PUBLIC_API_URL`; `localhost` apunta al telefono, no al backend de la laptop.

---

## Estructura del Proyecto

```text
PlanearIA/
+-- App.tsx
+-- README.md
+-- Documentacion/
|   +-- README.md
|   +-- 00-fundamentos/
|   +-- 01-planes-maestros/
|   +-- 02-operacion/
|   +-- 03-validacion/
|   +-- 04-referencia/
|   +-- 05-analisis-ia/
|   +-- 99-archivo/
+-- backend/
|   +-- api/
|   +-- lib/
+-- context/
+-- src/
|   +-- components/
|   +-- context/
|   +-- hooks/
|   +-- navigation/
|   +-- screens/
|   +-- services/
|   +-- sync/
|   +-- themes/
|   +-- utils/
|   +-- __tests__/
+-- types/
```

---

## Documentacion

La documentacion tecnica esta en [`Documentacion/`](./Documentacion/):

| Documento | Descripcion |
| --------- | ----------- |
| [`Documentacion/README.md`](./Documentacion/README.md) | Indice tecnico principal. |
| [`Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md`](./Documentacion/00-fundamentos/RESUMEN_EJECUTIVO.md) | Estado vigente y reglas de direccion. |
| [`Documentacion/00-fundamentos/VISION_ACTUAL.md`](./Documentacion/00-fundamentos/VISION_ACTUAL.md) | Manifiesto actual de cero friccion. |
| [`Documentacion/00-fundamentos/ARQUITECTURA.md`](./Documentacion/00-fundamentos/ARQUITECTURA.md) | Arquitectura del sistema y decisiones tecnicas. |
| [`Documentacion/01-planes-maestros/meta_guia_planes.md`](./Documentacion/01-planes-maestros/meta_guia_planes.md) | Guia maestra para planes futuros. |
| [`Documentacion/01-planes-maestros/PLAN_CLASSROOM.md`](./Documentacion/01-planes-maestros/PLAN_CLASSROOM.md) | Plan activo de Classroom. |
| [`context/README.md`](./context/README.md) | Protocolo de ground truth, capturas y referencias por modulo. |
| [`context/referencias-opensource/README.md`](./context/referencias-opensource/README.md) | Repos open source curados y referencias faltantes. |
| [`Documentacion/02-operacion/ENTORNO_LOCAL.md`](./Documentacion/02-operacion/ENTORNO_LOCAL.md) | Guia para levantar frontend/backend local. |
| [`Documentacion/02-operacion/GUIA_PRUEBAS.md`](./Documentacion/02-operacion/GUIA_PRUEBAS.md) | Guia vigente de pruebas. |
| [`Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`](./Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md) | Mapa vigente de navegacion. |
| [`Documentacion/99-archivo/README.md`](./Documentacion/99-archivo/README.md) | Archivo historico de docs legacy. |

---

## Validacion

Comandos habituales:

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand
npm run check
```

Pruebas focalizadas utiles:

```bash
npm run test:classroom
npm run test:planeaciones
npm run test:sync
```

Para cambios de UX/UI tambien se debe validar manualmente en web, Android y, si es posible, iOS.

---

## Consideraciones de Costo

PlanearIA debe tomar decisiones tecnicas pensando en que lo construye una sola persona con presupuesto limitado.

Prioridades:

- Usar free tiers cuando sean suficientes.
- Evitar servicios caros antes de tener usuarios reales.
- Preferir infraestructura facil de explicar, levantar y entregar.
- Evaluar self-hosting local/Docker/backend propio cuando llegue el modulo de infraestructura.
- Documentar costos antes de agregar IA, storage, correo, push o hosting permanente.

---

## Licencia

Proyecto privado. Todos los derechos reservados.

---

**Repositorio:** [github.com/RitualBoat/PlanearIA](https://github.com/RitualBoat/PlanearIA)

**Branch principal de trabajo:** `development`

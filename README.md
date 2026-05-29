# PlanearIA - Plataforma Inteligente para Docentes

<div align="center">

![Version](https://img.shields.io/badge/version-4.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.34-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6.svg)

PlanearIA es una plataforma educativa offline-first para ayudar a docentes a crear, organizar, evaluar y compartir recursos con asistencia de IA.

[Vision](#vision-del-producto) | [Estado](#estado-actual) | [Modulos](#modulos-de-la-app) | [Arquitectura](#arquitectura) | [Roadmap](#roadmap) | [Documentacion](#documentacion)

</div>

---

## Vision del Producto

PlanearIA nace como una app para planeaciones educativas, pero su objetivo es crecer hasta convertirse en una plataforma integral para docentes. La vision es que un profesor pueda trabajar desde un solo lugar:

- Crear planeaciones didacticas con plantillas, editor tipo Word/Docs e IA pedagogica.
- Administrar grupos, alumnos, asistencia, calificaciones y reportes.
- Crear recursos evaluables: examenes, trabajos, rubricas, proyectos y entregables calificables.
- Crear recursos didacticos: diapositivas, PDFs, videos, notas de voz, mapas mentales y lineas de tiempo.
- Compartir recursos con otros docentes mediante una red social educativa.
- Comunicarse por chat y notificaciones.
- Trabajar sin internet y sincronizar cuando vuelva la conexion.
- Mantener una arquitectura profesional, pero realista para un proyecto construido por un estudiante con presupuesto limitado.

El principio rector es simple: la app debe sentirse util para docentes reales, no solo tecnicamente interesante.

---

## Estado Actual

PlanearIA esta en desarrollo activo. No esta en produccion y no tiene usuarios reales, asi que el proyecto permite refactors grandes cuando ayuden a limpiar legacy, simplificar flujos o mejorar la experiencia.

Lo que ya existe en la app:

- App React Native + Expo con soporte Android, iOS y web.
- Navegacion principal con tabs y stack navigator.
- Login, registro y recuperacion de contrasena.
- Arquitectura MVVM basada en screens, hooks ViewModel, contexts y services.
- Persistencia local con AsyncStorage y estrategia offline-first.
- Backend serverless en Vercel con MongoDB Atlas.
- Sincronizacion por `syncEngine` y endpoints API.
- Modulos funcionales o parcialmente funcionales para planeaciones, recursos, grupos, alumnos, asistencia, calificaciones, plantillas, feed social, contactos, chat, notificaciones, cuenta, onboarding y ayuda.
- Sistema de documentacion tecnica y planes maestros de refactorizacion por modulo.

Estado del trabajo principal actual:

- El modulo de Planeaciones es el foco activo.
- Las fases 0 a 8 dejaron modelo V2, contexto, editor, escaner, exportacion y copiloto IA como base.
- La Fase 9 de `plan_planeaciones.md` esta destinada a corregir el flujo real: editor tipo Word/Docs, WebView en web, errores moviles, botones ilegibles, navegacion legacy, plantilla default y experiencia centrada en documento.
- La guia `Documentacion/meta_guia_planes.md` define el estandar para futuros planes de refactorizacion.

---

## Modulos de la App

| Modulo | Estado actual | Vision |
| ------ | ------------- | ------ |
| Planeaciones | Refactor activo con plan maestro. Hay modelo V2, editor, escaner, exportacion y copiloto IA, pero falta cerrar Fase 9. | Editor tipo Word/Docs con plantillas, IA, importacion, exportacion y flujo mobile/web profesional. |
| Contenido / Hub de Recursos | Hub transversal para planeaciones, recursos, entregables y plantillas. | Convertirse en un centro claro, sin flujos duplicados ni rutas legacy escondidas. |
| Recursos Didacticos / Biblioteca | Existen lista, creacion, contexto y ViewModels. | Gestionar diapositivas, PDFs, videos, notas, mapas mentales y lineas de tiempo. |
| Recursos Evaluables / Tareas / Entregables | Hay tareas dentro de grupos, entregables, calificacion y asignacion de recursos. | Examenes, trabajos, rubricas, proyectos, revision, asignacion y calificacion conectada con alumnos. |
| Grupos | Modulo amplio con dashboard, lista, detalle, reportes, importacion y tareas. | Ser el centro operativo de grupos, alumnos, asistencia, calificaciones y entregables. |
| Alumnos | CRUD, detalle, notas, importacion, exportacion y reportes. | Perfil academico completo con historial, estadisticas y conexion a todos los modulos. |
| Asistencia | Registro e historial. | Control rapido por grupo, reportes y sincronizacion offline robusta. |
| Calificaciones | Captura y promedios. | Calificaciones conectadas con rubricas, entregables, reportes y analitica. |
| Plantillas | Biblioteca, lista, detalle y editor legacy/generico. | Ecosistema de plantillas reutilizables, importables, compartibles y sanitizadas. |
| Feed / Red Social Educativa | Feed, detalle de posts, retos, preguntas y resultados. | Comunidad docente para compartir recursos, ideas, retos y materiales. |
| Social / Contactos | Pantalla social, buscador de perfiles e invitaciones. | Red de contactos docentes con colaboracion y permisos claros. |
| Chat / Mensajeria | Lista de chats y conversacion; puede compartir texto, planeaciones y recursos. | Mensajeria docente con privacidad, adjuntos educativos y sync estable. |
| Notificaciones | Contexto, pantalla y servicio push. | Alertas utiles, configurables y compatibles con dev builds. |
| Cuenta, Perfil y Accesibilidad | Perfil, roles, terminos, tema, fuente y daltonismo. | Configuracion profesional, accesible y separada entre perfil publico y privacidad. |
| Auth / Seguridad | Login, registro, recuperacion, AuthContext y backend auth. | Auth real endurecida con JWT, almacenamiento seguro, emails y recuperacion confiable. |
| Onboarding y Ayuda | Existen pantallas de onboarding y ayuda. | Guias actualizadas segun los flujos reales de la app. |
| Infraestructura, Sync y Backend | Vercel serverless, MongoDB Atlas, endpoints por modulo y sync local/remoto. | Infraestructura de bajo costo, facil de lanzar y con opcion de self-hosting local/Docker cuando convenga. |
| UX/UI y Navegacion Global | Reglas nuevas en la meta guia. | Asegurar que ningun modulo quede aislado, redundante o dificil de encontrar. |

---

## Principios de Producto

- **Offline-first:** la app debe poder funcionar sin internet y sincronizar despues.
- **Docente primero:** cada flujo debe ahorrar tiempo real a un profesor.
- **IA como copiloto:** la IA propone, mejora, revisa o transforma; el docente conserva control.
- **Editor real, no solo formularios:** los modulos de creacion deben evolucionar hacia experiencias tipo herramienta profesional.
- **Navegacion cuidada:** cada modulo debe tener entradas, salidas, CTAs y rutas claras.
- **Sin legacy innecesario:** si una pantalla vieja duplica una nueva, se elimina, oculta o redirige.
- **Bajo costo:** priorizar free tiers, servicios simples y despliegues que un estudiante pueda mantener.
- **Escalable sin sobredisenar:** construir profesionalmente, pero sin complejidad prematura.

---

## Arquitectura

| Capa | Tecnologia | Descripcion |
| ---- | ---------- | ----------- |
| Frontend | React Native 0.81.5 + Expo 54 | App cross-platform para Android, iOS y web. |
| Lenguaje | TypeScript 5.9.2 | Tipado estatico y modelos compartidos. |
| Navegacion | React Navigation 7.x | Stack navigator y bottom tabs. |
| Estado | React Context + hooks | MVVM: screens delgadas, hooks como ViewModels. |
| Storage local | AsyncStorage | Fuente local para offline-first. |
| Backend | Vercel Serverless | Endpoints Node.js por modulo. |
| Base de datos | MongoDB Atlas M0 | Persistencia remota de bajo costo. |
| Auth | JWT | Aislamiento por `userId` en endpoints. |
| Sync | `src/sync` + endpoints `/api/sync` | Sincronizacion local/remota. |
| Editor | `@10play/tentap-editor`, TipTap, WebView | Base para editor enriquecido tipo Docs/Word. |
| Exportacion/importacion | `docx`, `expo-print`, `expo-file-system`, `mammoth`, `pdfjs-dist`, `xlsx` | Documentos, plantillas, reportes y datos. |
| Testing | Jest + Testing Library | Tests unitarios y de integracion. |

### Patron MVVM

```
Screen/View -> hook ViewModel -> Context/Service -> AsyncStorage/API -> MongoDB Atlas
```

Reglas actuales:

- Las pantallas no deben concentrar logica pesada.
- Los hooks controlan estado, validaciones, acciones y side effects.
- Los contexts coordinan estado compartido por modulo.
- Los services encapsulan I/O, importacion, exportacion, IA, sync y API.
- Los tipos deben vivir centralizados en `types/`.

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

Cada plan futuro debe documentar proveedor, modelo, variables de entorno, prompts, fallback si no hay API key, costo aproximado y validacion humana. El backend ya cuenta con un gateway IA multi-provider para Planeaciones (`backend/lib/aiGateway.js`) y un limite por accion configurable (`AI_MAX_REQUESTS_PER_ACTION`, default 10), por lo que los nuevos modulos deben intentar reutilizar esa capa antes de crear integraciones aisladas. El modo dev puede ampliar el limite con advertencia visible, pero invitados y usuarios registrados deben conservar limites conservadores.

---

## Estrategia de Refactorizacion

Cada modulo importante debe tener su propio plan maestro, siguiendo el estandar de `Documentacion/meta_guia_planes.md`.

Todo plan debe incluir:

- Analisis del ground truth.
- Inventario del codigo actual.
- Decisiones tecnicas.
- Modelo de datos objetivo.
- UX/UI objetivo.
- Mapa de navegacion y UX/UI global.
- IA y automatizacion.
- Offline-first y sync.
- Costos e infraestructura.
- Limpieza legacy.
- Fases con tracking markdown: `[ ]`, `[~]`, `[x]`.
- Criterios de validacion y cierre.

Planes actuales:

| Plan | Archivo | Estado |
| ---- | ------- | ------ |
| Planeaciones | [`plan_planeaciones.md`](./plan_planeaciones.md) | Activo, Fase 9 pendiente/en preparacion. |
| Meta guia de planes | [`Documentacion/meta_guia_planes.md`](./Documentacion/meta_guia_planes.md) | Vigente, define reglas para futuros planes. |

---

## Roadmap

### Corto plazo

- Cerrar Fase 9 de Planeaciones.
- Corregir WebView en web y error de maximum update depth en movil.
- Convertir el editor de planeaciones en una experiencia centrada en documento.
- Eliminar flujos legacy y duplicados al crear/editar planeaciones.
- Asegurar plantilla predeterminada y selector de plantillas.
- Probar botones de IA y documentar API keys requeridas.

### Mediano plazo

- Profesionalizar Recursos Evaluables.
- Profesionalizar Recursos Didacticos.
- Reforzar Grupos, Alumnos, Asistencia y Calificaciones.
- Mejorar Feed, Social, Chat y Notificaciones.
- Endurecer Auth, Seguridad, Cuenta y Accesibilidad.
- Crear un plan global de UX/UI y navegacion si los flujos empiezan a fragmentarse.

### Largo plazo

- Evaluar infraestructura final: Vercel, servidor propio, Docker, FastAPI, Azure o GitHub Actions segun costo y facilidad de entrega.
- Preparar despliegue web y distribucion en app stores.
- Crear landing page y documentacion de lanzamiento.
- Agregar analitica, crash reporting y monitoreo basico.

---

## Instalacion

### Prerrequisitos

```bash
node --version   # >= 18.x
npm --version    # >= 9.x
```

### Setup

```bash
git clone https://github.com/RitualBoat/PlanearIA.git
cd PlanearIA
npm install

cd backend
npm install
cd ..
```

### Ejecutar

```bash
npx expo start
npm run start:dev
npm run android
npm run ios
npm run web
```

Notas:

- `npm run start:dev` es recomendado para funciones nativas avanzadas.
- iOS requiere Mac + Xcode.
- Algunas funciones push o nativas pueden requerir dev build, no solo Expo Go.

### Variables de entorno

```bash
cp .env.example .env
```

Configurar credenciales de MongoDB Atlas, endpoints y claves de IA cuando el modulo las requiera.

---

## Estructura del Proyecto

```text
PlanearIA/
+-- App.tsx
+-- README.md
+-- plan_planeaciones.md
+-- Documentacion/
|   +-- README.md
|   +-- ARQUITECTURA.md
|   +-- FLUJO_SINCRONIZACION.md
|   +-- DIAGRAMA_NAVEGACION.md
|   +-- MAPA_NAVEGACION.md
|   +-- GUIA_PRUEBAS.md
|   +-- meta_guia_planes.md
+-- backend/
|   +-- api/
|   +-- lib/
+-- context/
|   +-- planeaciones-reales/
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
| [`Documentacion/README.md`](./Documentacion/README.md) | Indice tecnico de documentacion. |
| [`Documentacion/meta_guia_planes.md`](./Documentacion/meta_guia_planes.md) | Guia maestra para planes futuros por modulo. |
| [`Documentacion/PLANEACIONES_IA_EDITOR_FASE9.md`](./Documentacion/PLANEACIONES_IA_EDITOR_FASE9.md) | Ground truth de IA en Planeaciones + criterio de aceptacion del editor Word/Docs en Fase 9. |
| [`Documentacion/ARQUITECTURA.md`](./Documentacion/ARQUITECTURA.md) | Arquitectura del sistema y decisiones tecnicas. |
| [`Documentacion/FLUJO_SINCRONIZACION.md`](./Documentacion/FLUJO_SINCRONIZACION.md) | Flujo offline-first y sincronizacion. |
| [`Documentacion/DIAGRAMA_NAVEGACION.md`](./Documentacion/DIAGRAMA_NAVEGACION.md) | Diagrama de navegacion. |
| [`Documentacion/MAPA_NAVEGACION.md`](./Documentacion/MAPA_NAVEGACION.md) | Mapa de rutas entre modulos. |
| [`Documentacion/GUIA_PRUEBAS.md`](./Documentacion/GUIA_PRUEBAS.md) | Guia de pruebas. |

---

## Validacion

Comandos habituales:

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm test -- --runInBand
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

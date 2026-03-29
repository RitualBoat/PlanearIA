# AUDITORÍA COMPLETA DEL PROYECTO — PlanearIA

**Fecha:** Junio 2025  
**Alcance:** Todos los archivos fuente del proyecto  
**Total de archivos auditados:** ~60 archivos (.tsx, .ts, .js, .json, .md)

---

## TABLA DE CONTENIDOS

1. [Tech Stack](#1-tech-stack)
2. [Arquitectura y Patrones](#2-arquitectura-y-patrones)
3. [Modelos de Datos / Tipos](#3-modelos-de-datos--tipos)
4. [Estructura de Navegación](#4-estructura-de-navegación)
5. [Capa de Persistencia y Sincronización](#5-capa-de-persistencia-y-sincronización)
6. [Backend / API Endpoints](#6-backend--api-endpoints)
7. [Inventario de Pantallas, Componentes, Hooks y Servicios](#7-inventario-detallado)
8. [Estado de Cada Feature](#8-estado-de-cada-feature)
9. [Problemas y Deuda Técnica](#9-problemas-y-deuda-técnica)
10. [Resumen Ejecutivo](#10-resumen-ejecutivo)

---

## 1. TECH STACK

### Frontend (App Móvil + Web)

| Tecnología                     | Versión          | Notas                                   |
| ------------------------------ | ---------------- | --------------------------------------- |
| React Native                   | 0.81.5           | `newArchEnabled: true`                  |
| Expo                           | SDK 54 (54.0.21) | Managed workflow con `expo-dev-client`  |
| React                          | 19.1.0           | Última versión estable                  |
| TypeScript                     | ~5.9.2           | Tipado estricto                         |
| @react-navigation/stack        | 7.4.8            | Navegación stack-only                   |
| @react-navigation/native       | 7.1.17           | Base de navegación                      |
| AsyncStorage                   | 2.2.0            | Persistencia local principal            |
| NetInfo                        | 11.4.1           | Detección de conectividad               |
| react-native-reanimated        | 4.1.2            | Animaciones (importado pero poco usado) |
| react-native-gesture-handler   | 2.28.0           | Gestos                                  |
| react-native-safe-area-context | 5.4.0            | SafeAreaView                            |
| react-native-screens           | 4.11.1           | Optimización de pantallas               |
| @expo/vector-icons             | —                | Iconografía (MaterialIcons)             |
| Realm + @realm/react           | 12.15.0 / 0.11.0 | **INSTALADO PERO NO USADO**             |

### Backend (Serverless)

| Tecnología                  | Versión | Notas                    |
| --------------------------- | ------- | ------------------------ |
| Node.js                     | —       | Runtime Vercel           |
| Vercel Serverless Functions | —       | 3 endpoints bajo `/api/` |
| MongoDB Atlas (driver)      | 6.3.0   | Base de datos en la nube |
| CORS handling               | Manual  | En `lib/auth.js`         |

### Herramientas de Desarrollo

| Herramienta     | Notas                             |
| --------------- | --------------------------------- |
| Expo CLI        | Scripts: start, android, ios, web |
| expo-dev-client | Para builds custom                |
| TypeScript      | Hereda de `expo/tsconfig.base`    |

---

## 2. ARQUITECTURA Y PATRONES

### Patrón MVVM (Model-View-ViewModel)

El proyecto sigue un patrón **MVVM** consistente:

- **View (Screen):** Solo JSX + StyleSheet. Cero lógica de negocio. Importa un hook ViewModel.
- **ViewModel (useXxxViewModel hook):** Toda la lógica: estado, validación, efectos, navegación.
- **Model:** Tipos en `types/`, datos en AsyncStorage vía Context/Service.

**Ejemplo típico:**

```
CrearTareaGrupoScreen.tsx  →  useCrearTareaGrupoViewModel.ts  →  gruposService.ts / Context
         (View)                      (ViewModel)                       (Model)
```

### Gestión de Estado

- **PlaneacionesContext** (`src/context/PlaneacionesContext.tsx`): Context básico con CRUD para planeaciones + AsyncStorage.
- **SyncProvider** (`src/sync/providers/SyncProvider.tsx`): Wrapper que extiende PlaneacionesContext con capacidad de sincronización. **Este es el provider ACTIVO** usado en `App.tsx`.
- **gruposService** (`src/services/gruposService.ts`): Servicio standalone con AsyncStorage para grupos (no usa Context).
- **NO hay Redux, Zustand, ni MobX.** Todo es Context API + hooks.

### Estructura de Providers en App.tsx

```
SyncProvider
  └── PlaneacionesProvider
        └── NavigationContainer
              └── StackNavigator
```

### Responsive

Utilidad en `src/utils/responsive.ts`:

- `isWeb()` — detecta plataforma web
- `isLargeScreen()` — ≥768px
- `responsive(mobile, tablet, web)` — valores por plataforma

---

## 3. MODELOS DE DATOS / TIPOS

### Archivo: `types/index.ts` (536 líneas)

#### Tipos Base

- `ID = number`
- `Carrera = "ISC" | "IGE" | "ARQ" | "ITICS"`
- `BaseEntity { id: ID; createdAt: string; updatedAt: string; }`

#### Entidades Principales

| Entidad                  | Campos Clave                                                                            | Estado                                   |
| ------------------------ | --------------------------------------------------------------------------------------- | ---------------------------------------- |
| `Grupo`                  | id, nombre, materia, carrera, semestre, periodo, horario, alumnos[], tareas[], activo   | **Usado activamente**                    |
| `Alumno`                 | id, nombre, apellidos, matricula, email, carrera, semestre, activo, foto                | Definido, usado solo como dato hardcoded |
| `Tarea`                  | id, titulo, descripcion, tipo, valor, fechaAsignacion, fechaEntrega, grupoId, recursoId | Definido, usado como dato hardcoded      |
| `EntregaTarea`           | id, tareaId, alumnoId, archivo, calificacion, retroalimentacion, estado                 | Definido, datos hardcoded                |
| `Recurso`                | id, titulo, tipo, contenido, metadata, tags, compartido                                 | Definido, datos hardcoded                |
| `Calificacion`           | id, alumnoId, grupoId, tipo, valor, fecha, periodo                                      | Definido, no implementado                |
| `Asistencia`             | id, alumnoId, grupoId, fecha, presente, justificacion                                   | Definido, no implementado                |
| `ComentarioAlumno`       | id, alumnoId, grupoId, texto, tipo, fecha                                               | Definido, no implementado                |
| `Usuario`                | id, nombre, email, rol, configuracion                                                   | Definido, no implementado                |
| `ConfiguracionSeguridad` | pin, biometrico, autoLogout                                                             | Definido, no implementado                |

#### Tipos de UI

- `CardProps`, `ModalProps`, `ListItemProps` — Genéricos para componentes
- `LoadingState`, `ErrorState`, `ScreenState<T>` — Estados de pantalla
- `COLORS` — Tema azul (#2563EB primary, #F0F7FF background)
- `FONT_SIZES` — 5 tamaños (small→xxlarge)

#### FormData Types

- `GrupoFormData`, `AlumnoFormData`, `TareaFormData`, `RecursoFormData`, `CalificacionRegistro`

### Archivo: `types/planeacion.ts` (~180 líneas)

#### Niveles Académicos

```typescript
enum NivelAcademico {
  PRIMARIA = "primaria",
  SECUNDARIA = "secundaria",
  PREPARATORIA = "preparatoria",
  UNIVERSIDAD = "universidad",
}
```

#### Jerarquía de Planeación

- `PlaneacionBase` — Campos comunes: id, titulo, asignatura, grado, nivel, objetivos, temas, etc.
- `PlaneacionPrimaria` extends PlaneacionBase — + competencias, actividadesLudicas, evaluacionCualitativa
- `PlaneacionSecundaria` extends PlaneacionBase — + competencias, proyectos, evaluacionFormativa
- `PlaneacionPreparatoria` extends PlaneacionBase — + competenciasDisciplinares, actividadesExperimentales
- `PlaneacionUniversidad` extends PlaneacionBase — + configuracionCurso, semanas[], evaluaciones[], bibliografía

#### Tipos Específicos de Universidad

- `ConfiguracionCurso` — duracionSemanas, horasTeoria, horasPractica, creditos, modalidad, prerequisitos
- `SemanaUniversitaria` — numero, temas[], objetivos[], actividadesPresenciales[], actividadesAutonomas[], recursos[], horasPresenciales, horasAutonomas
- `Evaluacion` — tipo, nombre, porcentaje, semana, descripcion, criterios[]
- `TipoEvaluacion` enum — 8 tipos (examen_parcial, examen_final, proyecto, tarea, practica, exposicion, participacion, otro)

#### Tipos Auxiliares

- `FiltrosPlaneacion` — nivel, asignatura, grado
- `EstadisticasPlaneaciones` — total, por nivel, última modificación
- `Planeacion` = Union type de los 4 niveles

---

## 4. ESTRUCTURA DE NAVEGACIÓN

### Tipo: Stack Navigator Único (sin tabs)

**Archivo:** `src/navigation/StackNavigator.tsx` (349 líneas)

Todas las pantallas usan `headerShown: false` con un `BottomNavBar` custom en cada screen.

### Mapa de Rutas

```
RootStackParamList:
│
├── Login (initial)
├── Home
│
├── ── Planeaciones ──
│   ├── Planeaciones          (hub)
│   ├── CrearPlaneacion       (wizard)
│   ├── EditorPlaneacion      (params: nivel, modo?, planeacionId?)
│   └── ListaPlaneaciones     (list + CRUD)
│
├── ── Grupos (v3.0) ──
│   ├── Grupos                (hub)
│   ├── ListaGrupos           (searchable list)
│   ├── CrearGrupo            (form)
│   ├── DetalleGrupo          (params: grupoId, grupoNombre → tabbed detail)
│   │
│   ├── CrearTareaGrupo       (params: grupoId)
│   ├── AsignarRecurso        (params: grupoId)
│   ├── DetalleTarea          (params: tareaId, grupoId)
│   └── CalificarEntregas     (params: tareaId, grupoId)
│
├── ── Recursos/Biblioteca ──
│   ├── RecursosDidacticos    (hub)
│   ├── Examenes              (creation options)
│   ├── Presentaciones        (creation options)
│   ├── MapasMentales         (creation options)
│   ├── LineasTiempo          (creation options)
│   └── ListaRecursos         (list view)
│
├── Cuenta                    (profile/settings)
│
└── ── DEPRECATED ──
    ├── Alumnos               (standalone — replaced by Grupos)
    ├── Calificaciones        (standalone — replaced by Grupos)
    └── Tareas                (standalone — replaced by Grupos)
```

### BottomNavBar

Barra inferior custom con:

- Botón atrás (flecha ←)
- Título de la pantalla actual
- Botón Home (casa 🏠)

**No existe Tab Navigator.** La navegación Home → secciones es vía cards/botones.

---

## 5. CAPA DE PERSISTENCIA Y SINCRONIZACIÓN

### Almacenamiento Local (AsyncStorage)

| Clave de Storage          | Contenido                           | Gestionado por                     |
| ------------------------- | ----------------------------------- | ---------------------------------- |
| `@planearia:planeaciones` | Array de Planeacion[] serializado   | PlaneacionesContext / SyncProvider |
| `@planearia:sync_pending` | PendingOperation[]                  | syncService                        |
| `@planearia:sync_last`    | ISO timestamp última sync           | syncService                        |
| `@planearia:device_id`    | Identificador único del dispositivo | syncService                        |
| `@planearia:grupos`       | Array de Grupo[] serializado        | gruposService                      |

### Flujo de Sincronización

```
[Usuario realiza CRUD]
        │
        ▼
[SyncProvider] ── guarda en AsyncStorage
        │         ── encola PendingOperation
        │
        ▼
[useSync hook] ── cada 60s verifica pendientes
        │         ── al reconectarse a internet
        │         ── al pulsar botón manual
        │
        ▼
[syncService.fullSync()]
        │
        ├── POST /api/sync con { deviceId, lastSync, operations[] }
        │
        ├── Servidor procesa operaciones → devuelve cambios remotos
        │
        ├── mergeServerChanges() → fusión por fechaModificacion (más reciente gana)
        │
        └── Limpia pendientes, actualiza lastSync
```

### Estado de Sincronización (SyncStatus)

```typescript
type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";
```

Expuesto por `SyncProvider` y visualizado por `SyncStatusBadge` / `SyncIndicator` components.

### Realm (NO ACTIVO)

- `realm` y `@realm/react` están instalados en `package.json`
- `SyncIndicatorRealm.tsx` importa desde `../realm` que **no existe** como directorio
- **Realm NO se usa en ninguna ruta de código activa**
- Parece ser un plan futuro abandonado o no iniciado

### Nota sobre Grupos

Los grupos usan `gruposService.ts` con AsyncStorage directamente, **sin sincronización con el backend**. Solo las planeaciones tienen sync implementado.

---

## 6. BACKEND / API ENDPOINTS

### Infraestructura

- **Hosting:** Vercel (serverless functions)
- **Base de Datos:** MongoDB Atlas (database: `planeariaDB`)
- **URL Base:** `https://backend-eight-chi-54.vercel.app`
- **Autenticación:** API Key vía header `X-API-Key` (valor: `planearia-dev-secret-2025`)
- **CORS:** Habilitado para todos los orígenes (`*`)

### Endpoints

#### `GET /api/health`

- **Función:** Health check
- **Respuesta:** `{ success: true, data: { status: "ok", timestamp, database: "connected" } }`

#### `GET /api/planeaciones`

- **Función:** Listar planeaciones
- **Query params:** `id` (opcional, una sola), `desde` (ISO timestamp para sync incremental), `page`, `limit`
- **Respuesta:** Array de planeaciones con paginación

#### `POST /api/planeaciones`

- **Función:** Crear planeación (upsert por id)
- **Body:** Objeto Planeacion
- **Respuesta:** Planeación guardada

#### `PUT /api/planeaciones`

- **Función:** Actualizar planeación (upsert)
- **Body:** Objeto Planeacion con id
- **Respuesta:** Planeación actualizada

#### `DELETE /api/planeaciones`

- **Función:** Eliminar planeación
- **Query param:** `id`
- **Respuesta:** Confirmación

#### `POST /api/sync`

- **Función:** Sincronización batch bidireccional
- **Body:** `{ deviceId, lastSync, operations: PendingOperation[] }`
- **Lógica:**
  1. Procesa cada operación (create/update/delete)
  2. Busca cambios en servidor desde `lastSync` excluyendo mismo `deviceId`
  3. Retorna cambios descargados + conteo de subidos
- **Respuesta:** `{ success, data: { uploaded, downloaded[], serverTime, errors[] } }`

### Autenticación (`lib/auth.js`)

```javascript
// Middleware de autenticación
function authenticate(req) {
  const apiKey = req.headers["x-api-key"];
  return apiKey === process.env.API_SECRET || apiKey === "planearia-dev-secret-2025";
}
```

La API key está hardcodeada tanto en el backend como en el frontend. No hay autenticación de usuarios.

### MongoDB (`lib/mongodb.js`)

- Connection pooling con caché global (`global._mongoClient`)
- Database: `planeariaDB`
- Colección usada: `planeaciones`

---

## 7. INVENTARIO DETALLADO

### PANTALLAS (Screens)

| #   | Pantalla                     | Archivo                                             | ViewModel                       | Estado                                    |
| --- | ---------------------------- | --------------------------------------------------- | ------------------------------- | ----------------------------------------- |
| 1   | **LoginScreen**              | `screens/auth/LoginScreen.tsx`                      | `useLoginViewModel`             | ⚠️ UI completa, auth FALSA                |
| 2   | **HomeScreen**               | `screens/home/HomeScreen.tsx`                       | `useHomeViewModel`              | ✅ Funcional                              |
| 3   | **PlaneacionesScreen**       | `screens/planeaciones/PlaneacionesScreen.tsx`       | — (inline)                      | ✅ Hub funcional                          |
| 4   | **CrearPlaneacionScreen**    | `screens/planeaciones/CrearPlaneacionScreen.tsx`    | `useCrearPlaneacionViewModel`   | ⚠️ Parcial — IA no funciona               |
| 5   | **EditorPlaneacionScreen**   | `screens/planeaciones/EditorPlaneacionScreen.tsx`   | `useEditorPlaneacionViewModel`  | ✅ Completo (4 niveles + weeks)           |
| 6   | **ListaPlaneacionesScreen**  | `screens/planeaciones/ListaPlaneacionesScreen.tsx`  | `useListaPlaneacionesViewModel` | ⚠️ CRUD funcional, export no implementado |
| 7   | **GruposScreen**             | `screens/grupos/GruposScreen.tsx`                   | — (inline)                      | ✅ Hub funcional                          |
| 8   | **ListaGruposScreen**        | `screens/grupos/ListaGruposScreen.tsx`              | `useGrupos`                     | ✅ Funcional (datos seed)                 |
| 9   | **CrearGrupoScreen**         | `screens/grupos/CrearGrupoScreen.tsx`               | `useCrearGrupoViewModel`        | ❌ Save es TODO                           |
| 10  | **DetalleGrupoScreen**       | `screens/grupos/DetalleGrupoScreen.tsx`             | `useDetalleGrupoViewModel`      | ❌ 6 tabs, TODO hardcoded                 |
| 11  | **CrearTareaGrupoScreen**    | `screens/grupos/tareas/CrearTareaGrupoScreen.tsx`   | `useCrearTareaGrupoViewModel`   | ❌ UI completa, save es TODO              |
| 12  | **AsignarRecursoScreen**     | `screens/grupos/tareas/AsignarRecursoScreen.tsx`    | — (inline)                      | ❌ Datos hardcoded, asignar es TODO       |
| 13  | **DetalleTareaScreen**       | `screens/grupos/tareas/DetalleTareaScreen.tsx`      | — (inline)                      | ❌ Datos hardcoded, solo UI               |
| 14  | **CalificarEntregasScreen**  | `screens/grupos/tareas/CalificarEntregasScreen.tsx` | `useCalificarEntregasViewModel` | ❌ Datos hardcoded, save es TODO          |
| 15  | **RecursosDidacticosScreen** | `screens/biblioteca/RecursosDidacticosScreen.tsx`   | — (inline)                      | ✅ Hub funcional                          |
| 16  | **ExamenesScreen**           | `screens/biblioteca/ExamenesScreen.tsx`             | — (inline)                      | ❌ Solo placeholder UI                    |
| 17  | **PresentacionesScreen**     | `screens/biblioteca/PresentacionesScreen.tsx`       | — (inline)                      | ❌ Solo placeholder UI                    |
| 18  | **MapasMentalesScreen**      | `screens/biblioteca/MapasMentalesScreen.tsx`        | — (inline)                      | ❌ Solo placeholder UI                    |
| 19  | **LineasTiempoScreen**       | `screens/biblioteca/LineasTiempoScreen.tsx`         | — (inline)                      | ❌ Solo placeholder UI                    |
| 20  | **ListaRecursosScreen**      | `screens/biblioteca/ListaRecursosScreen.tsx`        | `useListaRecursosViewModel`     | ❌ Datos hardcoded                        |
| 21  | **CuentaScreen**             | `screens/cuenta/CuentaScreen.tsx`                   | `useCuentaViewModel`            | ❌ Solo logout funciona                   |
| 22  | **AlumnosScreen**            | `screens/alumnos/AlumnosScreen.tsx`                 | —                               | 🗑️ DEPRECATED                             |
| 23  | **CalificacionesScreen**     | `screens/calificaciones/CalificacionesScreen.tsx`   | —                               | 🗑️ DEPRECATED                             |
| 24  | **TareasScreen**             | `screens/tareas/TareasScreen.tsx`                   | —                               | 🗑️ DEPRECATED                             |

### COMPONENTES (Components)

| #   | Componente             | Archivo                                      | Descripción                                   | Estado                                     |
| --- | ---------------------- | -------------------------------------------- | --------------------------------------------- | ------------------------------------------ |
| 1   | **BottomNavBar**       | `components/BottomNavBar.tsx`                | Barra inferior: atrás + título + home         | ✅ Funcional                               |
| 2   | **WebScrollView**      | `components/WebScrollView.tsx`               | ScrollView adaptado a web/mobile              | ✅ Funcional                               |
| 3   | **SemanaEditor**       | `components/SemanaEditor.tsx` (683 lín.)     | Editor de semana universitaria con templates  | ✅ Completo y complejo                     |
| 4   | **EvaluacionEditor**   | `components/EvaluacionEditor.tsx` (656 lín.) | Editor de plan de evaluación con % validation | ✅ Completo y complejo                     |
| 5   | **SyncIndicator**      | `components/SyncIndicator.tsx`               | Badge de status sync (cloud icons)            | ✅ Funcional                               |
| 6   | **SyncIndicatorRealm** | `components/SyncIndicatorRealm.tsx`          | Indicador sync para Realm                     | ❌ ROTO — importa `../realm` que no existe |
| 7   | **SyncStatusBadge**    | `components/SyncStatusBadge.tsx`             | Badge sync mejorado con conteo pendientes     | ✅ Funcional                               |

### HOOKS (ViewModels)

| #   | Hook                              | Archivo                                            | Responsabilidad                                                                    | Estado                                  |
| --- | --------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | **useLoginViewModel**             | `hooks/useLoginViewModel.ts`                       | Auth falsa (setTimeout 2s), form validation                                        | ⚠️ Auth no real                         |
| 2   | **useHomeViewModel**              | `hooks/useHomeViewModel.ts`                        | Menu options, logout, navegación                                                   | ✅ Funcional                            |
| 3   | **useCrearPlaneacionViewModel**   | `hooks/useCrearPlaneacionViewModel.ts`             | Selector nivel, modales, nav a editor                                              | ✅ Funcional                            |
| 4   | **useEditorPlaneacionViewModel**  | `hooks/useEditorPlaneacionViewModel.ts` (656 lín.) | Toda la lógica del editor: form state, semanas, evaluaciones, save, load, validate | ✅ Completo                             |
| 5   | **useListaPlaneacionesViewModel** | `hooks/useListaPlaneacionesViewModel.ts`           | Filtros, CRUD delegado a context, formateo fechas                                  | ✅ Funcional                            |
| 6   | **useGrupos**                     | `hooks/useGrupos.ts`                               | CRUD grupos via gruposService, búsqueda, loading/error                             | ✅ Funcional                            |
| 7   | **useCrearGrupoViewModel**        | `hooks/useCrearGrupoViewModel.ts`                  | Form state para grupo nuevo                                                        | ❌ Save es console.log                  |
| 8   | **useDetalleGrupoViewModel**      | `hooks/useDetalleGrupoViewModel.ts`                | Tab management, nav a tareas                                                       | ✅ Funcional (pero datos son hardcoded) |
| 9   | **useCuentaViewModel**            | `hooks/useCuentaViewModel.ts`                      | Profile/password options                                                           | ❌ Solo logout funciona                 |
| 10  | **useListaRecursosViewModel**     | `hooks/useListaRecursosViewModel.ts`               | Búsqueda, icon/color mapping                                                       | ⚠️ Solo utilidades, sin datos reales    |
| 11  | **useCrearTareaGrupoViewModel**   | `hooks/useCrearTareaGrupoViewModel.ts`             | Form state para tarea nueva                                                        | ❌ Save es console.log                  |
| 12  | **useCalificarEntregasViewModel** | `hooks/useCalificarEntregasViewModel.ts`           | 3 entregas hardcoded, form state                                                   | ❌ Save es console.log                  |

### SERVICIOS

| #   | Servicio          | Archivo                                    | Responsabilidad                                                 | Estado                          |
| --- | ----------------- | ------------------------------------------ | --------------------------------------------------------------- | ------------------------------- |
| 1   | **gruposService** | `services/gruposService.ts` (~180 lín.)    | CRUD AsyncStorage para grupos. Inicializa con 3 grupos ejemplo. | ✅ Funcional (sin sync backend) |
| 2   | **syncService**   | `sync/services/syncService.ts` (~280 lín.) | API client, pending ops, fullSync, merge, health check          | ✅ Funcional para planeaciones  |

### CONTEXT / PROVIDERS

| #   | Provider                 | Archivo                           | Responsabilidad                       | Activo                        |
| --- | ------------------------ | --------------------------------- | ------------------------------------- | ----------------------------- |
| 1   | **PlaneacionesProvider** | `context/PlaneacionesContext.tsx` | CRUD planeaciones + AsyncStorage      | Sí (wrapped by SyncProvider)  |
| 2   | **SyncProvider**         | `sync/providers/SyncProvider.tsx` | Extiende PlaneacionesContext con sync | Sí (provider raíz en App.tsx) |

---

## 8. ESTADO DE CADA FEATURE

### ✅ PLANEACIONES — 85% Completo

**Lo que funciona:**

- Crear planeación manual para los 4 niveles académicos (primaria, secundaria, preparatoria, universidad)
- Editor completo con campos específicos por nivel
- Modo universidad con configuración de curso detallada (semanas, horas, créditos, modalidad)
- Editor de semanas (SemanaEditor) con templates rápidos y listas editables
- Editor de evaluaciones (EvaluacionEditor) con validación de porcentajes (suma = 100%)
- Modos: "Desde cero" (simple) y "Detallado semana por semana" (universidad)
- Guardar/editar/eliminar planeaciones en AsyncStorage
- Listar planeaciones con filtros (nivel, asignatura, grado)
- Clonar planeaciones
- Sincronización bidireccional con MongoDB Atlas

**Lo que NO funciona:**

- ❌ "Generar con IA" — Modal de selección existe pero no hace nada
- ❌ Exportar planeación — Muestra alerta "próximamente"
- ❌ Sin validación de campos obligatorios en el editor (solo verifica título)

### ⚠️ GRUPOS — 40% Completo

**Lo que funciona:**

- Listar grupos con búsqueda
- Ver detalle de grupo con 6 tabs (UI completa)
- Servicio CRUD completo en AsyncStorage (gruposService)
- Navegación entre pantallas de grupo

**Lo que NO funciona:**

- ❌ Crear grupo — Form existe pero `handleGuardar` es `console.log`
- ❌ Todas las tabs del detalle muestran datos HARDCODED (no conectados a storage)
- ❌ Sin sincronización con backend (solo planeaciones tienen sync)
- ❌ Sin CRUD real de alumnos dentro de un grupo
- ❌ Sin registro real de asistencias
- ❌ Sin registro real de calificaciones por grupo
- ❌ Sin comentarios reales de alumnos
- ❌ La gráfica de "Gráficas" tab es solo placeholder

### ❌ TAREAS DE GRUPO — 15% Completo

**Lo que funciona:**

- UI de todas las pantallas (crear, detalle, asignar recurso, calificar)
- Patrón MVVM aplicado correctamente

**Lo que NO funciona:**

- ❌ Crear tarea — save es `console.log`
- ❌ Detalle tarea — datos totalmente hardcoded
- ❌ Asignar recurso — datos hardcoded, asignación es TODO
- ❌ Calificar entregas — datos hardcoded, save es `console.log`
- ❌ Sin servicio de persistencia para tareas
- ❌ Sin conexión entre tareas y grupos almacenados

### ❌ RECURSOS DIDÁCTICOS / BIBLIOTECA — 10% Completo

**Lo que funciona:**

- Hub de navegación entre 4 tipos de recursos
- UI de opciones de creación (IA, Plantilla, Manual) en cada tipo
- Lista de recursos con búsqueda (datos hardcoded)

**Lo que NO funciona:**

- ❌ Crear examen — placeholder (`console.log`)
- ❌ Crear presentación — placeholder
- ❌ Crear mapa mental — placeholder
- ❌ Crear línea de tiempo — placeholder
- ❌ Sin servicio de persistencia para recursos
- ❌ Sin generación con IA
- ❌ Sin templates reales
- ❌ Sin creación manual
- ❌ Lista de recursos muestra datos inventados

### ❌ AUTENTICACIÓN — 5% Completo

**Lo que funciona:**

- UI de login (username + password form)
- Navegación Login → Home

**Lo que NO funciona:**

- ❌ Auth es FALSA — `setTimeout(2000)` simula login, cualquier credencial funciona
- ❌ Sin registro de usuarios
- ❌ Sin recuperación de contraseña
- ❌ Sin backend de autenticación
- ❌ Sin tokens/JWT
- ❌ Sin sesión persistente (refrescar = volver al login)

### ❌ CUENTA / PERFIL — 5% Completo

**Lo que funciona:**

- UI con 3 opciones
- Logout (navega a Login)

**Lo que NO funciona:**

- ❌ Editar perfil — `console.log` only
- ❌ Cambiar contraseña — `console.log` only
- ❌ Sin modelo de usuario persistido

### ✅ SINCRONIZACIÓN — 70% Completo (solo para planeaciones)

**Lo que funciona:**

- Pendiente operations queue en AsyncStorage
- Auto-sync cada 60s cuando hay conexión
- Sync al reconectarse a internet
- Sync manual (botón en SyncStatusBadge)
- Health check de API
- Merge por fecha de modificación (más reciente gana)
- Deduplicación de operaciones pendientes
- Device ID tracking
- Backend sync endpoint funcional

**Lo que NO funciona:**

- ❌ Solo sincroniza planeaciones (no grupos, tareas, recursos, usuarios)
- ❌ Sin manejo de conflictos sofisticado (last-write-wins solamente)
- ❌ Sin retry con backoff exponencial (retry counter existe pero no se usa)
- ❌ Realm instalado pero no integrado
- ❌ `SyncIndicatorRealm` importa módulo inexistente

---

## 9. PROBLEMAS Y DEUDA TÉCNICA

### Críticos

1. **Autenticación falsa** — Cualquiera puede "loguearse". La API key está hardcoded en el frontend (`planearia-dev-secret-2025`). No hay autenticación de usuarios en el backend.

2. **API Key expuesta** — La secret key está en texto plano en `src/sync/config/apiConfig.ts`. Accesible en el bundle de la app.

3. **SyncIndicatorRealm roto** — Importa `../realm` que no existe. Si se renderiza, crashea la app.

4. **gruposService inicializa con datos hardcoded** — Cada instalación inicia con 3 grupos ejemplo que podrían confundir al usuario.

### Importantes

5. **Inconsistencia de persistencia** — Planeaciones usan Context + Sync, Grupos usan Service directo, Tareas/Recursos no tienen persistencia.

6. **3 pantallas deprecated siguen en el navigator** — AlumnosScreen, CalificacionesScreen, TareasScreen (standalone) siguen registradas en StackNavigator.

7. **Sin validación robusta** — El editor de planeaciones solo verifica que el título no esté vacío. Fechas de tarea aceptan texto libre sin validación.

8. **Export no implementado** — Botón presente en ListaPlaneaciones pero muestra "próximamente".

9. **Sin manejo de errores global** — No hay error boundaries, ni toasts, ni logging service.

10. **Sin tests** — Cero archivos de test en todo el proyecto.

### Menores

11. **Datos hardcoded en múltiples pantallas** — DetalleGrupo, DetalleTarea, AsignarRecurso, CalificarEntregas, ListaRecursos usan datos inventados en el código.

12. **Fecha de tarea es TextInput libre** — Nota en código dice "En una versión futura se usará un selector de fecha".

13. **Icons como images en Home** — HomeScreen usa `require()` de imágenes PNG para iconos en lugar de vector icons como el resto de la app.

14. **boxShadow en vez de elevation** — Varios componentes usan `boxShadow` CSS que no funciona en React Native nativo. Solo funciona en web.

15. **Realm dependency innecesaria** — Agrega peso al bundle sin usarse.

16. **Sin deep linking** — No hay configuración de deep links / universal links.

17. **Sin i18n** — Todo hardcoded en español. Sin framework de internacionalización.

---

## 10. RESUMEN EJECUTIVO

### ¿Qué es PlanearIA?

Una app móvil (React Native/Expo) para docentes que permite crear y gestionar planeaciones didácticas, organizar grupos de alumnos, asignar tareas y crear recursos educativos. Soporta 4 niveles académicos (primaria a universidad) con un backend de sincronización en Vercel + MongoDB Atlas.

### ¿Qué FUNCIONA hoy?

| Feature                    | %    | Detalle                                                                                                          |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| Planeaciones (CRUD manual) | 85%  | Crear, editar, listar, filtrar, clonar, sincronizar. 4 niveles. Editor de semanas/evaluaciones para universidad. |
| Sincronización             | 70%  | Offline-first, auto-sync, merge, solo para planeaciones                                                          |
| Grupos (listar)            | 40%  | Listar y buscar grupos. CRUD en servicio pero crear no conectado al UI                                           |
| Navegación                 | 100% | Todas las rutas definidas y funcionando                                                                          |
| UI/Diseño                  | 90%  | Consistente, MVVM, componentes reutilizables                                                                     |

### ¿Qué NO FUNCIONA?

| Feature             | %   | Detalle                             |
| ------------------- | --- | ----------------------------------- |
| Autenticación       | 5%  | Solo UI, login es falso             |
| Generación con IA   | 0%  | Solo botón/modal, cero integración  |
| Recursos Didácticos | 10% | Solo hubs de nav, sin creación real |
| Tareas de Grupo     | 15% | Solo UI, sin persistencia           |
| Calificaciones      | 0%  | Sin implementar                     |
| Asistencias         | 0%  | Sin implementar                     |
| Perfil/Cuenta       | 5%  | Solo logout                         |
| Exportar            | 0%  | Sin implementar                     |

### Arquitectura vs Realidad

La **arquitectura** está bien diseñada:

- MVVM consistente (screens → hooks → services/context)
- Tipos TypeScript comprehensivos
- Sync layer con offline-first
- Responsive para web/mobile/tablet
- Backend serverless escalable

Pero la **implementación** está desbalanceada:

- ~85% del esfuerzo fue en Planeaciones
- El resto son shells/UI sin backend
- Muchas entidades definidas en tipos pero sin implementar

### Próximos Pasos Sugeridos (por prioridad)

1. **Autenticación real** — JWT/OAuth, backend de usuarios, sesión persistente
2. **Completar CRUD de Grupos** — Conectar CrearGrupo al servicio, implementar alumnos reales
3. **Servicio de Tareas** — Crear tareasService.ts similar a gruposService
4. **Limpiar código muerto** — Eliminar pantallas deprecated, SyncIndicatorRealm, dependencia Realm
5. **Extender sync** — Sincronizar grupos y tareas además de planeaciones
6. **Implementar al menos 1 recurso** — Exámenes sería el más útil
7. **Agregar tests** — Al menos unit tests para servicios y ViewModels
8. **Proteger API key** — Mover a variables de entorno / auth real

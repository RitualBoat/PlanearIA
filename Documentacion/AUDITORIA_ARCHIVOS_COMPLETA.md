# Auditoría Completa de Archivos — PlanearIA

**Fecha:** Junio 2025  
**Alcance:** Todos los archivos del proyecto (frontend + backend)

---

## Resumen Ejecutivo

| Categoría              | Archivos | LOC Aprox.  | Estado                                           |
| ---------------------- | -------- | ----------- | ------------------------------------------------ |
| **Screens**            | 20       | ~4,100      | Mixto: Planeaciones funcional, resto placeholder |
| **Hooks (ViewModels)** | 12       | ~1,740      | Mixto: 4 funcionales, 8 placeholder              |
| **Components**         | 7        | ~1,870      | Funcionales                                      |
| **Services**           | 1        | ~190        | Funcional (AsyncStorage)                         |
| **Sync Layer**         | 5        | ~830        | Funcional (API Vercel + MongoDB)                 |
| **Context**            | 1        | ~280        | Funcional                                        |
| **Navigation**         | 1        | ~349        | Funcional                                        |
| **Types**              | 3        | ~710        | Completos                                        |
| **Backend API**        | 5        | ~370        | Funcional                                        |
| **Root / Config**      | 5        | ~80         | Funcional                                        |
| **TOTAL**              | **60**   | **~10,520** |                                                  |

**Funcionalidad real:** ~40% implementada, ~60% UI shells / placeholders.

---

## 1. Root / Configuration Files

### 1.1 `App.tsx` (~22 lines)

- **Purpose:** Application entry point
- **Key functionality:** Wraps the entire app in `SyncProvider` → `PlaneacionesProvider` → `NavigationContainer` → `StackNavigator`
- **Placeholder/TODO:** None
- **Dependencies:** expo-status-bar, react-native, @react-navigation/native, PlaneacionesContext, SyncProvider, StackNavigator
- **Notes:** Imports `Text`, `View`, `StyleSheet` but doesn't use them (dead imports)

### 1.2 `index.js` (~7 lines)

- **Purpose:** Expo entry point — registers root component
- **Key functionality:** Calls `registerRootComponent(App)`
- **Placeholder/TODO:** None
- **Dependencies:** expo, App

### 1.3 `package.json`

- **Purpose:** Project manifest
- **Key functionality:** Expo 54 (SDK 54), React 19.1, React Native 0.81.5
- **Key dependencies:**
  - `@react-navigation/stack` + `react-native-gesture-handler` + `react-native-reanimated`
  - `@react-native-async-storage/async-storage` v2.2
  - `@react-native-community/netinfo` v11.4.1
  - `@expo/vector-icons` v15
  - `realm` v12.15 + `@realm/react` v0.11 (installed but used only in SyncIndicatorRealm)
- **Notes:** Realm is a heavy dependency (~50MB) but barely used. Consider removing if not needed.

### 1.4 `app.json`

- **Purpose:** Expo configuration
- **Key functionality:** App name "PlanearIA", portrait orientation, new architecture enabled, edge-to-edge on Android
- **Placeholder/TODO:** None

### 1.5 `tsconfig.json` (~3 lines)

- **Purpose:** TypeScript config — extends Expo's base
- **Placeholder/TODO:** Empty `compilerOptions` — no strict mode, no path aliases

---

## 2. Types

### 2.1 `types/index.ts` (~536 lines)

- **Purpose:** Central type definitions for the entire app
- **Key functionality:**
  - Entity interfaces: `Planeacion` (legacy numeric ID), `Grupo`, `Alumno`, `Calificacion`, `Asistencia`, `ComentarioAlumno`, `Tarea`, `EntregaTarea`, `Recurso`, `ConfiguracionSeguridad`, `Usuario`
  - Form data interfaces for all entities
  - UI types: `CardProps`, `ModalProps`, `ListItemProps`
  - State management types: `LoadingState`, `ErrorState`, `ScreenState<T>`
  - Constants: `COLORS` (Material Blue theme), `FONT_SIZES`
  - Utility types: `PartialExceptId`, `CreateEntity`, `CRUDOperation`
  - Re-exports from `planeacion.ts`
- **Placeholder/TODO:** None — comprehensive type definitions
- **Notes:** Contains a **duplicate** `Planeacion` interface (numeric `ID` based) that conflicts with `types/planeacion.ts` (string `id` based). The actual app uses the `planeacion.ts` version.

### 2.2 `types/planeacion.ts` (~170 lines)

- **Purpose:** Planeación-specific types (the ones actually used throughout the app)
- **Key functionality:**
  - `NivelAcademico` enum: PRIMARIA, SECUNDARIA, PREPARATORIA, UNIVERSIDAD
  - `PlaneacionBase` interface with string `id`, all common fields
  - Level-specific extensions: `PlaneacionPrimaria` (campoFormativo), `PlaneacionSecundaria` (competenciasDisciplinares), `PlaneacionPreparatoria` (competenciasGenericas + disciplinares), `PlaneacionUniversidad` (semanas, evaluaciones, configuracionCurso)
  - `Planeacion` union type
  - `FiltrosPlaneacion`, `PlantillaPlaneacion`, `EstadisticasPlaneaciones`
  - Supporting types: `Actividad`, `ConfiguracionCurso`, `TipoEvaluacion`, `Evaluacion`, `SemanaUniversitaria`, `ActividadPresencial`
- **Placeholder/TODO:** None
- **Dependencies:** None (pure types)

### 2.3 `types/images.d.ts` (~5 lines)

- **Purpose:** TypeScript declaration for PNG image imports
- **Key functionality:** `declare module "*.png"`
- **Placeholder/TODO:** None

---

## 3. Navigation

### 3.1 `src/navigation/StackNavigator.tsx` (~349 lines)

- **Purpose:** Central navigation configuration — all routes
- **Key functionality:**
  - `RootStackParamList` type definition with all routes and their params
  - 20 screen registrations in `Stack.Navigator`
  - Groups: Auth (Login, Home), Planeaciones (4), Grupos (4), Tareas in Grupos (4), Tareas deprecated (1), Biblioteca/Recursos (6), Cuenta (1), Deprecated (Alumnos, Calificaciones)
  - All `headerShown: false` — custom headers per screen
  - Login is `initialRouteName`
- **Placeholder/TODO:** Deprecated screens still registered: `Alumnos`, `Calificaciones`, `Tareas`
- **Dependencies:** @react-navigation/stack, all 20 screen components, COLORS from types, NivelAcademico from types/planeacion

---

## 4. Context

### 4.1 `src/context/PlaneacionesContext.tsx` (~280 lines)

- **Purpose:** Global state management for planeaciones using React Context + AsyncStorage
- **Key functionality:**
  - Full CRUD: `agregarPlaneacion`, `actualizarPlaneacion`, `eliminarPlaneacion`, `obtenerPlaneacion`, `clonarPlaneacion`
  - Filtering: `filtrarPlaneaciones` with `FiltrosPlaneacion`
  - Persistence: Auto-save to AsyncStorage on state change
  - `SyncStatus` type: idle | loading | synced | error | offline
  - `reloadFromStorage`, `limpiarPlaneaciones`
- **Placeholder/TODO:** None — fully functional for local persistence
- **Dependencies:** AsyncStorage, types/planeacion
- **Notes:** This is the **original** context. `SyncProvider` in `src/sync/` provides an **enhanced** version with the same interface + actual sync. Both are active in App.tsx (SyncProvider wraps PlaneacionesProvider), which means **two providers compete** for planeaciones state.

---

## 5. Sync Layer

### 5.1 `src/sync/index.ts` (~45 lines)

- **Purpose:** Barrel export for the sync module
- **Key functionality:** Re-exports apiConfig, syncService, useSync, SyncProvider
- **Placeholder/TODO:** None

### 5.2 `src/sync/config/apiConfig.ts` (~135 lines)

- **Purpose:** API and sync configuration constants
- **Key functionality:**
  - `API_CONFIG`: baseUrl = `https://backend-eight-chi-54.vercel.app`, apiSecret = `planearia-dev-secret-2025`, timeout 15s
  - `SYNC_CONFIG`: autoSyncInterval 60s, maxRetries 3, retryDelay 2s, batchSize 50, debugMode in dev
  - `STORAGE_KEYS`: 5 AsyncStorage keys
  - `CONNECTIVITY_CONFIG`: ping Google every 10s
  - `isAPIConfigured()`: validates baseUrl and apiSecret are set
- **Placeholder/TODO:** None
- **⚠️ SECURITY ISSUE:** API secret is hardcoded in source code (`planearia-dev-secret-2025`)

### 5.3 `src/sync/hooks/useSync.ts` (~165 lines)

- **Purpose:** React hook for sync state management
- **Key functionality:**
  - Network monitoring via NetInfo
  - Auto-reconnection detection with automatic sync
  - Periodic sync every 60s when online
  - Pending operation counter (updated every 5s)
  - API health check on mount
  - `forceSync()` for manual trigger
- **Placeholder/TODO:** None — fully implemented
- **Dependencies:** NetInfo, syncService, apiConfig

### 5.4 `src/sync/providers/SyncProvider.tsx` (~260 lines)

- **Purpose:** Enhanced context provider with sync capabilities
- **Key functionality:**
  - Same interface as PlaneacionesContext (CRUD, filtering, state)
  - Adds sync operations: registers pending operations on every CRUD action
  - `forceSync()` triggers full sync and reloads
  - `useSyncPlaneaciones` and `usePlaneaciones` hooks (alias)
- **Placeholder/TODO:** None — fully implemented
- **Dependencies:** syncService, useSync, apiConfig, types/planeacion
- **Notes:** Duplicates PlaneacionesContext interface. Both are mounted in App.tsx.

### 5.5 `src/sync/services/syncService.ts` (~321 lines)

- **Purpose:** Core sync service — API client + local storage operations
- **Key functionality:**
  - Local: `saveLocalPlaneaciones`, `loadLocalPlaneaciones`
  - Pending ops: `getPendingOperations`, `addPendingOperation` (deduplicates updates/deletes), `clearPendingOperations`
  - Sync: `fullSync()` — POSTs pending operations to `/api/sync`, receives server changes, merges with local (server wins if newer `fechaModificacion`)
  - Utilities: `getDeviceId` (generated + cached), `checkConnectivity` (NetInfo), `checkAPIHealth` (GET /api/health)
  - `apiRequest()` wrapper with auth header and AbortController timeout
- **Placeholder/TODO:** None — fully implemented
- **Dependencies:** AsyncStorage, NetInfo, apiConfig

---

## 6. Services

### 6.1 `src/services/gruposService.ts` (~190 lines)

- **Purpose:** CRUD service for Grupos using AsyncStorage
- **Key functionality:**
  - `obtenerGrupos()` → loads from `@planearia:grupos`, falls back to 3 hardcoded defaults
  - `obtenerGrupoPorId(id)`, `guardarGrupos(grupos)`, `agregarGrupo(grupo)`, `actualizarGrupo(grupo)`, `eliminarGrupo(id)`
  - `filtrarGruposPorBusqueda(grupos, searchText)` — filters by nombre, materia, carrera
- **Placeholder/TODO:** Default hardcoded grupos (ISC 7A, IGE 3B, ARQ 5A) remain when storage is empty
- **Dependencies:** AsyncStorage
- **Notes:** No sync — only local persistence. No connection to the sync layer.

---

## 7. Hooks (ViewModels)

### 7.1 `src/hooks/useHomeViewModel.ts` (~100 lines)

- **Purpose:** ViewModel for HomeScreen
- **Key functionality:** Menu option definitions with require() images and navigation targets, `handleLogout` (resets navigation to Login), `handleProfile` → `console.log` only
- **Placeholder/TODO:** `handleProfile` is stub
- **Dependencies:** @react-navigation/native, require() for image assets

### 7.2 `src/hooks/useCrearPlaneacionViewModel.ts` (~100 lines)

- **Purpose:** ViewModel for level selection when creating a planeación
- **Key functionality:** Level selection modal state, 4 level options, `handleSeleccionarNivel` navigates to EditorPlaneacion, AI template modal state
- **Placeholder/TODO:** `handleGenerarConIA` → `console.log("AI generation - próximamente")`
- **Dependencies:** @react-navigation/native, NivelAcademico

### 7.3 `src/hooks/useEditorPlaneacionViewModel.ts` (~656 lines)

- **Purpose:** ViewModel for the planeación editor — **most complex hook**
- **Key functionality:**
  - Full state management for all 4 academic levels
  - Level-specific field initialization
  - University mode: semanas management (add/delete/clone/update), evaluaciones management (add/delete/update), curso configuration
  - Load existing planeación for edit mode via PlaneacionesContext
  - Validation before save
  - `handleGuardar()` → fully functional — creates/updates planeación via context
  - Computed fields: `totalPorcentajeEval`, `horasSemanales`
- **Placeholder/TODO:** None — **fully implemented**
- **Dependencies:** PlaneacionesContext (usePlaneaciones), types/planeacion

### 7.4 `src/hooks/useListaPlaneacionesViewModel.ts` (~230 lines)

- **Purpose:** ViewModel for the planeaciones list
- **Key functionality:** Filtering by NivelAcademico, edit (navigate to EditorPlaneacion with edit mode), clone (via context), delete (with confirmation), context menu state
- **Placeholder/TODO:** `handleExportar` → Alert "próximamente disponible"
- **Dependencies:** PlaneacionesContext, @react-navigation/native

### 7.5 `src/hooks/useLoginViewModel.ts` (~110 lines)

- **Purpose:** ViewModel for login
- **Key functionality:** Form state (usuario/contraseña), loading state, confirmation dialog
- **Placeholder/TODO:**
  - `handleLogin` → 2-second `setTimeout` fake auth (no real API call)
  - `handleOlvidasteContrasena` → Alert "próximamente"
  - `handleRegistrate` → Alert "próximamente"
- **Dependencies:** @react-navigation/native

### 7.6 `src/hooks/useCrearGrupoViewModel.ts` (~65 lines)

- **Purpose:** ViewModel for group creation form
- **Key functionality:** Form field state (nombre, materia, carrera, semestre, periodo, horario)
- **Placeholder/TODO:** `handleCrearGrupo` → `console.log` only, navigates back without saving. Comment says "TODO: integrate gruposService"
- **Dependencies:** @react-navigation/native

### 7.7 `src/hooks/useDetalleGrupoViewModel.ts` (~80 lines)

- **Purpose:** ViewModel for group detail screen
- **Key functionality:** Active tab state (6 tabs: alumnos, calificaciones, asistencias, comentarios, tareas, gráficas), navigation helpers for CrearTareaGrupo and AsignarRecurso
- **Placeholder/TODO:** No data loading — all data is hardcoded in the screen. State management only for UI (tab selection).
- **Dependencies:** @react-navigation/native

### 7.8 `src/hooks/useGrupos.ts` (~180 lines)

- **Purpose:** ViewModel for group list — **well-structured**
- **Key functionality:** Full CRUD via gruposService, search filtering, loading/error states, `useEffect` to load on mount, `agregarGrupo`, `actualizarGrupo`, `eliminarGrupo`
- **Placeholder/TODO:** None — **fully functional** (with AsyncStorage backend)
- **Dependencies:** gruposService

### 7.9 `src/hooks/useCuentaViewModel.ts` (~50 lines)

- **Purpose:** ViewModel for account settings
- **Key functionality:** `handleLogout` resets navigation to Login
- **Placeholder/TODO:**
  - `handleEditarPerfil` → `console.log` only
  - `handleCambiarContrasena` → `console.log` only
- **Dependencies:** @react-navigation/native

### 7.10 `src/hooks/useCalificarEntregasViewModel.ts` (~85 lines)

- **Purpose:** ViewModel for grading student submissions
- **Key functionality:** Hardcoded `entregas` array, calificaciones/retroalimentacion state per student, `handleGuardarCalificaciones`
- **Placeholder/TODO:** `handleGuardarCalificaciones` → `console.log` only (TODO comment)
- **Dependencies:** None (hardcoded data)

### 7.11 `src/hooks/useCrearTareaGrupoViewModel.ts` (~80 lines)

- **Purpose:** ViewModel for task creation form
- **Key functionality:** Form state (titulo, tipo, descripcion, valor, fechaEntrega), tipo options
- **Placeholder/TODO:** `handleGuardar` → `console.log` only
- **Dependencies:** @react-navigation/native

### 7.12 `src/hooks/useListaRecursosViewModel.ts` (~45 lines)

- **Purpose:** ViewModel for resource list
- **Key functionality:** Search text state, icon/color mapping for resource types
- **Placeholder/TODO:** No data fetching — data is hardcoded in screen
- **Dependencies:** None

---

## 8. Components

### 8.1 `src/components/BottomNavBar.tsx` (~85 lines)

- **Purpose:** Reusable bottom navigation bar
- **Key functionality:** Back button (goBack) + Home button (navigate to Home), displays current screen name
- **Placeholder/TODO:** None
- **Dependencies:** @react-navigation/native, @expo/vector-icons (MaterialIcons)

### 8.2 `src/components/SemanaEditor.tsx` (~683 lines)

- **Purpose:** Complex weekly planner editor for university detailed mode
- **Key functionality:**
  - Expandable/collapsible per-week editor
  - Fields: temas, objetivos, actividades presenciales (with duracion + metodología), actividades autónomas, recursos, entregables
  - 5 quick-fill templates: Teórica, Práctica de Lab, Evaluación, Proyecto, Lecturas/Investigación
  - Clone week, delete week
  - Add/remove items within each field
- **Placeholder/TODO:** None — **fully implemented**
- **Dependencies:** @expo/vector-icons (MaterialIcons), COLORS from types, SemanaUniversitaria/ActividadPresencial from types/planeacion

### 8.3 `src/components/EvaluacionEditor.tsx` (~656 lines)

- **Purpose:** Evaluation plan editor for university mode
- **Key functionality:**
  - Add/edit/delete evaluaciones
  - 8 evaluation types: examen, proyecto, tarea, presentación, práctica, participación, ensayo, investigación
  - Percentage allocation tracking (bars + must sum to 100%)
  - Week assignment
  - Criteria management per evaluation (add/remove)
  - Edit modal for individual evaluation
- **Placeholder/TODO:** None — **fully implemented**
- **Dependencies:** @expo/vector-icons (MaterialIcons), COLORS from types, Evaluacion/TipoEvaluacion from types/planeacion

### 8.4 `src/components/SyncIndicator.tsx` (~95 lines)

- **Purpose:** Displays sync status icon and text
- **Key functionality:** Shows icons based on PlaneacionesContext `syncStatus` + NetInfo connectivity: cloud-off (offline), sync (loading), error (error), cloud-done (synced)
- **Placeholder/TODO:** None
- **Dependencies:** PlaneacionesContext (usePlaneaciones), NetInfo, @expo/vector-icons

### 8.5 `src/components/SyncIndicatorRealm.tsx` (~130 lines)

- **Purpose:** Alternative sync indicator using Realm
- **Key functionality:** Shows Realm sync state (active/waiting/error), manual force sync button, references `useRealmApp` from `src/realm`
- **Placeholder/TODO:** References `src/realm` module that **does not exist** in the project
- **Dependencies:** Realm (@realm/react), @expo/vector-icons
- **⚠️ BROKEN:** Will crash if used — imports from non-existent module

### 8.6 `src/components/SyncStatusBadge.tsx` (~150 lines)

- **Purpose:** Third sync indicator — badge style with pending count
- **Key functionality:** Shows sync status with color-coded badge, pending operations count, force sync via `useSyncPlaneaciones`
- **Placeholder/TODO:** None
- **Dependencies:** src/sync (useSyncPlaneaciones)

### 8.7 `src/components/WebScrollView.tsx` (~70 lines)

- **Purpose:** Cross-platform scrollable container
- **Key functionality:** On web: renders `<div>` with CSS overflow scrollbar styling. On mobile: renders standard `ScrollView`
- **Placeholder/TODO:** None
- **Dependencies:** react-native (Platform, ScrollView)

---

## 9. Screens

### 9.1 Authentication

#### `src/screens/auth/LoginScreen.tsx` (~180 lines)

- **Purpose:** Login screen
- **Key functionality:** Username/password fields, login button with loading spinner, confirmation dialog, responsive web/mobile styling
- **Placeholder/TODO:**
  - Auth is **fake** (2-second setTimeout, no API call)
  - "Olvidaste tu contraseña?" → Alert "próximamente"
  - "Registrate" → Alert "próximamente"
- **Dependencies:** useLoginViewModel, responsive utils

### 9.2 Home

#### `src/screens/home/HomeScreen.tsx` (~230 lines)

- **Purpose:** Main landing screen / dashboard
- **Key functionality:** 2×2 grid menu (Planeaciones, Grupos, Recursos Didácticos, Cuenta), hamburger menu modal (profile + logout), responsive web/mobile layout
- **Placeholder/TODO:** Menu icon images loaded via `require()` — profile handler is stub
- **Dependencies:** useHomeViewModel, COLORS/FONT_SIZES, responsive utils, @expo/vector-icons

### 9.3 Planeaciones

#### `src/screens/planeaciones/PlaneacionesScreen.tsx` (~160 lines)

- **Purpose:** Hub screen with 2 options: Create new / View existing
- **Key functionality:** Navigation to CrearPlaneacion and ListaPlaneaciones
- **Placeholder/TODO:** None — functional as menu
- **Dependencies:** @react-navigation/stack, BottomNavBar

#### `src/screens/planeaciones/CrearPlaneacionScreen.tsx` (~290 lines)

- **Purpose:** Choose creation method (manual vs AI) and academic level
- **Key functionality:** Two option cards, level selection modal (4 levels), AI template modal with param selectors
- **Placeholder/TODO:**
  - AI parameter dropdowns are **non-functional** (static "Seleccionar..." text)
  - `handleGenerarConIA` → `console.log` only
- **Dependencies:** useCrearPlaneacionViewModel, BottomNavBar

#### `src/screens/planeaciones/EditorPlaneacionScreen.tsx` (~1,046 lines)

- **Purpose:** Full lesson plan editor — **the core feature**
- **Key functionality:**
  - Complete form for all 4 academic levels with level-specific fields
  - General data: asignatura, grado, grupo, fecha, hora, duración
  - Content: unidad temática, tema, aprendizajes esperados (add/remove)
  - Activities: inicio/desarrollo/cierre with individual durations
  - Resources, evaluation, evidencias
  - University mode: detailed weekly planning (SemanaEditor), evaluation plan (EvaluacionEditor), course config (duration, hours, credits, modalidad)
  - Save via PlaneacionesContext — **fully functional**
- **Placeholder/TODO:** Date/time fields are plain text (no date picker)
- **Dependencies:** useEditorPlaneacionViewModel, SemanaEditor, EvaluacionEditor, SyncIndicator, WebScrollView, BottomNavBar, PlaneacionesContext

#### `src/screens/planeaciones/ListaPlaneacionesScreen.tsx` (~708 lines)

- **Purpose:** List all saved planeaciones with filtering
- **Key functionality:** FlatList with cards, level badges (color-coded), context menu (edit/clone/delete/export), filter modal by NivelAcademico, filter chips, university detail badges
- **Placeholder/TODO:** Export → Alert "próximamente disponible"
- **Dependencies:** useListaPlaneacionesViewModel, SyncIndicator, BottomNavBar, PlaneacionesContext

### 9.4 Grupos

#### `src/screens/grupos/GruposScreen.tsx` (~155 lines)

- **Purpose:** Hub for groups management
- **Key functionality:** Two cards: Create Group / View Groups
- **Placeholder/TODO:** None — functional as menu
- **Dependencies:** @react-navigation/stack, BottomNavBar

#### `src/screens/grupos/CrearGrupoScreen.tsx` (~230 lines)

- **Purpose:** Form to create a new group
- **Key functionality:** Fields: nombre, materia, carrera (ISC/IGE/ARQ/ITICS picker), semestre, periodo, horario
- **Placeholder/TODO:** `handleCrearGrupo` → **console.log only**, navigates back without saving
- **Dependencies:** useCrearGrupoViewModel, BottomNavBar

#### `src/screens/grupos/ListaGruposScreen.tsx` (~290 lines)

- **Purpose:** List all groups with search
- **Key functionality:** Loading/error states, search bar, group cards (nombre, materia, carrera, semestre, alumnos count, estado), navigation to DetalleGrupo
- **Placeholder/TODO:** Default data from 3 hardcoded groups in gruposService
- **Dependencies:** useGrupos, WebScrollView, BottomNavBar

#### `src/screens/grupos/DetalleGrupoScreen.tsx` (~643 lines)

- **Purpose:** Group detail with 6-tab interface
- **Key functionality:** Tabs: Alumnos, Calificaciones, Asistencias, Comentarios, Tareas, Gráficas. Each tab has UI with action buttons.
- **Placeholder/TODO:** **ALL tab content uses hardcoded data:**
  - 3 static student names (Juan Pérez, María García, Carlos López)
  - Static stats (promedio 8.5, asistencia 92%)
  - 3 hardcoded tarea items with progress bars
  - Gráficas tab shows placeholder text
  - No real data loading from any source
- **Dependencies:** useDetalleGrupoViewModel, WebScrollView, BottomNavBar

### 9.5 Tareas within Grupos

#### `src/screens/grupos/tareas/CrearTareaGrupoScreen.tsx` (~260 lines)

- **Purpose:** Create a task for a specific group
- **Key functionality:** Form: título, tipo selector (tarea/examen/proyecto/investigación), descripción, valor, fecha entrega
- **Placeholder/TODO:**
  - `handleGuardar` → **console.log only**
  - Date field is plain text (no date picker)
- **Dependencies:** useCrearTareaGrupoViewModel, BottomNavBar

#### `src/screens/grupos/tareas/DetalleTareaScreen.tsx` (~280 lines)

- **Purpose:** View task detail with submission status
- **Key functionality:** Task info card, stats (15/28 entregas, 54%, promedio 8.75), submission list with status icons
- **Placeholder/TODO:** **ALL data is hardcoded** (tarea object, entregas array)
- **Dependencies:** BottomNavBar

#### `src/screens/grupos/tareas/AsignarRecursoScreen.tsx` (~210 lines)

- **Purpose:** Assign existing resource (exam) to a group
- **Key functionality:** List of exam resources, assign button
- **Placeholder/TODO:**
  - `handleAsignar` → logs and navigates back (TODO comment in code)
  - Resource data is hardcoded
- **Dependencies:** BottomNavBar

#### `src/screens/grupos/tareas/CalificarEntregasScreen.tsx` (~230 lines)

- **Purpose:** Grade student submissions
- **Key functionality:** Per-student grade input (0-10), feedback text area, save/cancel
- **Placeholder/TODO:** `handleGuardarCalificaciones` → **console.log only** (TODO comment)
- **Dependencies:** useCalificarEntregasViewModel, BottomNavBar

### 9.6 Deprecated Screens

#### `src/screens/tareas/TareasScreen.tsx` (~170 lines)

- **Purpose:** Standalone tasks hub (deprecated)
- **Placeholder/TODO:** Both buttons → **console.log only**, entirely non-functional

#### `src/screens/alumnos/AlumnosScreen.tsx` (~170 lines)

- **Purpose:** Student management hub (deprecated)
- **Placeholder/TODO:** Both buttons → **console.log only**, entirely non-functional

#### `src/screens/calificaciones/CalificacionesScreen.tsx` (~170 lines)

- **Purpose:** Grades management hub (deprecated)
- **Placeholder/TODO:** Both buttons → **console.log only**, entirely non-functional

### 9.7 Biblioteca / Recursos Didácticos

#### `src/screens/biblioteca/RecursosDidacticosScreen.tsx` (~280 lines)

- **Purpose:** Hub for educational resources
- **Key functionality:** 4 resource type cards (Exámenes, Presentaciones, Mapas Mentales, Líneas de Tiempo) with method badges (IA/Plantillas/Manual), "Ver Todos Mis Recursos" button
- **Placeholder/TODO:** None for the hub itself
- **Dependencies:** BottomNavBar

#### `src/screens/biblioteca/ExamenesScreen.tsx` (~255 lines)

- **Purpose:** Create exams (3 methods: AI, template, manual)
- **Key functionality:** Three option cards with info section
- **Placeholder/TODO:** All 3 creation methods → **console.log only**
- **Dependencies:** BottomNavBar

#### `src/screens/biblioteca/PresentacionesScreen.tsx` (~130 lines)

- **Purpose:** Create presentations
- **Placeholder/TODO:** **No onPress handlers** on any button — completely non-functional

#### `src/screens/biblioteca/MapasMentalesScreen.tsx` (~130 lines)

- **Purpose:** Create mind maps
- **Placeholder/TODO:** **No onPress handlers** — completely non-functional

#### `src/screens/biblioteca/LineasTiempoScreen.tsx` (~130 lines)

- **Purpose:** Create timelines
- **Placeholder/TODO:** **No onPress handlers** — completely non-functional

#### `src/screens/biblioteca/ListaRecursosScreen.tsx` (~210 lines)

- **Purpose:** List all saved resources
- **Key functionality:** Search bar, resource cards with type/origin badges
- **Placeholder/TODO:** Uses hardcoded `recursosEjemplo` array (3 items), no real data source
- **Dependencies:** useListaRecursosViewModel, BottomNavBar

### 9.8 Account

#### `src/screens/cuenta/CuentaScreen.tsx` (~160 lines)

- **Purpose:** Account settings
- **Key functionality:** Three cards: Edit Profile, Change Password, Logout. Logout works (resets nav to Login).
- **Placeholder/TODO:**
  - `handleEditarPerfil` → **console.log only**
  - `handleCambiarContrasena` → **console.log only**
- **Dependencies:** useCuentaViewModel, BottomNavBar

---

## 10. Utils

### 10.1 `src/utils/responsive.ts` (~45 lines)

- **Purpose:** Responsive layout utilities
- **Key functionality:**
  - `getScreenDimensions()` → width/height
  - `isLargeScreen()` → width >= 768
  - `isWeb()` → Platform.OS === "web"
  - `responsive(mobile, tablet, web?)` → returns appropriate value based on platform/size
- **Placeholder/TODO:** None
- **Dependencies:** react-native (Dimensions, Platform)

---

## 11. Backend (Vercel Serverless)

### 11.1 `backend/package.json`

- **Purpose:** Backend project manifest
- **Dependencies:** `mongodb` v6.3 (driver only), `@vercel/node` v3 (dev)
- **Scripts:** `dev` (vercel dev), `deploy` (vercel --prod)

### 11.2 `backend/vercel.json`

- **Purpose:** Vercel deployment config
- **Key functionality:** Functions: `api/*.js` with 256MB memory, 10s max duration

### 11.3 `backend/lib/auth.js` (~90 lines)

- **Purpose:** Authentication middleware
- **Key functionality:**
  - `validateAuth(req)` → checks `X-API-Key` or `Authorization` header against `API_SECRET` env var (default `planearia-dev-secret-2025`)
  - `getCorsHeaders()` → `Access-Control-Allow-Origin: *`
  - `handleCors(req, res)` → handles OPTIONS preflight
  - `applyCors(res)` → applies CORS headers
  - `errorResponse(res, status, message)` / `successResponse(res, data, status)`
- **Placeholder/TODO:** None
- **⚠️ SECURITY:** Wildcard CORS (`*`), hardcoded default secret

### 11.4 `backend/lib/mongodb.js` (~50 lines)

- **Purpose:** MongoDB Atlas connection with caching
- **Key functionality:** Global `cachedClient`/`cachedDb` for connection reuse between serverless invocations. DB name: `planeariaDB`. Pool size 10, 5s server selection timeout.
- **Placeholder/TODO:** None
- **Dependencies:** mongodb (MongoClient)

### 11.5 `backend/api/health.js` (~20 lines)

- **Purpose:** Health check endpoint — `GET /api/health`
- **Key functionality:** Returns `{ status: "ok", service: "PlanearIA API", version: "1.0.0" }`
- **Placeholder/TODO:** None

### 11.6 `backend/api/planeaciones.js` (~165 lines)

- **Purpose:** Full CRUD REST API for planeaciones
- **Key functionality:**
  - `GET /api/planeaciones` → list all (with `desde` filter for incremental sync, `limit`)
  - `GET /api/planeaciones?id=xxx` → get one
  - `POST /api/planeaciones` → create (upserts if exists)
  - `PUT /api/planeaciones` → update (with upsert)
  - `DELETE /api/planeaciones?id=xxx` → delete
  - Auth required on all endpoints
- **Placeholder/TODO:** None — fully implemented
- **Dependencies:** mongodb, auth

### 11.7 `backend/api/sync.js` (~115 lines)

- **Purpose:** Batch sync endpoint — `POST /api/sync`
- **Key functionality:**
  - Receives `deviceId`, `lastSync`, `operations[]` from client
  - Processes create/update (upsert) and delete operations
  - Returns changes from server since `lastSync` (excluding same device to avoid echoes)
  - Returns `{ uploaded, downloaded[], errors[], serverTime }`
- **Placeholder/TODO:** None — fully implemented
- **Dependencies:** mongodb, auth

---

## 12. Critical Findings

### 12.1 Architecture Issues

| Issue                         | Severity  | Details                                                                                                                                                                      |
| ----------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dual Provider conflict**    | 🔴 High   | `SyncProvider` and `PlaneacionesProvider` both mounted in App.tsx, both manage planeaciones state independently. Screens use `PlaneacionesContext` directly, bypassing sync. |
| **Broken component**          | 🔴 High   | `SyncIndicatorRealm.tsx` imports from non-existent `src/realm` module                                                                                                        |
| **Duplicate Planeacion type** | 🟡 Medium | `types/index.ts` has numeric-ID `Planeacion`, `types/planeacion.ts` has string-ID `Planeacion`. Only the latter is used.                                                     |
| **Dead dependencies**         | 🟡 Medium | `realm` and `@realm/react` (~50MB) in package.json, only used in broken SyncIndicatorRealm                                                                                   |
| **3 deprecated screens**      | 🟡 Medium | AlumnosScreen, CalificacionesScreen, TareasScreen still registered in navigator                                                                                              |

### 12.2 Security Issues

| Issue                      | Severity  | Details                                                                                    |
| -------------------------- | --------- | ------------------------------------------------------------------------------------------ |
| **Hardcoded API secret**   | 🔴 High   | `planearia-dev-secret-2025` in source code (apiConfig.ts + auth.js fallback)               |
| **Wildcard CORS**          | 🟡 Medium | `Access-Control-Allow-Origin: *` in backend                                                |
| **No real authentication** | 🔴 High   | Login is fake (setTimeout), no user management, API uses shared secret not per-user tokens |

### 12.3 Functionality Gap

| Module                  | Status         | What's Missing                                            |
| ----------------------- | -------------- | --------------------------------------------------------- |
| **Planeaciones CRUD**   | ✅ Functional  | Export feature                                            |
| **Planeaciones Sync**   | ✅ Functional  | Conflict resolution UI                                    |
| **Grupos CRUD**         | ⚠️ Partial     | CrearGrupo doesn't save, DetalleGrupo is all hardcoded    |
| **Alumnos**             | ❌ Shell       | No functionality                                          |
| **Calificaciones**      | ❌ Shell       | No functionality                                          |
| **Tareas**              | ⚠️ Partial     | Forms exist but don't save; all data hardcoded            |
| **Recursos Didácticos** | ❌ Shell       | 3 of 4 types have no handlers; ListaRecursos is hardcoded |
| **AI Generation**       | ❌ Placeholder | All AI buttons are console.log stubs                      |
| **Authentication**      | ❌ Fake        | 2-second setTimeout, no real auth                         |
| **User Profile**        | ❌ Shell       | Edit profile and change password are stubs                |

### 12.4 Code Quality

| Observation           | Details                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| **MVVM pattern**      | Consistently applied — ViewModels as hooks, screens are pure views              |
| **TypeScript**        | Well-typed across planeaciones module; algunos hooks lack explicit return types |
| **Naming**            | Consistent Spanish naming convention throughout                                 |
| **Error handling**    | Present in sync layer and context; missing in most screens                      |
| **Responsive design** | Implemented via `responsive.ts` utils + `WebScrollView`                         |
| **Dead code**         | Unused imports in App.tsx, 3 deprecated screens still mounted                   |

---

## 13. File Count Summary

```
Root config:          5 files  (App.tsx, index.js, package.json, app.json, tsconfig.json)
Types:                3 files  (index.ts, planeacion.ts, images.d.ts)
Navigation:           1 file   (StackNavigator.tsx)
Context:              1 file   (PlaneacionesContext.tsx)
Sync layer:           5 files  (index.ts, apiConfig.ts, useSync.ts, SyncProvider.tsx, syncService.ts)
Services:             1 file   (gruposService.ts)
Hooks:               12 files  (all useXxxViewModel + useGrupos)
Components:           7 files  (BottomNavBar, SemanaEditor, EvaluacionEditor, SyncIndicator ×2, SyncStatusBadge, WebScrollView)
Screens:             20 files  (auth ×1, home ×1, planeaciones ×4, grupos ×4, tareas-grupo ×4, deprecated ×3, biblioteca ×6, cuenta ×1)
Utils:                1 file   (responsive.ts)
Backend:              5 files  (health.js, planeaciones.js, sync.js, auth.js, mongodb.js)
Backend config:       2 files  (package.json, vercel.json)
─────────────────────────────────
TOTAL:               63 source files
```

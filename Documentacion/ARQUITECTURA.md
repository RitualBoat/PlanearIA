# Arquitectura de PlanearIA

## Indice

1. [Vision General](#vision-general)
2. [Stack Tecnologico](#stack-tecnologico)
3. [Capas de la Arquitectura](#capas-de-la-arquitectura)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Sistema de Tipos](#sistema-de-tipos)
6. [Flujo de Datos](#flujo-de-datos)
7. [Backend](#backend)
8. [Estrategia de Refactorizacion](#estrategia-de-refactorizacion)

---

## Vision General

PlanearIA es una aplicacion movil para docentes mexicanos. Permite gestionar planeaciones didacticas, grupos, alumnos, recursos educativos y evaluaciones.

### Principios de Diseno

1. **Offline-first**: Todos los datos se guardan localmente en AsyncStorage. MongoDB Atlas es el respaldo en la nube.
2. **MVVM**: Pantallas (View) consumen hooks personalizados (ViewModel) que acceden a Context providers (Model).
3. **Monolito modular**: PlanearIA debe mantenerse como una aplicacion unificada y un backend logico simple, separando dominios por carpetas y contratos internos antes de pensar en microservicios.
4. **Cero friccion**: cada modulo debe sentirse como una herramienta conocida por docentes: Word/Docs, Classroom, Canva, Excel o WhatsApp profesional.
5. **Vision de editor**: Cada modulo de creacion/edicion evolucionara de formularios nativos simples a experiencias profesionales, empezando por Planeaciones como Word/Docs.

---

## Stack Tecnologico

| Tecnologia | Version | Proposito |
|-----------|---------|-----------|
| React Native | 0.81.5 | Framework UI cross-platform |
| Expo | 54.0.21 | Tooling de desarrollo (Expo Go) |
| TypeScript | 5.9.2 | Tipado estatico |
| React Navigation | 7.x | Navegacion (native stack) |
| AsyncStorage | - | Persistencia local offline-first |
| MongoDB Atlas | M0 | Base de datos cloud |
| Vercel | - | Hosting de funciones serverless |
| JWT | - | Autenticacion con userId isolation |
| Jest | - | Unit testing |
| @expo/vector-icons | - | Iconos (imports directos, no barrel) |

### Tecnologias NO usadas

- **Realm**: Nunca fue implementado. El proyecto usa AsyncStorage + MongoDB Atlas.
- **Docker**: Planeado para v5.0. El backend actual corre en Vercel.
- **expo-router**: Se usa @react-navigation directamente.
- **expo-secure-store**: Pendiente de instalar. Auth token actualmente en AsyncStorage.

---

## Capas de la Arquitectura

```
+-------------------------------------------------------------+
|                     PRESENTACION                             |
|  Screens (React Native components)                          |
|  EditorPlaneacionScreen, ListaPlaneacionesScreen, etc.      |
+-------------------------------------------------------------+
                            |
+-------------------------------------------------------------+
|                     VIEWMODEL                                |
|  Custom hooks                                               |
|  useEditorState, useFilteredPlaneaciones, etc.               |
+-------------------------------------------------------------+
                            |
+-------------------------------------------------------------+
|                     CONTEXT (Model)                          |
|  React Context providers                                    |
|  AuthContext, PlaneacionesContext, NotificacionesContext      |
+-------------------------------------------------------------+
                            |
+-------------------------------------------------------------+
|                     SERVICIOS                                |
|  apiClient.ts, syncService.ts, syncEngine.ts                |
|  pushNotificationService.ts                                  |
+-------------------------------------------------------------+
                            |
              +-------------+-------------+
              |                           |
+-------------------------+  +-------------------------+
|   STORAGE LOCAL         |  |   BACKEND REMOTO        |
|   AsyncStorage          |  |   Vercel Serverless     |
|   @planearia:*          |  |   /api/planeaciones     |
|                         |  |   /api/sync             |
+-------------------------+  +-------------------------+
                                          |
                              +-------------------------+
                              |   MongoDB Atlas M0      |
                              |   planeariaDB           |
                              |   Collection:           |
                              |   - planeaciones        |
                              +-------------------------+
```

---

## Estructura del Proyecto

```
PlanearIA/
├── App.tsx                      # Entry point principal
├── Documentacion/
│   ├── plan_planeaciones.md     # Plan de Planeaciones cerrado como referencia
│   ├── PLAN_PASOS_INICIALES.md  # Plan rector activo actual
├── .agents/skills/              # Skills para agentes IA
│   ├── token-efficiency/        # Control de verbosidad adaptativo
│   ├── writing-style/           # Convenciones de escritura
│   ├── accessibility/           # Accesibilidad VoiceOver/TalkBack
│   ├── best-practices/          # Best practices RN/Expo
│   ├── performance/             # Optimizacion de rendimiento
│   ├── core-web-vitals/         # Metricas de performance
│   ├── seo/                     # ASO y deep linking
│   └── web-quality-audit/       # Auditoria de calidad
│
├── backend/
│   ├── api/                     # Endpoints serverless (Vercel)
│   │   ├── auth.js              # Login, registro
│   │   ├── health.js            # Health check
│   │   ├── planeaciones.js      # CRUD con userId isolation
│   │   └── sync.js              # Sincronizacion batch
│   └── lib/
│       ├── auth.js              # getUserFromToken, verifyApiKey
│       ├── mongodb.js           # Conexion a Atlas
│       └── databaseIndexes.js   # Indices de MongoDB
│
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── BottomNavBar.tsx
│   │   └── SyncIndicator.tsx
│   ├── context/
│   │   ├── AuthContext.tsx       # Autenticacion y sesion
│   │   ├── PlaneacionesContext.tsx # Estado de planeaciones
│   │   └── NotificacionesContext.tsx
│   ├── hooks/                   # ViewModels (custom hooks)
│   ├── navigation/
│   │   └── StackNavigator.tsx   # Todas las rutas
│   ├── screens/
│   │   ├── auth/                # LoginScreen
│   │   ├── planeaciones/        # Editor, Lista, Crear
│   │   ├── grupos/              # Grupos, Detalle, Crear
│   │   ├── biblioteca/          # Recursos didacticos
│   │   ├── cuenta/              # Perfil
│   │   ├── notificaciones/
│   │   └── ayuda/
│   ├── services/
│   │   └── pushNotificationService.ts
│   ├── sync/
│   │   └── services/
│   │       ├── syncEngine.ts    # Motor de sincronizacion
│   │       └── syncService.ts   # Servicio de sync
│   ├── themes/
│   │   └── colors.ts            # Paleta de colores
│   └── utils/
│       ├── apiClient.ts         # Cliente HTTP centralizado
│       └── migrateV1toV2.ts     # Migracion de tipos V1 a V2
│
├── types/
│   ├── index.ts                 # Tipos generales (Grupo, Alumno, etc.)
│   ├── planeacion.ts            # V1 types (legacy, en deprecacion)
│   ├── planeacionV2.ts          # V2 types (NEM-aligned, estandar nuevo)
│   └── plantillaDocumento.ts    # Tipos de plantillas
│
├── context/
│   └── planeaciones-reales/     # Ejemplos de planeaciones reales
│
└── Documentacion/               # Docs tecnicos
```

---

## Sistema de Tipos

### V1 (Legacy - en deprecacion)

Definidos en `types/planeacion.ts`. Estructura plana con campos basicos:

```typescript
interface Planeacion {
  id: string;
  titulo: string;
  asignatura: string;
  grado: string;
  semanas: Semana[];
  // ...campos simples
}
```

### V2 (Actual - alineado a NEM)

Definidos en `types/planeacionV2.ts`. Estructura jerarquica que soporta desde primaria hasta universidad:

```typescript
interface PlaneacionDocumento {
  id: string;
  metadatos: MetadatosPlaneacion;      // Institucion, docente, periodo
  configuracion: ConfiguracionNivel;    // Nivel educativo y campos
  contenido: ContenidoPlaneacion;       // Semanas con sesiones y actividades
  estadoSync: EstadoSincronizacion;     // Control de sync
}
```

La funcion `migrateV1toV2` en `src/utils/migrateV1toV2.ts` convierte documentos V1 a V2.

### Plantillas

Definidas en `types/plantillaDocumento.ts`. Representan la estructura NEM escaneada de documentos reales.

---

## Flujo de Datos

### Escritura (optimistic update)

```
Usuario edita → setState (UI inmediata)
             → AsyncStorage.setItem (persistencia local)
             → Cola de sync (operacion pendiente)
             → [Cuando hay red] POST /api/sync → MongoDB Atlas
```

### Lectura

```
App inicia → AsyncStorage.getItem → setState (datos locales)
          → [Si hay red] GET /api/sync → merge con datos remotos
```

### Conflictos

Estrategia last-write-wins basada en `fechaModificacion`. El documento mas reciente sobrescribe.

---

## Backend

### Endpoints

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth` | POST | Login, registro |
| `/api/planeaciones` | GET/POST/PUT/DELETE | CRUD con userId isolation |
| `/api/sync` | POST | Sincronizacion batch |

### Autenticacion

```
Authorization: Bearer <JWT>
```

El JWT contiene `userId`. El backend decodifica con `getUserFromToken` y filtra todos los queries por `userId`.

### Indices MongoDB

```javascript
// Planeaciones
{ userId: 1, fechaModificacion: -1 }

// Cada coleccion futura
{ id: 1 } // unique
{ userId: 1 } // isolation
```

---

## Estrategia de Refactorizacion

### Enfoque modular

Cada modulo de la app recibe su propio plan de refactorizacion. El plan sigue un patron estandarizado de 8 fases:

| Fase | Nombre | Descripcion |
|------|--------|-------------|
| 0 | Limpieza Legacy | Eliminar codigo muerto, tipos duplicados, dependencias no usadas |
| 1 | Tipos y Modelo | Crear tipos V2 alineados al dominio, funciones de migracion |
| 2 | Capa de Datos | Context provider, sync, backend isolation |
| 3 | Editor Base | Instalar dependencias de UI (tentap-editor), crear componentes base |
| 4 | Pantallas | Rediseno completo de screens y ViewModels |
| 5 | Scanner | Escaner de plantillas/documentos existentes |
| 6 | IA Copiloto | Integrar asistencia de IA contextual |
| 7 | Export | Exportacion a PDF/DOCX, navegacion final |
| 8 | Verificacion | Eliminar codigo viejo, tests end-to-end |

### Vision

Transformar cada modulo de formularios nativos simples a experiencias docentes familiares:
- Planeaciones como Word/Docs.
- Grupos, recursos y tareas como Classroom.
- Diseno didactico como Canva/Genially.
- Listas y registros como Excel.
- Comunicacion docente como WhatsApp profesional.
- IA contextual con validacion humana, fallback local y costos controlados.

### Estado actual

El modulo de **Planeaciones** cerro Fase 9 como primera gran refactorizacion. La prioridad actual es ejecutar `Documentacion/PLAN_PASOS_INICIALES.md` y preparar el siguiente plan maestro: Classroom / Grupos y Recursos.

---

## Convenciones

### Nomenclatura

- Pantallas: `[Nombre]Screen.tsx` (PascalCase)
- Componentes: `[Nombre].tsx` (PascalCase)
- Hooks: `use[Nombre].ts` (camelCase)
- Utilidades: `[nombre].ts` (camelCase)
- Tipos: `[nombre].ts` (camelCase)

### Colores

Definidos en `src/themes/colors.ts`:

```typescript
COLORS = {
  primary: '#2196F3',
  secondary: '#87CEEB',
  background: '#f8fbff',
  surface: '#ffffff',
  error: '#f44336',
  text: '#1a1a1a',
  textSecondary: '#6b7280',
};
```

### Estilo de escritura

- Sin emojis en codigo, comentarios, commits, ni documentacion
- Commits en formato Conventional Commits: `type(scope): description`
- Comentarios explican WHY, no WHAT
- Ver `.agents/skills/writing-style/SKILL.md`

---

**Ultima actualizacion**: Mayo 2026
**Version de Arquitectura**: 4.0

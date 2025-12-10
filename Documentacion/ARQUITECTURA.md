# Arquitectura de PlanearIA

## 📋 Índice

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Navegación](#navegación)
4. [Flujos de Usuario](#flujos-de-usuario)
5. [Módulos Principales](#módulos-principales)
6. [Tipos y Modelos de Datos](#tipos-y-modelos-de-datos)

---

## 🎯 Visión General

**PlanearIA** es una aplicación móvil/web diseñada exclusivamente para docentes, que les permite gestionar de manera integral todos los aspectos de su labor educativa. La arquitectura ha sido rediseñada para ser más lógica, funcional y centrada en el flujo de trabajo real de un profesor.

### Principios de Diseño

1. **Centrada en el Docente**: Todas las funcionalidades están diseñadas pensando en las necesidades diarias del profesor
2. **Organización por Grupos**: Los alumnos, calificaciones y seguimiento se organizan por grupos/clases
3. **Recursos Inteligentes**: Generación de materiales educativos con IA, plantillas o desde cero
4. **Sin Comunicación Estudiantil**: No incluye chat ni herramientas de comunicación con estudiantes

---

## 📁 Estructura del Proyecto

```
PlanearIA/
├── src/
│   ├── screens/                    # Pantallas de la aplicación
│   │   ├── auth/                   # Autenticación
│   │   │   └── LoginScreen.tsx
│   │   │
│   │   ├── home/                   # Pantalla principal
│   │   │   └── HomeScreen.tsx
│   │   │
│   │   ├── planeaciones/           # Módulo de Planeaciones
│   │   │   ├── PlaneacionesScreen.tsx
│   │   │   ├── CrearPlaneacionScreen.tsx
│   │   │   ├── EditorPlaneacionScreen.tsx
│   │   │   └── ListaPlaneacionesScreen.tsx
│   │   │
│   │   ├── grupos/                 # ⭐ NUEVO: Módulo de Grupos
│   │   │   ├── GruposScreen.tsx           # Menú principal
│   │   │   ├── ListaGruposScreen.tsx      # Lista de grupos
│   │   │   ├── CrearGrupoScreen.tsx       # Crear nuevo grupo
│   │   │   └── DetalleGrupoScreen.tsx     # Detalle con pestañas
│   │   │
│   │   ├── recursosDidacticos/     # ⭐ NUEVO: Recursos Educativos
│   │   │   ├── RecursosDidacticosScreen.tsx    # Menú principal
│   │   │   ├── ExamenesScreen.tsx              # Crear exámenes
│   │   │   ├── PresentacionesScreen.tsx        # Crear presentaciones
│   │   │   ├── MapasMentalesScreen.tsx         # Crear mapas mentales
│   │   │   ├── LineasTiempoScreen.tsx          # Crear líneas de tiempo
│   │   │   └── ListaRecursosScreen.tsx         # Ver todos los recursos
│   │   │
│   │   ├── tareas/                 # Módulo de Tareas
│   │   │   └── TareasScreen.tsx
│   │   │
│   │   ├── cuenta/                 # Configuración de cuenta
│   │   │   └── CuentaScreen.tsx
│   │   │
│   │   └── [deprecated]/           # Pantallas antiguas (mantener por compatibilidad)
│   │       ├── alumnos/
│   │       ├── calificaciones/
│   │       └── recursos/
│   │
│   ├── navigation/                 # Navegación
│   │   └── StackNavigator.tsx      # Configuración de rutas
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── BottomNavBar.tsx
│   │   └── WebScrollView.tsx
│   │
│   ├── context/                    # Context API
│   │   └── PlaneacionesContext.tsx
│   │
│   └── utils/                      # Utilidades
│       └── responsive.ts
│
├── types/                          # Definiciones de TypeScript
│   ├── index.ts                    # Tipos principales
│   ├── planeacion.ts               # Tipos de planeaciones
│   └── images.d.ts
│
└── assets/                         # Recursos estáticos
    └── [iconos, imágenes, etc.]
```

---

## 🧭 Navegación

### Mapa de Navegación

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌────────────────────────────────────────────────────┐
│                   HOME                             │
│  ┌──────────┬──────────┬────────────┬────────────┐ │
│  │Planeacio │  Grupos  │ Recursos   │  Tareas    │ │
│  │   nes    │          │ Didácticos │            │ │
│  └─────┬────┴────┬─────┴──────┬─────┴─────┬──────┘ │
└────────┼─────────┼────────────┼───────────┼────────┘
         │         │            │           │
         ▼         ▼            ▼           ▼
```

### Stack de Navegación (RootStackParamList)

```typescript
RootStackParamList = {
  // Autenticación
  Login: undefined
  Home: undefined

  // Planeaciones
  Planeaciones: undefined
  CrearPlaneacion: undefined
  EditorPlaneacion: { nivel, modo, planeacionId? }
  ListaPlaneaciones: undefined

  // ⭐ Grupos (NUEVA ARQUITECTURA)
  Grupos: undefined
  ListaGrupos: undefined
  CrearGrupo: undefined
  DetalleGrupo: { grupoId, grupoNombre }

  // Tareas
  Tareas: undefined

  // ⭐ Recursos Didácticos (NUEVA ARQUITECTURA)
  RecursosDidacticos: undefined
  Examenes: undefined
  Presentaciones: undefined
  MapasMentales: undefined
  LineasTiempo: undefined
  ListaRecursos: undefined

  // Cuenta
  Cuenta: undefined
}
```

---

## 👤 Flujos de Usuario

### 1. Flujo de Gestión de Grupos

```
Home → Grupos → Opciones:
                 ├─→ Crear Grupo → Formulario → Guardar → Lista Grupos
                 └─→ Mis Grupos → Seleccionar Grupo → Detalle Grupo
                                                        │
                      ┌─────────────────────────────────┴───────────────────────┐
                      │                 Pestañas del Grupo:                     │
                      ├─→ Alumnos (agregar, editar, ver detalles)               │
                      ├─→ Calificaciones (registrar, consultar)                 │
                      ├─→ Asistencias (pasar lista, estadísticas)               │
                      ├─→ Comentarios (notas personalizadas por alumno)         │
                      └─→ Gráficas (rendimiento, promedios, comparativas)       │
                      └─────────────────────────────────────────────────────────┘
```

**Características clave del flujo de Grupos:**

- Un grupo agrupa: alumnos, calificaciones, asistencias y comentarios
- Vista unificada con pestañas para gestionar todo desde un solo lugar
- Estadísticas y gráficas integradas para análisis del rendimiento
- Comentarios personalizados para seguimiento individual

### 2. Flujo de Recursos Didácticos

```
Home → Recursos Didácticos → Tipo de Recurso:
                              ├─→ Exámenes ──────┐
                              ├─→ Presentaciones ├→ Método de Creación:
                              ├─→ Mapas Mentales │   ├─→ Generar con IA
                              └─→ Líneas Tiempo ─┘   ├─→ Usar Plantilla
                                                      └─→ Crear Manualmente
                                    ↓
                              Editor/Generador → Vista Previa → Guardar
                                    ↓
                              Lista de Recursos (ver todos)
```

**Características clave de Recursos Didácticos:**

- 4 tipos principales: Exámenes, Presentaciones, Mapas Mentales, Líneas de Tiempo
- 3 métodos de creación para cada tipo:
  - **IA**: Generación automática basada en temas
  - **Plantillas**: Diseños predefinidos personalizables
  - **Manual**: Creación desde cero
- Todos los recursos se guardan y pueden consultarse en "Lista de Recursos"

### 3. Flujo de Planeaciones (Se mantiene)

```
Home → Planeaciones → Opciones:
                       ├─→ Crear Nueva → Seleccionar Nivel → Editor → Guardar
                       └─→ Mis Planeaciones → Seleccionar → Ver/Editar
```

### 4. Flujo de Tareas (Existente)

```
Home → Tareas → Opciones:
                 ├─→ Crear Tarea → Formulario → Asignar a Grupo → Guardar
                 └─→ Mis Tareas → Ver → Revisar Entregas
```

---

## 🔧 Módulos Principales

### 1. Módulo de Grupos ⭐ (NUEVO)

**Propósito**: Gestionar grupos de alumnos de manera integral

**Pantallas**:

- `GruposScreen`: Menú principal (Crear Grupo / Mis Grupos)
- `ListaGruposScreen`: Lista todos los grupos con búsqueda
- `CrearGrupoScreen`: Formulario para crear un nuevo grupo
- `DetalleGrupoScreen`: Vista detallada con 5 pestañas

**Pestañas en DetalleGrupoScreen**:

| Pestaña            | Funcionalidad                                         |
| ------------------ | ----------------------------------------------------- |
| **Alumnos**        | Lista de alumnos del grupo, agregar/editar alumnos    |
| **Calificaciones** | Registrar y consultar calificaciones del grupo        |
| **Asistencias**    | Control de asistencia, estadísticas de asistencia     |
| **Comentarios**    | Notas y observaciones personalizadas por alumno       |
| **Gráficas**       | Visualización de rendimiento, promedios, comparativas |

**Datos de un Grupo**:

```typescript
{
  nombre: "7A - Matemáticas Avanzadas";
  materia: "Matemáticas Avanzadas";
  carrera: "ISC";
  semestre: 7;
  periodo: "Enero-Junio 2024";
  cantidadAlumnos: 28;
  estado: "activo";
  horario: "Lun-Mie-Vie 7:00-9:00";
}
```

### 2. Módulo de Recursos Didácticos ⭐ (NUEVO)

**Propósito**: Crear materiales educativos con IA, plantillas o manualmente

**Tipos de Recursos**:

#### a) Exámenes

- Generación con IA basada en temas
- Plantillas de diferentes formatos (opción múltiple, abierto, mixto)
- Editor manual para crear preguntas personalizadas

#### b) Presentaciones (Diapositivas)

- Generación con IA a partir de un tema
- Plantillas de diseño profesional
- Editor de diapositivas desde cero

#### c) Mapas Mentales

- Generación automática de estructura con IA
- Plantillas para diferentes tipos de conceptos
- Creador visual de mapas mentales

#### d) Líneas de Tiempo

- Generación con IA para eventos históricos
- Plantillas para proyectos, historia, etc.
- Editor manual de eventos cronológicos

**Pantallas**:

- `RecursosDidacticosScreen`: Menú principal con 4 tipos
- `ExamenesScreen`: Opciones de creación de exámenes
- `PresentacionesScreen`: Opciones de creación de presentaciones
- `MapasMentalesScreen`: Opciones de creación de mapas mentales
- `LineasTiempoScreen`: Opciones de creación de líneas de tiempo
- `ListaRecursosScreen`: Ver todos los recursos creados

### 3. Módulo de Planeaciones (Existente)

**Propósito**: Crear y gestionar planeaciones didácticas

**Pantallas**:

- `PlaneacionesScreen`: Menú principal
- `CrearPlaneacionScreen`: Selección de nivel académico
- `EditorPlaneacionScreen`: Editor completo de planeación
- `ListaPlaneacionesScreen`: Consultar planeaciones guardadas

### 4. Módulo de Tareas (Existente)

**Propósito**: Asignar y gestionar tareas/exámenes

**Funcionalidades**:

- Crear nuevas tareas
- Asignar a grupos
- Ver entregas
- Calificar

### 5. Módulo de Cuenta (Existente)

**Propósito**: Configuración de cuenta y seguridad

**Funcionalidades**:

- Perfil del profesor
- Configuración de seguridad
- Preferencias
- Cerrar sesión

---

## 📊 Tipos y Modelos de Datos

### Nuevos Tipos Agregados

#### Grupo

```typescript
interface Grupo {
  id: number;
  nombre: string;
  materia: string;
  carrera: "ISC" | "IGE" | "ARQ" | "ITICS";
  semestre: number;
  periodo: string;
  profesorId: number;
  cantidadAlumnos: number;
  estado: "activo" | "inactivo" | "finalizado";
  fechaCreacion: Date;
  horario?: string;
}
```

#### Alumno (Actualizado)

```typescript
interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  numeroControl: string;
  grupoId?: number; // ⭐ NUEVO: relación con grupo
  carrera: Carrera;
  email?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fechaIngreso: Date;
  estado: "activo" | "inactivo" | "egresado" | "baja";
  fotoPerfil?: string; // ⭐ NUEVO
}
```

#### Calificacion (Actualizado)

```typescript
interface Calificacion {
  id: number;
  alumnoId: number;
  grupoId: number; // ⭐ NUEVO: antes era materiaId
  periodo: string;
  parcial1?: number;
  parcial2?: number;
  parcial3?: number;
  final?: number;
  promedio: number;
  estado: "aprobado" | "reprobado" | "pendiente";
  observaciones?: string;
  fechaRegistro: Date;
}
```

#### Asistencia (Nuevo)

```typescript
interface Asistencia {
  id: number;
  alumnoId: number;
  grupoId: number;
  fecha: Date;
  estado: "presente" | "ausente" | "retardo" | "justificada";
  observaciones?: string;
  hora?: string;
}
```

#### ComentarioAlumno (Nuevo)

```typescript
interface ComentarioAlumno {
  id: number;
  alumnoId: number;
  grupoId: number;
  profesorId: number;
  comentario: string;
  tipo: "academico" | "conductual" | "logro" | "area_mejora" | "general";
  privado: boolean;
  fecha: Date;
}
```

#### Recurso (Actualizado)

```typescript
interface Recurso {
  id: number;
  titulo: string;
  tipo:
    | "examen"
    | "presentacion"
    | "mapa_mental"
    | "linea_tiempo"
    | "video"
    | "documento"
    | "imagen"
    | "audio"
    | "enlace"
    | "otro";
  descripcion: string;
  archivo?: string;
  url?: string;
  grupoId?: number; // ⭐ NUEVO: antes era materiaId
  tags: string[];
  fechaCreacion: Date;
  fechaModificacion: Date;
  tamaño?: number;
  formato?: string;
  acceso: "publico" | "privado" | "restringido";
  origen: "manual" | "ia" | "plantilla"; // ⭐ NUEVO
}
```

---

## 🎨 Convenciones de Código

### Nomenclatura de Archivos

- Pantallas: `[Nombre]Screen.tsx` (PascalCase)
- Componentes: `[Nombre].tsx` (PascalCase)
- Utilidades: `[nombre].ts` (camelCase)
- Tipos: `[nombre].ts` (camelCase)

### Estructura de una Pantalla

```typescript
// 1. Imports
import React from "react";
import { View, Text, StyleSheet } from "react-native";

// 2. Types
type ScreenNavigationProp = ...;
interface ScreenProps { ... }

// 3. Component
const Screen: React.FC<ScreenProps> = ({ navigation }) => {
  // Estado
  // Funciones
  // Render
};

// 4. Styles
const styles = StyleSheet.create({ ... });

// 5. Export
export default Screen;
```

### Colores Principales

```typescript
COLORS = {
  primary: "#2196F3", // Azul principal
  secondary: "#87CEEB", // Azul claro
  background: "#f8fbff", // Fondo
  surface: "#ffffff", // Blanco para tarjetas
  error: "#f44336", // Rojo para errores
  text: "#1a1a1a", // Texto principal
  textSecondary: "#6b7280", // Texto secundario
};
```

---

## 🚀 Próximos Pasos de Implementación

### Fase 1: Funcionalidad Básica (Actual)

- ✅ Estructura de navegación
- ✅ Pantallas principales creadas
- ✅ Tipos y modelos definidos
- 🔄 Navegación funcional entre pantallas

### Fase 2: Lógica de Negocio

- [ ] Context API para manejo de estado global
- [ ] Integración con backend/API
- [ ] CRUD completo de Grupos
- [ ] CRUD completo de Recursos Didácticos
- [ ] Sistema de autenticación real

### Fase 3: Funcionalidades Avanzadas

- [ ] Integración con IA para generación de recursos
- [ ] Sistema de plantillas
- [ ] Generación de gráficas y estadísticas
- [ ] Exportación de datos (PDF, Excel)
- [ ] Sincronización en la nube

### Fase 4: Optimización

- [ ] Pruebas unitarias
- [ ] Optimización de rendimiento
- [ ] Mejoras de UI/UX
- [ ] Documentación completa

---

## 📝 Notas Importantes

1. **Pantallas Deprecadas**: Las pantallas antiguas (AlumnosScreen, CalificacionesScreen, RecursosScreen) se mantienen por compatibilidad pero no deben usarse en nuevas funcionalidades.

2. **Enfoque en Grupos**: La nueva arquitectura centraliza todo en torno a los grupos. Un docente trabaja con grupos, no con alumnos individuales dispersos.

3. **Recursos con IA**: Aunque la interfaz está lista, la integración con IA real será parte de la Fase 3.

4. **Sin Chat**: La aplicación NO incluye ni incluirá funciones de chat o mensajería con estudiantes.

5. **Responsive**: Toda la UI está diseñada para funcionar en móvil, tablet y web.

---

## 🔄 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         PlanearIA                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Login   │→ │   Home   │→ │  Grupos  │  │Planeacio │     │
│  │          │  │          │  │          │  │   nes    │     │
│  └──────────┘  └────┬─────┘  └────┬─────┘  └──────────┘     │
│                     │             │                         │
│                     ├─────────────┼─────────┐               │
│                     ▼             ▼         ▼               │
│              ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│              │ Recursos │  │  Tareas  │  │  Cuenta  │       │
│              │Didácticos│  │          │  │          │       │
│              └────┬─────┘  └──────────┘  └──────────┘       │
│                   │                                         │
│    ┌──────────────┼───────────────┐                         │
│    ▼              ▼               ▼                         │
│ ┌────────┐  ┌─────────┐  ┌──────────┐                       │
│ │Exámenes│  │Present. │  │MapasMent.│ ...                   │
│ └────────┘  └─────────┘  └──────────┘                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Context & State Management               │
│  ┌────────────────── ┐  ┌─────────────────┐                 │
│  │PlaneacionesContext│  │GruposContext    │  (Futuro)       │
│  └────────────────── ┘  └─────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│                    Types & Models                           │
│  Grupo | Alumno | Calificacion | Asistencia | Comentario    │
│  Recurso | Planeacion | Tarea | Usuario                     │
└─────────────────────────────────────────────────────────────┘
```

---

**Última actualización**: Noviembre 28, 2025  
**Versión de Arquitectura**: 2.0  
**Desarrollador**: PlanearIA Team

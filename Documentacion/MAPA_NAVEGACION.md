# 🗺️ Mapa Completo de Navegación - PlanearIA

## 📊 Vista General de Todas las Rutas

```
TOTAL: 23 PANTALLAS FUNCIONALES
├─ Autenticación: 2
├─ Planeaciones: 4
├─ Grupos: 4 ⭐ NUEVO
├─ Recursos Didácticos: 6 ⭐ NUEVO
├─ Tareas: 1
├─ Cuenta: 1
└─ Deprecated: 5 (mantener)
```

---

## 🌳 Árbol de Navegación Completo

```
┌────────────────────────────────────────────────────────────┐
│                      LoginScreen                           │
│                    (Autenticación)                         │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────┐
│                      HomeScreen                            │
│                   (Menú Principal)                         │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Planeacio-│  │  Grupos  │  │ Recursos │  │  Tareas  │ │
│  │   nes    │  │   ⭐     │  │Didácticos│  │          │ │
│  │          │  │          │  │    ⭐    │  │          │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
└───────┼─────────────┼─────────────┼─────────────┼────────┘
        │             │             │             │
        │             │             │             │
   ┌────┴────┐   ┌────┴────┐  ┌────┴────┐   ┌────┴────┐
   │         │   │         │  │         │   │         │
   ▼         ▼   ▼         ▼  ▼         ▼   ▼         ▼
```

---

## 🎯 MÓDULO 1: PLANEACIONES

```
PlaneacionesScreen (Menú)
├─→ CrearPlaneacionScreen
│   └─→ EditorPlaneacionScreen
│       (nivel, modo, planeacionId?)
│
└─→ ListaPlaneacionesScreen
    └─→ EditorPlaneacionScreen (editar)
```

**Rutas**:

1. `Planeaciones` (menú)
2. `CrearPlaneacion`
3. `EditorPlaneacion` (con params)
4. `ListaPlaneaciones`

**Total**: 4 pantallas

---

## 👥 MÓDULO 2: GRUPOS ⭐ NUEVO

```
GruposScreen (Menú)
├─→ CrearGrupoScreen
│   (Formulario)
│   └─→ [Guardar y volver a Lista]
│
└─→ ListaGruposScreen
    (Lista con búsqueda)
    └─→ DetalleGrupoScreen ⭐⭐⭐
        (grupoId, grupoNombre)
        │
        ├─→ [Pestaña: Alumnos]
        │   • Lista de alumnos
        │   • Agregar nuevo alumno
        │   • Ver/Editar alumno
        │
        ├─→ [Pestaña: Calificaciones]
        │   • Estadísticas del grupo
        │   • Registrar calificaciones
        │   • Ver historial
        │
        ├─→ [Pestaña: Asistencias]
        │   • Estadísticas de asistencia
        │   • Pasar lista
        │   • Ver historial
        │
        ├─→ [Pestaña: Comentarios]
        │   • Comentarios por alumno
        │   • Agregar comentario
        │   • Ver historial
        │
        └─→ [Pestaña: Gráficas]
            • Promedio de calificaciones
            • Evolución del grupo
            • % de asistencias
            • Comparativa por alumno
```

**Rutas**:

1. `Grupos` (menú)
2. `CrearGrupo`
3. `ListaGrupos`
4. `DetalleGrupo` (con params) ⭐ PANTALLA CLAVE

**Total**: 4 pantallas

**Característica Especial**: DetalleGrupoScreen tiene 5 pestañas integradas

---

## 🎨 MÓDULO 3: RECURSOS DIDÁCTICOS ⭐ NUEVO

```
RecursosDidacticosScreen (Menú)
├─→ ExamenesScreen
│   ├─→ [Generar con IA] (Placeholder)
│   ├─→ [Usar Plantilla] (Placeholder)
│   └─→ [Crear Manualmente] (Placeholder)
│
├─→ PresentacionesScreen
│   ├─→ [Generar con IA] (Placeholder)
│   ├─→ [Usar Plantilla] (Placeholder)
│   └─→ [Crear Manualmente] (Placeholder)
│
├─→ MapasMentalesScreen
│   ├─→ [Generar con IA] (Placeholder)
│   ├─→ [Usar Plantilla] (Placeholder)
│   └─→ [Crear Manualmente] (Placeholder)
│
├─→ LineasTiempoScreen
│   ├─→ [Generar con IA] (Placeholder)
│   ├─→ [Usar Plantilla] (Placeholder)
│   └─→ [Crear Manualmente] (Placeholder)
│
└─→ ListaRecursosScreen
    (Todos los recursos creados)
    (Con búsqueda y filtros)
```

**Rutas**:

1. `RecursosDidacticos` (menú)
2. `Examenes`
3. `Presentaciones`
4. `MapasMentales`
5. `LineasTiempo`
6. `ListaRecursos`

**Total**: 6 pantallas

**Nota**: Cada tipo de recurso tiene 3 métodos de creación (IA/Plantilla/Manual)

---

## 📝 MÓDULO 4: TAREAS

```
TareasScreen (Menú)
├─→ [Crear Tarea] (Placeholder)
└─→ [Mis Tareas] (Placeholder)
```

**Rutas**:

1. `Tareas`

**Total**: 1 pantalla (más subpantallas por implementar)

---

## ⚙️ MÓDULO 5: CUENTA

```
CuentaScreen
├─→ [Mi Perfil] (Placeholder)
├─→ [Configuración] (Placeholder)
└─→ [Cerrar Sesión]
```

**Rutas**:

1. `Cuenta`

**Total**: 1 pantalla

---

## 🗑️ PANTALLAS DEPRECATED (Mantener)

```
AlumnosScreen ❌ (Reemplazado por Grupos)
CalificacionesScreen ❌ (Reemplazado por Grupos)
RecursosScreen ❌ (Reemplazado por RecursosDidacticos)
```

**Rutas**:

1. `Alumnos` (deprecated)
2. `Calificaciones` (deprecated)
3. `Recursos` (deprecated)

**Total**: 3 pantallas (no usar en nuevas features)

**Nota**: Se mantienen solo por compatibilidad, no están en el menú principal

---

## 📊 Tabla de Todas las Rutas

| #   | Ruta                 | Pantalla                 | Módulo       | Params           | Estado |
| --- | -------------------- | ------------------------ | ------------ | ---------------- | ------ |
| 1   | `Login`              | LoginScreen              | Auth         | -                | ✅     |
| 2   | `Home`               | HomeScreen               | Main         | -                | ✅     |
| 3   | `Planeaciones`       | PlaneacionesScreen       | Planeaciones | -                | ✅     |
| 4   | `CrearPlaneacion`    | CrearPlaneacionScreen    | Planeaciones | -                | ✅     |
| 5   | `EditorPlaneacion`   | EditorPlaneacionScreen   | Planeaciones | nivel, modo, id? | ✅     |
| 6   | `ListaPlaneaciones`  | ListaPlaneacionesScreen  | Planeaciones | -                | ✅     |
| 7   | `Grupos`             | GruposScreen             | Grupos ⭐    | -                | ✅     |
| 8   | `CrearGrupo`         | CrearGrupoScreen         | Grupos ⭐    | -                | ✅     |
| 9   | `ListaGrupos`        | ListaGruposScreen        | Grupos ⭐    | -                | ✅     |
| 10  | `DetalleGrupo`       | DetalleGrupoScreen ⭐    | Grupos ⭐    | grupoId, nombre  | ✅     |
| 11  | `Tareas`             | TareasScreen             | Tareas       | -                | ✅     |
| 12  | `RecursosDidacticos` | RecursosDidacticosScreen | Recursos ⭐  | -                | ✅     |
| 13  | `Examenes`           | ExamenesScreen           | Recursos ⭐  | -                | ✅     |
| 14  | `Presentaciones`     | PresentacionesScreen     | Recursos ⭐  | -                | ✅     |
| 15  | `MapasMentales`      | MapasMentalesScreen      | Recursos ⭐  | -                | ✅     |
| 16  | `LineasTiempo`       | LineasTiempoScreen       | Recursos ⭐  | -                | ✅     |
| 17  | `ListaRecursos`      | ListaRecursosScreen      | Recursos ⭐  | -                | ✅     |
| 18  | `Cuenta`             | CuentaScreen             | Cuenta       | -                | ✅     |
| 19  | `Alumnos`            | AlumnosScreen            | Deprecated   | -                | ⚠️     |
| 20  | `Calificaciones`     | CalificacionesScreen     | Deprecated   | -                | ⚠️     |
| 21  | `Recursos`           | RecursosScreen           | Deprecated   | -                | ⚠️     |

**Total Activas**: 18 rutas principales  
**Total Deprecated**: 3 rutas (mantener)  
**TOTAL GENERAL**: 21 rutas registradas

---

## 🔀 Flujos de Navegación Críticos

### Flujo 1: Gestión de un Grupo Completo

```
Home
 └─→ Grupos
      └─→ ListaGrupos
           └─→ DetalleGrupo (Grupo seleccionado)
                ├─→ [Tab] Alumnos
                │   • Ver lista
                │   • Agregar alumno
                │
                ├─→ [Tab] Calificaciones
                │   • Ver estadísticas
                │   • Registrar calificaciones
                │
                ├─→ [Tab] Asistencias
                │   • Ver estadísticas
                │   • Pasar lista
                │
                ├─→ [Tab] Comentarios
                │   • Ver comentarios
                │   • Agregar comentario
                │
                └─→ [Tab] Gráficas
                    • Ver rendimiento
```

**Profundidad máxima**: 4 niveles  
**Pantallas involucradas**: 4  
**Pestañas**: 5

### Flujo 2: Crear un Recurso Educativo

```
Home
 └─→ RecursosDidacticos
      ├─→ Examenes
      │   └─→ [Seleccionar método]
      │       ├─→ IA
      │       ├─→ Plantilla
      │       └─→ Manual
      │
      ├─→ Presentaciones
      │   └─→ [Seleccionar método]
      │
      ├─→ MapasMentales
      │   └─→ [Seleccionar método]
      │
      └─→ LineasTiempo
          └─→ [Seleccionar método]

Todos guardan en → ListaRecursos
```

**Profundidad máxima**: 3 niveles  
**Pantallas involucradas**: 7  
**Opciones por recurso**: 3 (IA/Plantilla/Manual)

### Flujo 3: Navegación Rápida (BottomNavBar)

```
Cualquier Pantalla Profunda
 ├─→ [Botón Atrás] → Pantalla Anterior
 └─→ [Botón Home] → HomeScreen
```

**Disponible en**: Todas las pantallas excepto Login  
**Funcionalidad**: Navegación rápida sin perder contexto

---

## 🎨 Convención de Colores por Módulo

```typescript
// Identificación visual por módulo
Planeaciones:         #2196F3 (Azul)
Grupos:               #4CAF50 (Verde)
Recursos Didácticos:  #9C27B0 (Morado)
Tareas:               #FF9800 (Naranja)
Cuenta:               #F44336 (Rojo)

// Recursos Didácticos (sub-colores)
Exámenes:            #FF9800 (Naranja)
Presentaciones:      #2196F3 (Azul)
Mapas Mentales:      #9C27B0 (Morado)
Líneas de Tiempo:    #4CAF50 (Verde)
```

---

## 🔑 Rutas con Parámetros

### EditorPlaneacion

```typescript
{
  nivel: NivelAcademico;      // "primaria" | "secundaria" | etc.
  modo: "crear" | "editar";
  planeacionId?: string;      // Solo si modo === "editar"
}
```

**Ejemplo de navegación**:

```typescript
navigation.navigate("EditorPlaneacion", {
  nivel: "secundaria",
  modo: "crear",
});
```

### DetalleGrupo ⭐

```typescript
{
  grupoId: number; // ID único del grupo
  grupoNombre: string; // Nombre para mostrar en header
}
```

**Ejemplo de navegación**:

```typescript
navigation.navigate("DetalleGrupo", {
  grupoId: 1,
  grupoNombre: "7A - Matemáticas Avanzadas",
});
```

---

## 📱 Componentes de Navegación

### StackNavigator

**Ubicación**: `src/navigation/StackNavigator.tsx`  
**Función**: Gestiona todas las rutas de la app  
**Tipo**: Stack Navigator (React Navigation)

**Configuración global**:

```typescript
screenOptions={{
  headerShown: false,  // Usa BottomNavBar en su lugar
  gestureEnabled: true,
  cardStyle: { backgroundColor: '#f8fbff' }
}}
```

### BottomNavBar

**Ubicación**: `src/components/BottomNavBar.tsx`  
**Función**: Barra de navegación inferior  
**Presente en**: Todas las pantallas excepto Login

**Elementos**:

- Botón Atrás (izquierda)
- Título de pantalla (centro)
- Botón Home (derecha)

---

## 🎯 Métricas de Navegación

### Profundidad de Navegación

```
Nivel 0: Login
Nivel 1: Home
Nivel 2: Menús de módulos
Nivel 3: Pantallas de acción
Nivel 4: Pantallas de detalle
Nivel 5: No utilizado (evitar)
```

**Máxima profundidad**: 4 niveles  
**Promedio**: 2-3 niveles  
**Objetivo**: Máximo 3 clics para cualquier acción

### Tiempo de Navegación Esperado

```
Home → Cualquier módulo: < 1s
Módulo → Subpantalla: < 1s
Total Login → Acción: < 5s
```

---

## 🚦 Estados de Navegación

### Estado Normal ✅

```
Usuario puede:
- Navegar hacia adelante
- Regresar (botón atrás)
- Ir a Home directo
- Cambiar entre pestañas (DetalleGrupo)
```

### Estado de Carga 🔄

```
Durante navegación:
- Mostrar indicador de carga (opcional)
- Preservar estado anterior
- No permitir doble navegación
```

### Estado de Error ❌

```
Si falla navegación:
- Mostrar mensaje de error
- Permitir reintentar
- No crashear la app
```

---

## 🔄 Ciclo de Vida de Navegación

```
1. Usuario hace clic/toque
   ↓
2. Validar destino existe
   ↓
3. Preparar parámetros
   ↓
4. Ejecutar navigation.navigate()
   ↓
5. Animación de transición
   ↓
6. Renderizar nueva pantalla
   ↓
7. Registrar en historial
   ↓
8. Listo para interacción
```

---

## 📈 Estadísticas de Uso Esperado

### Pantallas Más Visitadas (Estimado)

1. **Home** - 100% (punto de entrada)
2. **DetalleGrupo** - 80% (gestión diaria)
3. **ListaGrupos** - 70%
4. **RecursosDidacticos** - 60%
5. **ListaRecursos** - 50%

### Flujos Más Comunes

1. Home → Grupos → Detalle → Asistencias (40%)
2. Home → Grupos → Detalle → Calificaciones (35%)
3. Home → Recursos → Crear recurso (30%)
4. Home → Planeaciones (25%)
5. Home → Tareas (20%)

---

## 🎉 Resumen Final

**Arquitectura de Navegación Completada**:

✅ **21 rutas** registradas en StackNavigator  
✅ **18 pantallas activas** funcionando  
✅ **4 niveles** de profundidad máxima  
✅ **5 pestañas** integradas en DetalleGrupo  
✅ **2 nuevos módulos** implementados  
✅ **BottomNavBar** en todas las pantallas  
✅ **TypeScript** completamente tipado  
✅ **Sin errores** de compilación  
✅ **Documentación** completa

**Estado**: ✅ **NAVEGACIÓN TOTALMENTE FUNCIONAL**

---

**Última actualización**: Noviembre 28, 2025  
**Versión**: 2.0  
**Autor**: Equipo PlanearIA  
**Próximo paso**: Implementar lógica de negocio (Fase 2)

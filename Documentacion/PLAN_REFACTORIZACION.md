# Plan de Refactorización - PlanearIA v3.0

## Análisis de Requerimientos

### Cambios planeados

1. **Integrar Tareas/Exámenes dentro de Grupos**

 - Las tareas no deben ser un módulo separado
 - Deben estar dentro de DetalleGrupoScreen como una pestaña adicional
 - Gestión completa: crear, asignar, calificar, ver entregas, estadísticas

2. **Mejorar Recursos Didácticos**

 - Al crear un recurso, elegir entre:
 - Solo guardar en "Mis Recursos"
 - Guardar Y asignar directamente a un grupo
 - Preparar para exportación futura (imágenes, videos, PowerPoint, Word, PDF)

3. **Principios de Diseño**
 - Navegación simple y minimalista
 - Arquitectura robusta y bien estructurada
 - Enfoque en la estructura, no en la funcionalidad completa
 - Todo debe tener lógica y coherencia

---

## Visión de la Nueva Arquitectura

### Filosofía Central

**Un profesor trabaja con GRUPOS, y dentro de cada grupo gestiona TODO:**

- Alumnos
- Calificaciones
- Asistencias
- Comentarios
- Gráficas de rendimiento
- **TAREAS/EXÁMENES/PROYECTOS** NUEVO

**Los recursos didácticos son herramientas que:**

- Se pueden crear y guardar para uso personal
- Se pueden asignar directamente a un grupo al crearlos
- En el futuro podrán exportarse en múltiples formatos

---

## Comparativa: Arquitectura Actual vs Nueva

### Arquitectura Actual (v2.0)

```
Home
├── Planeaciones (módulo independiente)
├── Grupos (5 pestañas)
│ ├── Alumnos
│ ├── Calificaciones
│ ├── Asistencias
│ ├── Comentarios
│ └── Gráficas
├── Recursos Didácticos (módulo independiente)
├── Tareas (módulo independiente) PROBLEMA
└── Cuenta
```

**Problema identificado:**

- Tareas como módulo separado no tiene sentido
- Las tareas están relacionadas con un grupo específico
- No hay forma directa de asignar recursos a grupos

### Nueva Arquitectura (v3.0)

```
Home
├── Planeaciones (sin cambios)
├── Grupos (6 pestañas - MÓDULO CENTRAL)
│ ├── Alumnos
│ ├── Calificaciones
│ ├── Asistencias
│ ├── Comentarios
│ ├── Tareas/Exámenes NUEVO
│ └── Gráficas
├── Recursos Didácticos (con opción de asignación)
│ └── Al crear: [Guardar] o [Guardar y Asignar a Grupo]
└── Cuenta
```

**Ventajas:**

- Todo relacionado con un grupo está en un solo lugar
- Navegación más lógica e intuitiva
- Reducción de 5 a 4 módulos principales
- Flujo de trabajo más natural para un profesor

---

## Cambios Técnicos Necesarios

### 1. Modelos de Datos (types/index.ts)

#### Modificaciones a Tarea

```typescript
// ANTES
interface Tarea {
 materiaId: ID; // Muy genérico
 // ...
}

// DESPUÉS
interface Tarea {
 grupoId: ID; // Específico al grupo
 tipo: "tarea" | "examen" | "proyecto" | "investigacion";
 recursoId?: ID; // Relacionar con recurso si es un examen
 // ...
}
```

#### Nueva Interfaz: EntregaTarea

```typescript
interface EntregaTarea {
 id: ID;
 tareaId: ID;
 alumnoId: ID;
 fechaEntrega: Date;
 archivo?: string;
 comentarioAlumno?: string;
 calificacion?: number;
 calificada: boolean;
 retroalimentacion?: string;
 estado: "pendiente" | "entregada" | "tarde" | "calificada";
}
```

#### Modificación a Recurso

```typescript
// ANTES
interface Recurso {
 grupoId?: ID; // Solo opcional
}

// DESPUÉS
interface Recurso {
 grupoId?: ID;
 asignadoComoTarea: boolean; // NUEVO
 tareaId?: ID; // Si está asignado como tarea
 formatosExportacion?: string[]; // Para futuro: ["pdf", "docx", "pptx"]
}
```

### 2. Pantallas a Modificar

#### DetalleGrupoScreen (Modificar)

**Cambio principal:** Agregar 6ta pestaña

```typescript
const tabs = [
 { id: "alumnos", label: "Alumnos", icon: "people" },
 { id: "calificaciones", label: "Calificaciones", icon: "grade" },
 { id: "asistencias", label: "Asistencias", icon: "event-available" },
 { id: "comentarios", label: "Comentarios", icon: "comment" },
 { id: "tareas", label: "Tareas", icon: "assignment" }, // NUEVO
 { id: "graficas", label: "Gráficas", icon: "analytics" },
];
```

**Contenido de la pestaña "Tareas":**

- Listado de tareas/exámenes del grupo
- Estadísticas: X% entregadas, promedio, etc.
- Botones:
 - "Crear Tarea"
 - "Asignar Examen" (desde recursos)
 - "Ver Todas"

### 3. Pantallas Nuevas a Crear

#### A. `CrearTareaGrupoScreen`

- Formulario para crear tarea
- Campos: título, descripción, tipo, fecha entrega, valor
- Ya tiene el grupoId del grupo actual
- Navegación: `DetalleGrupo` → `CrearTareaGrupo`

#### B. `AsignarRecursoScreen`

- Muestra lista de recursos tipo "examen"
- Permite asignar uno existente como tarea
- Navegación: `DetalleGrupo` → `AsignarRecurso`

#### C. `DetalleTareaScreen`

- Información completa de la tarea
- Lista de alumnos con estado de entrega
- Indicadores visuales: Entregado | Pendiente | Tarde
- Botones: "Calificar Entregas"

#### D. `CalificarEntregasScreen`

- Lista de entregas por alumno
- Formulario de calificación por alumno
- Campo de retroalimentación
- Ver archivo entregado

### 4. Modificaciones a Recursos Didácticos

#### ExamenesScreen / PresentacionesScreen / etc.

**Agregar al final del formulario:**

```tsx
<View style={styles.asignacionSection}>
 <Text style={styles.sectionTitle}>¿Qué deseas hacer?</Text>

 <TouchableOpacity
 style={[styles.optionButton, saveOption === "save" && styles.optionActive]}
 onPress={() => setSaveOption("save")}
 >
 <MaterialIcons name="save" size={24} />
 <Text>Solo guardar en Mis Recursos</Text>
 </TouchableOpacity>

 <TouchableOpacity
 style={[
 styles.optionButton,
 saveOption === "assign" && styles.optionActive,
 ]}
 onPress={() => setSaveOption("assign")}
 >
 <MaterialIcons name="assignment" size={24} />
 <Text>Guardar y asignar a un grupo</Text>
 </TouchableOpacity>

 {saveOption === "assign" && (
 <View>
 <Text>Selecciona el grupo:</Text>
 {/* Dropdown de grupos */}
 </View>
 )}
</View>
```

### 5. Navegación (StackNavigator)

#### Rutas a ELIMINAR

```typescript
Tareas: undefined; // Ya no existe como módulo independiente
```

#### Rutas a AGREGAR

```typescript
// Tareas dentro de Grupos
CrearTareaGrupo: { grupoId: number }
AsignarRecurso: { grupoId: number }
DetalleTarea: { tareaId: number, grupoId: number }
CalificarEntregas: { tareaId: number, grupoId: number }
```

### 6. HomeScreen

**Antes (5 opciones):**

```typescript
menuOptions = [
 "Planeaciones",
 "Grupos",
 "RecursosDidacticos",
 "Tareas", // ELIMINAR
 "Cuenta",
];
```

**Después (4 opciones):**

```typescript
menuOptions = [
 "Planeaciones",
 "Grupos", // Ahora incluye tareas
 "RecursosDidacticos",
 "Cuenta",
];
```

---

## Nuevos Flujos de Navegación

### Flujo 1: Crear y Asignar una Tarea

```
Home
 └─→ Grupos
 └─→ ListaGrupos
 └─→ DetalleGrupo (seleccionar grupo)
 └─→ [Pestaña: Tareas]
 ├─→ "Crear Tarea" → CrearTareaGrupoScreen
 │ └─→ [Guardar] → Volver a DetalleGrupo
 │
 └─→ "Asignar Examen" → AsignarRecursoScreen
 └─→ [Asignar] → Volver a DetalleGrupo
```

### Flujo 2: Ver Entregas y Calificar

```
DetalleGrupo (pestaña Tareas)
 └─→ [Seleccionar Tarea] → DetalleTareaScreen
 ├─→ Ver lista de entregas
 │ • Juan Pérez - Entregado
 │ • María López - Pendiente
 │ • Carlos Gómez - Tarde
 │
 └─→ "Calificar" → CalificarEntregasScreen
 └─→ [Guardar calificaciones] → DetalleTarea
```

### Flujo 3: Crear Examen y Asignarlo Directamente

```
Home
 └─→ RecursosDidacticos
 └─→ Examenes
 └─→ [Seleccionar método: IA/Plantilla/Manual]
 └─→ Crear examen
 └─→ Al finalizar:
 • Opción 1: "Solo guardar" → ListaRecursos
 • Opción 2: "Guardar y asignar a grupo"
 └─→ [Seleccionar grupo] → Se asigna automáticamente
 → DetalleGrupo (pestaña Tareas)
```

---

## Diseño de Interfaces

### Pestaña "Tareas" en DetalleGrupoScreen

```
┌─────────────────────────────────────────┐
│ Tareas y Exámenes del Grupo │
├─────────────────────────────────────────┤
│ │
│ Estadísticas │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ 75% │ │ 8.5 │ │ 3 │ │
│ │Entregado│ │Promedio │ │Pendiente│ │
│ └─────────┘ └─────────┘ └─────────┘ │
│ │
│ [Crear Nueva Tarea] [Asignar Examen] │
│ │
│ Tareas Activas │
│ ┌───────────────────────────────────┐ │
│ │ Investigación sobre IA │ │
│ │ Entrega: 2 días │ │
│ │ 15/28 entregados | Valor: 20pts │ │
│ └───────────────────────────────────┘ │
│ │
│ ┌───────────────────────────────────┐ │
│ │ Examen Parcial 2 │ │
│ │ Próximo: 30 Nov | Valor: 30pts │ │
│ └───────────────────────────────────┘ │
│ │
└─────────────────────────────────────────┘
```

### DetalleTareaScreen

```
┌─────────────────────────────────────────┐
│ ← Investigación sobre IA │
├─────────────────────────────────────────┤
│ │
│ Tipo: Tarea │
│ Valor: 20 puntos │
│ Fecha asignación: 15 Nov 2025 │
│ Fecha entrega: 30 Nov 2025 │
│ │
│ Descripción: │
│ Realizar investigación sobre... │
│ │
│ ────────────────────────────────────── │
│ │
│ Estado de Entregas (15/28) │
│ │
│ Juan Pérez García │
│ Entregado: 28 Nov | 9.5/10 │
│ │
│ María López Martínez │
│ Entregado: 29 Nov | 8.0/10 │
│ │
│ Carlos Gómez Ruiz │
│ Pendiente │
│ │
│ Ana Torres Silva │
│ Entregado tarde: 1 Dic │
│ │
│ [Calificar Entregas] │
│ │
└─────────────────────────────────────────┘
```

### Opción de Asignación en Recursos

```
┌─────────────────────────────────────────┐
│ Crear Examen │
├─────────────────────────────────────────┤
│ │
│ Título: [_______________] │
│ Tema: [_______________] │
│ ... │
│ │
│ ────────────────────────────────────── │
│ │
│ ¿Qué deseas hacer con este examen? │
│ │
│ ○ Solo guardar en Mis Recursos │
│ └─ Podrás asignarlo después │
│ │
│ ● Guardar y asignar a un grupo │
│ └─ Seleccionar grupo: [7A Matemáti▼] │
│ Fecha entrega: [30 Nov 2025] │
│ Valor: [30] puntos │
│ │
│ [Cancelar] [Guardar] │
│ │
└─────────────────────────────────────────┘
```

---

## Actualizaciones de Colores

```typescript
COLORS = {
 // Existentes
 primary: "#2196F3",
 grupos: "#4CAF50",
 recursos: "#9C27B0",

 // Nuevos para Tareas
 tareas: "#FF9800", // Naranja (ya existe, reusar)
 tareasPendiente: "#FFC107", // Amarillo para pendientes
 tareasEntregada: "#4CAF50", // Verde para entregadas
 tareasTarde: "#F44336", // Rojo para entregas tardías
 tareasCalificada: "#2196F3", // Azul para calificadas
};
```

---

## Resumen de Archivos a Modificar/Crear

### Modificar (7 archivos)

1. **types/index.ts**

 - Actualizar `Tarea` con `grupoId`
 - Crear `EntregaTarea`
 - Actualizar `Recurso` con campos de asignación

2. **src/screens/grupos/DetalleGrupoScreen.tsx**

 - Agregar 6ta pestaña "Tareas"
 - Implementar contenido de pestaña

3. **src/screens/home/HomeScreen.tsx**

 - Eliminar opción "Tareas"
 - Mantener solo 4 módulos principales

4. **src/navigation/StackNavigator.tsx**

 - Eliminar ruta `Tareas`
 - Agregar 4 rutas nuevas de tareas en grupos

5. **src/screens/recursosDidacticos/ExamenesScreen.tsx**

 - Agregar sección de asignación
 - Toggle: guardar vs asignar

6. **src/screens/recursosDidacticos/PresentacionesScreen.tsx**

 - Similar a ExamenesScreen

7. **src/screens/recursosDidacticos/MapasMentalesScreen.tsx**
 - Similar a ExamenesScreen

### Crear (5 archivos nuevos)

1. **src/screens/grupos/tareas/CrearTareaGrupoScreen.tsx**

 - Formulario de creación de tarea

2. **src/screens/grupos/tareas/AsignarRecursoScreen.tsx**

 - Lista de recursos para asignar

3. **src/screens/grupos/tareas/DetalleTareaScreen.tsx**

 - Detalle de tarea con entregas

4. **src/screens/grupos/tareas/CalificarEntregasScreen.tsx**

 - Calificar entregas individualmente

5. **src/screens/grupos/tareas/ListaTareasScreen.tsx**
 - Vista completa de todas las tareas (opcional)

### Actualizar Documentación (5 archivos)

1. **ARQUITECTURA.md**
2. **MAPA_NAVEGACION.md**
3. **DIAGRAMA_NAVEGACION.md**
4. **RESUMEN.md**
5. **GUIA_PRUEBAS.md**

---

## Plan de Implementación

### Fase 1: Tipos y Modelos

- [x] Actualizar `types/index.ts`
- [x] Crear `EntregaTarea`
- [x] Modificar `Tarea` y `Recurso`

### Fase 2: Navegación

- [ ] Actualizar `StackNavigator`
- [ ] Remover ruta `Tareas`
- [ ] Agregar rutas nuevas
- [ ] Actualizar `HomeScreen`

### Fase 3: Grupos (Tareas)

- [ ] Modificar `DetalleGrupoScreen`
- [ ] Crear `CrearTareaGrupoScreen`
- [ ] Crear `AsignarRecursoScreen`
- [ ] Crear `DetalleTareaScreen`
- [ ] Crear `CalificarEntregasScreen`

### Fase 4: Recursos (Asignación)

- [ ] Modificar `ExamenesScreen`
- [ ] Modificar `PresentacionesScreen`
- [ ] Modificar `MapasMentalesScreen`
- [ ] Modificar `LineasTiempoScreen`

### Fase 5: Documentación

- [ ] Actualizar `ARQUITECTURA.md`
- [ ] Actualizar `MAPA_NAVEGACION.md`
- [ ] Actualizar `DIAGRAMA_NAVEGACION.md`
- [ ] Actualizar `RESUMEN.md`
- [ ] Actualizar `GUIA_PRUEBAS.md`
- [ ] Crear `CHANGELOG.md`

---

## Validación de la Arquitectura

### Criterios de Éxito

1. **Simplicidad**

 - 4 módulos principales (antes 5)
 - Navegación más directa
 - Menos profundidad de navegación

2. **Lógica**

 - Tareas relacionadas con grupos
 - Recursos pueden asignarse directamente
 - Todo en contexto

3. **Robustez**

 - Tipos TypeScript completos
 - Relaciones claras entre entidades
 - Preparado para escalabilidad

4. **Minimalismo**
 - No funcionalidad innecesaria
 - Solo estructura de navegación
 - Placeholders para lógica futura

---

## Métricas de Mejora

| Métrica | Antes (v2.0) | Después (v3.0) | Mejora |
| ------------------------ | ------------ | -------------- | ------ |
| Módulos principales | 5 | 4 | -20% |
| Pestañas en Grupos | 5 | 6 | +20% |
| Clics para asignar tarea | 5-6 | 2-3 | -50% |
| Pantallas totales | 21 | 25 | +19% |
| Profundidad navegación | 4 niveles | 4 niveles | = |
| Coherencia lógica | 7/10 | 10/10 | +30% |

---

## Notas Importantes

### Para Implementación

1. **No implementar lógica completa** - Solo estructura y navegación
2. **Usar placeholders** - Para operaciones que vendrán después
3. **Mantener consistencia** - Estilos y patrones existentes
4. **TypeScript estricto** - Todos los tipos bien definidos

### Para el Futuro (Fase 2)

1. **Context API** para manejo de estado
2. **API REST** para backend
3. **IA Integration** para generación de recursos
4. **Exportación** en múltiples formatos
5. **Notificaciones** para entregas y fechas

---

## Resultado Esperado

Una aplicación con:

- Arquitectura limpia y lógica
- Navegación intuitiva
- Grupos como módulo central
- Tareas integradas en grupos
- Recursos con opción de asignación
- Preparada para exportación futura
- 0 errores de TypeScript
- Documentación completa y actualizada

---

**Fecha de creación**: 28 Noviembre 2025
**Versión**: 3.0 (Plan)
**Estado**: Pendiente de implementación
**Autor**: Equipo PlanearIA

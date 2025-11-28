# Diagrama de Navegación - PlanearIA

## 📱 Flujo Visual Completo

```
                    ┌─────────────────┐
                    │                 │
                    │  LoginScreen    │
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │                 │
                    │   HomeScreen    │
                    │  (Menú Principal)│
                    │                 │
                    └────┬───┬───┬────┘
                         │   │   │
         ┌───────────────┼───┼───┼───────────────┐
         │               │   │   │               │
         ▼               ▼   ▼   ▼               ▼
   ┌──────────┐   ┌─────────────────┐   ┌──────────┐
   │Planeacio-│   │     GRUPOS      │   │  Tareas  │
   │   nes    │   │   ⭐ NUEVO ⭐    │   │          │
   │          │   │                 │   │          │
   └─────┬────┘   └────────┬────────┘   └──────────┘
         │                 │
         │        ┌────────┴────────┐
         │        │                 │
         │        ▼                 ▼
         │  ┌──────────┐     ┌──────────┐
         │  │  Lista   │     │  Crear   │
         │  │  Grupos  │     │  Grupo   │
         │  │          │     │          │
         │  └─────┬────┘     └──────────┘
         │        │
         │        ▼
         │  ┌───────────────────────────┐
         │  │   DetalleGrupoScreen      │
         │  │   ┌───────────────────┐   │
         │  │   │ 📑 Pestañas:      │   │
         │  │   ├─ Alumnos         │   │
         │  │   ├─ Calificaciones  │   │
         │  │   ├─ Asistencias     │   │
         │  │   ├─ Comentarios     │   │
         │  │   └─ Gráficas        │   │
         │  │   └───────────────────┘   │
         │  └───────────────────────────┘
         │
         ▼
   ┌──────────────────────────────┐
   │   RECURSOS DIDÁCTICOS        │
   │      ⭐ NUEVO ⭐             │
   └──────────┬───────────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
    ▼         ▼         ▼         ▼
┌─────────┐┌────────┐┌─────────┐┌─────────┐
│Exámenes ││Present.││ Mapas   ││ Líneas  │
│         ││        ││Mentales ││ Tiempo  │
└────┬────┘└───┬────┘└────┬────┘└────┬────┘
     │         │          │          │
     └─────────┴──────────┴──────────┘
               │
               ▼
     ┌──────────────────────┐
     │ Método de Creación:  │
     ├──────────────────────┤
     │ 🤖 Generar con IA   │
     │ 📋 Usar Plantilla    │
     │ ✏️  Crear Manualmente│
     └──────────────────────┘

     Todos guardan en →  Lista de Recursos
```

---

## 🎯 Módulo de Grupos - Detalle

### Flujo de DetalleGrupoScreen

```
┌─────────────────────────────────────────────────────────┐
│            Detalle del Grupo: "7A - Matemáticas"       │
├─────────────────────────────────────────────────────────┤
│ [Alumnos] [Calificaciones] [Asistencias] [Comentarios] [Gráficas] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pestaña ALUMNOS:                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │ • Juan Pérez García         [Ver] [Editar]       │ │
│  │ • María López Martínez      [Ver] [Editar]       │ │
│  │ • Carlos Rodríguez Sánchez  [Ver] [Editar]       │ │
│  │                                                   │ │
│  │ [+ Agregar Nuevo Alumno]                         │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Pestaña CALIFICACIONES:                                │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Promedio Grupal: 8.5                              │ │
│  │ Aprobación: 85%                                   │ │
│  │                                                   │ │
│  │ [Registrar Calificaciones]                        │ │
│  │ [Ver Historial]                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Pestaña ASISTENCIAS:                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Asistencia Promedio: 92%                          │ │
│  │ Retardos Hoy: 3                                   │ │
│  │                                                   │ │
│  │ [Pasar Lista Hoy]                                 │ │
│  │ [Ver Historial de Asistencias]                    │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Pestaña COMENTARIOS:                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Juan Pérez: "Excelente participación"            │ │
│  │ María López: "Necesita mejorar en..."            │ │
│  │                                                   │ │
│  │ [+ Agregar Comentario]                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Pestaña GRÁFICAS:                                      │
│  ┌───────────────────────────────────────────────────┐ │
│  │  📊 Gráfica de Promedios                          │ │
│  │  📊 Evolución del Grupo                           │ │
│  │  📊 Porcentaje de Asistencias                     │ │
│  │  📊 Comparativa por Alumno                        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Módulo de Recursos Didácticos - Detalle

### Ejemplo: Crear un Examen

```
RecursosDidacticosScreen
         │
         ▼
    Seleccionar: EXÁMENES
         │
         ▼
┌─────────────────────────────┐
│   ExamenesScreen            │
│                             │
│  ¿Cómo quieres crear?       │
│                             │
│  ┌─────────────────────┐   │
│  │  🤖 Generar con IA  │───┼──→ Ingresa tema y nivel
│  └─────────────────────┘   │    IA genera preguntas
│                             │    Vista previa
│  ┌─────────────────────┐   │    Editar/Guardar
│  │  📋 Usar Plantilla  │───┼──→ Elige plantilla
│  └─────────────────────┘   │    (Opción múltiple, etc.)
│                             │    Personaliza
│  ┌─────────────────────┐   │    Guardar
│  │  ✏️ Crear Manual    │───┼──→ Editor en blanco
│  └─────────────────────┘   │    Agrega preguntas
│                             │    Configura puntaje
└─────────────────────────────┘    Guardar
         │
         ▼
    GUARDAR EN
  Lista de Recursos
```

### Tipos de Recursos Disponibles

| Tipo                 | Icono | Métodos                 | Casos de Uso          |
| -------------------- | ----- | ----------------------- | --------------------- |
| **Exámenes**         | 📝    | IA / Plantilla / Manual | Evaluaciones, quizzes |
| **Presentaciones**   | 📊    | IA / Plantilla / Manual | Clases, exposiciones  |
| **Mapas Mentales**   | 🧠    | IA / Plantilla / Manual | Organizar conceptos   |
| **Líneas de Tiempo** | 📅    | IA / Plantilla / Manual | Historia, proyectos   |

---

## 🔄 Comparación: Arquitectura Antigua vs Nueva

### ❌ ANTIGUA (Separada y dispersa)

```
Home
 ├─ Alumnos (Pantalla individual)
 ├─ Calificaciones (Pantalla individual)
 ├─ Recursos (Simple upload/download)
 └─ Tareas
```

**Problemas**:

- Alumnos y calificaciones separados
- No hay agrupación lógica
- Recursos básicos sin opciones de creación
- Difícil seguimiento integral

### ✅ NUEVA (Integrada y lógica)

```
Home
 ├─ Grupos (TODO integrado)
 │   └─ Detalle Grupo
 │       ├─ Alumnos
 │       ├─ Calificaciones  } Todo en
 │       ├─ Asistencias     } UN SOLO
 │       ├─ Comentarios     } LUGAR
 │       └─ Gráficas        }
 │
 └─ Recursos Didácticos (Creación avanzada)
     ├─ Exámenes (IA/Plantillas/Manual)
     ├─ Presentaciones (IA/Plantillas/Manual)
     ├─ Mapas Mentales (IA/Plantillas/Manual)
     └─ Líneas de Tiempo (IA/Plantillas/Manual)
```

**Ventajas**:

- ✅ Vista unificada por grupo
- ✅ Gestión integral de alumnos
- ✅ Seguimiento completo (notas, asistencia, comentarios)
- ✅ Gráficas y estadísticas integradas
- ✅ Recursos didácticos con IA
- ✅ Flujo de trabajo natural del docente

---

## 📋 Checklist de Navegación Implementada

### ✅ Completado

- [x] HomeScreen actualizado con 5 opciones principales
- [x] Stack Navigator configurado con todas las rutas
- [x] Módulo de Grupos completo (4 pantallas)
- [x] Módulo de Recursos Didácticos completo (6 pantallas)
- [x] DetalleGrupoScreen con sistema de pestañas
- [x] Cada recurso didáctico tiene su pantalla
- [x] Navegación tipada con TypeScript
- [x] BottomNavBar en todas las pantallas

### 🔄 Pendiente (Lógica de negocio)

- [ ] Context API para estado de Grupos
- [ ] Context API para estado de Recursos
- [ ] Integración con IA real
- [ ] Sistema de plantillas funcional
- [ ] CRUD completo de todas las entidades
- [ ] Generación de gráficas reales
- [ ] Persistencia de datos

---

## 🎓 Flujos de Uso Real del Docente

### Caso de Uso 1: Inicio de Semestre

```
1. Login → Home
2. Crear Grupo para cada materia
   - "7A - Matemáticas"
   - "5B - Programación"
3. Agregar alumnos a cada grupo
4. Configurar periodo y horarios
```

### Caso de Uso 2: Día a Día de Clases

```
1. Home → Grupos → Seleccionar "7A - Matemáticas"
2. Pestaña Asistencias → Pasar lista
3. Pestaña Comentarios → Agregar nota sobre alumno destacado
4. Home → Recursos Didácticos → Presentaciones
5. Generar con IA una presentación para próxima clase
```

### Caso de Uso 3: Fin de Parcial

```
1. Home → Grupos → Seleccionar grupo
2. Pestaña Calificaciones → Registrar calificaciones
3. Pestaña Gráficas → Ver rendimiento del grupo
4. Pestaña Comentarios → Agregar retroalimentación a alumnos
```

### Caso de Uso 4: Preparación de Examen

```
1. Home → Recursos Didácticos → Exámenes
2. Seleccionar "Generar con IA"
3. Ingresar tema: "Ecuaciones de Segundo Grado"
4. Revisar preguntas generadas
5. Editar si es necesario
6. Guardar en Lista de Recursos
7. Asignar examen desde Tareas → Crear Tarea
```

---

## 🗂️ Estructura de Carpetas Actualizada

```
src/
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   │
│   ├── home/
│   │   └── HomeScreen.tsx (Actualizado con 5 opciones)
│   │
│   ├── planeaciones/ (Mantiene 4 pantallas)
│   │   ├── PlaneacionesScreen.tsx
│   │   ├── CrearPlaneacionScreen.tsx
│   │   ├── EditorPlaneacionScreen.tsx
│   │   └── ListaPlaneacionesScreen.tsx
│   │
│   ├── grupos/ ⭐ NUEVO (4 pantallas)
│   │   ├── GruposScreen.tsx
│   │   ├── ListaGruposScreen.tsx
│   │   ├── CrearGrupoScreen.tsx
│   │   └── DetalleGrupoScreen.tsx (con pestañas)
│   │
│   ├── recursosDidacticos/ ⭐ NUEVO (6 pantallas)
│   │   ├── RecursosDidacticosScreen.tsx
│   │   ├── ExamenesScreen.tsx
│   │   ├── PresentacionesScreen.tsx
│   │   ├── MapasMentalesScreen.tsx
│   │   ├── LineasTiempoScreen.tsx
│   │   └── ListaRecursosScreen.tsx
│   │
│   ├── tareas/
│   │   └── TareasScreen.tsx
│   │
│   ├── cuenta/
│   │   └── CuentaScreen.tsx
│   │
│   └── [deprecated]/ (Mantener pero no usar)
│       ├── alumnos/
│       ├── calificaciones/
│       └── recursos/
│
├── navigation/
│   └── StackNavigator.tsx (Actualizado con 20+ rutas)
│
├── components/
│   ├── BottomNavBar.tsx
│   └── WebScrollView.tsx
│
├── context/
│   ├── PlaneacionesContext.tsx
│   ├── GruposContext.tsx (Pendiente)
│   └── RecursosContext.tsx (Pendiente)
│
└── utils/
    └── responsive.ts
```

**Total de pantallas**: 23 pantallas funcionales

---

## 🎯 Resumen de la Nueva Arquitectura

### Principios Fundamentales

1. **Centralización por Grupos**

   - Todo gira en torno a los grupos de clase
   - Vista unificada con pestañas
   - Seguimiento integral del desempeño

2. **Recursos Inteligentes**

   - 3 métodos de creación (IA, Plantillas, Manual)
   - 4 tipos principales de recursos educativos
   - Almacenamiento centralizado

3. **Flujo Natural del Docente**

   - Refleja el trabajo real día a día
   - Menos clics para tareas comunes
   - Información contextual

4. **Escalabilidad**
   - Fácil agregar nuevos tipos de recursos
   - Nuevas pestañas en grupos si se necesitan
   - Arquitectura modular

---

**Documento creado**: Noviembre 28, 2025  
**Autor**: Equipo PlanearIA  
**Estado**: Arquitectura implementada, pendiente lógica de negocio

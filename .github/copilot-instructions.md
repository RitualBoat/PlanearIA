# Instrucciones para GitHub Copilot — PlanearIA

## Contexto del Proyecto

PlanearIA es una app React Native + Expo SDK 54 + TypeScript para docentes mexicanos.
Arquitectura MVVM con hooks como ViewModels.

## Roadmap

- El archivo `roadmap-context/ROADMAP_COMPLETO_2.md` es la **fuente de verdad** de las tareas del proyecto.
- Cada tarea tiene un prefijo numérico (ej: `1.1.1`) y un estado: `[PENDIENTE]`, `[EN PROGRESO]`, `[COMPLETADO]`.
- Al completar una tarea, actualizar su estado en el roadmap.

### Cuando el usuario pida "trabajar en la próxima tarea"

1. Leer `ROADMAP_COMPLETO_2.md` para encontrar la siguiente tarea `[PENDIENTE]`
2. Implementar la tarea en el código
3. **Ejecutar tests** relacionados (`npm test -- --testPathPattern="<patrón>"`)
4. Cambiar su estado en el roadmap a `[COMPLETADO]` (o `[EN PROGRESO]`)
5. Informar al usuario del resultado

### Testing CI/CD — Regla obligatoria

**Cada vez que implementes o modifiques código funcional, DEBES:**

1. **Buscar tests existentes** que cubran el módulo modificado en `src/__tests__/`
2. **Ejecutar los tests afectados** y verificar que pasen
3. **Crear tests nuevos** si el módulo no tiene cobertura o si se crean archivos nuevos (context, viewModel, componente, servicio)
4. **Si un test falla**, arreglarlo antes de marcar la tarea como completada
5. Los tests se ejecutan con: `npm test` o `npm test -- --testPathPattern="<archivo>"`

### Python

- Ejecutable: `C:/Users/jarco/AppData/Local/Programs/Python/Python312/python.exe`
- Tiene `requests` instalado

## Notas de Desarrollo Importantes

### Pantallas Esqueleto ("Próximamente")

La app tiene pantallas/módulos que existen como esqueleto visual pero **no tienen funcionalidad implementada** (ej: Plantillas, Recursos, partes de Calificaciones avanzadas, etc.). Al desarrollar:

- **NUNCA elimines ni ocultes** estas pantallas de la navegación. Deben seguir visibles.
- Cuando el usuario intente usar una funcionalidad no implementada, mostrar un **mensaje/alerta** como: _"Esta función se implementará próximamente"_ o _"Disponible en una próxima actualización"_.
- Esto aplica a cualquier botón, screen o acción que pertenezca a un módulo del Backlog y aún no se haya implementado.
- Al implementar un módulo nuevo, verificar si ya tiene pantalla esqueleto y **reutilizarla** en lugar de crear una nueva.

### MongoDB — Base de Datos y Endpoints Backend

La base de datos MongoDB Atlas (`planeariaDB`) está **conectada pero vacía**. No tiene colecciones ni datos. Esto es intencional:

- **MongoDB es schemaless:** Las colecciones se crean automáticamente al insertar el primer documento. NO es necesario crear tablas/colecciones por adelantado.
- **La BD se llena progresivamente** conforme se implementan los endpoints de cada módulo:
  - Sprint 1 (ya hecho): `planeaciones` (via `/api/planeaciones` y `/api/sync`)
  - Sprint 3: `grupos`, `alumnos`
  - Sprint 4: `entregables`, `usuarios`
- **La app es offline-first:** AsyncStorage es la fuente primaria de datos. MongoDB es el respaldo en la nube via sincronización. La app funciona sin conexión.

#### Regla obligatoria: Índices al crear endpoints

**Cada vez que implementes una tarea de "Crear endpoint backend CRUD de X", DEBES crear índices** en la colección correspondiente. Hazlo al inicio del endpoint o en un bloque de inicialización:

```javascript
// Ejemplo para una colección nueva:
const collection = db.collection("grupos");

// Crear índices (idempotente, se puede llamar cada vez)
await collection.createIndex({ id: 1 }, { unique: true });
await collection.createIndex({ fechaModificacion: -1 });
// Si tiene userId: await collection.createIndex({ userId: 1 });
```

**Índices mínimos por colección:**
| Colección | Índices requeridos |
|---|---|
| `planeaciones` | `{ id: 1 }` unique, `{ fechaModificacion: -1 }` |
| `grupos` | `{ id: 1 }` unique, `{ fechaModificacion: -1 }` |
| `alumnos` | `{ id: 1 }` unique, `{ grupoId: 1 }` |
| `entregables` | `{ id: 1 }` unique, `{ grupoId: 1 }` |
| `usuarios` | `{ id: 1 }` unique, `{ email: 1 }` unique |
| `asistencias` | `{ id: 1 }` unique, `{ grupoId: 1, fecha: -1 }` |
| `calificaciones` | `{ id: 1 }` unique, `{ alumnoId: 1 }` |

**Nota:** `createIndex` es idempotente — si el índice ya existe, no hace nada. Es seguro llamarlo en cada invocación.

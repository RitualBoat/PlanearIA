# Instrucciones para GitHub Copilot -- PlanearIA

## Contexto del Proyecto

PlanearIA es una app React Native + Expo SDK 54 + TypeScript para docentes mexicanos.
Arquitectura MVVM con hooks como ViewModels.
Backend: Vercel serverless + MongoDB Atlas.
Storage local: AsyncStorage (offline-first).
Auth: JWT con userId isolation.

## Plan de Trabajo Activo

- El plan rector actual es `Documentacion/PLAN_PASOS_INICIALES.md`.
- El plan de Planeaciones quedo cerrado como referencia en `Documentacion/plan_planeaciones.md`.
- La guia obligatoria para nuevos planes maestros es `Documentacion/meta_guia_planes.md`.
- Cada modulo importante tendra su propio plan maestro dentro de `Documentacion/`, siguiendo tracking `[ ]`, `[~]`, `[x]`.
- Las tareas se marcan con: `[ ]` pendiente, `[~]` en progreso, `[x]` completado.
- Al completar una tarea, actualizar su estado en el plan.

### Cuando el usuario pida "trabajar en la proxima tarea"

1. Leer `Documentacion/PLAN_PASOS_INICIALES.md` y el plan maestro del modulo activo para encontrar la siguiente tarea pendiente `[ ]`
2. Implementar la tarea en el codigo
3. **Ejecutar tests** relacionados (`npm test -- --testPathPattern="<patron>"`)
4. Cambiar su estado en el plan a `[x]`
5. Informar al usuario del resultado

### Testing CI/CD -- Regla obligatoria

**Cada vez que implementes o modifiques codigo funcional, DEBES:**

1. **Buscar tests existentes** que cubran el modulo modificado en `src/__tests__/`
2. **Ejecutar los tests afectados** y verificar que pasen
3. **Crear tests nuevos** si el modulo no tiene cobertura o si se crean archivos nuevos (context, viewModel, componente, servicio)
4. **Si un test falla**, arreglarlo antes de marcar la tarea como completada
5. Los tests se ejecutan con: `npm test` o `npm test -- --testPathPattern="<archivo>"`
6. En Windows, usar `--rootDir c:\Users\jarco\dev\PlanearIA` para evitar conflictos de Haste Map

### Python

- Ejecutable: `C:/Users/jarco/AppData/Local/Programs/Python/Python312/python.exe`
- Tiene `requests` instalado

## Notas de Desarrollo

### Pantallas Esqueleto ("Proximamente")

La app tiene pantallas/modulos que existen como esqueleto visual pero **no tienen funcionalidad implementada**. Al desarrollar:

- No elimines pantallas esqueleto sin revisar el plan maestro vigente y la navegacion global.
- Cuando el usuario intente usar una funcionalidad no implementada, mostrar un mensaje como: "Esta funcion se implementara proximamente".
- Al implementar un modulo nuevo, verificar si ya tiene pantalla esqueleto y **reutilizarla**.
- Si un boton, card o ruta `Proximamente` aumenta carga cognitiva o parece accion real rota, documentarlo para UX/UI Global y considerar ocultarlo/redirigirlo con aprobacion del plan.

### MongoDB -- Base de Datos y Endpoints Backend

La base de datos MongoDB Atlas (`planeariaDB`) esta conectada. La app es offline-first: AsyncStorage es la fuente primaria. MongoDB es el respaldo via sincronizacion.

#### Regla obligatoria: Indices al crear endpoints

**Cada vez que implementes un endpoint backend CRUD, DEBES crear indices** en la coleccion:

```javascript
const collection = db.collection("grupos");
await collection.createIndex({ id: 1 }, { unique: true });
await collection.createIndex({ fechaModificacion: -1 });
```

**Indices por coleccion:**

| Coleccion | Indices requeridos |
|---|---|
| `planeaciones` | `{ userId: 1, fechaModificacion: -1 }`, `{ id: 1 }` unique |
| `grupos` | `{ id: 1 }` unique, `{ fechaModificacion: -1 }` |
| `alumnos` | `{ id: 1 }` unique, `{ grupoId: 1 }` |
| `entregables` | `{ id: 1 }` unique, `{ grupoId: 1 }` |
| `usuarios` | `{ id: 1 }` unique, `{ email: 1 }` unique |
| `asistencias` | `{ id: 1 }` unique, `{ grupoId: 1, fecha: -1 }` |
| `calificaciones` | `{ id: 1 }` unique, `{ alumnoId: 1 }` |

`createIndex` es idempotente. Seguro llamarlo en cada invocacion.

### Autenticacion

El backend usa JWT. Las peticiones incluyen:

```javascript
headers: {
  'Authorization': 'Bearer <JWT>',
  'Content-Type': 'application/json'
}
```

El JWT contiene `userId`. El backend decodifica con `getUserFromToken` en `backend/lib/auth.js`. Cada endpoint filtra datos por `userId` para aislamiento.

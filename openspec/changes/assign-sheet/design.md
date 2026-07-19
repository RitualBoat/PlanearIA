# Design: assign-sheet

## Context

El plan pide "un solo componente sobre `SYNC_ENTITIES` (clase/unidad/actividad); operacion encolada offline; usado por al menos un flujo real al cerrar". La lectura ingenua es que falta un componente. La lectura correcta, verificada sobre el codigo el 2026-07-19, es que faltan tres cosas y solo una es visual:

1. Un selector compartido (hoy hay tres UIs distintas y ninguna reutilizable).
2. Que la escritura encole (hoy tres de cuatro superficies escriben directo y la asignacion se pierde en el pull siguiente).
3. Que existan los niveles unidad y actividad como destino (el modelo ya los tiene; el producto solo los fija al crear).

El motor no falta. `queueEntityOperation` (`entitySync.ts:109-126`) ya encola y hace flush inmediato, y seis contextos lo usan bien. `AgregarContenidoClassroomScreen` ya crea materiales con `grupoId` y `unidadId` por el camino correcto. Este change no construye tuberia: conecta la que existe.

## Goals / Non-Goals

**Goals**

- Un componente y un ViewModel que cualquier superficie pueda montar con un contrato de props.
- Que ninguna asignacion pueda ocurrir sin quedar encolada.
- Que el docente confirme antes de escribir y sepa que paso despues, con precision.
- Que los tres niveles del plan sean elegibles sin cambiar esquema ni backend.
- Cerrar los dos defectos verificados de perdida y de confirmacion falsa.

**Non-Goals**

- Redisenar `AsignarRecursoScreen`, `ContenidoScreen` ni `ConversacionScreen`.
- Tocar el motor de sincronizacion o el backend.
- Incorporar planeaciones al selector, o desasignar en masa.
- Cerrar el golden journey GJ2, que ademas depende de `crear-tipo-primero`.

## Decisions

### D1. Un componente presentacional y un ViewModel; el contrato de props es lo transversal

`AssignSheet` no sabe de recursos ni de entregables: recibe `elementos` (lo que se va a asignar), `onAsignar` y estado. `useAssignSheet()` resuelve destinos, valida y ejecuta. La transversalidad que pide el plan no la da el componente por existir, la da el hecho de que su entrada sea un contrato y no una pantalla concreta. Si Office monta la hoja sobre un documento y Clases sobre un material, ambas usan la misma pieza y el mismo camino de escritura.

Alternativa descartada: una pantalla `AsignarScreen` generica. Obligaria a navegar fuera del contexto de trabajo, que es justo lo que el plan quiere eliminar ("sin descargar ni copiar nada", "desde el propio documento").

### D2. Cascada clase -> unidad -> actividad, con los dos ultimos opcionales

Elegir solo la clase es una asignacion completa y valida: es lo que el docente hace hoy y no puede volverse mas costoso. Unidad y actividad afinan y se cargan al elegir el nivel anterior.

El mapeo a campos existentes es lo que mantiene el change dentro de su ola:

| Nivel | Campo | Evidencia |
| --- | --- | --- |
| Clase | `grupoId` | `types/index.ts:220`, `:167` |
| Unidad | `unidadId` | `types/index.ts:216`, `:168` |
| Actividad | `tareaId` + `asignadoComoTarea` | `types/index.ts:221-222` |

Coherencia que el hook debe garantizar, porque los dos campos de actividad pueden desincronizarse: al elegir actividad se fija `tareaId` y `asignadoComoTarea: true`; al asignar sin actividad se limpia `tareaId` y `asignadoComoTarea: false`. Dejar `asignadoComoTarea: true` con `tareaId` vacio produciria un material que se anuncia como tarea de ninguna tarea.

### D3. La escritura reutiliza el camino que ya encola; no se crea uno nuevo

El hook llama a `actualizarRecurso` / `actualizarEntregable` de `RecursosContext` / `EntregablesContext`. Esos contextos persisten y llaman a `queueEntityOperation`, que devuelve si la cola quedo drenada. Tres consecuencias buscadas: la operacion sobrevive al pull, sube sola al reconectar y el estado en memoria de la app queda consistente sin recargar.

Alternativa descartada: un servicio propio que escriba almacenamiento y encole por su cuenta. Funcionaria, pero dejaria el estado en memoria de los contextos desactualizado hasta el proximo evento de sync, y agregaria una segunda forma de escribir la misma entidad, que es la enfermedad que este change viene a curar.

### D4. `grupoAsignacionesService` se corrige en su camino de datos, sin tocar la UI de sus consumidores

Es la decision de alcance mas delicada y se toma a proposito. Entregar un selector que conserva la asignacion mientras `ContenidoScreen` y `ConversacionScreen` siguen perdiendola dejaria dos productos distintos conviviendo, y el docente no tiene forma de saber cual esta usando. El servicio pasa a encolar y a leer y escribir `@planearia:entregables`; su firma publica no cambia, asi que sus consumidores no se modifican.

Lo que **no** hace: no cambia la UI, ni los textos, ni el flujo de esas pantallas. Un lector del diff debe poder ver que el cambio es de camino de datos.

Compatibilidad con datos legacy: `classroomRepository` sigue leyendo `@planearia:tareas` como `tareasLegacy` y fusionando con `mergeById` (`classroomRepository.ts:59-60,72,205-219`), asi que los entregables legacy siguen siendo visibles. No se migra ni se borra nada; solo se deja de **escribir** en la clave equivocada.

### D5. Confirmacion explicita con el destino nombrado, y sin pantalla de exito incondicional

Nada se escribe hasta que el docente confirma en el pie de la hoja, y el texto de confirmacion nombra el destino elegido, no un generico. Asignar mueve trabajo del docente entre contextos; el limite arquitectonico de confirmacion no aplica solo a la IA.

Se retira la pantalla de exito de `AsignarRecursoScreen:197-237`, que hoy afirma "Los elementos fueron vinculados al grupo seleccionado" incluso cuando se actualizaron cero elementos.

### D6. El resultado se afirma segun el hecho, con el vocabulario de #83

`queueEntityOperation` devuelve `true` solo si la cola de la entidad quedo vacia. La hoja distingue dos finales: sincronizado, o guardado en el dispositivo y encolado. El segundo **reutiliza el vocabulario de `useSyncPresentation()`**; no se inventa copy nuevo de offline, porque la spec `sync-status-presentation` prohibe derivar estado de sincronizacion fuera de esa fuente.

### D7. Sin conexion no bloquea: se puede asignar igual

La hoja informa la falta de conexion, no la castiga. Bloquear la asignacion offline contradiria la promesa central del producto y ademas seria innecesario: la operacion se encola. El estado offline es informativo y la accion de confirmar sigue habilitada.

### D8. Accesibilidad heredada de #82, con sus trampas ya conocidas

- Estado de seleccion con `aria-checked` explicito: RN Web no lo deriva (hallazgo de #82).
- Area tactil de 44pt real: `hitSlop` extiende el alto pero no ensancha por debajo del ancho, asi que las opciones fijan altura minima en vez de confiar en `hitSlop` (hallazgo de #83).
- Foco atrapado en la hoja mientras esta abierta; cierre por fondo y por `Escape`; foco visible en web.
- Cada opcion se entiende leyendo: el destino elegido se anuncia por texto, no solo por marca visual.
- Toda transicion sirve variante estatica bajo `useReducedMotionPreference()`. El `Sheet` de #82 ya lo resuelve para la entrada; lo que agregue este change lo respeta igual.

### D9. Un solo consumidor de UI en este change

`AsignarRecursoScreen` es el unico que adopta la hoja. Es la superficie dedicada a asignar, es alcanzable desde Detalle de Grupo y es la que sufre los dos defectos. Cumple el criterio "usado por al menos un flujo real al cerrar" sobre el flujo donde mas se nota, sin abrir pantallas que no son de esta ola.

## Risks / Trade-offs

- **Pantalla hibrida.** `AsignarRecursoScreen` conserva su cuerpo con `COLORS` legacy mientras su selector pasa a tokens. Es visualmente inconsistente por un tiempo. Se acepta: redisenar la pantalla entera no es de esta ola y hacerlo aqui diluiria el change. La inconsistencia queda declarada en la evidencia.
- **La correccion de clave cambia donde aterrizan escrituras futuras.** Mitigado porque la lectura sigue fusionando ambas claves y porque nada se borra ni se migra. Un revert devuelve la escritura a la clave legacy sin dejar datos huerfanos: lo escrito en el intervalo queda en la clave que la app usa para leer.
- **Coherencia `tareaId` / `asignadoComoTarea`.** Dos campos para un hecho es una debilidad del modelo heredado. Este change no la resuelve; la contiene fijando ambos juntos en el hook y verificandolo por prueba.
- **Los dos defectos son invisibles para la suite actual.** Por eso las pruebas de regresion se escriben contra el sintoma (la asignacion sobrevive a un pull; el entregable real cambia), no contra la implementacion.

## Migration Plan

Aditivo primero, adopcion despues. La hoja y el hook nacen con pruebas antes de tener consumidor. Luego `AsignarRecursoScreen` la adopta y pierde sus modales. La correccion del servicio es independiente de la adopcion: cada una puede revertirse sin la otra.

Sin migracion de datos, sin cambios de esquema y sin ventana de incompatibilidad: en todo momento las claves se leen igual y el motor de sincronizacion se comporta igual.

## Open Questions

Ninguna bloqueante. Dos deudas quedan declaradas y con dueno futuro: el boton muerto de `ContenidoScreen:461` y la imposibilidad de asignar planeaciones desde el chat (`ConversacionScreen:524-527`). Ambas exigen entrar a pantallas que este change no abre.

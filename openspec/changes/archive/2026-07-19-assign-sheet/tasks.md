# Tasks: assign-sheet

## 1. ViewModel de asignacion

- [x] 1.1 Crear `src/hooks/useAssignSheet.ts` con el contrato de entrada (elementos a asignar) y salida (destinos por nivel, seleccion, validez, ejecutar, estado)
- [x] 1.2 Resolver los destinos de clase desde `GruposContext` y los de unidad y actividad desde el dataset de classroom vigente, filtrando siempre por el nivel superior elegido
- [x] 1.3 Invalidar los niveles inferiores al cambiar un nivel superior (cambiar de clase descarta unidad y actividad)
- [x] 1.4 Ejecutar la asignacion via `actualizarRecurso` / `actualizarEntregable`, sin escribir almacenamiento ni encolar por cuenta propia
- [x] 1.5 Fijar juntos `tareaId` y `asignadoComoTarea` segun D2: ambos al elegir actividad, ambos limpios al no elegirla
- [x] 1.6 Propagar el `syncOk` que devuelven los contextos para distinguir sincronizado de encolado
- [x] 1.7 Prueba: cada tipo de elemento y cada nivel de destino produce una llamada que encola en `src/sync`
- [x] 1.8 Prueba de coherencia: no existe resultado con `asignadoComoTarea: true` y `tareaId` vacio, ni al reves
- [x] 1.9 Prueba de cascada: cambiar de clase descarta unidad y actividad previas

## 2. Componente AssignSheet

- [x] 2.1 Crear `src/components/assign/AssignSheet.tsx` sobre el `Sheet` de #82, con `getStyles` y tokens de runtime; sin `COLORS` ni hex
- [x] 2.2 Presentar los tres niveles en cascada, con unidad y actividad marcadas como opcionales de forma legible
- [x] 2.3 Declarar `accessibilityRole` y `accessibilityLabel` por opcion, y `aria-checked` explicito en la seleccion (RN Web no lo deriva, hallazgo de #82)
- [x] 2.4 Garantizar 44pt reales por opcion y por control fijando altura minima, no solo `hitSlop` (hallazgo de #83)
- [x] 2.5 Pie con confirmacion que nombra destino y cantidad, deshabilitado sin clase o sin elementos, con estado deshabilitado anunciado
- [x] 2.6 Estados disenados: cargando con `Skeleton`, vacio con `EmptyState` y salida a crear clase, error con reintento sin cerrar la hoja
- [x] 2.7 Estado offline informativo y no bloqueante, expresado con el vocabulario de `useSyncPresentation()`; sin copy propio de offline
- [x] 2.8 Variante estatica bajo `useReducedMotionPreference()` en toda transicion que agregue este componente
- [x] 2.9 Crear el barrel `src/components/assign/index.ts`
- [x] 2.10 Pruebas de componente: seleccion anunciada, confirmacion deshabilitada sin destino, cierre sin confirmar no escribe nada, estado vacio con salida
- [x] 2.11 Prueba de fuente: el componente no importa `COLORS`, no contiene hex ni literales de copy de estado de sincronizacion, y no escribe almacenamiento ni encola

## 3. Correccion del camino de datos legacy

- [x] 3.1 Corregir en `src/services/grupoAsignacionesService.ts` la clave de entregables a `SYNC_ENTITIES.entregables.storageKey`, dejando de escribir en `@planearia:tareas`
- [x] 3.2 Hacer que `asignarRecursosAGrupo`, `asignarEntregablesAGrupo`, `desvincularRecursoDeGrupo` y `desvincularEntregableDeGrupo` encolen via `queueEntityOperation`, conservando su firma publica
- [x] 3.3 Verificar por diff que la UI de `ContenidoScreen` y `ConversacionScreen` queda sin cambios
- [x] 3.4 Prueba de regresion del defecto de perdida: una asignacion seguida de una reconciliacion con lista remota sin `grupoId` conserva la asignacion por estar encolada
- [x] 3.5 Prueba de regresion del defecto de clave: asignar un entregable creado por `EntregablesContext` lo modifica de verdad
- [x] 3.6 Verificar que la lectura legacy sigue intacta: `classroomRepository` continua fusionando `@planearia:tareas` y no se migra ni se borra dato alguno

## 4. Adopcion en un flujo real

**Desviacion de alcance registrada (ver design.md D10).** El propose fijaba `AsignarRecursoScreen` como consumidor. Durante la implementacion se vio que esa pantalla tiene el destino **fijo** por ruta (`grupoId`) y deja elegir los elementos, es decir la forma inversa a la hoja, que recibe elementos y hace elegir destino. Adoptarla ahi habria exigido inventar preseleccion de destino y conservar igual su selector de elementos. `ListaRecursosScreen` tiene la forma exacta de la hoja (elemento conocido, destino desconocido) **y** un boton muerto que abria un `Alert` "Proximamente". Se adopto ahi. `AsignarRecursoScreen` recibe solo la correccion minima de veracidad, que es lo que la spec le exige.

- [x] 4.1 Montar `AssignSheet` en `src/screens/biblioteca/ListaRecursosScreen.tsx`, alimentada por `useAssignSheet()`
- [x] 4.2 Wirear el boton muerto "Asignar a entregable" (`Alert` "Proximamente") a la hoja compartida y renombrarlo a "Asignar a clase"
- [x] 4.3 En `AsignarRecursoScreen`, dejar de afirmar exito incondicional: usar el conteo real que devuelve el servicio y avisar cuando no cambio nada
- [x] 4.4 El selector de entregables de `AsignarRecursoScreen` queda alimentado por la clave correcta como efecto de 3.1, de modo que deja de aparecer vacio para datos vigentes
- [x] 4.5 Verificar en navegador el recorrido completo desde el boton antes muerto: cascada, confirmacion, escritura y operacion encolada
- [x] 4.6 Registrar que el riesgo de "pantalla hibrida" queda anulado: al no migrarse `AsignarRecursoScreen` a la hoja, conserva su cuerpo legacy completo y no mezcla tokens con `COLORS`

## 5. Validacion tecnica

- [x] 5.1 `npm run typecheck` en verde
- [x] 5.2 `npm run lint -- --quiet` en verde
- [x] 5.3 `npm test -- --runInBand` en verde, sin regresion sobre la linea base vigente
- [x] 5.4 `npm run test:sync -- --runInBand` en verde, confirmando que el motor no cambio de comportamiento
- [x] 5.5 `npm run test:classroom -- --runInBand` en verde, por tocar el camino de datos de materiales y entregables
- [x] 5.6 Verificar por diff que `src/sync/`, `backend/` y `package.json` quedan sin cambios

## 6. QA visual y evidencia

- [x] 6.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar
- [x] 6.2 QA visual nivel N3 con Playwright MCP a 375/767/768/1279/1280, con medicion DOM excluyendo subarboles `aria-hidden`
- [x] 6.3 Cubrir el journey obligatorio GJ0 y la parte de GJ2 que este change toca (ruta `AsignarRecurso`), sin reclamar GJ2 completo: `crear-tipo-primero` sigue pendiente
- [x] 6.4 Evidenciar en navegador que la asignacion **queda encolada**: `@planearia:pending_ops_v2_recursos` con la operacion `update` real. **La reconexion posterior no se ejercito**: es comportamiento del motor, que este change no toca (`src/sync` con diff vacio) y que tiene su propia suite. Declarado en evidencia
- [x] 6.5 Evidenciar foco por teclado dentro de la hoja y anuncio de seleccion en el arbol de accesibilidad
- [x] 6.6 Guardar capturas en `evidencia/capturas/` y ejecutar `npm run qa:visual:check -- --change assign-sheet`
- [x] 6.7 Checklist anti-slop 1.9.3 y Nielsen sin severidad >=3, en `evidencia/README.md`

## 7. Cierre SDD

- [x] 7.1 Actualizar `TLDR.md` y `design.md` con la desviacion de adopcion (D10)
- [x] 7.2 Revision adversarial independiente previa a archive: PASS CON HUECOS, dos majors corregidos
- [x] 7.3 Completar `readiness.json` con evidencia real y ejecutar `npm run openspec:ready:archive -- --change assign-sheet --run-local`, resolviendo cada FAIL antes de archivar

El archive, el sync de specs y `npm run opsx:finish` son pasos posteriores al change y no tareas suyas, misma convencion que #82 y #83.

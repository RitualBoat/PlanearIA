# Tasks: assign-sheet

## 1. ViewModel de asignacion

- [ ] 1.1 Crear `src/hooks/useAssignSheet.ts` con el contrato de entrada (elementos a asignar) y salida (destinos por nivel, seleccion, validez, ejecutar, estado)
- [ ] 1.2 Resolver los destinos de clase desde `GruposContext` y los de unidad y actividad desde el dataset de classroom vigente, filtrando siempre por el nivel superior elegido
- [ ] 1.3 Invalidar los niveles inferiores al cambiar un nivel superior (cambiar de clase descarta unidad y actividad)
- [ ] 1.4 Ejecutar la asignacion via `actualizarRecurso` / `actualizarEntregable`, sin escribir almacenamiento ni encolar por cuenta propia
- [ ] 1.5 Fijar juntos `tareaId` y `asignadoComoTarea` segun D2: ambos al elegir actividad, ambos limpios al no elegirla
- [ ] 1.6 Propagar el `syncOk` que devuelven los contextos para distinguir sincronizado de encolado
- [ ] 1.7 Prueba: cada tipo de elemento y cada nivel de destino produce una llamada que encola en `src/sync`
- [ ] 1.8 Prueba de coherencia: no existe resultado con `asignadoComoTarea: true` y `tareaId` vacio, ni al reves
- [ ] 1.9 Prueba de cascada: cambiar de clase descarta unidad y actividad previas

## 2. Componente AssignSheet

- [ ] 2.1 Crear `src/components/assign/AssignSheet.tsx` sobre el `Sheet` de #82, con `getStyles` y tokens de runtime; sin `COLORS` ni hex
- [ ] 2.2 Presentar los tres niveles en cascada, con unidad y actividad marcadas como opcionales de forma legible
- [ ] 2.3 Declarar `accessibilityRole` y `accessibilityLabel` por opcion, y `aria-checked` explicito en la seleccion (RN Web no lo deriva, hallazgo de #82)
- [ ] 2.4 Garantizar 44pt reales por opcion y por control fijando altura minima, no solo `hitSlop` (hallazgo de #83)
- [ ] 2.5 Pie con confirmacion que nombra destino y cantidad, deshabilitado sin clase o sin elementos, con estado deshabilitado anunciado
- [ ] 2.6 Estados disenados: cargando con `Skeleton`, vacio con `EmptyState` y salida a crear clase, error con reintento sin cerrar la hoja
- [ ] 2.7 Estado offline informativo y no bloqueante, expresado con el vocabulario de `useSyncPresentation()`; sin copy propio de offline
- [ ] 2.8 Variante estatica bajo `useReducedMotionPreference()` en toda transicion que agregue este componente
- [ ] 2.9 Crear el barrel `src/components/assign/index.ts`
- [ ] 2.10 Pruebas de componente: seleccion anunciada, confirmacion deshabilitada sin destino, cierre sin confirmar no escribe nada, estado vacio con salida
- [ ] 2.11 Prueba de fuente: el componente no importa `COLORS`, no contiene hex ni literales de copy de estado de sincronizacion, y no escribe almacenamiento ni encola

## 3. Correccion del camino de datos legacy

- [ ] 3.1 Corregir en `src/services/grupoAsignacionesService.ts` la clave de entregables a `SYNC_ENTITIES.entregables.storageKey`, dejando de escribir en `@planearia:tareas`
- [ ] 3.2 Hacer que `asignarRecursosAGrupo`, `asignarEntregablesAGrupo`, `desvincularRecursoDeGrupo` y `desvincularEntregableDeGrupo` encolen via `queueEntityOperation`, conservando su firma publica
- [ ] 3.3 Verificar por diff que la UI de `ContenidoScreen` y `ConversacionScreen` queda sin cambios
- [ ] 3.4 Prueba de regresion del defecto de perdida: una asignacion seguida de una reconciliacion con lista remota sin `grupoId` conserva la asignacion por estar encolada
- [ ] 3.5 Prueba de regresion del defecto de clave: asignar un entregable creado por `EntregablesContext` lo modifica de verdad
- [ ] 3.6 Verificar que la lectura legacy sigue intacta: `classroomRepository` continua fusionando `@planearia:tareas` y no se migra ni se borra dato alguno

## 4. Adopcion en un flujo real

- [ ] 4.1 Montar `AssignSheet` en `src/screens/grupos/tareas/AsignarRecursoScreen.tsx`, alimentada por `useAssignSheet()`
- [ ] 4.2 Retirar los tres `Modal` ad-hoc de esa pantalla (seleccion, confirmar asignacion, confirmar quitar) sustituyendolos por la hoja y su confirmacion
- [ ] 4.3 Retirar la pantalla de exito incondicional (`:197-237`) y sustituirla por el resultado real segun `syncOk`
- [ ] 4.4 Alimentar el selector de entregables con la fuente correcta, de modo que la lista deje de aparecer vacia para datos vigentes
- [ ] 4.5 Prueba de pantalla: asignar desde `AsignarRecursoScreen` encola y refleja el resultado correcto en linea y sin conexion
- [ ] 4.6 Declarar en evidencia la inconsistencia visual transitoria de la pantalla (cuerpo legacy con selector en tokens), decidida en D-riesgos

## 5. Validacion tecnica

- [ ] 5.1 `npm run typecheck` en verde
- [ ] 5.2 `npm run lint -- --quiet` en verde
- [ ] 5.3 `npm test -- --runInBand` en verde, sin regresion sobre la linea base vigente
- [ ] 5.4 `npm run test:sync -- --runInBand` en verde, confirmando que el motor no cambio de comportamiento
- [ ] 5.5 `npm run test:classroom -- --runInBand` en verde, por tocar el camino de datos de materiales y entregables
- [ ] 5.6 Verificar por diff que `src/sync/`, `backend/` y `package.json` quedan sin cambios

## 6. QA visual y evidencia

- [ ] 6.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar
- [ ] 6.2 QA visual nivel N3 con Playwright MCP a 375/767/768/1279/1280, con medicion DOM excluyendo subarboles `aria-hidden`
- [ ] 6.3 Cubrir el journey obligatorio GJ0 y la parte de GJ2 que este change toca (ruta `AsignarRecurso`), sin reclamar GJ2 completo: `crear-tipo-primero` sigue pendiente
- [ ] 6.4 Ejercitar asignar sin conexion y la reconexion posterior en navegador, evidenciando que la operacion se encola y sube sola
- [ ] 6.5 Evidenciar foco por teclado dentro de la hoja y anuncio de seleccion en el arbol de accesibilidad
- [ ] 6.6 Guardar capturas en `evidencia/capturas/` y ejecutar `npm run qa:visual:check -- --change assign-sheet`
- [ ] 6.7 Checklist anti-slop 1.9.3 y Nielsen sin severidad >=3, en `evidencia/README.md`

## 7. Cierre SDD

- [ ] 7.1 Actualizar `TLDR.md` si cambio alcance, archivos, comportamiento o resultado esperado
- [ ] 7.2 Revision adversarial independiente previa a archive
- [ ] 7.3 Completar `readiness.json` con evidencia real y ejecutar `npm run openspec:ready:archive -- --change assign-sheet --run-local`
- [ ] 7.4 `npm run opsx:sync` y archive
- [ ] 7.5 `npm run opsx:finish`

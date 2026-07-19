# Tasks: sync-status-ui

## 1. Fuente unica de presentacion

- [x] 1.1 Crear `src/hooks/useSyncPresentation.ts` con la funcion pura exportada `derivarPresentacionSync(entrada)` que implementa la tabla de precedencia D2 (siete estados, `syncEnabled` primero, offline antes que `authError`) y devuelve `{ estado, tono, icono, titulo, detalle, etiquetaA11y, accion }`
- [x] 1.2 Reutilizar literalmente los textos tranquilizadores vigentes de `SyncContext`/`SyncStatusBanner` para los estados `sin-conexion` y `sin-servidor`; ningun estado usa el tono de error
- [x] 1.3 Envolver la funcion pura en el hook `useSyncPresentation()` que la alimenta desde `useSyncStatus()` y memoiza el resultado
- [x] 1.4 Prueba de tabla que congela los siete estados: entrada -> `estado`, `titulo`, `tono`, `icono` y `etiquetaA11y`, incluidos los dos casos de precedencia (invitado con `status` residual; offline con `authError`)
- [x] 1.5 Prueba de que ningun estado de sincronizacion devuelve el tono de error

## 2. Componentes de sync

- [x] 2.1 Crear `src/components/sync/SyncStatusChip.tsx`: consume el hook, sirve variante compacta y completa, `getStyles` con tokens de runtime, sin `COLORS` ni hex
- [x] 2.2 Declarar en el chip `accessibilityRole` no-alerta, `accessibilityLabel` desde `etiquetaA11y` y `aria-busy` explicito durante `sincronizando` (RN Web no lo deriva)
- [x] 2.3 Cuando el chip es accionable (reintentar / reingresar), garantizar 44pt via `hitSlop` sin inflar el alto visual, siguiendo el patron de `Chip.tsx`
- [x] 2.4 Transicion de estado con `withTiming` y variante sin transicion bajo `useReducedMotionPreference()`; sin animacion en bucle permanente
- [x] 2.5 Crear `src/components/sync/PendingBadge.tsx`: muestra `pendingCount`, se oculta en 0, nunca usa rojo
- [x] 2.6 Crear `src/components/sync/SaveStateLabel.tsx`: recibe `estado` y `guardadoEn` por props, combina la pierna local con la de sync, declara estado ocupado accesible durante `guardando`
- [x] 2.7 Crear el barrel `src/components/sync/index.ts`
- [x] 2.8 Pruebas por componente: los siete estados en el chip, ocultamiento en 0 del badge, y que `SaveStateLabel` muestre "guardado" con el chip global en `sin-conexion` sin contradiccion
- [x] 2.9 Prueba de fuente: ningun archivo de `src/components/sync/` contiene literales de copy de estado, hex ni importa `COLORS`

## 3. Adopcion en las superficies existentes

- [x] 3.1 Montar `SyncStatusChip` en `src/navigation/AppTopBar.tsx` como cuarto elemento del chrome, en flujo de layout, con variante compacta en movil
- [x] 3.2 Eliminar `buildSyncState` de `src/screens/planeaciones/ListaPlaneacionesScreen.tsx`; la pantalla deja de leer `syncStatus`/`isOnline`/`pendingCount` de `PlaneacionesContext`. **Desviacion:** primero se sustituyo por `SyncStatusChip`, pero la captura mostro la misma frase dos veces en la vista (chrome + encabezado); como el chrome ya lleva el estado en toda pantalla, se retiro el de la pantalla. Guardarrail nuevo: la pantalla no puede volver a derivar estado
- [x] 3.3 Verificar por prueba que la cadena "Error sync" no existe en `src/`
- [x] 3.4 Migrar `src/components/SyncStatusBanner.tsx` a `getStyles` con tokens de runtime y al vocabulario del hook, conservando sus tres disparadores (`showOffline`, `showServerDown`, `showAuthError`) y su `syncNow("manual")`
- [x] 3.5 Prueba de que los tres disparadores de la barra siguen produciendo barra y que la barra ya no importa `COLORS`
- [x] 3.6 Adoptar `SaveStateLabel` en `src/screens/plantillas/EditorPlantillaScreen.tsx` como consumidor de referencia, alimentado por su `isSaving` existente
- [x] 3.7 Verificar que `PlaneacionesContext` queda sin modificar: sus campos y su ciclo siguen intactos, solo deja de tener consumidor de UI

## 4. Validacion tecnica

- [x] 4.1 `npm run typecheck` en verde
- [x] 4.2 `npm run lint -- --quiet` en verde, incluida la regla que prohibe `COLORS` en UI nueva
- [x] 4.3 `npm test -- --runInBand` en verde, sin regresion sobre la linea base 108 suites / 720 tests
- [x] 4.4 `npm run test:sync -- --runInBand` en verde, confirmando que el motor no cambio de comportamiento

## 5. QA visual y evidencia

- [x] 5.1 Levantar `expo start --web` y confirmar HTTP 200 antes de navegar
- [x] 5.2 QA visual con Playwright MCP a 375/768/1280: chip en el chrome, sin desborde horizontal, variante compacta en movil
- [x] 5.3 Transicion offline -> reconexion ejercitada en navegador **solo para la ruta de invitado** (eventos `offline`/`online` reales). Los estados autenticados no se pudieron verificar en navegador: el backend rechaza este origen por CORS y no se crearon cuentas ni se usaron credenciales. Quedan cubiertos de forma determinista por la prueba de tabla. Limitacion declarada en `evidencia/README.md`
- [x] 5.4 Evidenciar el estado de sincronizacion desactivada (sesion de invitado), que es el caso hoy mal presentado
- [ ] 5.5 Verificar por captura el cambio en caliente de tema, escala tipografica y daltonismo. **No ejecutado:** garantizado por construccion (`getStyles` + `useAppTheme`, cero hex, cero `COLORS`) y por prueba de fuente, con el mecanismo ya probado en #78 y #82, pero sin captura por modo en esta corrida. Declarado como limitacion
- [x] 5.6 Guardar capturas en `evidencia/capturas/` y ejecutar `npm run qa:visual:check`
- [x] 5.7 Checklist anti-slop 1.9.3 y Nielsen sin severidad >=3

## 6. Cierre SDD

- [x] 6.1 Actualizar `TLDR.md` si cambiaron alcance, archivos, comportamiento o resultado esperado
- [x] 6.2 Completar `readiness.json` con validaciones, evidencia y rollback
- [ ] 6.3 Revision adversarial con `/adversarial-review` y correccion de hallazgos
- [ ] 6.4 `npm run openspec:ready:archive -- --change sync-status-ui --run-local` en PASS
- [ ] 6.5 Archive, sync de specs y `npm run opsx:finish`

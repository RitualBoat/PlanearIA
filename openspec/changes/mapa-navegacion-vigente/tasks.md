## 1. Congelar la fuente de verdad

- [ ] 1.1 Transcribir a una nota de trabajo el contenido vigente de `ROOT_ROUTES`, `HUB_ROUTES`, `INITIAL_HUB`, `HUB_LANDING` y `DEV_ONLY_ROUTES` desde `src/navigation/routeManifest.ts`, con el commit exacto de referencia.
- [ ] 1.2 Registrar los cinco hubs con titulo e icono desde `src/navigation/AppShell.tsx:24-30` y las nueve rutas raiz desde `src/navigation/types.ts:159-174`.
- [ ] 1.3 Registrar la regla de navegacion cruzada y de retorno desde `src/navigation/navigateToHub.ts:30-74`, y el criterio de pertenencia a la raiz desde `src/navigation/types.ts:154-158`.
- [ ] 1.4 Confirmar contra el codigo que el mapa no documentara ninguna ruta inexistente: verificar que cada nombre transcrito aparece en `routeManifest.ts` y que `npm run typecheck` pasa en el commit de referencia.

## 2. Rehacer el mapa de navegacion

- [ ] 2.1 Reescribir el encabezado de `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`: documento derivado de `src/navigation/routeManifest.ts`, disparador de actualizacion, y frontera explicita respecto a la navegacion objetivo del Plan Maestro.
- [ ] 2.2 Sustituir la tabla de cinco tabs legacy por la tabla de los cinco hubs con ruta, landing y proposito; la tabla contiene hubs y nada mas.
- [ ] 2.3 Escribir una seccion por hub con sus pantallas segun `HUB_ROUTES`, marcando dentro de cada una las superficies legacy (`Feed` y `Social` en Mas, `Contenido` en Office) con la decision que las movio y su estado pendiente de ConectaPLAN.
- [ ] 2.4 Documentar `AsistenteTab` -> `AsistenteHome` con su alcance vigente honesto: a que destinos ya funcionales enruta y que superficie conversacional aun no existe.
- [ ] 2.5 Documentar las nueve rutas raiz con el criterio "solo-destino, nunca navega hacia un hub", y separar `CatalogoComponentes` como ruta solo-desarrollo no alcanzable por el docente.
- [ ] 2.6 Documentar la navegacion cruzada como regla estructural: las acciones suben al padre y no bajan a un hermano, el cruce usa la forma anidada de `navigateToHub`, el retorno usa `goBackOrHubLanding` con fallback a la landing del hub.
- [ ] 2.7 Registrar la decision de `FloatingActionIcons` y su resultado verificable, con enlace a la seccion 3.5 del design archivado de #81.
- [ ] 2.8 Conservar el checklist de cambios de navegacion del documento actual, revisando que ninguna de sus lineas presuponga la estructura de tabs legacy.

## 3. Cerrar la copia con mas autoridad

- [ ] 3.1 Corregir la tabla de cinco tabs de `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md:17-21` para que refleje los hubs vigentes, sin reescribir el resto del inventario de modulos.
- [ ] 3.2 Resolver la pregunta abierta sobre `ContenidoTab` (`:77`) apuntando a la decision D6 y a su ubicacion real dentro de Office.
- [ ] 3.3 Agregar un puntero desde `MAPA_MODULOS_ACTUALES.md` hacia el mapa de navegacion como referencia detallada, para que exista una sola descripcion vigente.

## 4. Separar plan de estado operativo

- [ ] 4.1 Agregar al encabezado de `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` el aviso de snapshot con puntero al epic #101 y sus milestones, declarando que los estados por change del documento no son autoridad de estado.
- [ ] 4.2 Marcar como archivados con su fecha los cuatro changes de Ola 1 (`app-shell-navegacion`, `componentes-base`, `sync-status-ui`, `assign-sheet`), sin tocar paridad, dependencias ni estimaciones historicas.
- [ ] 4.3 Marcar `OQ2 (RESUELTO 2026-07-19)` siguiendo la forma que el documento ya usa en OQ6, con enlace a la decision y su resultado verificable, conservando el texto original de la pregunta.
- [ ] 4.4 Marcar el riesgo R4 como resuelto indicando que su mitigacion propuesta ya se ejecuto, sin alterar la tabla de riesgos restante.
- [ ] 4.5 Verificar que ninguna estimacion, paridad, dependencia ni criterio de aceptacion historico del plan cambio, comparando el diff linea por linea.

## 5. Corregir el estado en Product OS

- [ ] 5.1 Corregir `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md:67` para que `UX/UI Ola 1 - Shell y componentes` no figure entre los milestones activos.
- [ ] 5.2 Actualizar `:134-135` para reflejar el milestone cerrado con #81-#84 cerrados, conservando el registro fechado del estado inicial tras `product-os-epic-uxui`.
- [ ] 5.3 Verificar el estado declarado contra `gh api repos/RitualBoat/PlanearIA/milestones?state=all` y guardar la salida como evidencia.

## 6. Verificacion y evidencia

- [ ] 6.1 Ejecutar la busqueda de las cinco tabs legacy sobre `Documentacion/` excluyendo `99-archivo/` y `03-validacion/`, y confirmar que ninguna ocurrencia restante las presenta como navegacion primaria vigente; guardar la salida como evidencia.
- [ ] 6.2 Verificar que todos los enlaces relativos de los cuatro archivos tocados resuelven a un archivo existente; guardar el resultado como evidencia `docs-verification`.
- [ ] 6.3 Verificar tabla por tabla que el mapa coincide con `routeManifest.ts`, `AppShell.tsx` y `RootStackParamList`, dejando constancia de la comparacion.
- [ ] 6.4 Ejecutar `npm exec --yes=false -- openspec validate --all --strict --no-interactive` y `npm run agent:harness:check`.
- [ ] 6.5 Confirmar que `git status` no muestra cambios en `src/`, `backend/`, tests ni configuracion.

## 7. Cierre

- [ ] 7.1 Actualizar `TLDR.md` si el alcance, los archivos o el resultado esperado cambiaron durante la aplicacion.
- [ ] 7.2 Completar `readiness.json` con las validaciones ejecutadas, la evidencia registrada, el rollback y la referencia de revision adversarial.
- [ ] 7.3 Ejecutar la revision adversarial verificando en particular que #86 no reciba instrucciones contradictorias entre el mapa, el Plan Maestro y las skills `ux-ui-design`.
- [ ] 7.4 Registrar como issues propios las derivaciones fuera de alcance: `PLAN_AUTH_SEGURIDAD_SESION_REAL.md:551-557`, `.eslintrc.cjs:104` y cualquier inconsistencia de codigo hallada al transcribir.
- [ ] 7.5 Ejecutar `npm run openspec:ready:archive -- --change mapa-navegacion-vigente --run-local` y resolver los FAIL antes de archivar.

## Why

`Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md` se declara mapa de la navegacion real, pero
describe cinco tabs (Feed, Contenido, Grupos, Social, Configuracion) que ya no existen, cita dos archivos
fuente de los cuales uno fue borrado, y afirma que el Asistente no tiene ruta dedicada cuando
`AsistenteTab` esta implementado. `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md` repite la misma
tabla con mas autoridad declarada. Ambos son lectura obligatoria de la skill `ux-ui-design`, asi que el
error se propaga automaticamente a cualquier agente que prepare Figma.

#86 (prototipos Figma Ola 2) es el siguiente hito y consumira esta documentacion. Corregirla despues de
que existan frames construidos sobre tabs inexistentes costaria rehacer el prototipo, no reeditar un
documento. Este change existe para llegar antes que #86, no despues.

Referencia: issue #111. Plan maestro afectado:
`Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.

## What Changes

- **Rehacer `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`** desde el codigo real posterior a
  #81: los cinco hubs de `AppShell.tsx`, sus stacks, las nueve rutas raiz de `RootStackParamList`, la
  landing de cada hub y la forma unica de navegacion cruzada (`navigateToHub` / `goBackOrHubLanding`). El
  documento declara que es derivado de `src/navigation/routeManifest.ts` y que no define navegacion
  objetivo.
- **Marcar Feed, Social y Contenido como superficies legacy** con su hub duenio real (`MasTab`, `MasTab`,
  `OfficeTab`) y la decision que las movio (D5, D6), nunca como tabs primarias.
- **Registrar la ruta real del Asistente** (`AsistenteTab` -> `AsistenteHome`) con su alcance vigente
  declarado de forma honesta: enruta a lo que ya funciona y declara lo que falta.
- **Corregir la tabla de tabs legacy en `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`** y su
  pregunta abierta sobre `ContenidoTab`, ya respondida por D6. Ampliacion de superficie respecto al
  alcance original del issue, justificada en `brownfield-baseline.md`: el criterio de aceptacion "una
  busqueda no presenta las cinco tabs legacy" no se puede cumplir sin este archivo.
- **Agregar aviso de snapshot al Plan Maestro** con puntero a #101 y sus milestones como estado operativo,
  sin reescribir estimaciones historicas; **marcar como archivados** los cuatro changes de Ola 1
  (`app-shell-navegacion`, `componentes-base`, `sync-status-ui`, `assign-sheet`) que hoy figuran como
  pendientes; **marcar OQ2 y el riesgo R4 como resueltos** con enlace a la decision de #81.
- **Corregir `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`** donde declara abierto el milestone
  `UX/UI Ola 1 - Shell y componentes`, hoy cerrado, conservando el registro fechado del estado inicial.

No hay cambios BREAKING: ningun consumidor automatizado parsea estos documentos.

## Capabilities

### New Capabilities

- `navigation-reference-currency`: la documentacion de referencia de navegacion describe la navegacion
  implementada y verificable contra el manifiesto de rutas, distingue superficies legacy de navegacion
  primaria, y separa explicitamente plan/snapshot de estado operativo rastreado en GitHub.

### Modified Capabilities

Ninguna. `adaptive-app-shell` define el comportamiento del shell y no cambia: este change documenta ese
comportamiento, no lo altera. `product-os-uxui-tracking` exige que `GITHUB_PRODUCT_OS.md` documente la
convencion de seguimiento; corregir una afirmacion de estado factualmente falsa no modifica ese requisito
ni ninguno de sus escenarios.

## Impact

- **Documentacion (unica superficie):** `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md`,
  `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md`,
  `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`,
  `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md`.
- **Codigo:** ninguno. No se toca `src/`, `backend/`, tests ni configuracion.
- **Consumidores afectados:** `.agents/skills/ux-ui-design/SKILL.md` y `.codex/skills/ux-ui-design/SKILL.md`
  listan el mapa como lectura obligatoria; la ruta del archivo no cambia, asi que no requieren edicion.
  Si alguna edicion tocara `.agents/`, se regenera el harness con `npm run agent:harness:sync`.
- **Dependencias:** #81 (cerrado) aporta el codigo que el mapa describe. #86 (Figma) es el consumidor
  aguas abajo que motiva la urgencia.
- **Fuera de alcance, derivado a issues propios:** `PLAN_AUTH_SEGURIDAD_SESION_REAL.md:551-557`
  (flujos por `ConfiguracionTab`, plan distinto), `CAMBIOS_SYNC_OFFLINE_2026-06.md` (registro fechado,
  historico por naturaleza) y `.eslintrc.cjs:104` (entrada de rollout para un archivo borrado; es codigo).

## No objetivos

- No redisenar navegacion ni proponer arquitectura de informacion nueva.
- No cambiar rutas, param lists ni ningun archivo de `src/navigation/`.
- No editar specs archivadas ni alterar decisiones de #81.
- No reescribir estimaciones, paridades ni dependencias historicas del Plan Maestro.
- No agregar un checker automatico de deriva entre mapa y codigo: seria superficie de harness dentro de un
  change documental, y `routeManifest.ts` ya verifica por compilacion lo que importa.
- No corregir otros planes maestros ni el registro de cambios de sync.

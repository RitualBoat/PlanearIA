# Brownfield baseline: sheet-medicion-panel-qa

Alcance de este documento: **solo** la superficie que el change toca. No inventaria la app ni
sustituye a las specs.

## Superficies tocadas

| Superficie | Archivo | Tipo de toque |
| --- | --- | --- |
| Capa modal de la biblioteca base | `src/components/base/Sheet.tsx` | Modificacion aditiva: un `testID` derivado en el panel y su comentario |
| Catalogo de componentes (solo desarrollo) | `src/screens/mas/CatalogoComponentesScreen.tsx` | Modificacion aditiva: un `testID` en la hoja de ejemplo |
| Cobertura de la biblioteca base | `src/__tests__/components/base/sheetResponsiva.test.tsx` | Archivo nuevo |
| Runbook de QA visual | `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` | Seccion nueva dentro de la seccion 5 |
| Evidencia del change | `openspec/changes/sheet-medicion-panel-qa/evidencia/` | Directorio nuevo |

No se tocan: `src/sync`, `SYNC_ENTITIES`, colas, almacenamiento, claves `@planearia:*`, `backend/`,
esquema, filtrado por `userId`, navegacion, dependencias, proyecto nativo, workflows de CI, gates
compartidos ni `openspec/changes/archive/`.

## Fuentes de verdad actuales

- `openspec/specs/base-component-library/spec.md`: comportamiento garantizado de la biblioteca base
  (#82), incluida la existencia de `Sheet` y el catalogo solo de desarrollo.
- `openspec/specs/golden-journeys-qa/spec.md`: contrato de QA visual, niveles y evidencia (#85).
- `openspec/specs/reactive-breakpoints/spec.md` y `src/hooks/useBreakpoint.ts`: origen de los rangos
  `mobile <768`, `tablet 768-1279`, `desktop >=1280` (#79).
- `qa/golden-journeys.json`: anchos canonicos por nivel; `niveles.N2.anchos` = 375, 767, 768, 1279, 1280.
- `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md`: procedimiento en prosa que cita al
  manifiesto.
- `src/components/base/Sheet.tsx`: implementacion vigente y unica de la capa modal base.

## Comportamiento vigente

- `Sheet` decide su forma por breakpoint sin ambiguedad (`Sheet.tsx:131-158`): en `mobile`,
  `width: "100%"`, raiz en `justifyContent: "flex-end"` y esquinas inferiores rectas; en `tablet` y
  `desktop`, `width: 520`, raiz en `center`/`center` y las cuatro esquinas redondeadas.
- `Sheet` emite hoy `testID` en la raiz, `${testID}-backdrop` en el fondo y `${testID}-close` en el
  boton de cierre. **El panel no emite ninguno.**
- El panel declara `accessibilityViewIsModal`, que react-native-web **no reenvia al DOM**. El unico
  `[aria-modal="true"]` del arbol web es el contenedor `position: fixed` que RN Web crea alrededor de
  `Modal`, a viewport completo.
- La cobertura de `Sheet` en `src/__tests__/components/base/estados.test.tsx:162,178` verifica foco y
  cierre. **Ninguna prueba verifica ancho, alineacion ni radios.**
- El runbook documenta siete trampas del entorno web en su seccion 5. Ninguna dice que elemento medir.
- `openspec/changes/archive/2026-07-19-assign-sheet/evidencia/README.md:19` declara "hoja inferior" a
  768 px y `:90-94` deja el mecanismo sin determinar; su `readiness.json` lo llama defecto heredado
  de #82. Ambas afirmaciones son producto de la medicion sobre el wrapper.

## Comportamiento objetivo

- La forma por breakpoint de `Sheet` queda **identica**. Este change no altera estilo ni layout.
- El panel emite `${testID}-panel` cuando el consumidor entrega `testID`, y `undefined` cuando no.
  `SheetProps` no cambia.
- Existe regresion automatica de la forma en 375, 767, 768, 1279 y 1280, con la clasificacion del
  ancho derivada de `getBreakpoint` real.
- El runbook prescribe anclar la medicion en el identificador propio del elemento y prohibe medir por
  atributos que la plataforma pueda haber puesto en un envoltorio.
- La evidencia de este change publica la medicion correcta a 768 px (520 px, centrado) junto a la del
  wrapper, y cita la fila equivocada del archivo de #84.

## Compatibilidad legacy

- `testID` es aditivo y opcional. Un consumidor que no lo entrega obtiene exactamente el arbol de
  antes, porque el ancla queda `undefined`.
- En React Native nativo `testID` no participa del renderizado ni del estilo; en web emite
  `data-testid`. No hay impacto de produccion en ninguna plataforma.
- `AssignSheet` y las pantallas que lo montan quedan con diff cero: heredan el ancla por el reenvio de
  `testID` que ya hacian.
- No hay claves `@planearia:*`, esquema, contrato de sync ni endpoint involucrado, asi que no existe
  migracion ni ruta de datos legacy que preservar.
- La evidencia archivada de #84 se conserva sin editar, por decision explicita (design.md D5).

## Owner de spec y contexto

- Owner: Ignacio Barboza Espinoza (dev unico).
- Specs modificadas: `base-component-library` (#82) y `golden-journeys-qa` (#85). Ambas quedan bajo el
  mismo owner; este change agrega requisitos y no retira ninguno vigente.
- Contexto de plan: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, Ola 1.
- Issue: #110. Dependencias declaradas y cerradas: #79, #82, #84, #85.

## Evidencia actual

- Evidencia previa de la superficie: `openspec/changes/archive/2026-07-19-componentes-base/evidencia/`
  (#82, QA de la biblioteca) y `openspec/changes/archive/2026-07-19-assign-sheet/evidencia/` (#84,
  donde nace el falso positivo que este change corrige).
- Evidencia que produce este change: `openspec/changes/sheet-medicion-panel-qa/evidencia/`, nivel de
  QA visual **N2** (altera la instrumentacion de layout de un componente base, no la superficie de un
  golden journey), con medicion DOM obligatoria en los cinco anchos y capturas por ancho.
- Cobertura automatica: `src/__tests__/components/base/sheetResponsiva.test.tsx`, con demostracion de
  no vacuidad por mutacion.

## Fuera de alcance

- Redisenar `Sheet`, cambiar su apariencia, tokens, animacion o contrato publico.
- Mover o redefinir los breakpoints de `useBreakpoint()`.
- Editar cualquier archivo bajo `openspec/changes/archive/`, incluida la evidencia de #84.
- Extender el ancla de medicion a los demas componentes de la biblioteca base: el requisito queda
  escrito, la adopcion caso por caso es trabajo posterior.
- Instalar Playwright como dependencia o crear workflow de CI de QA visual (`golden-journeys-web`).
- Modificar `scripts/checkOpenSpecReadiness.mjs`, `scripts/checkGoldenJourneys.mjs` o cualquier gate
  compartido.
- Tocar `src/sync`, backend, almacenamiento, navegacion o dependencias.

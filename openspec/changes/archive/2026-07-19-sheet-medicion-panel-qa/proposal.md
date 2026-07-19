# Change: sheet-medicion-panel-qa

Issue: #110. Plan maestro: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (Ola 1). Origen: auditoria post-#84 del 2026-07-19.

## Why

El cierre de #84 archivo un defecto que no existe. Su evidencia declara, a 768 px, "hoja inferior" (`openspec/changes/archive/2026-07-19-assign-sheet/evidencia/README.md:19`) y remata en Limitaciones que "el mecanismo exacto no quedo determinado" (`:90-94`). Su `readiness.json` lo eleva a hallazgo: "es un defecto heredado del Sheet de #82".

El componente esta bien. `Sheet` decide por breakpoint sin ambiguedad (`src/components/base/Sheet.tsx:131-158`): `width: esMovil ? "100%" : 520`, `justifyContent: esMovil ? "flex-end" : "center"`. Lo que fallo es **el instrumento**.

El panel declara `accessibilityViewIsModal` (`Sheet.tsx:97`), pero react-native-web no reenvia esa prop al DOM. El unico elemento con `[aria-modal="true"]` en el arbol es el contenedor `position: fixed` a viewport completo que RN Web crea alrededor de `Modal`. Medir por ese selector devuelve **siempre** un rectangulo del ancho de la ventana pegado al borde inferior, en cualquier breakpoint: exactamente la forma que #84 reporto como defecto.

Esto tiene dos costos, y el segundo es el caro:

1. **Un falso positivo archivado.** Queda escrito, con severidad Nielsen 1, que la biblioteca base de #82 tiene un defecto de forma que no tiene.
2. **La trampa sigue armada.** Nada la impide repetirse. `Sheet` no tiene ninguna prueba de forma por breakpoint (`src/__tests__/components/base/estados.test.tsx` cubre foco y cierre), y el runbook de QA visual documenta siete trampas del entorno web (`Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` seccion 5) sin decir **que elemento medir**. El proximo change con capa modal vuelve a pisarla.

El workspace ya conserva la correccion escrita y coherente, sin versionar. Lo que falta no es codigo: es el envoltorio que lo hace verdad del sistema (spec, regresion, evidencia, runbook).

## What Changes

- **Ancla de medicion estable sobre el panel.** `Sheet` emite `testID={`${testID}-panel`}` en el `Animated.View` del panel, completando la convencion que ya tenia (`-backdrop`, `-close`). **`SheetProps` no cambia**: el ancla se deriva del `testID` que el consumidor ya pasa. `AssignSheet` (`src/components/assign/AssignSheet.tsx:81,124`) reenvia `testID` a `Sheet`, asi que el flujo de asignacion de #84 gana el ancla sin tocar su codigo.
- **Regresion automatica por breakpoint.** `src/__tests__/components/base/sheetResponsiva.test.tsx` fija la forma en 375, 767, 768, 1279 y 1280: los anchos canonicos N2 de `qa/golden-journeys.json`. El ancho entra por `getBreakpoint` **real**, no por una constante escrita a mano, de modo que mover un breakpoint en `src/hooks/useBreakpoint.ts` rompe aqui tambien en vez de dejar la prueba verde afirmando sobre un limite que ya no existe.
- **La prueba afirma forma, no solo ancho.** Ancho correcto con alineacion equivocada seguiria viendose mal: se afirma tambien `justifyContent` de la raiz y los radios inferiores, que son las esquinas rectas que anclan la hoja al borde en movil.
- **Superficie de medicion declarada.** `CatalogoComponentesScreen` recibe `testID="sheet-catalogo"`. Es la superficie natural: ruta solo de desarrollo (`src/navigation/routeManifest.ts:110`) donde la biblioteca de #82 se mide en navegador, y aisla el componente sin sembrar datos de dominio.
- **La trampa entra al runbook.** `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` gana la octava trampa: medir una capa modal por `[aria-modal="true"]` devuelve el wrapper de RN Web, no el panel; hay que anclar por el `data-testid` del panel. Es lo unico que impide la reincidencia, porque hoy ese conocimiento vive solo en un comentario de codigo.
- **La correccion se registra hacia adelante.** La evidencia de este change cita la fila equivocada de #84 y publica la medicion corregida lado a lado. **No se edita ningun archivo bajo `openspec/changes/archive/`**: reescribir el historico borraria la senal de que la trampa existio.

Los tres cambios locales del workspace se adoptan **tal cual**. Son la correccion correcta y sus comentarios explican el porque, que es justamente lo que evita la reincidencia.

## Capabilities

### Modified Capabilities

- `base-component-library`: se agrega el requisito de que las capas modales expongan un ancla de medicion estable sobre su propio panel, distinta del backdrop y del contenedor que la plataforma web inserta, y que su forma por breakpoint este cubierta por regresion en los limites de rango.
- `golden-journeys-qa`: el procedimiento de QA visual pasa a exigir que la medicion se ancle en el elemento propio del componente bajo prueba, y prohibe medir por atributos de accesibilidad que la plataforma web pueda haber colocado en un contenedor envolvente.

### New Capabilities

Ninguna.

## Impact

**Codigo modificado (dos archivos, ambos aditivos)**
- `src/components/base/Sheet.tsx`: una prop `testID` derivada en el panel y el comentario que explica por que existe. Sin cambios de estilo, layout, estado ni contrato publico.
- `src/screens/mas/CatalogoComponentesScreen.tsx`: un `testID` en la hoja de ejemplo, en ruta solo de desarrollo.

**Codigo agregado**
- `src/__tests__/components/base/sheetResponsiva.test.tsx`: cinco pruebas de frontera.

**Documentacion modificada**
- `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md`: trampa nueva en la seccion 5.

**Sin impacto**
- Apariencia del componente en cualquier ancho: `testID` no participa del estilo y en nativo es inerte.
- `src/sync`, `SYNC_ENTITIES`, colas, almacenamiento, claves `@planearia:*`, backend, esquema, filtrado por `userId`, navegacion, dependencias, proyecto nativo.
- `AssignSheet` y sus consumidores: el diff es cero; heredan el ancla por reenvio.
- `openspec/changes/archive/`: intocado.

**Deuda declarada, no cerrada por este change**
- El ancla se agrega solo a `Sheet`. **Hoy no queda ningun componente sin cubrir**: verificado que `Sheet` es el unico de la biblioteca base que usa `Modal` (`grep -l Modal src/components/base/*.tsx` devuelve un solo archivo), asi que el requisito nuevo se cumple universalmente al cerrar este change. La deuda es hacia adelante: el requisito obliga a toda capa modal futura, y esa adopcion es responsabilidad del change que la introduzca.
- La evidencia archivada de #84 conserva su fila equivocada. La correccion vive en la evidencia de este change, por decision explicita de no editar el historico.

## No objetivos

- No redisenar `Sheet` ni cambiar su apariencia, tokens, animacion o contrato publico.
- No mover ni redefinir los breakpoints de `useBreakpoint()`.
- No reabrir #84 ni reeditar su evidencia archivada.
- No descartar, revertir ni reescribir los tres cambios locales existentes.
- No tocar `src/sync`, backend, almacenamiento, claves `@planearia:*` ni navegacion.
- No instalar Playwright como dependencia ni crear workflow de CI de QA visual: sigue siendo `golden-journeys-web`.
- No extender el ancla a otros componentes de la biblioteca base.
- No modificar `scripts/checkOpenSpecReadiness.mjs`, `scripts/checkGoldenJourneys.mjs` ni ningun gate compartido.
- No agregar dependencias.
- No editar el Plan Maestro ni sus conteos.

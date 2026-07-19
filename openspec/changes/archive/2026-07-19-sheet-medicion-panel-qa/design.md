# Design: sheet-medicion-panel-qa

## Contexto

`Sheet` renderiza dentro de un `Modal` de React Native. En web, react-native-web traduce ese `Modal`
a un contenedor `position: fixed` que ocupa el viewport completo y **le pone `aria-modal="true"`**.

El panel de `Sheet` declara `accessibilityViewIsModal` (`src/components/base/Sheet.tsx:97`), que es la
prop equivalente en RN. Pero `accessibilityViewIsModal` **no esta en la lista de props que
react-native-web reenvia al DOM**: no produce ningun atributo. El resultado es que el arbol web tiene
exactamente un `[aria-modal="true"]`, y es el contenedor envolvente, no la hoja.

Toda medicion por ese selector devuelve el rectangulo de la ventana. Es un falso negativo perfecto:
no lanza error, no queda vacio, y devuelve numeros plausibles que describen el elemento equivocado.

## D1. El ancla se deriva del `testID`, no es una prop nueva

**Decision.** El panel emite `testID={`${testID}-panel`}` cuando el consumidor pasa `testID`, y
`undefined` cuando no.

**Alternativas descartadas.**

| Opcion | Por que no |
| --- | --- |
| Prop nueva `panelTestID` | Amplia `SheetProps` para un problema de instrumentacion; obliga a cada consumidor a recordar pasarla, que es como se pierde el ancla |
| `nativeID` / `id` fijo `"sheet-panel"` | Un id fijo colisiona en cuanto hay dos hojas montadas (`AssignSheet` monta una segunda hoja para el resultado) |
| Reenviar `accessibilityViewIsModal` con un parche a RN Web | Toca una dependencia por un problema de QA; rompe en cada actualizacion |
| `role="dialog"` explicito en el panel | Cambia el arbol de accesibilidad real del componente, es decir cambia el producto para poder medirlo |

**Por que la derivacion gana.** `Sheet` ya emite `${testID}-backdrop` y `${testID}-close`. El panel
completa la convencion en vez de inventar una segunda. El contrato publico queda intacto, y todo
consumidor que ya pasa `testID` gana el ancla sin editar una linea: `AssignSheet` reenvia `testID` a
sus dos hojas (`src/components/assign/AssignSheet.tsx:81,124`), asi que el flujo de asignacion de #84
queda medible por el mismo mecanismo, con diff cero.

## D2. La prueba deriva el ancho de `getBreakpoint`, no de constantes

**Decision.** El test afirma `expect(getBreakpoint(width)).toBe("mobile")` **antes** de renderizar, y
mockea unicamente la lectura de dimensiones de `useBreakpoint`, delegando la clasificacion al modulo
real via `jest.requireActual`.

**Por que.** Una prueba que escribe `768` a mano y afirma "aqui es dialogo" se vuelve ficcion en
cuanto alguien mueve el rango: seguiria verde afirmando sobre un limite que ya no existe. Con la
derivacion, mover un breakpoint en `src/hooks/useBreakpoint.ts` rompe **tambien** esta suite, que es
la senal correcta. El mock se limita a lo que Jest no puede proveer: no hay ventana que medir.

**Costo aceptado.** La suite depende de la forma interna de `useBreakpoint` (que devuelva
`{width, height, fontScale, breakpoint, isMobile, isTablet, isDesktop}`). Es una dependencia real y
declarada: si ese contrato cambia, la prueba debe cambiar con el.

## D3. Cinco anchos, y son los del manifiesto

**Decision.** 375, 767, 768, 1279 y 1280.

**Por que esos.** Son `niveles.N2.anchos` de `qa/golden-journeys.json`, que a su vez derivan de
`useBreakpoint()` (#79). 767/768 y 1279/1280 son los pares de frontera: es donde una regresion de
rango se manifiesta primero y donde un `<=` mal escrito se ve. No se inventan anchos nuevos ni se
reduce la cobertura por comodidad.

## D4. Se afirma la forma completa, no el ancho

**Decision.** Cada caso afirma tres cosas del panel (`width`, `borderBottomLeftRadius`,
`borderBottomRightRadius`) y una de la raiz (`justifyContent`, mas `alignItems` en el caso no-movil).

**Por que.** El ancho solo no fija la forma: un panel de 520 px alineado a `flex-end` seguiria
viendose como hoja inferior recortada. Quien coloca al panel es la raiz. Y los radios inferiores
rectos son lo que visualmente lo ancla al borde: si se redondean, deja de nacer del borde aunque
mida bien. Se afirma el invariante que el docente ve, no un numero que casualmente lo acompana.

## D5. La evidencia archivada de #84 no se edita

**Decision.** `openspec/changes/archive/2026-07-19-assign-sheet/` queda intocado, con su fila de 768
equivocada y su `readiness.json` afirmando un defecto heredado que no existe. La correccion se
publica en la evidencia de este change, citando el archivo y la linea, con las dos mediciones lado a
lado.

**Por que.** El archivo es historico, no un documento vivo. Corregirlo en su lugar borraria la senal
de que la trampa existio y de que se atrapo, que es informacion util para quien audite despues. La
regla del proyecto ya lo dice: no editar artefactos archivados a mano. Se corrige hacia adelante.

**Costo aceptado.** Queda una contradiccion entre dos carpetas del historico. Se mitiga con la cita
explicita: la evidencia de este change nombra archivo y linea, asi que quien llegue por cualquiera de
los dos lados encuentra el otro.

## D6. La trampa entra al runbook como seccion propia

**Decision.** Se agrega a `Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md` seccion 5 una
trampa mas, con la misma forma que las siete vigentes: sintoma, causa, remedio prescrito.

**Por que aqui y no solo en el codigo.** El comentario en `Sheet.tsx` protege a quien lea `Sheet`.
No protege a quien haga QA visual de otro componente con capa modal, que es donde la trampa vuelve a
aparecer. Las siete trampas ya documentadas son de la misma familia (clics sinteticos que no navegan,
`aria-hidden` contaminando `innerText`, capturas que expiran): todas describen una herramienta que
devuelve un resultado plausible y equivocado. Esta es la octava y pertenece al mismo lugar.

## D7. El catalogo es la superficie de medicion

**Decision.** `CatalogoComponentesScreen` recibe `testID="sheet-catalogo"` y es donde se mide en
navegador.

**Por que.** Es ruta solo de desarrollo (`src/navigation/routeManifest.ts:110`, `DEV_ONLY_ROUTES`),
alcanzable desde `MasHome`, y ya es la superficie declarada por #82 para validar la biblioteca base
por breakpoint. Aisla el componente: medirlo por `AssignSheet` exigiria sembrar clases, unidades y
recursos, y cualquier fallo de ese andamiaje se confundiria con un fallo de forma.

## Riesgos

| Riesgo | Mitigacion |
| --- | --- |
| El ancla se percibe como codigo de prueba en produccion | `testID` no participa del estilo; en nativo es inerte y en web solo emite `data-testid`. El resto de la biblioteca ya usa la misma convencion |
| La prueba se vuelve fragil ante el contrato de `useBreakpoint` | Declarado en D2 como dependencia real y consciente; es preferible a una prueba que no rompe cuando deberia |
| Alguien "arregla" el falso positivo archivado de #84 editando el historico | D5 lo prohibe explicitamente y la evidencia de este change deja la cita cruzada |
| El requisito de spec se lee como obligacion inmediata para toda la biblioteca | El proposal declara la adopcion caso por caso como deuda abierta, no como parte de este change |

# Evidencia: sheet-medicion-panel-qa (#110)

Corrida del 2026-07-19. QA visual nivel **N2** (el change altera la instrumentacion de layout de un
componente base; no toca la superficie de ningun golden journey).

**Que demuestra esta evidencia:** que `Sheet` **siempre estuvo bien** y que el defecto archivado en
#84 fue un artefacto de medicion. Se mide el mismo instante con las dos anclas y se publican los dos
resultados lado a lado.

## Entorno

- `expo start --web` en el puerto **8085**. **HTTP 200 confirmado antes de navegar**: `status=200`,
  `2.929 s`, 1257 b.
- Se uso 8085 y no 8081/8082/8083 porque los tres tenian servidores node previos escuchando (PIDs
  36988, 35224, 29888, arrancados a las 02:32 del 2026-07-19, restos de la sesion de #84). Medir
  contra cualquiera de ellos habria sido QA contra un build ajeno, que es exactamente lo que
  invalidaria esta evidencia.
- Navegacion con **Playwright MCP**, clics reales sobre el DOM. Ningun evento sintetico.
- Sesion de invitado (onboarding saltado). No se sembraron datos: el catalogo no los necesita.
- Recorrido hasta el componente: Onboarding -> Saltar -> Escritorio -> hub `Mas` -> `Catalogo de
  componentes` -> boton "Abrir hoja".

## Medicion por breakpoint

Medicion DOM real (`getBoundingClientRect` + `getComputedStyle`), no lectura de captura. En cada
ancho se midieron **las dos anclas en la misma llamada**, para que el contraste quede demostrado y no
solo afirmado (tarea 5.4).

**Ancla correcta: `[data-testid="sheet-catalogo-panel"]`**

| Ancho | Ancho panel | left | bottom | Radio inferior | Centrado | Pegado al borde | Forma |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 375 | 375 (100%) | 0 | 812 | 0 px | n/a | si | hoja inferior |
| 767 | 767 (100%) | 0 | 812 | 0 px | n/a | si | hoja inferior |
| **768** | **520** | **124** | **512** | **16 px** | **si** | **no** | **dialogo centrado** |
| 1279 | 520 | 380 | 556 | 16 px | si | no | dialogo centrado |
| 1280 | 520 | 380 | 556 | 16 px | si | no | dialogo centrado |

Cero desborde horizontal en los cinco anchos (`scrollWidth <= innerWidth`).

**Ancla equivocada: `[aria-modal="true"]` (lo que midio #84)**

| Ancho | Ancho medido | left | bottom | Radio inferior | `position` | Forma aparente |
| --- | --- | --- | --- | --- | --- | --- |
| 375 | 375 | 0 | 812 | 0 px | fixed | hoja inferior |
| 767 | 767 | 0 | 812 | 0 px | fixed | hoja inferior |
| **768** | **768** | **0** | **812** | **0 px** | **fixed** | **hoja inferior (FALSO)** |
| 1279 | 1279 | 0 | 900 | 0 px | fixed | hoja inferior (FALSO) |
| 1280 | 1280 | 0 | 900 | 0 px | fixed | hoja inferior (FALSO) |

**El envoltorio devuelve el viewport completo en todos los anchos.** Por eso la trampa es invisible en
movil (donde coincide con la respuesta correcta) y solo miente de 768 para arriba. Verificado ademas
en el arbol: `wrapper === panel` es `false`, y el panel tiene `position: relative` mientras el
envoltorio tiene `position: fixed`.

**Correccion de la evidencia archivada de #84**

`openspec/changes/archive/2026-07-19-assign-sheet/evidencia/README.md:19` declara, a 768 px:

> `| 768 | no | 44 px | hoja inferior | 2 clases |`

y `:90-94` remata que "el mecanismo exacto no quedo determinado". Su `readiness.json` lo eleva a
"defecto heredado del Sheet de #82" con severidad Nielsen 1.

**Medicion correcta a 768 px: 520 px de ancho, centrado (left 124, right 644), esquinas inferiores de
16 px, no pegado al borde.** El componente nunca tuvo el defecto. La causa fue el selector.

**Ese archivo NO se edita** (design.md D5): el historico se conserva y la correccion se publica aqui.
Confirmado por `git status openspec/changes/archive/` sin cambios.

**Anclas emitidas por el componente**

| Ancla | Elemento | Presente |
| --- | --- | --- |
| `sheet-catalogo` | raiz | si |
| `sheet-catalogo-backdrop` | fondo oscurecido | si |
| `sheet-catalogo-panel` | **panel visible** | si (nueva) |
| `sheet-catalogo-close` | boton cerrar | si |

Las cuatro son distintas entre si: medir una nunca devuelve otra.

## Journeys cubiertos

- **GJ0 `arranque-y-alcance-del-shell`** (obligatorio en todo nivel): recorrido y capturado en los
  cinco anchos. Verificado en 375, 768 y 1280 que la navegacion primaria expone **5 destinos unicos**
  (`InicioTab`, `OfficeTab`, `ClasesTab`, `AsistenteTab`, `MasTab`), una sola superficie de
  navegacion, sin desborde horizontal. Sin regresion respecto de #81.
- Ningun otro journey se reclama: este change no toca superficie de GJ1, GJ2 ni GJ3. El componente
  medido vive en una ruta solo de desarrollo.

Capturas de GJ0: `capturas/arranque-y-alcance-del-shell-{375,767,768,1279,1280}.png`.
Capturas del componente: `capturas/sheet-medicion-panel-{375,767,768,1279,1280}.png`.

## Verificacion de que la apariencia no cambia

El criterio central del issue es que el componente no cambie. Verificado por tres vias:

1. **Diff:** `src/components/base/Sheet.tsx` cambia 13 lineas, todas comentario mas un prop `testID`.
   `getStyles` queda byte a byte igual; ninguna propiedad de estilo se toca.
2. **Numerica:** los valores medidos coinciden con lo que `getStyles` produce
   (`width: esMovil ? "100%" : 520`, `borderBottomLeftRadius: esMovil ? 0 : radii.lg`).
3. **Visual:** la captura de 768 muestra el dialogo centrado con esquinas redondeadas y su pie
   Cancelar/Aplicar, sobre el catalogo con el rail lateral. Es la forma correcta, no la reportada.

## Regresion automatica

`src/__tests__/components/base/sheetResponsiva.test.tsx`: 5 pruebas, una por ancho de frontera, en
verde. El ancho entra por `getBreakpoint` real (`jest.requireActual`); solo se sustituye la lectura de
dimensiones.

**Demostracion de no vacuidad por mutacion** (tarea 3.4), con `Sheet.tsx` restaurado despues y
verificado por `md5sum` identico (`91f9481141dde8b3774570067a07bed8`):

| Mutacion aplicada | Resultado | Casos que fallan |
| --- | --- | --- |
| `esMovil = true` (ignora el breakpoint) | FALLA | 3/5 (768, 1279, 1280): `Expected 520, Received "100%"` |
| `esMovil = false` (ignora el breakpoint) | FALLA | 2/5 (375, 767): `Expected "100%", Received 520` |
| Se quita el `testID` del panel | FALLA | 5/5: `Unable to find an element with testID: sheet-panel` |

Las dos primeras mutaciones cubren **los cinco casos entre ambas**: ninguna prueba pasa por
casualidad. La tercera demuestra que el ancla es lo que sostiene toda la suite.

## Checklist Nielsen

| Heuristica | Estado | Severidad |
| --- | --- | --- |
| Visibilidad del estado del sistema | La hoja abre y cierra con estado visible; sin cambios | 0 |
| Correspondencia con el mundo real | Copy del catalogo intacto | 0 |
| Control y libertad | Cerrar por boton y por backdrop, ambos con ancla propia | 0 |
| Consistencia | La convencion `-panel` sigue la de `-backdrop` y `-close` ya vigente | 0 |
| Prevencion de errores | La regresion por breakpoint impide que un cambio de rango pase sin senal | 0 |
| Reconocer antes que recordar | Sin cambios de UI | 0 |
| Flexibilidad y eficiencia | Sin cambios de UI | 0 |
| Diseno estetico y minimalista | Sin cambios visuales: verificado por diff, numero y captura | 0 |
| Recuperacion de errores | Sin cambios de UI | 0 |
| Ayuda y documentacion | El runbook gana la trampa 5.7 con sintoma, causa y remedio | 0 |

**Severidad Nielsen maxima: 0**

La severidad 1 que #84 declaro por "forma del panel en tablet/escritorio" **queda retirada**: no
existia el defecto.

## Checklist anti-slop

| Criterio (seccion 1.9.3) | Cumplimiento |
| --- | --- |
| No parece plantilla | Sin cambios visuales; la hoja conserva la identidad de #82 |
| Cero placeholders genericos | No se agrega UI; el catalogo declara que es superficie de desarrollo |
| Tipografia con jerarquia intencional | Sin cambios; tokens de #80 intactos |
| Estados disenados | Sin cambios; los estados de la hoja siguen los de #82 |
| >= 1 micro-interaccion significativa | Sin cambios; la entrada con `withSpring` y su variante reduce-motion siguen intactas |
| Densidad correcta por breakpoint | Verificado numericamente en los 5 anchos: hoja completa <768, dialogo de 520 px >=768 |
| Nielsen sin severidad >= 3 | Cumplido (maxima 0) |

## Consola

**42 errores registrados, 0 atribuibles al change.**

| Clasificacion | Cantidad | Detalle |
| --- | --- | --- |
| CORS del backend desplegado | 21 | `Access to fetch at 'https://backend-eight-chi-54.vercel.app/api/...' blocked by CORS policy`: el backend responde `Access-Control-Allow-Origin: https://planearai.com` y el origen es `http://localhost:8085` |
| `net::ERR_FAILED` derivados | 21 | Consecuencia directa de los CORS anteriores, uno por peticion bloqueada |
| Atribuibles al change | **0** | Ninguno menciona `Sheet`, `testID`, layout ni el catalogo |

Endpoints afectados: `/api/grupos`, `/api/notificaciones`, `/api/mensajes`. Es ruido preexistente de
navegar en localhost contra el backend desplegado, de la misma familia que el declarado en #84 y #85.
Se reporta clasificado, no omitido.

Advertencias: 3, todas preexistentes y ajenas al change.

## Limitaciones

- **No se verifico en nativo.** `testID` es inerte en React Native nativo y no emite atributo alguno,
  asi que no hay comportamiento que observar. La verificacion nativa no aportaria senal.
- **No se midieron los demas componentes de la biblioteca base.** El requisito de spec queda escrito
  para toda capa modal, pero solo `Sheet` lo adopta en este change. La adopcion caso por caso queda
  declarada como deuda abierta en `proposal.md`.
- **No se re-midio `AssignSheet` en navegador.** Hereda el ancla por reenvio de `testID` (diff cero,
  verificado por `git diff --stat`), y su medicion exigiria sembrar clases, unidades y recursos, con
  lo que un fallo del andamiaje se confundiria con un fallo de forma. La herencia esta verificada por
  lectura de codigo (`AssignSheet.tsx:81,124`), no por navegador.
- **El foco y la tabulacion no se re-verificaron.** #84 ya los verifico sobre este mismo componente y
  este change no toca el arbol de foco: no agrega, quita ni reordena elementos enfocables.
- **La evidencia archivada de #84 conserva su fila equivocada**, por decision explicita (design.md
  D5). Queda una contradiccion entre dos carpetas del historico, mitigada por la cita cruzada de esta
  seccion "Correccion de la evidencia archivada de #84".

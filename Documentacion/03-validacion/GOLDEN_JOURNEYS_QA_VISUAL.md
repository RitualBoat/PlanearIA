# Golden Journeys y QA Visual por Breakpoint

> **Estado:** vigente.
> **Uso:** procedimiento obligatorio de QA visual para todo change con UI visible.
> **Fuente de verdad:** `qa/golden-journeys.json`. Este documento explica y cita; si discrepan, manda el manifiesto.
> **No usar para:** dar por cerrado el gate R2, ni para sustituir typecheck, lint, tests o el gate de readiness.

Origen: issue [#85](https://github.com/RitualBoat/PlanearIA/issues/85), hallazgo H3 de la auditoria #76.

## 1. Que resuelve esto

El gate R2 exige "golden journeys" y ninguna fuente decia cuales eran. El change #81 hizo QA visual
excelente, pero su procedimiento quedo dentro de su carpeta de evidencia: el siguiente change tenia
que reinventarlo. Una QA que se reinventa se degrada en silencio, porque nadie nota la captura que no
se tomo.

Este documento y el manifiesto fijan **que se recorre, en que anchos, que evidencia se guarda y como
se verifica que no falte nada**.

## 2. Los golden journeys

Definidos en `qa/golden-journeys.json`. Resumen:

| ID | Slug | Persona | Estado | Que falta y quien lo cierra |
| --- | --- | --- | --- | --- |
| GJ0 | `arranque-y-alcance-del-shell` | transversal | **vigente** | nada |
| GJ1 | `lunes-7am-preparar-el-dia` | Maria | parcial | tablero del dia: `escritorio-docente` |
| GJ2 | `crear-planeacion-y-asignarla` | Luis | parcial | asignar desde el documento: `crear-tipo-primero` + `assign-sheet` |
| GJ3 | `capturar-calificaciones` | Carmen | parcial | importar SU hoja con formulas: CalcuPLAN |
| GJ4 | `offline-reconexion` | — | declarado | todo: `golden-journeys-web` |
| GJ5 | `accion-ia-revisable` | — | declarado | todo: `golden-journeys-web` |

### Por que hay estados

GJ1-GJ3 traducen los tres recorridos de `IHC_DISCOVERY_DOCENTE.md` seccion 4. Esos recorridos
describen como trabaja el docente **hoy sin PlanearIA**, asi que la mayoria de sus pantallas objetivo
pertenecen a changes futuros.

Un journey `parcial` declara por separado los **pasos** (lo que se verifica hoy, sobre rutas reales) y
el **delta** (lo que falta, con el change dueno). Sin esa separacion, el gate exigiria verificar
pantallas inexistentes y la unica salida seria fabricar evidencia. Cuando el change dueno aterrice,
**ese change actualiza el manifiesto** y el journey pasa a `vigente`.

`GJ0` es transversal y esta 100% cubierto hoy: es la red de regresion real durante Ola 1-2, porque
protege que ningun change de UI deje una experiencia inalcanzable o duplique la navegacion primaria.

## 3. Cuanto esfuerzo aplica (proporcionalidad)

Un ajuste de color no cuesta lo mismo que rehacer la navegacion.

| Nivel | Disparador | Anchos | Ademas |
| --- | --- | --- | --- |
| **N1** | todo change con UI visible | 375, 768, 1280 | GJ0 + Nielsen + anti-slop |
| **N2** | altera estructura de layout o navegacion | + 767, 1279 | medicion DOM numerica del invariante declarado |
| **N3** | toca la superficie de un golden journey | 375, 767, 768, 1279, 1280 | recorrido completo del journey afectado |

Los anchos derivan de `useBreakpoint()` (spec `reactive-breakpoints`): `mobile <768`,
`tablet 768-1279`, `desktop >=1280`. 375 es el movil representativo; 768 y 1280 son los limites
**inferiores** de tablet y escritorio; 767 y 1279 los **superiores**, donde una regresion de
breakpoint se manifiesta primero.

**Como se declara.** En `readiness.json` del change:

```json
{
  "qaVisualNivel": "N2",
  "qaVisualJourneys": ["capturar-calificaciones"]
}
```

`qaVisualJourneys` solo hace falta en N3. Para saber si tu change toca un journey, compara los
archivos que tocas contra el campo `rutas` de cada journey del manifiesto.

**El nivel lo eliges tu y el checker no puede corregirte**: exige que este declarado y que exista,
pero no sabe si tu change altero la navegacion. Elegir de menos es la forma facil de vaciar este gate,
y es lo que la revision adversarial debe mirar antes de archivar.

## 4. Procedimiento

### 4.1 Levantar el servidor y confirmar HTTP 200

```bash
# Perfil expo-web de .claude/launch.json, puerto 8081.
# Nunca con Bash directo: usa el arranque de preview del harness.
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081
```

**No navegues hasta ver 200.** El bundler tarda en responder y una pagina en blanco se ve igual que
una pantalla vacia legitima.

### 4.2 Recorrer y medir, ancho por ancho

Para cada ancho del nivel que aplique:

1. Ajustar el ancho con `browser_resize` de Playwright MCP. Si mides desde el panel Browser, dispara
   ademas el evento de redimensionado a mano (ver 5.2).
2. **Medir en una llamada posterior**, nunca en el mismo tick: el re-render de React es asincrono.
3. Medir por DOM y estilos computados los criterios observables del journey, excluyendo los subarboles
   `aria-hidden` (ver 5.6).
4. Navegar con clics reales de Playwright, no con eventos sinteticos (ver 5.5).
5. Capturar en `evidencia/capturas/<slug>-<ancho>.png`.

### 4.3 Aplicar los checklists

- **Nielsen** (`IHC_DISCOVERY_DOCENTE.md` seccion 6): las 10 heuristicas con severidad 0-4.
  **Severidad >= 3 bloquea el archive.**
- **Anti-slop** (`PLAN_UXUI_NAVEGACION_GLOBAL.md` seccion 1.9.3).

### 4.4 Clasificar la consola

Registra los errores y clasificalos. Declarar "cero errores" cuando los hay es falso; atribuir al
change errores preexistentes tambien. Ver 5.4.

### 4.5 Verificar y archivar

```bash
npm run qa:visual:check -- --change <nombre-del-change>
```

Cita su salida en la evidencia `playwright-breakpoints` de `readiness.json`. **Esta obligacion es lo
que vuelve ejecutable el gate**: el perfil `ui` de `scripts/checkOpenSpecReadiness.mjs` ya exige esa
clave, y ahora su contenido es verificable en vez de texto libre.

## 5. Las trampas del entorno web

Verificadas durante la QA de #79 y #81 (2026-07-17 y 2026-07-18) y **corregidas con la corrida de
referencia de #85** (2026-07-19), que desmintio tres de ellas y anadio una. **Son pasos obligatorios,
no anecdotas**: un runbook que ignora como falla la herramienta no es reproducible.

### 5.1 El bundler tarda en responder

Si navegas antes del 200, capturas una pagina en blanco y la reportas como pantalla real.
**Siempre confirma HTTP 200 antes de navegar.**

### 5.2 Redimensionar por CDP crudo no emite el evento DOM `resize`

**Es la mas peligrosa: produce evidencia que parece correcta y no lo es.**

El `resize_window` del panel Browser cambia `window.innerWidth`, pero no emite el evento `resize` del
documento (probado: 0 eventos en un contador tras redimensionar). Por eso `useWindowDimensions` de
React Native Web no reacciona, y una pantalla ya montada **no reacomoda**: capturas el layout del
ancho anterior creyendo que es el nuevo.

```js
// Solo si redimensionas por CDP crudo, disparar el evento real:
window.dispatchEvent(new Event("resize"));
// Medir en una llamada POSTERIOR: el re-render de React es asincrono.
```

**`browser_resize` de Playwright MCP NO tiene este problema** (comprobado el 2026-07-19: tras pasar de
375 a 768 sin ningun disparo manual, el shell reacomodo a rail de 68 pt). Playwright usa
`page.setViewportSize`, que si emite el evento. **Como el procedimiento prescribe Playwright MCP, el
disparo manual no hace falta**; queda documentado para quien mida desde el panel Browser.

Lo que si aplica siempre: **medir en una llamada posterior al cambio de ancho**, porque el re-render
de React es asincrono. Medir en el mismo tick devuelve el estado anterior.

### 5.3 Las capturas del panel Browser no funcionan en este proyecto

El screenshot del panel Browser expira a los 30 s de forma consistente, en cualquier pantalla del
shell, incluso tras esperar a que el renderer se asiente. **Usa Playwright MCP para capturar**
(`browser_take_screenshot`), que es lo que este procedimiento prescribe.

Independientemente de la herramienta: **mide por DOM y estilos computados**, que es numerico y exacto.
La captura acompaña; no sustituye. Por eso N2 y N3 exigen medicion numerica ademas de capturas.

### 5.4 El ruido de consola preexistente

Navegar sin sesion autenticada produce respuestas `401` del backend desplegado (`/api/mensajes`,
`/api/grupos`, `/api/notificaciones`). Son preexistentes y ajenas al change. **Clasificalas y declara
cuantas son atribuibles al change**; #81 registro 198 errores y demostro que el 100% eran 401 de
polling sin sesion.

### 5.5 Los clics sinteticos por JS no navegan en el shell

Los cinco destinos de la navegacion primaria son elementos `<a>`. Despachar la secuencia
`pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click` a mano **no dispara la navegacion**: el titulo
del documento no cambia y el hub activo sigue igual (comprobado el 2026-07-19 sobre los cinco
destinos). **Usa el clic real de Playwright** (`browser_click`), que ademas es mas fiel a lo que hace
el docente.

El sintoma es traicionero: la llamada "funciona" sin lanzar error y devuelve el estado anterior, que
se parece mucho a haber medido demasiado pronto. Si un recorrido no avanza, descarta primero el tipo
de clic.

Los clics sinteticos si sirven para controles que no son anclas (por ejemplo, `SALTAR` del onboarding
o los botones de los hubs), pero no hay razon para preferirlos teniendo el clic real.

### 5.6 Medir el texto visible, no `body.innerText`

React Navigation deja montadas las pantallas inactivas, marcadas con `aria-hidden="true"`.
`document.body.innerText` **las incluye**: puedes estar en Office y leer el texto del Escritorio, y
concluir que la navegacion no funciono. Excluye esos subarboles antes de medir:

```js
const c = document.body.cloneNode(true);
c.querySelectorAll('[aria-hidden="true"]').forEach(n => n.remove());
const visible = c.innerText;
```

### 5.7 Nota operativa

Limpiar `localStorage` resetea onboarding y sesion; es como se recorre GJ0 desde el paso 1.

## 6. Contrato de evidencia

Dentro del directorio del change:

```
evidencia/
  README.md            las siete secciones obligatorias
  capturas/            <slug>-<ancho>.png, capturas reales
```

Secciones obligatorias de `README.md` (el checker las exige por nombre):

| Seccion | Contenido |
| --- | --- |
| `Entorno` | comando, puerto y confirmacion HTTP 200 |
| `Medicion por breakpoint` | tabla numerica por ancho |
| `Journeys cubiertos` | recorrido y criterios observables, nombrando el slug |
| `Checklist Nielsen` | 10 heuristicas con severidad, y la linea `Severidad Nielsen maxima: <n>` |
| `Checklist anti-slop` | los 7 criterios de la seccion 1.9.3 |
| `Consola` | errores registrados y clasificados |
| `Limitaciones` | que no se verifico y por que |

La linea `Severidad Nielsen maxima: <n>` es obligatoria y legible por maquina: el checker falla si
falta o si alcanza el umbral de bloqueo (3).

**Ejemplo canonico:** `openspec/changes/archive/2026-07-19-golden-journeys-qa-visual/evidencia/`.

## 7. Decision registrada: Playwright sigue solo como MCP

**Vigente desde:** 2026-07-19. **Owner:** Ignacio Barboza Espinoza (dev unico).
**Revision:** por disparador, con respaldo de calendario el 2027-01-19.

| Opcion | A favor | En contra |
| --- | --- | --- |
| devDependency `@playwright/test` + runner versionado | recorridos como codigo; baseline de imagen comparable en CI | ~1 GB de navegadores; CI tendria que levantar el bundler de Expo web (arranque lento y flaky); no existen fixtures de auth ni datos de prueba; costo real contra presupuesto bajo/cero con un solo dev |
| **Solo MCP + manifiesto + runbook + checker** (elegida) | cero instalacion; cierra la brecha que realmente fallo, que era el contrato y no la herramienta; ya demostrado en #81 | la ejecucion sigue conducida por agente, no por CI |

**Disparadores que obligan a revisar:**

1. Se necesita regresion visual bloqueante en CI con baseline de imagenes.
2. Entra un segundo colaborador al repositorio.

Cuando se cumpla alguno, la revision ocurre en el change **`golden-journeys-web`**
(`PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`, Ola 2, depende de `limpiar-senal-tests`), no de
forma incidental dentro de un change de UI.

**Limitacion honesta de la decision:** el checker verifica que la evidencia este **completa**, no que
sea **cierta**. Un agente podria redactar un reporte con capturas de otro momento. Esa brecha solo la
cierra el baseline comparable en CI, que es exactamente el alcance del change diferido. Se declara
aqui en vez de dejarla implicita.

## 8. Esto NO cierra el gate R2

R2 exige cuatro cosas: ground truth Figma aprobado y accesible, golden journeys, senal de tests limpia
y reclutamiento IHC preparado.

| Componente de R2 | Estado |
| --- | --- |
| Golden journeys | cubierto por este trabajo (parte de H3) |
| Senal de tests | verde (103 suites / 677 tests tras #81) |
| Ground truth Figma aprobado | **abierto**: gate manual #46 |
| Reclutamiento IHC | **abierto**: gate manual #47 |

#46 y #47 son gates manuales con su propia evidencia y **no se dan por satisfechos** por la existencia
de este manifiesto ni de este procedimiento.

## 9. Referencias

- `qa/golden-journeys.json` — fuente de verdad.
- `scripts/checkGoldenJourneys.mjs` — verificador; `npm run qa:visual:check`.
- `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md` — recorridos (4) y Nielsen con severidad (6).
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` — gate R2 y anti-slop (1.9).
- `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` — R2 y `golden-journeys-web`.
- `openspec/specs/golden-journeys-qa/spec.md` — spec de comportamiento.
- `openspec/changes/archive/2026-07-18-app-shell-navegacion/evidencia/README.md` — precedente del contrato.

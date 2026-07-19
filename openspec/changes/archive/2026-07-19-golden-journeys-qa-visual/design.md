# Design: golden-journeys-qa-visual

## 1. Problema de diseno

Convertir un gate escrito en prosa ("golden journeys") en algo que un agente futuro pueda ejecutar
sin criterio propio y que un revisor pueda verificar sin leer todo. Tres restricciones lo acotan:

1. **No se pueden inventar pantallas.** La mayoria de las pantallas objetivo de los recorridos IHC
   pertenecen a changes que aun no existen. Un gate que las exija seria inaplicable desde el dia uno.
2. **La QA visual es cara.** Si todo change de UI debe cubrir 4 journeys en 5 anchos, el gate se
   incumple o se falsifica. Necesita proporcionalidad explicita.
3. **Presupuesto bajo/cero y un solo dev.** Cualquier infraestructura que exija CI adicional o
   descargas grandes tiene que justificar su costo contra el problema real.

## 2. Decisiones

### D1. El manifiesto es la fuente de verdad; el runbook explica

`qa/golden-journeys.json` declara los journeys en JSON; `GOLDEN_JOURNEYS_QA_VISUAL.md` explica el
procedimiento y cita al manifiesto. **Alternativa descartada:** todo en prosa. Un gate que solo vive
en Markdown no se puede verificar por script, y R2 pide un gate ejecutable. **Alternativa
descartada:** todo en el script. Enterrar los journeys en codigo los vuelve invisibles para quien
diseña, que es justo quien debe discutirlos.

Ubicacion `qa/` y no `Documentacion/`: es un artefacto que consume una herramienta, igual que
`scripts/`. Deja espacio natural para que `golden-journeys-web` ponga ahi sus runners despues.

### D2. Cada journey declara `estado`, y eso es lo que evita la ficcion

```
vigente   -> ejecutable de punta a punta hoy; se verifica completo
parcial   -> hay camino real hoy, pero el objetivo requiere un change posterior
declarado -> reservado, sin criterios definidos aqui; tiene dueno explicito
```

Un journey `parcial` declara dos cosas separadas: `pasos` (lo que se verifica hoy) y `delta` (lo que
falta, con el change dueno). Cuando ese change aterrice, actualiza el manifiesto y el journey pasa a
`vigente` sin reabrir este issue. **Es la decision central del change**: sin ella, definir los tres
recorridos IHC produciria un gate que exige verificar pantallas inexistentes, que es exactamente la
"evidencia fabricada" que el issue prohibe.

### D3. GJ0 existe porque los otros tres no bastan hoy

Los recorridos de `IHC_DISCOVERY_DOCENTE.md` seccion 4 describen el trabajo del docente **sin**
PlanearIA. Traducidos, GJ1-GJ3 quedan los tres en `parcial`. Un gate cuyos journeys estan todos
parcialmente cubiertos no protege nada durante Ola 1, que es justo cuando mas cambia el shell.

GJ0 (arranque, los 5 hubs, una pantalla real por hub) es transversal, esta 100% cubierto hoy y se
deriva directamente de lo que #81 ya verifico. Es la red de regresion real del periodo Ola 1-2.

### D4. Proporcionalidad en tres niveles

| Nivel | Disparador | Anchos | Evidencia |
| --- | --- | --- | --- |
| N1 | todo change con UI visible | 375, 768, 1280 | GJ0 + Nielsen + anti-slop |
| N2 | altera estructura de layout o navegacion | + 767, 1279 | medicion DOM numerica del invariante declarado |
| N3 | toca la superficie de un golden journey | los de N1/N2 | recorrido completo del journey afectado |

Los anchos derivan de `useBreakpoint()` (#79: `mobile <768`, `tablet 768-1279`, `desktop >=1280`).
375 es el movil representativo; 768 y 1280 son los limites **inferiores** de tablet y escritorio;
767 y 1279 son los limites **superiores**, donde una regresion de breakpoint se manifiesta primero
(exactamente el patron que #81 uso).

El nivel se declara en `readiness.json` del change. **El checker exige que este declarado y que sea
valido, pero no puede juzgar si es el correcto**: un change que altera la navegacion podria declarar
N1 y saltarse los anchos limite. Lo que se gana frente a hoy es que la eleccion queda escrita y
auditable en la revision adversarial, no que sea imposible equivocarse. Declarado aqui para no
sobrevender el gate.

### D5. El gate se vuelve ejecutable verificando la evidencia, no ejecutando el navegador

`npm run qa:visual:check -- --change <nombre>` lee el manifiesto y afirma sobre el directorio de
evidencia del change:

- existen las capturas de todos los anchos que exige su nivel;
- el reporte tiene las secciones obligatorias del contrato;
- la severidad Nielsen maxima declarada es menor que 3 (umbral de `IHC_DISCOVERY_DOCENTE.md` 6.2);
- los journeys que el change declara tocar estan cubiertos en el reporte.

Es read-only, determinista, sin navegador ni red, y corre en segundos en cualquier maquina o CI.

**Alternativa descartada:** un runner de Playwright que ejecute los journeys. Requiere levantar el
bundler de Expo web (arranque lento y flaky en CI), fixtures de auth y datos de prueba que hoy no
existen, y ~1 GB de navegadores. Compra regresion visual automatica; cuesta mucho mas que el problema
que resuelve hoy. Queda con disparador de revision explicito y dueno (`golden-journeys-web`).

**Lo que este diseño acepta como limitacion honesta:** el checker verifica que la evidencia este
completa, no que sea *cierta*. Un agente puede escribir un reporte con capturas de otro momento. Esa
brecha se cierra con baselines comparables en CI, que es precisamente el alcance del change diferido.
Se declara aqui en vez de dejarlo implicito.

### D6. Obligacion documentada, sin tocar el gate compartido

El runbook obliga a los changes con UI a correr `qa:visual:check` y citar su salida en la evidencia
`playwright-breakpoints` de `readiness.json`, que el perfil `ui` ya exige
(`VALIDATION_PROFILES.ui` en `scripts/checkOpenSpecReadiness.mjs`).

**Alternativa descartada por ahora:** cablear el checker dentro de `checkOpenSpecReadiness.mjs`.
Arriesga a todo change no-UI por un beneficio que la obligacion documentada ya entrega, y este change
no deberia poder romper el gate de archive de otros. Queda como seguimiento con disparador: cuando
dos changes de UI consecutivos hayan pasado por el checker sin fricciones.

### D7. Las trampas del entorno web son pasos del procedimiento, no anecdotas

Un runbook que ignora como falla la herramienta no es reproducible. Verificado 2026-07-17/18:

| Trampa | Efecto si se ignora | Paso obligatorio |
| --- | --- | --- |
| El bundler tarda en responder | Se navega a una pagina en blanco y se reporta como pantalla real | Confirmar HTTP 200 antes de navegar |
| `resize_window` (CDP) cambia `innerWidth` pero **no emite el evento DOM `resize`** | `useWindowDimensions` no reacciona: se captura el layout del ancho anterior y se reporta como si fuera el nuevo | Disparar `window.dispatchEvent(new Event("resize"))` y medir en una llamada posterior (el re-render de React es asincrono) |
| El screenshot agota tiempo en pantallas con animacion | Se abandona la medicion o se inventa | Medir por DOM y estilos computados; la captura acompaña, no sustituye |
| Los 401 del backend por navegar sin sesion | Se reporta "cero errores" (falso) o se atribuyen al change (falso) | Clasificar el ruido de consola y declarar el residuo |

La segunda es la mas peligrosa: produce evidencia que **parece correcta y no lo es**. Por eso el
contrato exige medicion DOM numerica por ancho y no solo capturas.

### D8. Frontera con `golden-journeys-web`

| | Este change (#85, pre-R2) | `golden-journeys-web` (Ola 2 del plan de harness) |
| --- | --- | --- |
| Entrega | definicion + contrato verificable | ejecucion automatizada en CI |
| Journeys | GJ0-GJ3 definidos; 2 declarados | implementa los declarados y automatiza todos |
| Playwright | solo MCP | devDependency + runner + baseline |
| Depende de | #81 | `limpiar-senal-tests` |

Sin esta frontera escrita los dos changes se pisan: el issue sugerido de aquel se llama "Versionar
golden journeys Playwright", y este explicitamente **no** versiona Playwright.

## 3. Contrato de evidencia

Todo change con UI visible produce, dentro de su directorio de change:

```
evidencia/
  README.md            secciones obligatorias del contrato
  capturas/            <journey>-<ancho>[-<variante>].png, capturas reales
```

Secciones obligatorias de `README.md`: entorno y confirmacion HTTP 200; medicion por breakpoint
(tabla numerica); journeys cubiertos; checklist Nielsen con severidad; checklist anti-slop (1.9.3);
consola y ruido clasificado; limitaciones honestas. El checker las exige por nombre.

## 4. Riesgos

| Riesgo | Mitigacion |
| --- | --- |
| El manifiesto se desactualiza conforme aterrizan changes | Cada journey `parcial` nombra a su change dueno; ese change actualiza el manifiesto como tarea propia |
| El checker se vuelve un tramite que se satisface sin QA real | Limitacion declarada en D5; el cierre real es el baseline comparable de `golden-journeys-web` |
| Se lee este change como "R2 cerrado" | El proposal, la spec y el TLDR declaran que #46 y #47 siguen abiertos y que solo se cubre H3 |
| `qa/` como directorio nuevo confunde | El runbook lo nombra y explica por que no vive en `Documentacion/` |

## 5. Fuentes

- `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md` secciones 4 (recorridos) y 6 (Nielsen + severidad).
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` seccion 1.9 (anti-slop) y :211 (R2).
- `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` :39 (R2) y :481 (`golden-journeys-web`).
- `openspec/changes/archive/2026-07-18-app-shell-navegacion/evidencia/README.md`: procedimiento de facto que aqui se formaliza.
- `src/navigation/routeManifest.ts` y `src/hooks/useBreakpoint.ts`: superficie navegable y anchos reales.
- `scripts/checkOpenSpecReadiness.mjs`: `VALIDATION_PROFILES.ui` y el formato de `readiness.json`.

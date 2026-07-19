# Evidencia: golden-journeys-qa-visual (#85)

Corrida de referencia de **GJ0 `arranque-y-alcance-del-shell`**, nivel **N1** (anchos 375, 768, 1280).
Fecha: 2026-07-19.

> **Estado de esta evidencia: INCOMPLETA.** Las mediciones estan hechas y son reales; las capturas
> `.png` **no se tomaron** por un bloqueo de herramienta descrito en la seccion `Limitaciones`. No se
> fabricaron ni se reutilizaron capturas de otro change. `npm run qa:visual:check` falla sobre esta
> evidencia, correctamente.

## Entorno

| Dato | Valor |
| --- | --- |
| Servidor | `expo start --web`, puerto 8081 (perfil `expo-web` de `.claude/launch.json`) |
| Confirmacion previa | `curl -s -o /dev/null -w "%{http_code}" http://localhost:8081` -> **HTTP 200** |
| Codigo servido | El servidor lo levanto una sesion concurrente. `git diff development --stat -- src/` es **vacio** en esta rama: el codigo servido es identico al de `development`, asi que la medicion es valida |
| Herramienta de medicion | Panel Browser (DOM y estilos computados) |
| Herramienta de captura | Playwright MCP: **no disponible en esta sesion** (ver `Limitaciones`) |
| Estado inicial | `localStorage` limpiado antes de la corrida para recorrer GJ0 desde el paso 1 (Onboarding) |

## Medicion por breakpoint

Medicion DOM sobre `[role="tablist"]` y `[role="tab"]`. La orientacion se deriva de la geometria real.
En **todos** los anchos se conto `tablists: 1`.

| Ancho | Breakpoint | `tablists` | Geometria de la barra | Presentacion | Area de toque |
| --- | --- | --- | --- | --- | --- |
| 375 | mobile | 1 | 367x55 en `y=753` (abajo) | Barra inferior | 69x55 |
| 768 | tablet | 1 | 68x954 en `x=12` (izquierda) | Rail | 68x58 |
| 1280 | desktop | 1 | 199x824 en `x=12` (izquierda) | Sidebar con etiquetas | 199x54 |

Confirmaciones:

- **Nunca barra y rail simultaneos:** a ningun ancho se encontro mas de una `tablist`.
- **Area de toque >= 44 pt** en los tres anchos, en los cinco destinos.
- **Estado seleccionado expuesto:** `aria-selected="true"` en el destino activo y `false` en los otros
  cuatro, verificado en los tres anchos.
- Los valores de 768 y 1280 coinciden exactamente con los medidos por #81 (68 de rail, 199 de sidebar),
  lo que confirma que el shell no ha regresado desde entonces.

El cambio de ancho se hizo por control remoto del navegador, disparando despues
`window.dispatchEvent(new Event("resize"))` y midiendo en una llamada posterior, segun el paso 5.2 del
runbook. Sin ese disparo la app conserva el layout del ancho anterior.

## Journeys cubiertos

**`arranque-y-alcance-del-shell` (GJ0)** — 7 pasos recorridos a 375; los pasos 2-6 reverificados a 768
y 1280.

| Paso | Accion | Resultado observado |
| --- | --- | --- |
| 1 | Abrir la app sin sesion | `document.title = Onboarding`; **0 tablists**: el shell no se monta sin sesion |
| 2 | Saltar el onboarding (sesion de invitado) | El shell abre en `Escritorio` con `Inicio` seleccionado, no en un feed |
| 3 | Abrir el hub Office | `title = OfficeHome`; contenido real "Office Docente / Mis planeaciones / Crear documento / Recursos didacticos / Plantillas / Biblioteca" |
| 4 | Abrir el hub Clases | Contenido real "Tus clases", contadores de Cursos/Alumnos/Pendientes y CTA "Crear clase" |
| 5 | Abrir el hub Asistente | Contenido real: enruta al Copiloto que ya existe dentro de los documentos |
| 6 | Abrir el hub Mas | Contenido real "Tu cuenta / Mi perfil / Cuenta y seguridad / Sesiones" |
| 7 | Abrir una pantalla legacy desde su hub | Office -> "Biblioteca" abre `Contenido` (`title = Contenido`) con su empty state real "Tu contenido aparecera aqui" y sus tres CTA de salida |

Criterios observables del manifiesto: **5 de 5 cumplidos**, salvo el de clasificacion de consola, que
no pudo medirse (ver `Limitaciones`).

El Escritorio declara explicitamente su naturaleza temporal ("Version temporal: aqui vivira tu tablero
del dia") y ofrece cuatro salidas reales, cumpliendo la regla de no dejar pantallas placeholder sin
entradas ni CTA de salida.

## Checklist Nielsen

Alcance declarado: evalua **el shell recorrido por GJ0**, no las pantallas internas que apunta.

| # | Heuristica | Observacion | Sev. |
| --- | --- | --- | --- |
| 1 | Visibilidad del estado | El hub activo se distingue por color, etiqueta y fondo; `aria-selected` lo expone | 0 |
| 2 | Sistema y mundo real | Inicio, Office, Clases, Asistente, Mas: lenguaje docente, sin jerga tecnica | 0 |
| 3 | Control y libertad | Cambiar de hub disponible desde cualquier pantalla del shell | 0 |
| 4 | Consistencia | Una sola barra por ancho segun M3: barra, rail y sidebar | 0 |
| 5 | Prevencion de errores | La particion de rutas esta atada por tipos y por test de guardia | 0 |
| 6 | Reconocer antes que recordar | Cada hub lista destinos con titulo y descripcion | 0 |
| 7 | Flexibilidad y eficiencia | Las cinco experiencias a un toque desde cualquier pantalla del shell | 0 |
| 8 | Diseno minimalista | Sin overlay flotante tapando contenido | 0 |
| 9 | Recuperacion de errores | El empty state de `Contenido` explica el siguiente paso y ofrece tres CTA | 0 |
| 10 | Ayuda y documentacion | Acceso a Ayuda desde el TopBar en todo el shell | 0 |

Severidad Nielsen maxima: 0

## Checklist anti-slop

| Criterio (seccion 1.9.3) | Cumplimiento |
| --- | --- |
| No parece plantilla | Paleta y ritmo propios desde tokens |
| Cero placeholders genericos | El Escritorio declara que es temporal en vez de simular un tablero; Office anuncia que CalcuPLAN y PresentaPLAN llegan despues en vez de mostrar botones muertos |
| Tipografia con jerarquia intencional | Tokens de #80, sin tamanos magicos |
| Estados disenados | El empty state real de `Contenido` se observo en la corrida |
| >= 1 micro-interaccion significativa | El indicador de hub activo comunica estado, no decora |
| Densidad correcta por breakpoint | 375 barra inferior; 1280 sidebar de 199 pt con etiquetas: no es una columna movil estirada |
| Nielsen sin severidad >= 3 | Cumplido |

## Consola

**No medido.** Los grabadores de consola y de red del panel Browser no quedaron adjuntos a la pestana,
que ya existia cuando esta sesion se conecto al servidor: `read_console_messages` devolvio "No console
logs" y `read_network_requests` devolvio "No network requests recorded".

Esto **no** significa cero errores. No se afirma nada sobre la consola en esta corrida. #81, con
instrumentacion adjunta desde el arranque, registro 198 errores y demostro que el 100% eran respuestas
`401` de polling del backend por navegar sin sesion, ajenas al shell.

## Limitaciones

1. **Capturas no tomadas (bloqueo de herramienta).** Las dos vias de captura fallaron:
   - El panel Browser agota su tiempo de 30 s de forma consistente al capturar, en cualquier pantalla
     del shell (reintentado tras esperar a que el renderer se asentara). Es exactamente la trampa 5.3
     del runbook, reproducida en vivo.
   - Playwright MCP, que es la herramienta que el runbook nombra, responde
     `Browser is already in use ... use --isolated`: su perfil de Chrome esta tomado por una sesion
     concurrente, la misma que ocupa el puerto 8081.

   **No se fabricaron ni reutilizaron capturas.** Faltan `arranque-y-alcance-del-shell-375.png`,
   `-768.png` y `-1280.png`.

2. **Consola y red sin instrumentar**, por la razon de la seccion anterior.

3. **Alcance del checklist Nielsen:** evalua el shell, no las pantallas internas, que conservan su
   diseno vigente y seran evaluadas por sus propios changes de rediseno.

4. **Onboarding:** se recorrio saltandolo, que es el camino de invitado. No se ejercito el registro ni
   el inicio de sesion real, que pertenecen a los journeys de auth.

## Verificacion con el propio contrato

```
npm run qa:visual:check -- --change golden-journeys-qa-visual
```

Resultado esperado y obtenido: **FAIL** por `evidencia-capturas`, nombrando los tres archivos
ausentes. El checker detecta correctamente su propia evidencia incompleta, que es la prueba de que no
es decorativo.

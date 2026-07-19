# Evidencia: golden-journeys-qa-visual (#85)

Corrida de referencia de **GJ0 `arranque-y-alcance-del-shell`**, nivel **N1** (anchos 375, 768, 1280).
Fecha: 2026-07-19. Herramienta: **Playwright MCP**.

Esta corrida es el ejemplo canonico del contrato definido en
`Documentacion/03-validacion/GOLDEN_JOURNEYS_QA_VISUAL.md`. Se ejecuta sobre la app real, no sobre una
plantilla, y el change se verifica con su propio checker.

## Entorno

| Dato | Valor |
| --- | --- |
| Servidor | `expo start --web`, puerto 8081 (perfil `expo-web` de `.claude/launch.json`) |
| Confirmacion previa | `curl -s -o /dev/null -w "%{http_code}" http://localhost:8081` -> **HTTP 200**, antes de navegar |
| Codigo servido | `git diff development --stat -- src/` vacio en esta rama: el codigo servido es identico al de `development` |
| Herramientas | Playwright MCP para navegacion, clics reales, medicion DOM y capturas |
| Estado inicial | `localStorage` limpiado antes de la corrida, para recorrer GJ0 desde el paso 1 (Onboarding) |
| Interaccion | Clics reales de Playwright (`page.locator(...).click()`), no eventos sinteticos (ver `Limitaciones`) |

## Medicion por breakpoint

Medicion DOM sobre `[role="tablist"]` y `[role="tab"]`. La orientacion se deriva de la geometria real.
En **todos** los anchos se conto `tablists: 1`.

| Ancho | Breakpoint | `tablists` | Geometria de la barra | Presentacion | Area de toque | Captura |
| --- | --- | --- | --- | --- | --- | --- |
| 375 | mobile | 1 | 367x55 en `y=753` (abajo) | Barra inferior | 69x55 | `capturas/arranque-y-alcance-del-shell-375.png` |
| 768 | tablet | 1 | 68x954 en `x=12` (izquierda) | Rail | 68x58 | `capturas/arranque-y-alcance-del-shell-768.png` |
| 1280 | desktop | 1 | 199x824 en `x=12` (izquierda) | Sidebar con etiquetas | 199x54 | `capturas/arranque-y-alcance-del-shell-1280.png` |

Confirmaciones:

- **Nunca barra y rail simultaneos:** a ningun ancho se encontro mas de una `tablist`. La barra pasa de
  horizontal abajo a vertical izquierda exactamente al cruzar 768.
- **Area de toque >= 44 pt** en los tres anchos, en los cinco destinos.
- **Estado seleccionado expuesto:** `aria-selected="true"` en el destino activo y `false` en los otros
  cuatro, verificado en los tres anchos.
- Los valores de 768 y 1280 (rail de 68, sidebar de 199) **coinciden exactamente con los medidos por
  #81**: el shell no ha regresado desde su archivo.
- **Densidad correcta por breakpoint**, visible en las capturas: a 375 el dock del Escritorio usa 2
  columnas y a 1280 usa 4, con la sidebar mostrando etiqueta junto al icono. No es una columna movil
  estirada.

## Journeys cubiertos

**`arranque-y-alcance-del-shell` (GJ0)** — 7 pasos recorridos a 375; los pasos 2-6 reverificados a 768
y 1280.

| Paso | Accion | Resultado observado |
| --- | --- | --- |
| 1 | Abrir la app sin sesion | `document.title = Onboarding`; **0 tablists**: el shell no se monta sin sesion |
| 2 | Saltar el onboarding (sesion de invitado) | El shell abre con `Escritorio` e `Inicio` seleccionado, no en un feed |
| 3 | Abrir el hub Office | `title = OfficeHome`; contenido real "Office Docente / Mis planeaciones / Crear documento / Recursos didacticos / Plantillas / Biblioteca" |
| 4 | Abrir el hub Clases | `title = ClasesTab`; contenido real "Tus clases", contadores de Cursos/Alumnos/Pendientes y CTA "Crear clase" |
| 5 | Abrir el hub Asistente | `title = AsistenteTab`; enruta al Copiloto que ya existe dentro de los documentos |
| 6 | Abrir el hub Mas | `title = MasTab`; contenido real "Tu cuenta / Mi perfil / Cuenta y seguridad / Sesiones" |
| 7 | Abrir una pantalla legacy desde su hub | Office -> "Biblioteca" abre `Contenido` (`title = Contenido`) con su empty state real "Tu contenido aparecera aqui" y tres CTA de salida |

**Criterios observables del manifiesto: 5 de 5 cumplidos.**

El Escritorio declara explicitamente su naturaleza temporal ("Version temporal: aqui vivira tu tablero
del dia") y ofrece cuatro salidas reales, cumpliendo la regla de no dejar pantallas placeholder sin
entradas ni CTA de salida.

## Checklist Nielsen

Alcance declarado: evalua **el shell recorrido por GJ0**, no las pantallas internas que apunta.

| # | Heuristica | Observacion | Sev. |
| --- | --- | --- | --- |
| 1 | Visibilidad del estado | El hub activo se distingue por color, etiqueta y fondo; `aria-selected` lo expone a lectores | 0 |
| 2 | Sistema y mundo real | Inicio, Office, Clases, Asistente, Mas: lenguaje docente, sin jerga tecnica | 0 |
| 3 | Control y libertad | Cambiar de hub disponible desde cualquier pantalla del shell | 0 |
| 4 | Consistencia | Una sola barra por ancho segun M3: barra, rail y sidebar | 0 |
| 5 | Prevencion de errores | La particion de rutas esta atada por tipos y por test de guardia | 0 |
| 6 | Reconocer antes que recordar | Cada hub lista destinos con titulo y descripcion | 0 |
| 7 | Flexibilidad y eficiencia | Las cinco experiencias a un toque desde cualquier pantalla del shell | 0 |
| 8 | Diseno minimalista | Sin overlay flotante tapando contenido; el chrome ocupa su propio espacio | 0 |
| 9 | Recuperacion de errores | El empty state de `Contenido` explica el siguiente paso y ofrece tres CTA | 0 |
| 10 | Ayuda y documentacion | Acceso a Ayuda desde el TopBar en todo el shell (visible en las tres capturas) | 0 |

Severidad Nielsen maxima: 0

## Checklist anti-slop

| Criterio (seccion 1.9.3) | Cumplimiento |
| --- | --- |
| No parece plantilla | Paleta azul docente desde tokens, ritmo propio, radios propios |
| Cero placeholders genericos | El Escritorio declara que es temporal en vez de simular un tablero; Office anuncia que CalcuPLAN y PresentaPLAN llegan despues en vez de mostrar botones muertos |
| Tipografia con jerarquia intencional | Tokens de #80, sin tamanos magicos |
| Estados disenados | El empty state real de `Contenido` se observo en la corrida |
| >= 1 micro-interaccion significativa | El indicador de hub activo (color + fondo tenue) comunica estado, no decora |
| Densidad correcta por breakpoint | Dock de 2 columnas a 375 y de 4 a 1280; comparar capturas |
| Nielsen sin severidad >= 3 | Cumplido |

## Consola

**28 errores registrados durante toda la sesion. Clasificados: el 100% son respuestas `401`** del
backend desplegado (`backend-eight-chi-54.vercel.app`) en tres endpoints de polling:

| Endpoint | Naturaleza |
| --- | --- |
| `/api/mensajes?tipo=conversaciones` | polling de conversaciones sin sesion autenticada |
| `/api/notificaciones?usuarioId=1` | polling de notificaciones sin sesion autenticada |
| `/api/grupos?limit=500` | carga de grupos sin sesion autenticada |

Es comportamiento preexistente por navegar como invitado en el navegador de QA, identico al que
documento #81. **Cero errores atribuibles al shell, a la particion de rutas o al TopBar.** Cero errores
atribuibles a este change, que no toca `src/`.

## Limitaciones

1. **Los clics sinteticos por JS no bastan en este shell.** Los cinco destinos de la navegacion
   primaria son elementos `<a>`; despachar `pointerdown`/`mousedown`/`pointerup`/`mouseup`/`click` a
   mano **no** dispara la navegacion. Solo el clic real de Playwright funciona. Es lo contrario de lo
   que sugeria la nota operativa heredada, y se corrigio en el runbook.
2. **El panel Browser no sirve para capturar en este proyecto.** Sus capturas agotan el tiempo de 30 s
   de forma consistente en cualquier pantalla del shell. La QA visual se hace con Playwright MCP, que
   es lo que el runbook prescribe.
3. **Alcance del checklist Nielsen:** evalua el shell, no las pantallas internas, que conservan su
   diseno vigente y seran evaluadas por sus propios changes de rediseno.
4. **Onboarding:** se recorrio saltandolo, que es el camino de invitado. No se ejercito el registro ni
   el inicio de sesion real, que pertenecen a los journeys de auth.
5. **Solo GJ0.** GJ1-GJ3 estan en estado `parcial` en el manifiesto y no se recorren en esta corrida:
   sus pantallas objetivo pertenecen a changes posteriores.

## Verificacion con el propio contrato

```
npm run qa:visual:check -- --change golden-journeys-qa-visual
```

Resultado: **PASS** en las once afirmaciones.

Nota de proceso honesta: en un primer intento esta misma corrida quedo sin capturas por un bloqueo de
herramienta, y el checker **fallo correctamente** en `evidencia-capturas` nombrando los tres archivos
ausentes. No se fabricaron capturas para sortearlo; se resolvio el bloqueo y se repitio el recorrido.

## Endurecimiento por la revision adversarial

La revision adversarial ataco al checker y encontro un hueco real: los chequeos de **medicion** y de
**cobertura de journeys** buscaban en todo el documento, y como los nombres de captura contienen el
ancho (`-375.png`) y el slug del journey, **una simple tabla de capturas los satisfacia**. Un reporte
que decia literalmente "Se reviso en todos los anchos y todo se ve bien" y "No documentamos nada aqui"
**pasaba N2 completo**, con las once afirmaciones en PASS.

Corregido: el reporte se parsea por encabezados Markdown y cada chequeo se acota a su seccion,
descartando los nombres `.png` antes de buscar. Verificado por mutacion: el mismo ataque ahora falla
en `evidencia-medicion-dom` y `evidencia-journeys-cubiertos`, y esta evidencia real sigue en PASS.

Los fixtures originales daban falsa confianza porque sus reportes no incluian tabla de capturas, que
es justo lo que tiene un reporte real. Se anadieron cuatro escenarios (13 -> 17), incluido el ataque
completo como regresion.

# Evidencia: app-shell-navegacion (#81)

Fecha de la QA visual: 2026-07-18. Servidor: `expo start --web` via `.claude/launch.json`
(`expo-web`, puerto 8081), confirmado **HTTP 200** antes de navegar. Herramienta: Playwright MCP.

## 1. Medicion por breakpoint (tarea 7.2)

Medicion DOM sobre `[role="tablist"]` y `[role="tab"]`, mas captura por ancho. La orientacion se
deriva de la geometria real (`width > height` = barra horizontal inferior; en caso contrario, rail
o sidebar vertical). En **todos** los anchos se conto `tablists: 1`.

| Ancho | Breakpoint | `tablists` | Geometria de la barra | Presentacion | Captura |
| --- | --- | --- | --- | --- | --- |
| 375 | mobile | 1 | 367x40 en `y=768` (abajo) | Barra inferior | `capturas/shell-375-movil.png` |
| 767 | mobile (limite) | 1 | 759x40 en `y=856` (abajo) | Barra inferior | `capturas/shell-767-limite-movil.png` |
| 768 | tablet (limite) | 1 | 68x830 en `x=12` (izquierda) | Rail | `capturas/shell-768-tablet-rail.png` |
| 1279 | tablet (limite) | 1 | ancho 68 (izquierda) | Rail | `capturas/shell-1279-limite-tablet.png` |
| 1280 | desktop (limite) | 1 | ancho 199 (izquierda) | Sidebar con etiquetas | `capturas/shell-1280-desktop-sidebar.png` |

Confirmaciones:

- **Nunca barra y rail simultaneos** (criterio H16 / M3, investigacion-web F2): a ningun ancho se
  encontro mas de una `tablist`. La transformacion ocurre exactamente en 768 (barra -> rail) y en
  1280 el rail se ensancha de 68 a 199 pt con etiquetas junto al icono.
- **Area de toque >= 44 pt**: a 375 cada destino mide 69x44; a 1280, 199x54.
- **Estado seleccionado expuesto**: `aria-selected="true"` en el destino activo y `role="tab"` en los
  cinco destinos (verificado en el snapshot de accesibilidad).

## 2. Cambio de breakpoint sin recargar (escenario de la spec)

Redimensionado de 1000 a 500 pt estando dentro del hub Mas, en la pantalla Cuenta:

| Momento | Ancho | Barra | Hub activo | Pantalla |
| --- | --- | --- | --- | --- |
| Antes | 1000 | rail izquierda | Mas | Cuenta |
| Despues | 500 | barra abajo | Mas | Cuenta |

El shell cambia de presentacion conservando hub e historial, sin recarga: es un unico navegador cuyas
`screenOptions` derivan del breakpoint reactivo, no dos arboles que se remontan.

## 3. Historial propio por hub (escenario de la spec)

Secuencia: Mas -> Cuenta -> (cambio a Office) -> (regreso a Mas). El titulo de documento vuelve a
`Cuenta`, no a `MasHome`: cada hub conserva su propia pila.

Ademas se verifico que tocar la tab del hub activo hace pop al inicio del stack
(Mas/Social -> `MasHome`), comportamiento estandar de React Navigation que aqui queda confirmado.

## 4. Recorrido de alcance de pantallas legacy (tarea 7.3)

Criterio: "pantallas actuales siguen accesibles desde los nuevos hubs".

| Pantalla legacy | Ruta de acceso verificada | Resultado |
| --- | --- | --- |
| `ContenidoScreen` | Office -> "Biblioteca" | Abre (`document.title = Contenido`); muestra su empty state real "Tu contenido aparecera aqui" |
| `ClassroomHomeScreen` | Tab Clases (landing del hub) | Abre con su contenido real: "Tus clases", contadores y empty state "Crea tu primera clase" |
| `FeedScreen` | Mas -> "Feed" | Abre (`document.title = Feed`) |
| `SocialScreen` | Mas -> "Comunidad docente" | Abre (`document.title = Social`) |
| `CuentaScreen` | Mas -> "Cuenta y seguridad" | Abre (`document.title = Cuenta`) con Accesibilidad, Preferencias y Cuenta |

Ninguna pantalla quedo huerfana; ninguna ruta se elimino del grafo (ver `inventario-rutas-antes.md`
y el test de guardia `src/__tests__/navigation/routePartition.test.ts`).

## 5. Propagacion de preferencias en caliente (escenario de la spec)

Medido sobre estilos computados del propio shell, no de una pantalla:

| Preferencia | Antes | Despues | Elemento medido |
| --- | --- | --- | --- |
| Tamano de fuente medio -> grande | `11px` | `13px` | Etiqueta del destino "Inicio" en la barra |
| Tamano de fuente grande -> medio | `13px` | `11px` | (restaurado) |
| Modo oscuro desactivado -> activado | `rgb(255,255,255)` | `rgb(30,37,46)` | Fondo del TopBar y del contenedor de la barra |

Ambos cambios se aplicaron sin reiniciar la app. Captura del shell en oscuro:
`capturas/shell-375-tema-oscuro.png`. Las preferencias se restauraron a su valor original al terminar.

## 6. Consola

Se registraron errores de consola durante toda la sesion. Clasificados: **el 100% son respuestas
`401` del backend desplegado** (`/api/mensajes?tipo=conversaciones`, `/api/grupos`,
`/api/notificaciones`) por navegar sin sesion autenticada en el navegador de QA. Es comportamiento
preexistente del polling de datos, ajeno a este change: **cero errores atribuibles al shell**, a la
particion de rutas o al TopBar.

## 7. Hallazgo corregido durante la QA

A 375 pt la barra inferior recortaba las etiquetas bajo el icono: el alto por defecto del navegador
no acomodaba icono + texto. Se fijo `height: 64` en el estilo de la barra en movil
(`src/navigation/AppShell.tsx`) y se reverifico por captura. Es exactamente el tipo de defecto que
solo aparece en navegador real y que los tests deterministas no habrian detectado.

## 8. Checklist Nielsen del shell (severidad 0-4)

| Heuristica | Observacion | Severidad |
| --- | --- | --- |
| Visibilidad del estado del sistema | El hub activo se distingue por color de icono, etiqueta y fondo tenue; `aria-selected` lo expone a lectores | 0 |
| Correspondencia con el mundo real | Nombres de experiencia docente (Inicio, Office, Clases, Asistente, Mas), no jerga tecnica | 0 |
| Control y libertad del usuario | Cambiar de hub siempre disponible; volver tras guardar regresa al origen real; sin callejones sin salida (fallback al landing del hub) | 0 |
| Consistencia y estandares | Una sola barra por ancho segun M3; rail en tablet y sidebar en escritorio como prescriben las window size classes | 0 |
| Prevencion de errores | La particion de rutas esta atada por tipos y por test de guardia: una ruta mal ubicada rompe la compilacion, no la navegacion en produccion | 0 |
| Reconocimiento antes que recuerdo | Los hubs listan destinos con titulo y descripcion; el dock del Escritorio nombra cada experiencia | 0 |
| Flexibilidad y eficiencia | La barra da acceso de un toque a las cinco experiencias desde cualquier pantalla del shell | 0 |
| Diseno estetico y minimalista | Sin overlay flotante tapando contenido; el chrome ocupa su propio espacio | 0 |
| Ayuda a reconocer y recuperarse de errores | El shell permanece navegable cuando una pantalla interna falla o no hay conexion (no monta estado propio) | 0 |
| Ayuda y documentacion | Acceso a Ayuda desde el TopBar en todo el shell | 0 |

**Severidad maxima observada: 0.** Ningun hallazgo >= 3, que es el umbral del gate.

Nota honesta de alcance: este checklist evalua **el shell**, no las pantallas internas que el shell
apunta. Esas conservan su diseno vigente y seran evaluadas por sus propios changes de rediseno.

## 9. Checklist anti-slop (plan seccion 1.9.3)

| Criterio | Cumplimiento |
| --- | --- |
| No parece plantilla | Paleta azul docente desde tokens, ritmo 4pt, radios propios; el dock y los hubs siguen el lenguaje de PlanearIA |
| Cero placeholders genericos | Sin lorem ipsum, sin avatares grises inventados, sin tarjetas vacias de relleno. El Escritorio dice explicitamente que es temporal en vez de simular un tablero; Office declara que CalcuPLAN/PresentaPLAN llegan despues en vez de mostrar botones muertos; Asistente enruta al Copiloto real que ya existe |
| Tipografia con jerarquia intencional | `title` / `subtitle` / `bodyStrong` / `caption` / `overline` desde los tokens de #80, no tamanos magicos |
| Estados disenados | Los hubs son lanzadores sin carga asincrona, asi que no fingen skeletons; la senal global sin conexion sigue en `SyncOfflineBar` y el chip de sync es de `sync-status-ui`. Razonamiento registrado en la spec en vez de declarar "N/A" en silencio |
| >= 1 micro-interaccion significativa | El indicador de hub activo (color + fondo) comunica estado, no decora; los tiles del dock responden con `scale: 0.97` al presionar |
| Densidad correcta por breakpoint | Movil 2 columnas de dock; escritorio 4 columnas y sidebar de 199 pt con etiquetas. No es una columna movil estirada (ver capturas 375 vs 1280) |
| Nielsen sin severidad >= 3 | Cumplido (seccion 8) |

## 10. Motion y accesibilidad

- La unica animacion del shell es la transicion entre destinos; se apaga cuando
  `useReducedMotionPreference()` es verdadero (test `shellOptions.test.ts`).
- Sin blur, parallax ni gradientes costosos: el shell se ve a diario y debe sostener 60fps en Android
  de gama media.
- `role="tab"`, etiqueta accesible y estado seleccionado en los cinco destinos; acciones del TopBar
  con `accessibilityRole="button"` y etiqueta que incluye el conteo de no leidas
  ("Abrir notificaciones, 3 sin leer").

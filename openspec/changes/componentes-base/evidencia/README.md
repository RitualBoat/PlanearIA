# Evidencia de QA visual: componentes-base (#82)

Nivel de QA: **N1** (change con UI visible; no altera la estructura de layout ni de navegacion del shell).
Journeys obligatorios: **GJ0 `arranque-y-alcance-del-shell`**.
Superficie medida: pantalla catalogo de la biblioteca base, montada bajo `__DEV__` en el hub Mas.

## Entorno

- Fecha: 2026-07-19.
- Servidor: `npx expo start --web --port 8081`. **HTTP 200 confirmado antes de navegar** (`status=200`, 1.60s).
- Herramienta: Playwright MCP (no el panel Browser). Interacciones reales de teclado y clic, no sinteticas.
- Sesion: invitado (paso 2 de GJ0: saltar onboarding). El shell abre en Escritorio y los cinco hubs responden.
- Temas verificados: claro en navegador; el contraste de ambos temas se verifica ademas de forma determinista en `src/__tests__/components/base/contrasteFoco.test.ts`.

## Medicion por breakpoint

Medicion DOM sobre estilos computados, excluyendo subarboles `aria-hidden`.

| Medida | 375 (movil) | 768 (tablet) | 1280 (escritorio) |
| --- | --- | --- | --- |
| Padding lateral de `Screen` | 16px (`spacing.lg`) | 24px (`spacing.xl`) | 24px (`spacing.xl`) |
| Ancho maximo de lectura | sin limite | 840px | 1120px |
| Ancho real del contenido | 360px | 660px | 1041px |
| Superficies de navegacion primaria | **1** | **1** | **1** |
| Forma de la navegacion | barra inferior (367x55) | rail vertical (68x830) | sidebar vertical |
| Desborde horizontal | no | no | no |

El requisito de #81 "exactamente una superficie de navegacion primaria a cualquier ancho" se conserva: montar la biblioteca dentro del shell no lo altera.

## Medicion de componentes

| Comprobacion | Resultado |
| --- | --- |
| `Button` alto efectivo | 46px, `min-height: 44px` (cumple el minimo de 44pt) |
| `Button` deshabilitado | `aria-disabled="true"`, `tabindex="-1"`, accion bloqueada |
| `Button` cargando | `aria-disabled="true"` + `aria-busy="true"`, accion bloqueada |
| `Chip` forma visual | 32px de alto (compacto a proposito) |
| `Chip` area tactil | extendida a 44pt con `hitSlop`, sin cambiar el tamano visual |
| `Chip` seleccionado | `role="checkbox"` + `aria-checked="true"` |
| Tipografia del titulo de estado | 18px / 24px / peso 600, exacto al token `typography.subtitle` |
| Anillo de foco (Tab real) | `boxShadow: rgb(22,118,210) 0 0 0 3px` |
| Contraste del anillo vs fondo | **4.61:1** (WCAG 2.2 SC 1.4.11 exige 3:1 para no textual) |

## Journeys cubiertos

- **GJ0 `arranque-y-alcance-del-shell`**: recorrido completo. Arranque en Escritorio, cambio a los cinco hubs desde la navegacion primaria, entrada al hub Mas y de ahi al catalogo. Sin rutas rotas ni navegacion duplicada en ningun ancho.

No se tocan otros golden journeys: el change no modifica ninguna pantalla existente.

## Dos defectos encontrados y corregidos durante esta QA

La medicion en navegador encontro dos fallos que las pruebas unitarias no podian ver, porque solo se manifiestan en web:

1. **`aria-busy` y `aria-checked` ausentes.** React Native Web deriva `aria-disabled` de `accessibilityState`, pero **no** deriva `aria-busy` ni `aria-checked`. El boton cargando y el chip seleccionado se anunciaban sin estado a un lector de pantalla en web. Corregido declarando ambos props (React Native los mapea de vuelta a `accessibilityState` en nativo). Guardado por prueba de fuente en `guardarrailes.test.ts`.
2. **Anillo de foco de bajo contraste.** El anillo usaba `primaryTint` (azul casi blanco): lo visible en pantalla era el `outline` por defecto del navegador, no el indicador propio. Corregido a `colors.primary` en los siete componentes enfocables, medido en **4.61:1**, y convertido en contrato por `contrasteFoco.test.ts` para tema claro y oscuro.

Nota metodologica: el foco programatico (`element.focus()`) **no** dispara `onFocus` en React Native Web; solo la tabulacion real lo hace. Una verificacion sintetica habria reportado el anillo como roto y una assercion sobre `accessibilityState` lo habria reportado como correcto: solo la interaccion real dio la respuesta buena.

## Checklist Nielsen (acotado a la superficie del change)

Umbral de bloqueo: severidad >= 3. **Ninguna heuristica alcanza severidad 3.**

Severidad Nielsen maxima: 1

| Heuristica | Estado | Nota |
| --- | --- | --- |
| Visibilidad del estado del sistema | OK | Los cuatro estados tienen componente; el boton cargando se anuncia ocupado |
| Correspondencia con el mundo real | OK | Copy en espanol docente, sin jerga tecnica |
| Control y libertad | OK | `Sheet` cierra por boton y por fondo; `Toast`, `Banner` y `Chip` son descartables |
| Consistencia y estandares | OK | Un solo origen de espaciado, radios, tipografia y color; roles ARIA estandar |
| Prevencion de errores | OK | Deshabilitado y cargando bloquean la accion, no solo la pintan |
| Reconocer antes que recordar | OK | Cada variante de estado trae icono y copy propios |
| Flexibilidad y eficiencia | OK | Densidad por breakpoint; area tactil de 44pt sin inflar la forma visual |
| Diseno estetico y minimalista | OK | Sin adornos; jerarquia por elevacion y espacio |
| Recuperacion ante errores | OK | `EmptyState` error y offline ofrecen reintento; `Input` asocia el error al control |
| Ayuda y documentacion | Sev. 1 | El catalogo es la documentacion viva; no hay guia de uso escrita por componente. Se difiere a la adopcion en Ola 2 |

## Checklist anti-slop 1.9.3

| Punto | Estado |
| --- | --- |
| No parece plantilla | OK. Paleta azul docente, ritmo 4pt y radios propios; sin logo sigue siendo PlanearIA |
| Cero placeholders genericos | OK. Sin lorem ipsum ni avatares grises; el copy del catalogo describe cada estado real |
| Tipografia con jerarquia intencional | OK. `title`/`subtitle`/`body`/`caption`/`overline` desde tokens, verificado 18/24/600 |
| Cada estado disenado, no improvisado | OK. Skeleton con shimmer sutil; tres variantes de estado con icono, copy y salida propios |
| Al menos 1 micro-interaccion significativa | OK. `scale 0.97` al presionar, desvanecido al descartar chip, entrada por spring de hoja y toast. Todas comunican estado, ninguna es decorativa |
| Densidad correcta por breakpoint | OK. Movil 16px sin limite de ancho; escritorio 24px con tope de 1120px, sin columna movil estirada |
| Nielsen sin severidad >= 3 | OK |

## Consola

53 errores en la sesion, **todos** HTTP 401 del backend por sesion de invitado: 51 de `api/mensajes` (polling), 1 de `api/grupos`, 1 de `api/notificaciones`. **Cero errores originados por la biblioteca base o por el catalogo.** Condicion preexistente, ajena a este change. Detalle en `consola-catalogo.log`.

## Capturas

En `capturas/`, con el patron `{slug}-{ancho}.png` que exige el manifiesto.

Recorrido GJ0 (obligatorio en N1), capturado en los tres anchos:

- `arranque-y-alcance-del-shell-375.png`: Escritorio con barra inferior.
- `arranque-y-alcance-del-shell-768.png`: Escritorio con rail lateral.
- `arranque-y-alcance-del-shell-1280.png`: Escritorio con sidebar etiquetada.

Superficie propia del change:

- `catalogo-componentes-1280.png`: botones, campos y chips a 1280 con sidebar.
- `catalogo-estados-1280.png`: variantes vacio y error de `EmptyState` a 1280.
- `catalogo-foco-375.png`: movil con barra inferior y anillo de foco visible tras tabulacion real.

## Limitaciones

- **Capturas por scroll interno.** El contenido vive en un `ScrollView` de React Native Web, asi que `fullPage` no extiende el alto del documento; las capturas cubren viewport y se complementa con medicion DOM del contenido completo. Misma limitacion documentada en #79 y #80.
- **Tema oscuro no capturado en navegador.** Se verifica de forma determinista por prueba de contraste sobre `lightTheme` y `darkTheme`, que es mas fuerte que una captura puntual, pero no sustituye una revision visual completa del tema oscuro.
- **`hitSlop` no es medible en el DOM.** Playwright ve la caja visual, no el area tactil extendida de React Native. Se verifica por prueba determinista en `controles.test.tsx` y `guardarrailes.test.ts`.
- **Sin verificacion en Android de gama media.** El presupuesto de 60fps de 1.9.4 no se midio en dispositivo fisico. Mitigado porque las animaciones corren en worklets de reanimated, son de corta duracion y no se adopto blur.
- **Los componentes aun no tienen consumidores de produccion.** La biblioteca se ejercita en el catalogo; su encaje real con pantallas llega en los changes de adopcion de Ola 2.

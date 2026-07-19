# Evidencia: sync-status-ui (#83)

QA visual N1 del 2026-07-19 sobre el codigo de la rama `feat/sync-status-ui`.

## Entorno

- `npx expo start --web --port 8082`, confirmado en **HTTP 200 (0.77 s) ANTES de navegar**. Se uso el puerto 8082 y no el 8081 porque ese puerto ya estaba ocupado por un servidor previo: hacer QA contra un build ajeno habria invalidado la evidencia.
- Navegacion con **Playwright MCP** (no el panel Browser), con clics reales sobre los elementos, no sinteticos.
- Toda medicion de DOM excluye subarboles `aria-hidden="true"`: React Native Web deja copias ocultas que inflarian los conteos.
- Sesion de **invitado** (se salta el onboarding). Es el estado por defecto de la app y, como se ve abajo, el que este change corrige.
- Suite: `typecheck`, `lint --quiet`, `test --runInBand` y `test:sync --runInBand`, todos en verde.

## Medicion por breakpoint

| Medida | 375 | 768 | 1280 |
| --- | --- | --- | --- |
| Variante del chip | compacta | completa | completa |
| Texto visible | (solo icono) | "Guardado en este dispositivo" | "Guardado en este dispositivo" |
| Ancho del chip | 32 px | 203 px | 203 px |
| Alto del chip | 28 px | 28 px | 28 px |
| Etiqueta accesible | completa | completa | completa |
| `role` en DOM | `img` | `img` | `img` |
| `aria-busy` | `false` | `false` | `false` |
| Chip dentro del viewport | si | si | si |
| Desborde horizontal | no | no | no |
| `scrollWidth` vs viewport | 375 = 375 | 768 = 768 | 1280 = 1280 |

El alto de 28 px es menor a 44 pt a proposito: el chip solo es accionable en los estados `sin-servidor` y `sesion-expirada`, y en esos casos el area tactil se completa con `hitSlop` sin inflar la forma, siguiendo el patron que `Chip.tsx` fijo en #82.

Capturas reales en `capturas/`: `arranque-y-alcance-del-shell-375.png` (variante compacta), `arranque-y-alcance-del-shell-768.png`, `arranque-y-alcance-del-shell-1280.png` y `planeaciones-sin-duplicado-1280.png`.

## Journeys cubiertos

**`arranque-y-alcance-del-shell` (GJ0, vigente).** Recorrido: onboarding -> saltar (crea sesion de invitado) -> Escritorio -> hub Office -> pantalla legacy real (`ListaPlaneaciones`). En cada paso se midio:

- El chip del chrome esta presente en todos los hubs y pantallas visitadas, con `role="img"` y su etiqueta completa.
- **Exactamente 1** superficie de navegacion primaria (`tablist`) en los tres anchos.
- Sin desborde horizontal en ninguna ruta.
- El arbol de accesibilidad anuncia el chip como `img "Guardado en este dispositivo. Tus cambios se guardan aqui. Inicia sesion para sincronizarlos."`.

**`offline-reconexion` (GJ4) NO se reclama.** El manifiesto lo declara en estado `declarado`, con sus pasos y criterios reservados al change duenio `golden-journeys-web` porque "exige fixtures de datos y control de red que este change no construye". No se inventa cobertura sobre un journey cuyo contrato aun no existe. Ver Limitaciones.

## Checklist Nielsen

Severidad Nielsen maxima: 1. Umbral de bloqueo: 3. Sin heuristicas bloqueantes.

| Heuristica | Observacion | Sev |
| --- | --- | --- |
| Visibilidad del estado del sistema | Es el objeto del change: el estado pasa de tres vocabularios a uno, presente en todo hub | 0 |
| Correspondencia con el mundo real | "Guardado en este dispositivo" describe el hecho; se retira "Error sync", que nombraba un fallo tecnico inexistente para el docente | 0 |
| Prevencion de errores | Sin conexion no se ofrece "volver a iniciar sesion", accion que no podria completarse | 0 |
| Reconocer antes que recordar | El chip es ambiente y persistente; no exige recordar si algo quedo sin subir | 0 |
| Estetica y diseno minimalista | Se retiro el chip duplicado de la pantalla de planeaciones tras verlo en captura (ver Limitaciones) | 1 |
| Ayudar a reconocer y recuperarse | Los dos estados recuperables ofrecen accion: reintentar y reingresar | 0 |

## Checklist anti-slop

Los siete puntos de 1.9.3, en OK:

1. **Sin color como unico portador de informacion.** Cada estado lleva icono propio y etiqueta completa; verificado en el arbol de accesibilidad.
2. **Tipografia desde tokens.** `scaleType(typography.caption, scaled)`; cero tamanos literales en la capa de sync.
3. **Micro-interaccion con proposito.** Fundido corto al cambiar de estado; sin animacion en bucle, que en un ciclo de 12 s dejaria el chrome en movimiento permanente.
4. **Reduce-motion respetado.** `useReducedMotionPreference()` sirve el cambio sin transicion.
5. **Estados disenados.** Los siete estan definidos y congelados en prueba, incluido el de sincronizacion desactivada que antes no existia.
6. **Sin paletas nuevas.** Cero hex y cero `COLORS` en la capa de sync, verificado por lint y por prueba de fuente.
7. **Jerarquia clara.** Chip ambiente de tono bajo; barra de interrupcion solo en los tres estados que el docente podria querer resolver.

## Consola

**36 errores, 3 advertencias. Cero atribuibles a este change.**

Los 36 son el mismo error repetido: CORS del backend desplegado rechazando el origen `localhost:8082`, porque `Access-Control-Allow-Origin` vale `https://planearai.com`. Es una condicion preexistente del entorno de desarrollo, no una regresion: afecta a `notificaciones`, `grupos` y `mensajes`, ninguno tocado por este change. Ningun error se origina en `src/components/sync/`, `src/hooks/syncPresentation.ts` ni en las superficies migradas.

Efecto colateral util: confirma que desde este origen no se puede establecer sesion autenticada contra el backend, lo que sostiene la limitacion declarada abajo.

## Limitaciones

**1. Los estados autenticados no se verificaron en navegador.** La precedencia hace que `syncEnabled === false` gane sobre todo, asi que en sesion de invitado el chip permanece en `local` haga lo que haga la red. Verificar en navegador los estados `sin-conexion`, `sesion-expirada`, `sincronizando`, `sin-servidor` y `pendiente` exige una sesion autenticada real, y el backend rechaza este origen por CORS. No se creo ninguna cuenta ni se usaron credenciales para forzarlo.

Lo que si los cubre: la prueba de tabla de `derivarPresentacionSync` congela los siete estados y las dos reglas de precedencia de forma determinista (16 casos), y las pruebas de componente verifican que el chip renderiza cada uno con su rol, etiqueta y accion (17 casos). La transicion de red si se ejercito en navegador para la ruta de invitado, despachando los eventos `offline`/`online` que la app escucha (`connectivity.ts`, ruta web): la app no se rompe y el estado se mantiene correcto.

**2. Cambio de conducta declarado: el invitado sin conexion ya no ve barra de interrupcion.** La barra vigente la mostraba con `!isOnline` sin mirar `syncEnabled`. Con la nueva precedencia, un docente sin sesion queda en `local` tambien sin red, y la barra no aparece. Es deliberado: para quien nunca sincronizo, perder la red no cambia nada, y la barra anunciaba una perdida que no existia. Verificado en navegador: con `navigator.onLine = false` y evento `offline`, el chip sigue en "Guardado en este dispositivo" y hay **0** elementos `role="alert"`.

**3. Se retiro el chip de la pantalla de planeaciones despues de verlo en captura.** El plan pedia sustituir su derivacion propia por el componente compartido, y asi se implemento primero. La captura mostro la misma frase dos veces en la misma vista, a 120 px de distancia: el chip del chrome y el del encabezado. Como el chrome ya lleva el estado en toda pantalla, y en los estados que importan la barra aporta el texto completo, el de la pantalla era redundante. La pantalla conserva la obligacion que si le fija la spec: no derivar estado por su cuenta, garantizado por prueba.

**4. Tema oscuro, daltonismo y escala tipografica no se verificaron por captura.** Estan garantizados por construccion (`getStyles` + `useAppTheme`, cero hex, cero `COLORS`) y por prueba de fuente, con el mecanismo ya probado en #78 y #82, pero no hay captura por modo en esta corrida.

**5. Sin medicion de 60 fps en Android de gama media.** El change no introduce animacion sostenida, lo que acota el riesgo, pero no se midio en dispositivo.

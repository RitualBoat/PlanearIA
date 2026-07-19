# Design: sync-status-ui

## Context

`SyncContext` (`src/context/SyncContext.tsx`) es la fuente de verdad y esta completa: expone `isOnline`, `status` (`idle`/`offline`/`syncing`/`synced`/`error`), `lastSyncAt`, `pendingCount`, `syncEnabled`, `authError`, `notice`, `dismissNotice` y `syncNow`. No le falta informacion.

Lo que falta es la capa de traduccion. Hoy `useSyncStatus()` tiene **un** consumidor (`SyncStatusBanner.tsx`), y las demas superficies derivan por su cuenta:

- `ListaPlaneacionesScreen.tsx:18-36` (`buildSyncState`): 4 hex fijos, vocabulario propio, sin `authError`.
- `SyncStatusBanner.tsx:20-63`: `COLORS` estatico legacy, otro vocabulario.
- `SyncNoticeToast` (`:77-102`): tercer conjunto de textos.

Restricciones firmes: el motor de sync no se toca (regla de oro `src/sync`), no se crea estado paralelo, la UI nueva consume tokens en runtime (#78/#80) y hereda los patrones de accesibilidad de #82 (RN Web no deriva `aria-busy`/`aria-checked`; el foco solo se dispara con tabulacion real).

Fundacion disponible: `src/components/base/Chip.tsx` (patron `getStyles`, `hitSlop` a 44pt, foco medido a 4.61:1), `AppTopBar.tsx` de #81 como chrome en flujo de layout.

## Goals / Non-Goals

**Goals:**
- Una sola traduccion de estado de sync a presentacion en toda la app.
- Un vocabulario, un set de iconos y un set de tonos, coherentes en cualquier pantalla.
- Cubrir los siete estados reales, incluido `syncEnabled === false`, que hoy nadie maneja.
- Presentar `authError` en las superficies que hoy lo ignoran.
- Conservar literalmente los textos tranquilizadores vigentes y eliminar el copy alarmista.
- Accesibilidad por texto, no solo por color.

**Non-Goals:**
- Motor de sync, colas, clientes HTTP, almacenamiento, estado paralelo.
- Retirar la maquina de estado paralela de `PlaneacionesContext`.
- `ConflictSheet` y resolucion de conflictos.
- Autoguardado o maquina de guardado por documento.
- Migrar todos los editores; solo el consumidor de referencia.

## Decisions

### D1. Un hook ViewModel (`useSyncPresentation`) como unica derivacion

`src/hooks/useSyncPresentation.ts` lee `useSyncStatus()` y devuelve un objeto de presentacion memoizado. Los tres componentes nuevos y `SyncStatusBanner` lo consumen; ninguno vuelve a decidir texto, icono ni tono.

*Alternativas consideradas.* (a) **Tres componentes autonomos, cada uno con su `switch`.** Es lo que pide literalmente el criterio del plan y es menos codigo al inicio, pero produce exactamente el defecto que este change existe para cerrar: tres traducciones que divergen al primer cambio de copy. Seria una cuarta, quinta y sexta derivacion sobre las tres actuales. Rechazada. (b) **Meter la presentacion dentro de `SyncContext`.** Concentra la verdad en un solo lugar, pero mezcla dominio con presentacion en un contexto que hoy es puramente de dominio, y obligaria a tocar `src/context/SyncContext.tsx`, que es frontera del motor. Rechazada por MVVM y por acotamiento. (c) **Modulo de funciones puras sin hook.** Viable y testeable, pero cada consumidor tendria que acordarse de llamar `useSyncStatus()` y pasar seis campos en el orden correcto; el hook elimina esa oportunidad de error. Elegida (c) *dentro* de (D1): el mapeo vive en una funcion pura exportada y el hook solo la alimenta, de modo que las pruebas cubren la tabla sin montar React.

### D2. Precedencia explicita de estados, con offline por encima de `authError`

El estado presentado se resuelve en este orden, y el primero que aplica gana:

| # | Condicion | Estado | Titulo | Tono | Icono |
| --- | --- | --- | --- | --- | --- |
| 1 | `!syncEnabled` | `local` | "Guardado en este dispositivo" | neutro | `smartphone` |
| 2 | `!isOnline` | `sin-conexion` | "Sin conexion" | aviso | `cloud-off` |
| 3 | `authError` | `sesion-expirada` | "Tu sesion expiro" | aviso | `lock-outline` |
| 4 | `status === "syncing"` | `sincronizando` | "Sincronizando" | info | `sync` |
| 5 | `status === "error"` | `sin-servidor` | "Guardado en este dispositivo" | aviso | `cloud-queue` |
| 6 | `pendingCount > 0` | `pendiente` | "N cambios por sincronizar" | info | `cloud-upload` |
| 7 | resto | `sincronizado` | "Todo sincronizado" | exito | `cloud-done` |

Dos decisiones dentro de la tabla merecen justificacion.

**Offline gana sobre `authError` (2 antes que 3).** Sin conexion, la sesion expirada es cierta pero inaccionable: ofrecer "vuelve a iniciar sesion" a un docente en modo avion es una instruccion imposible de cumplir, que convierte un estado tranquilo (sin conexion, todo a salvo) en una alarma sin salida. Ademas el codigo vigente ya asume esta precedencia: `SyncStatusBanner.tsx:24` calcula `showAuthError = isOnline && syncEnabled && authError`. La tabla formaliza lo que la barra ya hacia bien y lo extiende al resto de la app.

**`syncEnabled === false` es el estado 1, no un caso borde.** Es el estado por defecto de todo docente invitado o con la API sin configurar. Hoy ninguna derivacion lo distingue: `buildSyncState` cae en su rama final y pinta "Sincronizado" en verde a alguien que **no tiene sincronizacion en absoluto**. Ponerlo primero garantiza que ninguna otra condicion pueda producir esa mentira.

*Alternativa considerada.* Mapear 1:1 los cinco valores de `GlobalSyncStatus` y tratar `syncEnabled`/`authError`/`pendingCount` como decoraciones. Es mas simple, pero `GlobalSyncStatus` describe el resultado del ultimo ciclo, no la situacion del docente: `status === "idle"` significa cosas opuestas para un invitado y para un usuario con sesion valida. Rechazada.

### D3. Ningun estado de sync usa el rojo de error

Los siete estados usan tonos neutro, info, aviso y exito. El rojo (`colors.error`) queda reservado para el unico fallo que si es del docente y si exige accion: `SaveStateLabel` con `estado="error"`, es decir, el guardado local que no se completo.

Un backend caido no es un fallo del docente ni pone en riesgo su trabajo: los cambios estan en cola local y subiran solos. Pintarlo de rojo, como hace hoy `buildSyncState` con `#dc2626` y la etiqueta "Error sync", ensena al docente a desconfiar de una app cuya promesa es precisamente funcionar sin conexion. Por eso el estado 5 se titula "Guardado en este dispositivo" y no "Servidor no disponible": el titulo dice lo que el docente necesita saber (su trabajo esta a salvo), y el detalle explica la causa.

### D4. `SaveStateLabel` recibe su estado por props; no lo inventa

Verificado: no existe maquina de autoguardado por documento. Solo hay booleanos `isSaving` sueltos, y el unico con copy real es `EditorPlantillaScreen.tsx:258,273`.

`SaveStateLabel` recibe `estado: "guardando" | "guardado" | "pendiente" | "error"` y `guardadoEn?: string`, y combina esa pierna local con la pierna de sync que le da `useSyncPresentation()`. La distincion que comunica es la que importa en offline-first: **guardado** (esta en el dispositivo, no se pierde) es distinto de **sincronizado** (esta en el servidor). Un docente sin conexion debe poder ver "Guardado" con calma aunque el chip global diga "Sin conexion".

*Alternativa considerada.* Derivar el estado de guardado desde `SyncContext.pendingCount` filtrado por documento. Rechazada: `pendingCount` es un total, no admite filtro por entidad sin tocar `src/sync`, y construir ese filtro seria estado paralelo, prohibido por el issue.

### D5. `SyncStatusBanner` se migra en su lugar; chip y barra tienen roles distintos

El chip es **ambiente**: siempre visible en `AppTopBar`, tono bajo, no interrumpe. La barra es **interrupcion**: aparece solo en `sin-conexion`, `sin-servidor` y `sesion-expirada`, ocupa ancho completo y lleva la accion de recuperacion.

Ambos leen el mismo hook, asi que no pueden contradecirse. Migrar la barra a tokens es obligatorio, no cosmetico: dejarla en `COLORS` legacy con su propio copy incumpliria de frente el criterio "mismo lenguaje visual en toda la app" mientras el chip nuevo dice otra cosa a cinco centimetros.

*Alternativa considerada.* Borrar la barra y dejar solo el chip. Rechazada: la barra es la que porta los textos tranquilizadores largos que el criterio manda conservar, y un chip de 32pt no puede explicar "Puedes seguir trabajando: tus cambios se guardan en este dispositivo".

### D6. Accesibilidad: el estado se anuncia por texto, y `aria-busy` va explicito

Cada estado expone `etiquetaA11y` completa (titulo + detalle + conteo cuando aplica), de modo que un lector de pantalla recibe la situacion sin depender del color ni del icono. Con daltonismo o alto contraste, el texto sigue siendo la informacion.

Durante `sincronizando` el chip declara `aria-busy` de forma explicita: #82 verifico que React Native Web **no** deriva `aria-busy` desde `accessibilityState`. Si el chip es accionable (reintentar), cumple 44pt via `hitSlop`, siguiendo el patron de `Chip.tsx` que mantiene el alto visual en 32.

El chip no usa `accessibilityRole="alert"`: un estado ambiente que cambia cada 12 segundos por el ciclo de polling interrumpiria al lector de pantalla sin cesar. `alert` queda para la barra, que aparece por excepcion.

### D7. Sin animacion de rotacion permanente

El estado `sincronizando` no gira un icono en bucle. El ciclo de polling corre cada 12 segundos (`SYNC_CONFIG.pollInterval`), asi que un spinner permanente convertiria el chrome en un elemento en movimiento constante: costo de bateria, distraccion y jank en gama media, contra el presupuesto de motion 1.9.4. La transicion entre estados es un fundido corto con `withTiming`, y bajo `useReducedMotionPreference()` se sirve el cambio sin transicion.

### D8. La pantalla de planeaciones deja de mostrar estado, no solo de derivarlo (decidido en QA)

El plan pedia sustituir `buildSyncState` por el componente compartido, y asi se implemento primero. La captura a 1280 mostro el resultado real: la misma frase, "Guardado en este dispositivo", dos veces en la misma vista, en el chrome y en el encabezado de la pantalla, separadas por 120 px. Eso no es lenguaje visual coherente, es repeticion.

Como el chip del chrome esta presente en toda pantalla del shell, y en los tres estados que el docente podria querer resolver la barra global aporta el texto completo, el indicador de la pantalla no agregaba informacion. Se retiro.

La obligacion que la spec si le fija a la pantalla se conserva y se refuerza: no derivar estado por su cuenta. Un guardarrail nuevo verifica que `buildSyncState`, `syncStatus` y `pendingCount` no reaparezcan en ese archivo.

*Alternativa considerada.* Conservarlo porque en movil el chip del chrome es compacto y sin palabras. Rechazada: en movil, los estados sin palabras son precisamente los calmos (`sincronizado` y `local`), donde el icono basta; en los estados con noticia, la barra ocupa el ancho completo con la frase entera. No se pierde texto donde importa.

## Risks / Trade-offs

- **[El chip global puede decir "Todo sincronizado" mientras planeaciones tiene trabajo en cola]** → `pendingCount` **si** incluye planeaciones (`entitySync.ts:390-396` recorre `[...Object.keys(SYNC_ENTITIES), "planeaciones"]`), asi que el estado 6 lo detecta y el chip dira "N cambios por sincronizar". Lo que no lo mueve es `status`: el ciclo propio de `PlaneacionesContext` no dispara `syncAllEntities()`. El riesgo real queda acotado a que el chip diga "Todo sincronizado" durante un ciclo de planeaciones en curso, sin ocultar trabajo pendiente. Se documenta como limitacion conocida y se cubre en la prueba de la tabla.
- **[`ListaPlaneacionesScreen` cambia de fuente de datos y podria regresionar]** → La pantalla pasa de `PlaneacionesContext` a `SyncContext` solo para el indicador. `PlaneacionesContext` conserva sus campos intactos; ningun otro consumidor los pierde. Cubierto por prueba de que la pantalla renderiza el chip en los siete estados.
- **[Migrar `SyncStatusBanner` toca un archivo legacy en produccion]** → Es el unico archivo legacy modificado y el cambio es de capa visual: mismos disparadores (`showOffline`, `showServerDown`, `showAuthError`), mismo `syncNow("manual")`, misma estructura. Cambian color, tokens y origen del copy. Cubierto por prueba de que los tres disparadores siguen produciendo barra.
- **[Un solo hook es un punto unico de fallo de copy]** → Es el objetivo, no el riesgo: concentra en un archivo lo que hoy esta en tres. La tabla completa se congela en prueba, de modo que un cambio accidental de precedencia o de copy falla la suite.
- **[El chip agrega un cuarto elemento al chrome y puede apretar el ancho movil]** → A 375 el chip se sirve en su variante compacta (icono + conteo, sin titulo), con la etiqueta accesible completa. Verificado por QA visual en los tres breakpoints.

## Migration Plan

Change aditivo con tres archivos modificados, sin migracion de datos, esquema, configuracion ni dependencias.

1. Hook y funcion pura de mapeo, con su prueba de tabla.
2. Los tres componentes, con sus pruebas.
3. Montaje del chip en `AppTopBar`.
4. Sustitucion de `buildSyncState` en `ListaPlaneacionesScreen`.
5. Migracion de `SyncStatusBanner` a tokens y vocabulario compartido.
6. `SaveStateLabel` en `EditorPlantillaScreen` como consumidor de referencia.
7. QA visual por breakpoint, incluida transicion offline y reconexion reales.

**Rollback.** Revertir el commit del PR devuelve los tres archivos a su derivacion actual y elimina hook y componentes. Este change nunca escribe en almacenamiento ni en colas, asi que ningun revert puede perder datos locales ni operaciones pendientes. Desactivacion parcial: retirar el montaje del chip en `AppTopBar` deja el resto operando; `SaveStateLabel` puede quitarse de su consumidor de referencia de forma aislada.

## Open Questions

- La retirada de la maquina de estado paralela de `PlaneacionesContext` queda para un change posterior. Este change la deja intacta y solo corta su consumo desde la UI; conviene decidir su retiro cuando se rediseñe la pantalla de planeaciones en Ola 2, para tocar el archivo una sola vez.
- `SaveStateLabel` se adopta hoy en un unico editor porque es el unico con estado de guardado real. La adopcion en NotasPLAN y el resto de Office depende de que esos editores existan con autoguardado propio (Ola 3).

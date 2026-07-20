## Context

#81 (`app-shell-navegacion`) reemplazo un stack plano de ~60 rutas hermanas por un shell de cinco hubs con
stacks anidados y una raiz de nueve rutas. La documentacion de referencia no siguio: describe el estado
anterior a #81 y lo presenta como vigente.

Estado verificado sobre `development@4755177`:

| Afirmacion documental | Realidad en codigo |
| --- | --- |
| Fuentes: `AppTabsNavigator.tsx`, `StackNavigator.tsx` | `AppTabsNavigator.tsx` no existe; el shell es `AppShell.tsx` |
| Tabs: Feed, Contenido, Grupos, Social, Configuracion | Hubs: `InicioTab`, `OfficeTab`, `ClasesTab`, `AsistenteTab`, `MasTab` (`AppShell.tsx:24-30`) |
| "Asistente: no existe ruta dedicada todavia" | `AsistenteTab` -> `AsistenteHome` (`routeManifest.ts:81`) |
| Rutas listadas como si fueran hermanas de raiz | Raiz de 9 rutas (`types.ts:159-174`); el resto vive en su hub |

Restricciones que enmarcan el diseno:

- **Existe una fuente de verdad mecanizada.** `src/navigation/routeManifest.ts` declara la particion en
  valores (no solo tipos) y sus chequeos bidireccionales (`:147-179`) rompen `typecheck` si contrato y
  manifiesto divergen. Cualquier diseno que ignore ese artefacto reintroduce el problema.
- **El consumidor es humano y agente, no un parser.** El mapa lo leen disenadores y las skills
  `ux-ui-design` (`.agents/` y `.codex/`, linea 12 de cada una). No hay script que lo procese, asi que el
  formato puede optimizarse para lectura, no para maquina.
- **#86 es aguas abajo.** El valor del change es llegar antes de que existan frames Figma equivocados.
- **Es un change documental.** Sin superficie de codigo, sin UI, sin datos: la validacion proporcional es
  `openspec-strict`, `harness-parity` y verificacion de enlaces, no Playwright.

## Goals / Non-Goals

**Goals:**

- Que un disenador o agente que abra el mapa obtenga la arquitectura de informacion implementada, con hub,
  ruta, landing y pantallas, sin tener que leer `src/navigation/`.
- Que las cinco tabs legacy dejen de aparecer como navegacion primaria vigente en toda la documentacion
  activa, no solo en el archivo que el issue nombra.
- Que el Plan Maestro deje de leerse como estado operativo y apunte a #101 para eso.
- Que OQ2 y el riesgo R4 queden cerrados con enlace a la decision que ya los resolvio.

**Non-Goals:**

- Redisenar navegacion o proponer arquitectura nueva (eso es el Plan Maestro y sus changes).
- Tocar `src/`, tests o configuracion.
- Automatizar la deteccion de deriva mapa/codigo.
- Corregir otros planes maestros o registros historicos fechados.

## Decisions

### D1. El mapa se deriva de `routeManifest.ts` y lo declara

Se transcriben `ROOT_ROUTES`, `HUB_ROUTES`, `INITIAL_HUB`, `HUB_LANDING` y `DEV_ONLY_ROUTES`, citando el
archivo como fuente. El encabezado declara la condicion derivada y el disparador de actualizacion (cambia
`routeManifest.ts` -> se actualiza el mapa).

*Alternativa descartada:* redactar el mapa leyendo los cinco stacks a ojo. Produce el mismo documento hoy
y vuelve a envejecer en silencio manana; ademas pierde el unico artefacto del repo cuya correccion esta
garantizada por compilacion.

*Alternativa descartada:* generar el mapa con un script desde `routeManifest.ts`. Es la solucion correcta
si la deriva reaparece, pero mete superficie de harness (script, fixture, comando, entrada en el doctor)
dentro de un change documental que se necesita antes de #86. Se documenta como opcion en Open Questions
en vez de ejecutarse a medias.

### D2. Las superficies legacy se registran por ubicacion, no por adjetivo

Feed y Social se documentan como rutas dentro de `MasTab`; Contenido como ruta dentro de `OfficeTab`. Cada
una con la decision que la movio (D5 y D6 del Plan Maestro, ejecutadas en `design.md` 3.3 de #81) y su
estado: viva y alcanzable, no primaria, pendiente de disolverse en ConectaPLAN.

*Por que importa la forma:* llamarlas "legacy" sin decir donde viven no le sirve a quien disene el flujo de
entrada. La ubicacion responde la pregunta que realmente se hace un disenador.

*Alternativa descartada:* omitirlas del mapa por ser legacy. Seguirian existiendo y alcanzables; un mapa
que las oculta es tan incorrecto como uno que las presenta como tabs.

### D3. La tabla de hubs solo contiene hubs

Los cinco hubs de `AppShell.tsx:24-30` viven en una tabla; toda pantalla legacy aparece unicamente en la
seccion de su hub duenio. Consecuencia verificable: una busqueda de `FeedTab` no devuelve nada presentado
como navegacion vigente, que es el criterio de aceptacion del issue expresado como propiedad del documento
y no como intencion.

### D4. La navegacion cruzada se documenta como regla estructural

Se registra la asimetria real (`types.ts:5-13`, `navigateToHub.ts:30-40`): las acciones de navegacion suben
al navegador padre pero nunca bajan a un hermano. De ahi que un cruce entre hubs requiera la forma anidada
de `navigateToHub` y que el retorno use `goBackOrHubLanding` con fallback a la landing del hub cuando no
hay historial (entrada por deep link).

*Por que no basta con listar los cruces existentes:* los 16 call sites de hoy son un inventario que
caduca; la regla explica por que un flujo Figma que cruza hubs tiene un costo estructural y cual es su
unica forma correcta.

### D5. `MAPA_MODULOS_ACTUALES.md` entra al alcance, de forma acotada

Se corrige su tabla de cinco tabs (`:17-21`) y su pregunta abierta sobre `ContenidoTab` (`:77`), mas un
puntero al mapa de navegacion como referencia detallada. No se reescribe el resto del documento.

*Por que se amplia el alcance declarado en el issue:* `00-fundamentos/` esta declarado fuente de verdad en
`CLAUDE.md` y `AGENTS.md` y forma parte de la Lectura Por Defecto, es decir, tiene mas autoridad que
`04-referencia/`. Corregir solo el archivo nombrado dejaria la version con mas autoridad diciendo lo
contrario, y el criterio de aceptacion "una busqueda no presenta las cinco tabs legacy" fallaria.

*Por que acotado:* el resto de `MAPA_MODULOS_ACTUALES.md` inventaria modulos, no navegacion. Reescribirlo
entero seria un change distinto sin issue.

### D6. Aviso de snapshot en el Plan Maestro, y ademas correccion de los estados ya falsos

El aviso va al encabezado y dice tres cosas: el documento es plan y snapshot de su fecha; el estado
operativo vive en #101 y sus milestones; los "Estado: pendiente" por change no son autoridad de estado.

Ademas se marcan como archivados los cuatro changes de Ola 1, con su fecha de archive.

*Por que ambas cosas y no solo el aviso:* el aviso es la politica que evita tener que sincronizar a mano
el plan con GitHub para siempre. Pero usarlo para dejar cuatro estados falsos verificables hoy seria
convertir la politica en excusa. La regla que queda: el aviso cubre la deriva futura; la deriva ya
conocida se corrige.

*Alternativa descartada:* corregir todos los "Estado: pendiente" del documento. Los demas changes siguen
realmente pendientes; tocarlos seria inventar trabajo.

### D7. OQ2 y R4 se marcan resueltos siguiendo el precedente del propio documento

Se usa la forma `OQ2 (RESUELTO 2026-07-19)` que el documento ya emplea en OQ6 (`:560`), con enlace a
`design.md` seccion 3.5 de #81 y el resultado verificable: componente retirado (`2e5acfb`), afordancias en
`AppTopBar` (campana con badge, ayuda, menu de cuenta). El riesgo R4 (`:107`) recibe el mismo tratamiento:
su mitigacion propuesta ya se ejecuto.

*Por que no borrar la open question:* el documento registra decisiones; borrar la pregunta perderia la
trazabilidad de que se decidio y donde.

### D8. `GITHUB_PRODUCT_OS.md` se corrige solo donde afirma un estado falsificable

Se corrigen `:67` (milestone listado entre activos) y `:134-135` (declarado abierto). El parrafo `:133`
describe el "estado inicial tras el change `product-os-epic-uxui` (2026-07-17)": es un registro fechado y
correcto en su fecha, asi que se conserva y se le agrega el estado posterior en vez de sobreescribirlo.

*Verificacion:* `gh api repos/RitualBoat/PlanearIA/milestones?state=all` devuelve milestone 11
`UX/UI Ola 1 - Shell y componentes state=closed open=0 closed=4`, con #81-#84 cerrados.

### D9. Las inconsistencias de codigo halladas al transcribir se derivan, no se corrigen

Si al escribir el mapa aparece una inconsistencia en `src/`, se registra con archivo y linea y se deriva a
issue propio. No se corrige aqui (no objetivo: no tocar codigo) ni se documenta como si estuviera resuelta.

## Risks / Trade-offs

- **El mapa vuelve a envejecer tras el proximo change de navegacion** -> El encabezado declara el
  disparador de actualizacion y nombra `routeManifest.ts` como fuente, de modo que la verificacion es
  comparar dos archivos y no releer cinco stacks. La automatizacion queda registrada en Open Questions con
  su justificacion, no descartada en silencio.
- **La ampliacion a `MAPA_MODULOS_ACTUALES.md` excede el alcance literal del issue** -> Queda declarada en
  proposal, design y `brownfield-baseline.md` con su razon (autoridad declarada superior y criterio de
  aceptacion inalcanzable sin ella), y acotada a la tabla de tabs y su pregunta abierta. Se comunico al
  responsable antes de aplicar.
- **Transcribir a mano puede introducir un error que el lector tomara por verdad** -> Cada tabla del mapa
  se verifica contra su fuente citada durante la revision adversarial, y las rutas se transcriben desde
  `routeManifest.ts`, no desde memoria ni desde los stacks.
- **Marcar OQ2/R4 resueltos podria leerse como alterar decisiones de #81** -> No se altera ninguna: se
  enlaza la decision existente y se registra su resultado. La spec `adaptive-app-shell` no se toca.
- **Documentar `Feed`/`Social` como vivas podria interpretarse como que son destino de diseno** -> Se
  registran con su estado explicito (pendientes de disolverse en ConectaPLAN, D5), que es la instruccion
  que #86 necesita para no disenarlas.

## Migration Plan

Cambio puramente documental, sin migracion. Rollback: `git revert` del commit del change restaura los
cuatro archivos. No hay estado intermedio posible porque ningun consumidor automatizado parsea estos
documentos: las skills solo los listan como lectura.

## Open Questions

- **Generador automatico del mapa desde `routeManifest.ts`.** Deliberadamente fuera de este change (D1).
  Si la deriva reaparece tras el proximo change de navegacion, ese es el issue correcto: script, fixture y
  entrada en el harness, con su propia superficie declarada.
- **Destino final de Feed y Social.** Lo decide `conectaplan`, no este change. El mapa registra el estado
  vigente y la decision D5 que las condena, sin adelantar el resultado.
- **`PLAN_AUTH_SEGURIDAD_SESION_REAL.md:551-557`** describe flujos por `ConfiguracionTab`, hoy
  `MasTab` -> `Cuenta`. Fuera de alcance (otro plan maestro activo); pendiente de issue propio.

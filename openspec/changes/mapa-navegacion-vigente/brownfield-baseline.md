# Brownfield baseline: mapa-navegacion-vigente

Registra unicamente la superficie que este change toca. No inventaria la aplicacion ni sustituye la spec.

## Superficies tocadas

- `Documentacion/04-referencia/MAPA_NAVEGACION_ACTUAL.md` (reescritura completa).
- `Documentacion/00-fundamentos/MAPA_MODULOS_ACTUALES.md` (edicion acotada: tabla de tabs `:17-21` y
  pregunta abierta `:77`; ampliacion respecto al alcance literal del issue #111, justificada abajo).
- `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md` (encabezado, estados de los cuatro
  changes de Ola 1, OQ2 y riesgo R4).
- `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` (estado del milestone `UX/UI Ola 1`, lineas `:67` y
  `:134-135`).

Ninguna superficie de codigo, backend, tests, configuracion ni UI. `src/navigation/` se lee como fuente y
no se modifica.

Justificacion de la ampliacion: `Documentacion/00-fundamentos/` esta declarado fuente de verdad en
`CLAUDE.md` y `AGENTS.md` y pertenece a la Lectura Por Defecto, de modo que tiene mas autoridad que
`04-referencia/`. Contiene la misma tabla de cinco tabs legacy. El criterio de aceptacion del issue
"una busqueda no presenta las cinco tabs legacy como navegacion primaria vigente" es inalcanzable sin
corregirla.

## Fuentes de verdad actuales

- `src/navigation/routeManifest.ts`: particion de rutas en valores (`ROOT_ROUTES`, `HUB_ROUTES`,
  `DEV_ONLY_ROUTES`, `INITIAL_HUB`, `HUB_LANDING`), con chequeos bidireccionales contra los param lists
  que rompen `typecheck` si divergen. Es la fuente primaria del mapa.
- `src/navigation/AppShell.tsx`: los cinco hubs, su titulo y su icono.
- `src/navigation/types.ts`: param lists por hub, raiz de nueve rutas y criterio de pertenencia.
- `src/navigation/StackNavigator.tsx`: composicion real de la raiz.
- `src/navigation/navigateToHub.ts`: forma unica del cruce entre hubs y del retorno.
- `openspec/specs/adaptive-app-shell/spec.md`: comportamiento del shell ya especificado por #81.
- `openspec/changes/archive/2026-07-18-app-shell-navegacion/design.md`: decisiones 3.3 (pantallas legacy),
  3.5 (OQ2 / `FloatingActionIcons`) y 3.7.
- GitHub: epic #101, milestones del plan UX/UI, issues #81-#84.

## Comportamiento vigente

- El mapa de referencia declara como fuentes `src/navigation/AppTabsNavigator.tsx` (inexistente) y
  `StackNavigator.tsx`, y presenta cinco tabs legacy como navegacion primaria.
- El mapa afirma que el Asistente no tiene ruta dedicada y ofrece cinco opciones para decidirlo.
- El mapa lista rutas como hermanas de raiz siguiendo el stack plano previo a #81.
- `MAPA_MODULOS_ACTUALES.md` repite la tabla de cinco tabs y deja abierta la pregunta sobre `ContenidoTab`.
- El Plan Maestro declara pendientes cuatro changes ya archivados, mantiene OQ2 abierta y el riesgo R4 sin
  resolver, y no distingue plan de estado operativo.
- `GITHUB_PRODUCT_OS.md` declara abierto el milestone `UX/UI Ola 1 - Shell y componentes`.

## Comportamiento objetivo

- El mapa describe los cinco hubs implementados con ruta, landing y pantallas, declara su derivacion de
  `routeManifest.ts` y su disparador de actualizacion, y cita solo archivos existentes.
- `Feed`, `Social` y `Contenido` figuran con su hub duenio y la decision que las movio, nunca como tabs.
- `AsistenteTab` -> `AsistenteHome` queda registrado con su alcance vigente declarado con honestidad.
- La navegacion cruzada y el criterio de rutas de raiz quedan documentados como reglas estructurales.
- Ninguna busqueda en documentacion activa presenta las cinco tabs legacy como navegacion primaria.
- El Plan Maestro lleva aviso de snapshot con puntero a #101, los cuatro changes figuran archivados, y OQ2
  y R4 figuran resueltos con enlace y resultado verificable.
- `GITHUB_PRODUCT_OS.md` no declara abierto el milestone cerrado y conserva su registro fechado.

## Compatibilidad legacy

- Ninguna ruta, pantalla ni contrato de codigo se modifica: `Feed`, `Social` y `Contenido` siguen vivas y
  alcanzables exactamente igual que hoy. Este change solo cambia como se describen.
- Los registros historicos fechados se conservan sin editar: `Documentacion/99-archivo/`,
  `Documentacion/03-validacion/` y `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md`.
- En el Plan Maestro se conservan estimaciones, paridades, dependencias y el texto original de OQ2 y R4;
  solo se anade su resolucion.
- En `GITHUB_PRODUCT_OS.md` se conserva el parrafo fechado del estado inicial tras `product-os-epic-uxui`.
- La ruta del archivo del mapa no cambia, asi que `.agents/skills/ux-ui-design/SKILL.md` y
  `.codex/skills/ux-ui-design/SKILL.md` siguen resolviendo su lectura obligatoria sin edicion.

## Owner de spec y contexto

- Spec nueva de este change: `navigation-reference-currency`.
- Comportamiento del shell: `adaptive-app-shell` (owner #81). Este change no la modifica.
- Convencion de seguimiento en Product OS: `product-os-uxui-tracking` (owner #89). No se modifica: se
  corrige una afirmacion de estado, no un requisito.
- Plan maestro afectado: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`.
- Tracker operativo: epic #101. Issue de este change: #111. Consumidor aguas abajo: #86.

## Evidencia actual

- Ausencia de `src/navigation/AppTabsNavigator.tsx` y contenido de `src/navigation/` en
  `development@4755177`.
- `routeManifest.ts:21-122` y sus chequeos `:130-179`; `AppShell.tsx:24-30`; `types.ts:154-174`.
- `git log --diff-filter=D -- src/components/FloatingActionIcons.tsx` -> `2e5acfb` (componente retirado).
- `gh api repos/RitualBoat/PlanearIA/milestones?state=all` -> milestone 11 `state=closed`, `closed=4`.
- `gh issue view` de #81, #82, #83, #84 -> CLOSED.
- `openspec/changes/archive/` contiene los cuatro changes de Ola 1 archivados.
- Evidencia a producir durante apply: busqueda de tabs legacy, verificacion de enlaces relativos
  (`docs-verification`), comparacion tabla por tabla contra el manifiesto, y revision adversarial.

## Fuera de alcance

- `Documentacion/01-planes-maestros/PLAN_AUTH_SEGURIDAD_SESION_REAL.md:551-557` (flujos por
  `ConfiguracionTab`): plan maestro distinto y activo; se deriva a issue propio.
- `Documentacion/02-operacion/CAMBIOS_SYNC_OFFLINE_2026-06.md:108,122`: registro fechado, historico.
- `.eslintrc.cjs:104` (entrada de rollout para `src/components/FloatingActionIcons.tsx`, ya borrado): es
  codigo, no documentacion; se deriva a issue propio.
- Cualquier cambio en `src/navigation/`, rutas, param lists o specs archivadas.
- Generador o checker automatico de deriva entre mapa y codigo: registrado como open question.
- Rediseno de navegacion o propuesta de arquitectura de informacion nueva.

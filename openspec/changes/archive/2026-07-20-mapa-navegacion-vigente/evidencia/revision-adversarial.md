# Revision adversarial - mapa-navegacion-vigente (#111)

Fecha: 2026-07-19. Rama: `docs/mapa-navegacion-vigente`.

**Alcance:** issue #111, change `mapa-navegacion-vigente`.
**Fuentes:** artefactos del change (proposal, design, spec, tasks, baseline), `git diff` contra
`development@4755177`, y el codigo real de `src/navigation/`.

## Alineacion spec/tareas

Los criterios de aceptacion del issue se contrastaron uno por uno contra evidencia ejecutada, no contra la
intencion declarada. La verificacion mecanica esta en `verificacion-docs.md`. Este documento registra
unicamente lo que el pase adversarial intento romper.

## Hallazgos

| Severidad | Area | Hallazgo | Evidencia | Arreglo |
| --- | --- | --- | --- | --- |
| Major | Contradiccion hacia #86 | El mapa documentaba el Asistente como hub a pantalla completa sin declarar que la decision D4 del plan lo quiere como **panel acoplable** en web/tablet (>=1024px). Un prototipo de Figma podia disenar una tab de pantalla completa en web creyendo seguir el plan. El mismo riesgo existia para D7 (sidebar completa + panel IA en web) y para el Escritorio. | `PLAN_UXUI_NAVEGACION_GLOBAL.md:46` (D4) y `:48` (D7) vs `AppShell.tsx` y `AsistenteHomeScreen.tsx` | **Corregido en docs.** Se anadio al mapa la seccion "Brecha entre lo implementado y la navegacion objetivo" con seis diferencias conocidas, el change que cierra cada una, y la regla de precedencia: el objetivo manda para diseno, el mapa manda para saber que existe. Se anadio el requisito correspondiente a la spec y un `AND` a su escenario. |
| Minor | Trazabilidad | La tabla historica atribuia a D7 el movimiento de `ConfiguracionTab` con la frase escueta "D7 la mueve al hub Mas" (heredada literalmente del design archivado de #81). D7 se titula "Navegacion adaptativa": un lector que lo consultara no encontraria una decision sobre la cuenta. | `PLAN_UXUI_NAVEGACION_GLOBAL.md:48` | **Corregido en docs.** Reformulado: D7 define los cinco hubs sin tab de configuracion, y por eso la cuenta pasa a Mas. |
| Minor | Contradiccion interna de la spec | El requisito 1 exigia "citar unicamente archivos fuente existentes", pero el mapa cita `src/components/FloatingActionIcons.tsx` (borrado) dentro de la frase que declara su eliminacion. El escenario ya era preciso ("cada archivo citado **como fuente**"); el requisito no. | `specs/navigation-reference-currency/spec.md` | **Corregido en spec.** El requisito ahora distingue cita como fuente de verdad (debe existir) de cita dentro de una afirmacion de eliminacion (permitida). |
| Minor | Deuda documental ajena | `PLAN_AUTH_SEGURIDAD_SESION_REAL.md` cita 24 rutas de repositorio que no existen. | Verificado contra `git show HEAD`: **preexistentes**, no introducidas por este change | Fuera de alcance por decision D10. Se deriva a issue propio. |
| Pregunta resuelta | Decisiones de #81 | Se verifico que no se alteraron decisiones de #81 ni specs. | `git status --porcelain` no muestra cambios en `openspec/specs/` ni en `openspec/changes/archive/` | Sin accion. |
| Pregunta resuelta | Skills de diseno | Se verifico que `.agents/skills/ux-ui-design/SKILL.md` y su espejo `.codex/` son identicos y no contienen afirmaciones de estructura de navegacion que contradigan el mapa: su lista de "Core experiences" es la vision objetivo, no navegacion vigente. La ruta del mapa no cambia, asi que la lectura obligatoria sigue resolviendo. | Lectura de ambos archivos y `diff` | Sin accion. |
| Pregunta resuelta | Coincidencia con el codigo | Comparacion bidireccional mapa <-> `routeManifest.ts`: 9 rutas raiz, 54 de hub, 1 solo-desarrollo y 5 hubs, 0 fallos, con dos mutaciones de control que fallan como se espera. Se verificaron ademas en fuente las afirmaciones en prosa: destinos del TopBar (`AppTopBar.tsx:90,109`), acciones del hub Asistente (`AsistenteHomeScreen.tsx:40,54`), ruta inicial (`StackNavigator.tsx:68-72`) y registro bajo `__DEV__` (`MasStack.tsx`). | `verificacion-docs.md` seccion 1 | Sin accion. |

## Que se intento romper y no cedio

- **Chequeo vacuo:** dos mutaciones de control (renombrar una ruta de hub y renombrar un hub) producen
  FAIL, y la restauracion vuelve a 0. El resultado verde distingue un mapa correcto de un chequeo inerte.
- **Criterio de aceptacion cumplido solo en el archivo nombrado:** la busqueda de tabs legacy encontro un
  quinto documento activo (`PLAN_AUTH`) que lo incumplia. Se corrigio en vez de estrechar la spec.
- **Exhaustividad de rutas:** se comprobo que `CatalogoComponentes` (solo `__DEV__`) esta documentada como
  no alcanzable en vez de omitida, de modo que el inventario no tiene huecos silenciosos.
- **Ampliacion de alcance sin declarar:** las dos superficies anadidas (`MAPA_MODULOS_ACTUALES.md` en el
  propose, `PLAN_AUTH` durante el apply) estan declaradas en proposal, design (D5 y D10),
  `brownfield-baseline.md` y `TLDR.md`, con su razon y su acotacion.

## Veredicto

**PASS CON HUECOS.**

Un Major y dos Minor detectados y **corregidos dentro de este change**; ninguno queda abierto. El hueco
rastreado que permanece es la deuda documental preexistente de `PLAN_AUTH_SEGURIDAD_SESION_REAL.md` (24
rutas rotas), explicitamente fuera de alcance y derivada a issue propio.

## Siguientes pasos antes de archivar

- Registrar las derivaciones como issues: rutas rotas de `PLAN_AUTH` y entrada obsoleta de
  `.eslintrc.cjs:104`.
- Reejecutar `openspec validate --all --strict` tras las correcciones de spec.
- Archivar es aconsejable en el estado actual.

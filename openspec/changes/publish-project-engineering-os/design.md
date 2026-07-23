## Context

PlanearIA contiene dos runtimes de tooling maduros:

- `tools/project-constructor`: paquete ESM privado `0.1.0`, blueprint neutral, cinco adaptadores de
  harness, OpenSpec local fijado, doctor read-only, Product OS declarativo, transacciones,
  resume/rollback y fixtures.
- `tools/debt-control`: motor ESM con assessments inmutables, registro verificable, presupuesto por
  plan, siete categorías, gates SDD, sincronización GitHub idempotente y handoff de contexto.

Ambos están probados, pero PlanearIA es a la vez owner y consumidor. El paquete constructor sigue
`private`/`UNLICENSED`, los scripts raíz apuntan a paths embebidos y no existen upstream público,
release SemVer, paquete npm ni mecanismo de upgrade por release. PR #127 propuso la extracción, pero se
cerró sin merge para implementar y sanear primero el motor de deuda. Esa condición terminó con #129,
#136 y PR #139 en `development@2ef9a46`.

El issue #126 aprobó repositorio público, licencia MIT, npm/npx, GitHub Releases, contribuciones y
migración reversible. El mantenedor inicial es un solo developer y el presupuesto es cero/bajo.
Creación pública, autenticación, primera publicación y releases mayores son gates humanos.

### Contextos delimitados

Este change no modifica los bounded contexts de producto descritos en
`Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`. Introduce un contexto técnico externo,
**Engineering OS**, owner del CLI, blueprint, schemas, motor de deuda, documentación pública y releases.

PlanearIA y futuros repositorios son consumidores. Cada consumidor es owner de su producto, decisiones
técnicas, overlays y archivos no administrados. El contrato es unidireccional: Engineering OS publica una
release inmutable; el consumidor registra nombre, versión, schema e identidad y aplica cambios solo
mediante un plan revisable. No cambian `userId`, `src/sync`, permisos, datos académicos o confirmación IA;
no se requieren microservicios, CQRS, event sourcing, colas ni providers.

## Goals / Non-Goals

**Goals:**

- Establecer un upstream público neutral y una única fuente canónica.
- Distribuir constructor y Debt Control Loop en un solo paquete/versionado.
- Hacer reproducibles instalación, bootstrap, upgrade, rollback y diagnóstico.
- Ligar commit, tag, tarball, checksum, GitHub Release, npm y provenance.
- Separar CI exhaustiva upstream de smokes contractuales de consumidores.
- Permitir contribuciones externas con permisos mínimos y releases gobernadas.
- Migrar PlanearIA sin una ventana silenciosa de dos owners.

**Non-Goals:**

- Publicar PlanearIA, su historia completa, dominio, datos, UI o runtime de producto.
- Crear SaaS, dashboard, telemetría, backend, marketplace o servicio hospedado.
- Activar perfiles condicionales antes del discovery.
- Implementar un template repository en v1.
- Garantizar pnpm, Yarn o Bun en v1.
- Automatizar OAuth, aceptación legal, compra o aprobación humana.
- Modificar branch protection de PlanearIA dentro de este change.

## Decisions

### D1. Solución híbrida con CLI canónico y repositorio público, sin template owner

La solución sostenible es híbrida:

1. `RitualBoat/project-engineering-os` contiene código, blueprint, specs, docs y CI.
2. `create-project-engineering-os` distribuye el mismo tree por npm/npx.
3. GitHub Releases publica el tarball contractual y checksum.
4. Un template repository puede evaluarse después como espejo generado, nunca como owner.

Un documento aislado no garantiza idempotencia; un template solo no conoce ownership ni migraciones; una
skill depende del agente. El CLI ofrece comportamiento verificable y `AGENTS.md` conserva degradación para
harnesses sin skills/MCP.

### D2. Upstream limpio mediante export allowlisted, no fork con historia completa

El repositorio público se inicializará con un seed mínimo revisado y después recibirá el export completo
por `feat/initial-release` y PR. El export se deriva de una allowlist declarativa de:

- runtime/blueprint/schemas/tests del constructor;
- runtime/schemas/tests del motor de deuda;
- documentación, políticas comunitarias y workflows propios del upstream.

Se excluyen historia, configuración, evidencia, secretos, rutas y términos de PlanearIA. Cada archivo
público debe tener owner, fuente y licencia. El SHA de corte queda trazado en ADR/changelog, pero no se
transfiere el historial completo.

La identidad del export normaliza texto a LF antes de calcular hashes y el upstream fija
`* text=auto eol=lf` en `.gitattributes`. Así un checkout de Windows no crea drift falso, mientras una
alteración de contenido distinta de finales de línea sigue bloqueando la comparación.

Alternativas descartadas: hacer público PlanearIA; `git filter-branch` del monorepo; mantener dos trees
editables.

### D3. Un paquete npm y un binario lógico

El paquete será `create-project-engineering-os` y expondrá el mismo entrypoint mediante:

- `create-project-engineering-os`;
- `project-os`;
- alias `project-constructor` solo durante una versión menor si una fixture de migración lo exige.

El CLI contendrá bootstrap, sync/check, doctor, readiness, Product OS, upgrade/rollback y namespace
`debt`. No se publica `debt-control` como segundo paquete: evitaría coordinación de versiones, doble
lockfile y políticas incompatibles.

El manifest declarará MIT, `repository`, `bugs`, `homepage`, `files`, `engines` y
`publishConfig.access=public`. `files` será allowlist y ningún módulo podrá resolver paths relativos a
PlanearIA.

### D4. Estado separado por responsabilidad, release compartida

La release del CLI es única, pero cada responsabilidad conserva estado explícito:

- `.project-constructor/state.json`: versión del paquete, schema, owners, hashes y transacciones.
- `.project-os/debt/config.json`: política seed-once configurable por el consumidor.
- `.project-os/debt/registry.json`: estado derivado y verificable de assessments.
- `.project-os/debt/assessments/*.json`: evidencia inmutable por flujo.

Upgrade versiona schemas y migra cada store explícitamente. Borrar un assessment no reanuda un plan; el
registro se valida contra assessments. El doctor solo lee estos stores. El package version compartido no
fusiona estados ni permite que un rollback del constructor borre deuda del consumidor.

### D5. El Debt Control Loop se instala activo pero vacío

Etapa A instala política, schemas, comandos y gates, con registro vacío. El bootstrap:

- no inventa hallazgos;
- no crea issue de saneamiento sin trigger;
- resuelve modo GitHub `auto` a `required` solo si existe Product OS; de otro modo a `off`;
- permite `required`, `advisory` u `off`;
- conserva umbral 5 como default configurable;
- conserva categorías, recurrencia, excepciones y regla NO GENERAR MÁS DEUDA TÉCNICA.

El cierre SDD siempre captura assessment, incluso `clean`. Los scanners producen candidatos, no
autorizaciones. `check` es read-only; `capture` y `sync` son las únicas mutaciones de estado, además de
`postfinish` bajo su contrato.

### D6. Release candidate único y promoción sin reconstrucción

El workflow ejecuta validaciones, produce una vez `npm pack`, prueba ese `.tgz` en repositorios temporales,
calcula SHA-256 y lo adjunta a GitHub Release. La publicación npm consume el mismo tarball.

Tag, `package.json`, changelog, asset y registry deben compartir versión y commit. Una versión existente no
se reutiliza ni se sobrescribe. Los source archives automáticos de GitHub no son el artefacto contractual.

### D7. Trusted Publishing actual, separado del soporte de consumidores

La publicación estable usa npm Trusted Publishing con runner GitHub-hosted, `contents: read`,
`id-token: write`, environment protegido y repositorio/workflow exactamente registrados. Al 2026-07-23,
npm exige Node >=22.14 y npm >=11.5.1 para Trusted Publishing; el job de release fijará una combinación
compatible y fallará antes de publicar si no la demuestra.

La matriz del producto continúa Node 20/22 porque el requisito OIDC pertenece al publicador, no al runtime
del consumidor. Trusted Publishing genera provenance automáticamente para paquete y repositorio públicos.
La primera publicación/reserva puede requerir autenticación interactiva temporal; nunca se guarda un
token persistente en Actions y cualquier credencial de bootstrap se revoca tras probar OIDC.

### D8. Workflows con privilegios mínimos y dependencias inmutables

CI de PR usa `contents: read` y no accede a secretos ni `pull_request_target`. Workflows de release separan
build/verify de publish, requieren environment y fijan acciones de terceros a SHA completo con comentario
de versión. Un check ausente, cancelado, skipped inesperadamente o timed out no cuenta como `PASS`.

Los nombres de jobs son únicos. Branch/ruleset exige PR, checks, conversaciones resueltas y prohíbe
force-push/borrado. El único push directo permitido es el seed mínimo necesario para crear `main`;
protección se activa inmediatamente y el export entra por PR.

### D9. CI upstream exhaustiva; consumidores prueban contrato

Upstream posee:

- unit tests de CLI, schemas, renderers, doctor, transacciones y deuda;
- fixtures greenfield/brownfield, segunda ejecución, colisiones, resume y rollback;
- neutralidad, secretos, licencias, docs y allowlist;
- pack/smoke del tarball;
- matriz Windows/macOS/Linux y Node 20/22.

PlanearIA conserva smokes de versión, bins/help, sync/check, doctor, debt check y fixture mínima. No duplica
la suite upstream. Sus checks específicos de app continúan independientes.

### D10. Upgrade ejecutado por la versión destino

La invocación usa versión explícita:

```text
npx create-project-engineering-os@<version> upgrade --target <repo> --check
npx create-project-engineering-os@<version> upgrade --target <repo> --apply --open-pr
```

`latest` solo se permite en onboarding no reproducible y nunca se persiste como identidad. `--check` es
read-only y muestra diff, migraciones, validaciones y rollback. `--apply` reutiliza transacciones, owners y
hashes. Schemas futuros o colisiones humanas fallan antes de escribir.

`--open-pr` es opt-in: exige Git limpio y `gh` autenticado, crea/reutiliza rama y PR, pero no aprueba,
mergea ni empuja directo a protegida. Si GitHub falla, conserva comandos/estado de recuperación.

### D11. Compatibilidad y versionado

- SemVer gobierna CLI/blueprint; schemas tienen versiones explícitas.
- Node `^20.20.0 || >=22.22.0`, npm/npx y tres SO son soporte v1.
- Cambiar rutas, ownership, config o registro requiere migración y fixture.
- Major requiere aprobación y guía de migración.
- pnpm/Yarn/Bun son `SKIP` documentado, no `FAIL` del núcleo.
- OpenSpec mantiene versión exacta local y ownership exclusivo de workflows OPSX.

### D12. Documentación y prompts son interfaz probada

README ofrece “crear repositorio nuevo” y “adoptar en uno existente”, seguidos de conceptos, comandos,
deuda, actualización, rollback, troubleshooting, seguridad y contribución. Tests ejecutan o extraen los
comandos principales y prueban encontrabilidad en menos de tres saltos.

Prompt 00 prepara Etapa A sin preguntar producto. Prompt 01 permanece inerte hasta el gate de Etapa A y
entonces guía discovery, ADR y perfiles. El runbook distingue intervención humana de changes versionados.

### D13. Specs upstream y contrato consumidor no comparten ownership

Upstream posee specs completas de runtime, distribución, deuda y upgrades. Las specs
`project-constructor-*` en PlanearIA pasan a ser contrato de aceptación de la versión fijada. Un cambio de
comportamiento nace y se archiva upstream; PlanearIA actualiza versión y contrato al adoptar una release.

El corte incluye tanto constructor como debt-control. Después del cutover, cambios a cualquiera nacen
upstream. Durante la transición, el source embebido queda congelado salvo corrección necesaria para
completar la publicación.

### D14. MIT del Engineering OS no decide licencia del producto

El repositorio y paquete usan MIT con copyright propuesto:
`Copyright (c) 2026 RitualBoat contributors`. Dependencias/artefactos conservan inventario SPDX y notices.
El blueprint instala un notice para archivos administrados, pero no crea ni reemplaza el `LICENSE` del
producto nuevo. Código y dominio del consumidor usan la licencia que su owner decida.

## Risks / Trade-offs

- [Nombre ocupado antes de reservarlo] → Revalidar GitHub/npm en el gate remoto; detener publicación
  parcial y aplicar solo un fallback aprobado.
- [Dos runtimes en un paquete aumentan alcance] → Namespaces, schemas y tests separados; release única
  elimina coordinación y es menor costo total para solo developers.
- [Dos fuentes de verdad durante transición] → SHA de corte, freeze explícito y retirada embebida solo
  después de upstream/npm sanos.
- [Import limpio pierde historia] → ADR, changelog e issues/PR/SHA preservan provenance sin exportar
  historia riesgosa.
- [Seed directo antes de protección] → Seed mínimo, SHA registrado, protección inmediata y export por PR.
- [OIDC o requisitos npm cambian] → Preflight contra versión real de Node/npm, docs oficiales y fallo
  seguro sin token persistente.
- [Release npm incorrecta] → Dry-run, smoke del mismo tarball, gate humano, deprecación y patch; no
  reutilizar versión.
- [Acción comprometida] → SHA completo, permisos mínimos, Dependabot/renovación deliberada.
- [Upgrade daña trabajo humano] → Ownership/hashes, dry-run, colisión bloqueante, journal, resume/rollback.
- [Deuda crea demasiados issues] → Un issue idempotente por plan y solo ante triggers configurados.
- [CI pública consume recursos] → Path filters y matrices completas solo donde aportan señal; sin
  servicios pagados por defecto.
- [MIT no cubre terceros] → Inventario/licencias por release y bloqueo ante incompatibilidad no aprobada.

## Migration Plan

1. Registrar `2ef9a46` como base y el SHA final de corte al comenzar apply.
2. Congelar cambios paralelos de constructor/debt-control y crear allowlist/neutrality checks.
3. Unificar ambos runtimes en el layout público y añadir metadata/licencias/bins/docs sin romper tests.
4. Implementar upgrade y migraciones de estado; probar tarball externo, idempotencia y rollback.
5. Construir CI/release con acciones por SHA, job OIDC compatible y release candidate único.
6. Revalidar nombres, notices, costos, sesión GitHub/npm y aprobación antes de mutar remoto.
7. Crear seed público mínimo, activar protección y enviar export completo por PR.
8. Probar upstream en los tres SO/Node 20/22, mergear por rama protegida y producir tag/release/tarball.
9. Ejecutar primera publicación aprobada, configurar Trusted Publisher y verificar provenance.
10. Adoptar versión exacta en PlanearIA, ejecutar smokes y rollback ensayado.
11. Retirar `tools/project-constructor` y `tools/debt-control` solo cuando upstream/npm sean sanos.
12. Actualizar plan, specs, docs, issue/Projects, capturar assessment y cerrar por archive/PR.

### Rollback por fase

- Antes de upstream: revertir el PR de PlanearIA; no hay estado externo.
- Upstream sin usuarios/releases: archivar o eliminar solo con aprobación explícita y evidencia.
- GitHub Release sin npm: marcar prerelease/deprecated; no mover tag silenciosamente.
- npm publicado: deprecar versión y publicar patch; no unpublish salvo política excepcional y decisión.
- PlanearIA migrado: PR que fija última versión sana; no `git reset --hard`.
- Migración de estado fallida: journal/resume o rollback de archivos administrados; assessments de deuda
  nunca se borran como recuperación.

## Open Questions

- Confirmar el copyright propuesto antes del gate público.
- Confirmar si la cuenta npm permite reservar/configurar Trusted Publisher inmediatamente; documentar
  recovery interactivo si la primera publicación debe precederlo.
- Decidir después de v1 si patch/minor puede auto-publicarse. v1 mantiene aprobación de environment para
  toda publicación.

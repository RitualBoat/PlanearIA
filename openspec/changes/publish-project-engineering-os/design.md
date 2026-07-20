## Context

PlanearIA contiene hoy `tools/project-constructor`, un paquete ESM privado `0.1.0` con 48 tests,
fixture de repositorio vacío, blueprint neutral, cinco adaptadores de harness, doctor, rollback y
contratos OpenSpec. El PR #125 demostró la implementación, pero el paquete permanece `UNLICENSED`,
el runbook exige un tarball local y los scripts raíz apuntan directamente al directorio embebido.

El issue #126 aprueba un upstream público canónico, licencia MIT, npm/npx, GitHub Releases y
actualizaciones mediante rama/PR. El trabajo cruza PlanearIA, GitHub y npm; la publicación y la
autenticación siguen siendo gates humanos. El presupuesto objetivo es cero/bajo y el mantenedor
inicial es un desarrollador individual.

### Contextos delimitados

Este change no modifica ningún bounded context de producto de
`Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`. Introduce un contexto técnico externo,
**Engineering OS**, owner del runtime, blueprint, schemas, CLI y política de releases. PlanearIA es
consumidor mediante nombre, versión, integridad y contrato CLI fijados.

No existe contrato cruzado entre entidades de producto: no cambia `userId`, datos académicos,
`src/sync`, permisos ni resultados de IA. El único contrato cruzado es técnico y unidireccional:
Engineering OS publica una release inmutable; PlanearIA consume esa release sin duplicar su ownership.
No requiere microservicios, CQRS, event sourcing, colas o providers.

## Goals / Non-Goals

**Goals:**

- Establecer un upstream público neutral y una única fuente canónica.
- Hacer reproducible la instalación por versión exacta mediante npm/npx y GitHub Release.
- Ligar código, tag, tarball, checksum, CI y provenance a una misma release.
- Permitir upgrades previsualizables, migrables, revisables por PR y reversibles.
- Separar tests/CI del upstream de los smokes contractuales del consumidor PlanearIA.
- Ofrecer documentación y gobernanza suficientes para usuarios y contribuidores externos.
- Hacer la transición sin ventana silenciosa de dos fuentes de verdad.

**Non-Goals:**

- Publicar la aplicación o el historial completo de PlanearIA.
- Alojar un servicio, dashboard, telemetría, backend o marketplace.
- Implementar el template repository opcional.
- Activar perfiles de producto o prometer pnpm, Yarn y Bun en v1.
- Automatizar autenticación, compra, aceptación legal o aprobación de la primera publicación.
- Cambiar bounded contexts, UI, datos, backend, auth, sync o IA de PlanearIA.

## Decisions

### D1. Upstream limpio, no fork ni copia con historial completo

`RitualBoat/project-engineering-os` se inicializará con un seed mínimo revisado: README, LICENSE,
SECURITY y CI suficiente para validar el primer PR. El export determinista completo entrará después por
`feat/initial-release`, con referencias a #103, #125, #126 y al SHA de corte. No se transferirá el
historial completo de PlanearIA porque puede contener dominio, paths retirados o material que no fue
revisado para publicación.

Alternativas descartadas:

- Hacer público PlanearIA: expone una aplicación y dominio fuera de alcance.
- `git filter-branch`/historial completo del subdirectorio: aumenta el riesgo de secretos y arrastra
  decisiones históricas no neutrales.
- Mantener dos repositorios editables: crea drift y ownership ambiguo.

Antes de la primera release, PlanearIA es la superficie de staging. En el instante de publicar la
release sana, el upstream se convierte en owner; desde entonces las correcciones nacen allí y
PlanearIA solo actualiza su versión fijada.

### D2. Paquete npm único con dos entradas de binario

El paquete se llamará `create-project-engineering-os` y expondrá el mismo entrypoint como
`create-project-engineering-os` y `project-os`. El primer nombre permite la ruta natural
`npx create-project-engineering-os@<versión>`; el segundo es el comando estable documentado.
El nombre interno `project-constructor` se conservará solo como alias transitorio si una fixture o
consumidor existente lo necesita durante una versión menor.

El manifest quitará `private: true`, declarará `license: "MIT"`, `repository`, `bugs`, `homepage`,
`files`, `engines` y `publishConfig.access: "public"`. `files` será una allowlist; el tarball se
inspeccionará y ningún archivo depende de estar dentro de PlanearIA.

Alternativas descartadas:

- Instalación global: dificulta reproducibilidad y puede usar una versión distinta a la declarada.
- Solo clonar GitHub: no ofrece resolución SemVer ni experiencia `npx`.
- Paquetes separados para CLI y blueprint: coordinación innecesaria para v1.

### D3. Release candidate único y promoción sin reconstrucción

El job de release ejecutará `npm ci`, tests, neutralidad y fixture; después hará `npm pack` una sola
vez. Ese `.tgz` se probará desde un runner temporal, se hasheará con SHA-256 y se adjuntará a GitHub
Release. La publicación npm consumirá el mismo tarball, no una reconstrucción posterior.

GitHub incluye archivos fuente automáticos por tag, pero el artefacto contractual será el tarball npm
adjunto y su checksum. El tag, `package.json`, changelog y nombre del asset deberán compartir versión.
No se reutilizará ni sobrescribirá una versión ya publicada.

### D4. Trusted Publishing después del bootstrap manual

La publicación estable usará npm Trusted Publishing con GitHub Actions hospedado, permisos mínimos
`contents: read` e `id-token: write`, y un environment de release. Según la
[documentación oficial de npm](https://docs.npmjs.com/trusted-publishers/), este flujo usa OIDC,
evita tokens persistentes y genera provenance automáticamente para paquete y repositorio públicos.
`repository.url` coincidirá exactamente con el upstream.

La primera publicación permanece manual porque reserva el nombre y puede ser necesaria antes de
configurar el trusted publisher del paquete. Se usará una credencial interactiva/temporal fuera de
Git, se comprobará `npm whoami` sin revelar tokens y se revocará cualquier token de bootstrap después
de verificar OIDC. El workflow nunca almacenará `NPM_TOKEN` si trusted publishing ya funciona.

Alternativas descartadas:

- Token de larga duración en Actions: mayor superficie de supply-chain.
- Publicación local permanente: menor provenance y proceso no reproducible.
- Self-hosted runner: npm no lo admite actualmente para trusted publishing.

### D5. Reglas y CI antes de aceptar contribuciones

El upstream tendrá `main` protegida mediante ruleset o branch protection: PR obligatorio, checks
registrados, conversaciones resueltas, bloqueo de force-push y borrado. GitHub documenta estas
capacidades para repositorios públicos en
[protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
Los nombres de jobs serán únicos para no producir checks ambiguos.

El commit seed es una excepción de bootstrap inevitable porque la rama debe existir antes de
protegerla. Se limitará a gobernanza y CI mínimas ya revisadas, se registrará su SHA y la protección se
activará inmediatamente. El release candidate completo entrará mediante el primer PR protegido y todo
cambio posterior seguirá esa ruta. `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, plantillas y
`CODEOWNERS` describirán colaboración y reporte privado.

### D6. CI upstream completa; PlanearIA valida solo el contrato consumidor

El upstream será owner de:

- unit tests del CLI, schemas, renderers, transactions y doctor;
- fixtures de bootstrap, segunda ejecución, migración, resume y rollback;
- neutralidad y búsqueda de secretos;
- `npm pack` y smoke del tarball;
- matriz Windows/macOS/Linux con Node 20/22.

PlanearIA reemplazará la ejecución directa del source embebido por una dependencia exacta y smokes de
integración: versión, `--help`, `sync --check`, doctor esperado y fixture mínima. No replicará la suite
completa del upstream.

### D7. Upgrade ejecutado por la versión destino, con branch/PR opcional

La invocación recomendada será:

```text
npx create-project-engineering-os@<version> upgrade --target <repo> --check
npx create-project-engineering-os@<version> upgrade --target <repo> --apply --open-pr
```

El usuario elige explícitamente `<version>`; `latest` solo aparece en onboarding y nunca dentro de una
actualización automática. El CLI compara `state.json`, schema, owners y hashes antes de escribir,
rechaza estados futuros, muestra diff determinista y reutiliza las transacciones existentes.

Con `--open-pr`, exige Git limpio, crea una rama `chore/project-os-v<version>`, aplica, valida, commitea,
publica esa rama y crea/reutiliza PR. No cambia ni mergea la rama protegida. Sin `gh` autenticado,
termina con archivos/commands de recuperación y no afirma haber creado el PR.

Alternativas descartadas:

- `git pull` desde un template: mezcla historias y no conoce ownership por archivo.
- Auto-update flotante: rompe reproducibilidad.
- Push directo: elimina revisión y dificulta rollback.

### D8. Compatibilidad y versionado

- SemVer gobierna CLI y blueprint; el schema tiene versión independiente registrada en `state.json`.
- Node `^20.20.0 || >=22.22.0`, npm/npx y los tres SO son la matriz v1.
- Un cambio de rutas administradas o estado requiere migración explícita y fixture.
- Un major requiere aprobación humana y guía de migración.
- pnpm, Yarn y Bun se registran como `SKIP`/no soportados, no como fallo del core.

### D9. Documentación como interfaz verificable

El README tendrá dos recorridos iniciales: “crear repositorio nuevo” y “adoptar en repositorio
existente”. Quickstart, concepts, command reference, updates, rollback, troubleshooting, security y
contributing quedarán enlazados en menos de tres saltos. Los comandos del README serán extraídos o
ejecutados por tests para evitar ejemplos obsoletos.

Prompt 00 utilizará versión exacta para reproducibilidad; Prompt 01 seguirá inerte hasta cerrar Etapa
A. No se preguntará por producto durante instalación.

### D10. Specs upstream y contrato consumidor tienen ámbitos distintos

El upstream recibirá las specs completas que gobiernan runtime, distribución y upgrades. Las specs
`project-constructor-*` conservadas en PlanearIA serán un contrato de aceptación fijado a la release que
consume, no una autorización para cambiar el paquete localmente. Un cambio de comportamiento nace y se
archiva primero en upstream; PlanearIA actualiza su contrato únicamente al adoptar esa release.

La documentación y una requirement explícita registrarán versión/owner para que una coincidencia de
texto no se interprete como doble fuente canónica. PlanearIA puede exigir un subconjunto o compatibilidad
adicional como consumidor, pero no redefinir el runtime del upstream.

### D11. MIT del constructor no impone licencia al producto generado

Código, templates y archivos administrados copiados desde Engineering OS conservan la licencia MIT y su
aviso. El constructor instalará un notice separado para esas superficies y no reemplazará ni elegirá la
licencia del producto nuevo. Código, dominio y contenido creado por el usuario pertenecen al proyecto
consumidor bajo la licencia que su owner decida.

El manifest de ownership distinguirá archivos `project-os`, overlays y archivos `project`. Upgrade
preservará el notice de las rutas administradas sin insertar encabezados en cada archivo ni modificar el
`LICENSE` principal del consumidor.

## Risks / Trade-offs

- [Nombre ocupado antes de reservarlo] → Revalidar GitHub/npm inmediatamente antes del gate remoto;
  detenerse y decidir fallback sin publicación parcial.
- [Ventana con dos fuentes de verdad] → Congelar el source embebido al SHA de corte y documentar
  explícitamente el momento en que upstream asume ownership.
- [El import limpio pierde historia útil] → Conservar provenance documental a issues/PR/SHA y un
  changelog inicial, sin transferir historia riesgosa.
- [El primer push precede a la protección] → Importar únicamente el tarball/tree validado, registrar
  SHA y activar ruleset antes de aceptar cambios.
- [Publicación npm incorrecta] → `npm publish --dry-run`, smoke del mismo tarball, gate humano,
  deprecación y nueva versión; nunca borrar ni reutilizar versión.
- [Trusted Publishing cambia] → Verificar documentación oficial durante apply y doctor/release; fallo
  seguro si OIDC/provenance no aparecen.
- [PR automático amplía permisos del CLI] → `--open-pr` es opt-in, muestra plan, exige `gh` autenticado
  y no mergea.
- [CI pública consume minutos o runners] → path filters y matriz completa solo en PR/release; costo
  revisado antes de activar servicios no gratuitos.
- [MIT no cubre dependencias] → Inventario SPDX/NOTICE y revisión por release; solo el código propio se
  relicencia mediante la decisión del owner.

## Migration Plan

1. Fijar el SHA de corte de PlanearIA y congelar cambios paralelos del constructor.
2. Convertir `tools/project-constructor` en release candidate autocontenido: nombre, bins, MIT,
   allowlist, docs comunitarias, workflows y tests de neutralidad/supply chain.
3. Ejecutar tests, matriz local aplicable, `npm pack`, inspección, checksum, fixture externa y
   `npm publish --dry-run`.
4. Revalidar nombres, copyright/NOTICE, costos y autenticación; presentar evidencia al gate humano.
5. Crear el upstream con seed mínimo, registrar su SHA y activar reglas/protecciones.
6. Publicar el export completo en `feat/initial-release`, validar CI y mergearlo mediante el primer PR
   protegido; después crear tag/release candidate y adjuntar exactamente el tarball probado y
   `SHA256SUMS`.
7. Con aprobación explícita, hacer la primera publicación npm desde ese tarball; configurar trusted
   publisher y demostrar provenance antes de retirar la credencial temporal.
8. Implementar y probar `upgrade --check/--apply/--open-pr` en upstream mediante PR protegido.
9. Actualizar PlanearIA para consumir la versión exacta, ejecutar smokes y retirar la copia canónica
   solo después de que upstream y npm estén sanos.
10. Actualizar plan, specs, evidencia y tracking; revisar ambos PRs antes del archive final.

### Rollback por fase

- Antes de crear upstream: revertir el PR/commits de la rama de PlanearIA.
- Upstream creado sin release: cerrarlo o archivarlo solo si sigue vacío de contribuciones externas y
  el owner lo aprueba; conservar evidencia del intento.
- GitHub Release sin npm: marcar prerelease/deprecated, no mover el tag validado silenciosamente.
- npm publicado: deprecar la versión defectuosa y publicar un patch; no unpublish salvo política
  excepcional del registry y decisión explícita.
- PlanearIA migrado: revertir su PR a la última versión sana fijada. Nunca usar `git reset --hard`.

## Open Questions

- Confirmar el texto de copyright del `LICENSE`/`NOTICE` antes del gate público; propuesta:
  `Copyright (c) 2026 RitualBoat contributors`.
- Verificar durante apply si la cuenta npm permite configurar Trusted Publishing inmediatamente tras
  la primera publicación y documentar el recovery si requiere 2FA o pasos adicionales.
- Decidir después de v1 si patch/minor puede publicarse automáticamente; v1 mantiene aprobación del
  environment para toda publicación, una política más estricta que el mínimo solicitado.

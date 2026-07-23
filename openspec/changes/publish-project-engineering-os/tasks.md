## 1. Baseline, corte y allowlist

- [x] 1.1 Registrar SHA de corte, inventario de rutas publicables, owners y hashes de
  `tools/project-constructor`, `tools/debt-control` y configuración neutral reutilizable.
- [x] 1.2 Crear allowlist y test negativo de neutralidad/secretos que rechace dominio, rutas, IDs y reglas
  específicas de PlanearIA sin bloquear términos neutrales legítimos.
- [x] 1.3 Registrar ADR de upstream limpio, paquete único, stores separados, release candidate único,
  trusted publishing y transición de ownership.
- [x] 1.4 Revalidar documentación oficial, disponibilidad GitHub/npm, costos, MIT/notices y requisitos
  Node/npm de publicación; no reservar ni publicar todavía.
- [x] 1.5 Congelar cambios paralelos de ambos runtimes durante el corte y documentar recovery si aparece
  una corrección crítica antes del cutover.

## 2. Paquete público autocontenido

- [x] 2.1 Crear layout público autocontenido y mover lógicamente constructor/debt-control bajo un único
  package sin depender de la raíz o paths de PlanearIA.
- [x] 2.2 Renombrar el package a `create-project-engineering-os`, declarar MIT, repository metadata,
  allowlist `files`, engines y `publishConfig`, y regenerar lockfile exacto.
- [x] 2.3 Exponer `create-project-engineering-os` y `project-os` sobre el mismo entrypoint; conservar
  `project-constructor` solo si una fixture demuestra necesidad transitoria.
- [x] 2.4 Integrar `project-os debt capture|check|sync|handoff|postfinish` y gates sin duplicar lógica,
  categorías o fuentes de configuración.
- [x] 2.5 Añadir LICENSE, notice de archivos administrados, inventario SPDX/terceros, changelog y política
  SemVer/migraciones.
- [x] 2.6 Demostrar que bootstrap/upgrade conservan el `LICENSE` del consumidor y que el tarball no incluye
  archivos incidentales.
- [x] 2.7 Añadir checks negativos de bin ausente, path a PlanearIA, runtime duplicado, tarball alterado,
  licencia incompatible y secreto simulado.

## 3. Stores, deuda y doctor

- [x] 3.1 Versionar schemas de state/config/registry/assessment y definir migraciones explícitas desde los
  formatos embebidos actuales.
- [x] 3.2 Sembrar política/registro vacíos e idempotentes en greenfield; probar GitHub `auto|required|advisory|off`
  y cero issue sin trigger.
- [x] 3.3 Portar la suite completa de assessments inmutables, categorías, fingerprints, presupuesto,
  recurrencia, excepciones, pausas y `remediation-new-debt`.
- [x] 3.4 Portar sincronización GitHub idempotente, bloque administrado, contenido hostil inerte,
  persistencia opcional de refs y fallos diferenciados por modo.
- [x] 3.5 Portar handoff reproducible, recomendación de mismo/nuevo chat y redacción de secretos.
- [x] 3.6 Extender doctor humano/JSON para identidad de release, source duplicado y salud read-only de deuda
  sin capture, sync, auth, reparación o renovación automática.
- [x] 3.7 Probar corrupción, assessment no reflejado, excepción vencida, plan pausado y GitHub off con
  causa/recuperación exactas.

## 4. Upgrade y recuperación de consumidores

- [x] 4.1 Registrar paquete, versión, schema e identidad en state sin romper fixtures legacy.
- [x] 4.2 Implementar `upgrade --check` determinista y read-only con versión destino, migraciones,
  validaciones y rollback.
- [x] 4.3 Implementar `upgrade --apply` sobre owners/hashes/transacciones con resume, rollback, rechazo de
  schemas futuros y preservación de assessments.
- [x] 4.4 Implementar `--open-pr` opt-in con preflight Git/gh, rama versionada, commit acotado y PR
  create/reuse; nunca push directo, aprobación o merge.
- [x] 4.5 Probar check repetido, colisión humana, fallo parcial, schema futuro, GitHub no autenticado, PR
  existente y rollback a release sana.
- [x] 4.6 Probar que rollback de constructor no elimina policy/registry/assessments fuera de la operación.

## 5. Documentación y gobernanza open source

- [x] 5.1 Escribir README amigable con quickstarts greenfield/brownfield, conceptos, comandos, deuda,
  discovery, actualización, rollback y troubleshooting.
- [x] 5.2 Añadir CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, CODEOWNERS y templates neutrales de
  issue/PR/security.
- [x] 5.3 Actualizar Prompt 00, Prompt 01 y guía manual para npm/npx fijado, Debt Control Loop y handoff
  posterior a Etapa A.
- [x] 5.4 Añadir prueba de encontrabilidad en menos de tres saltos y smoke de comandos extraídos del README.
- [x] 5.5 Definir Project OS, labels, estados, branch/ruleset, release environment y gates manuales de
  forma declarativa/previsualizable.
- [x] 5.6 Documentar ownership de specs upstream frente a contratos consumidores y cómo proponer cambios
  desde PlanearIA u otro proyecto.
- [x] 5.7 Documentar costos/free tiers, licencias, vendor lock-in, actualización deliberada, incidentes y
  rollback sin servicios pagados obligatorios.

## 6. CI, release y supply chain

- [x] 6.1 Crear CI upstream Windows/macOS/Linux con Node 20/22, nombres de job únicos y agregador que falle
  ante checks ausentes, skipped inesperados, cancelados o timeout.
- [x] 6.2 Separar workflows de PR y release, usar permisos mínimos, evitar `pull_request_target` privilegiado
  y fijar cada action de terceros a SHA completo comentado.
- [x] 6.3 Crear scripts que validen SemVer/tag/changelog, ejecuten `npm pack` una vez, prueben el `.tgz` y
  produzcan `SHA256SUMS`.
- [x] 6.4 Crear GitHub Release que adjunte exactamente el tarball probado y checksum del mismo commit/tag.
- [x] 6.5 Crear job npm Trusted Publishing con environment, runner hospedado, Node >=22.14, npm >=11.5.1,
  `contents: read` e `id-token: write`, sin fallback a token persistente.
- [x] 6.6 Añadir preflight/fallos por repository/workflow OIDC divergente, runtime de publicación
  incompatible, provenance ausente, versión existente y checksum distinto.
- [x] 6.7 Ejecutar `npm pack --dry-run`, inspección del tarball, smoke externo, `npm publish --dry-run` y
  verificación de licencias antes del gate remoto.

## 7. Gate remoto e import inicial

- [ ] 7.1 Revalidar nombres, copyright/notices, sesiones GitHub/npm, scopes, costo y aprobación previa sin
  imprimir credenciales.
- [x] 7.2 Generar seed mínimo y export allowlisted desde el SHA de corte; demostrar que el export coincide
  con el release candidate.
- [x] 7.3 Crear `RitualBoat/project-engineering-os` público con seed, registrar SHA y activar/verificar
  protección de rama/tags y environment antes del import.
- [x] 7.4 Subir export por `feat/initial-release`, crear/reutilizar PR, esperar CI y corregir Blockers/Majors
  antes de mergear.
- [ ] 7.5 Crear tag y GitHub Release con tarball/checksum ligados al merge protegido.
- [ ] 7.6 Realizar primera publicación npm aprobada, configurar trusted publisher y verificar provenance;
  revocar cualquier credencial temporal.
- [ ] 7.7 Ejecutar instalación `npx` desde el registry en fixture externa limpia y comparar identidad con
  GitHub Release.

## 8. Migración reversible de PlanearIA

- [ ] 8.1 Añadir `create-project-engineering-os` como dependencia exacta y adaptar scripts raíz a
  `project-os`, incluidos comandos debt.
- [ ] 8.2 Sustituir suites duplicadas por smokes contractuales de versión, bins/help, sync/check, doctor,
  debt check y fixture mínima.
- [ ] 8.3 Ensayar rollback de PlanearIA a la última release sana mediante PR normal.
- [ ] 8.4 Retirar `tools/project-constructor` y `tools/debt-control` solo después de upstream/npm/provenance
  sanos; comprobar que no queda segunda fuente editable.
- [ ] 8.5 Actualizar plan maestro, roadmap, índices, prompts, compatibilidad, costos/licencias, runbooks,
  incidentes y estrategia de actualización.
- [ ] 8.6 Documentar que las specs locales son contrato consumidor fijado y que upstream gobierna la
  evolución del paquete.

## 9. Evidencia, deuda y cierre

- [ ] 9.1 Ejecutar suites upstream y PlanearIA aplicables: constructor, debt-control, documentación,
  OpenSpec, harness/OPSX, typecheck, lint, Jest y backend sin warnings/logs inesperados.
- [ ] 9.2 Ejecutar fixtures greenfield/brownfield desde tarball y npm: segundo run cero drift, triggers de
  deuda, upgrade, PR, resume y rollback en la matriz soportada.
- [ ] 9.3 Ejecutar revisión de secretos, dependencias, licencias, acciones fijadas y permisos de workflows.
- [ ] 9.4 Ejecutar revisión adversarial independiente desde contexto limpio y corregir todos los Blockers,
  Majors y deuda nueva verificable.
- [ ] 9.5 Capturar assessment `kind: feature` del flow; clasificar todos los candidatos y demostrar
  `debt:check` sin triggers nuevos del plan constructor.
- [ ] 9.6 Completar `readiness.json` con URLs/hashes/checks/provenance reales y pasar pre-archive
  `--run-local`.
- [ ] 9.7 Archivar/sincronizar mediante `opsx:archive`, publicar PR de PlanearIA, esperar checks registrados
  y cerrar mediante `opsx:finish`.
- [ ] 9.8 Actualizar #126 y ambos Projects/repositorios a Done solo cuando package, release, rollback,
  documentación y ownership coincidan.

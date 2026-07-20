## 1. Baseline y corte de ownership

- [ ] 1.1 Registrar SHA de corte, inventario de rutas publicables y owners actuales del constructor.
- [ ] 1.2 Crear test de allowlist/neutralidad que detecte dominio PlanearIA, secretos y paths no publicables.
- [ ] 1.3 Confirmar con documentación oficial vigente npm/GitHub, costos, disponibilidad de nombres,
  licencia MIT, copyright/NOTICE y recovery antes de mutaciones remotas.
- [ ] 1.4 Añadir ADR de upstream limpio, paquete, release candidate único, trusted publishing y transición
  de ownership.

## 2. Paquete público autocontenido

- [ ] 2.1 Renombrar el paquete a `create-project-engineering-os`, declarar MIT, repository metadata,
  `files`, engines y `publishConfig`, y regenerar el lockfile exacto.
- [ ] 2.2 Exponer los bins `create-project-engineering-os` y `project-os`, conservando solo la
  compatibilidad transitoria justificada.
- [ ] 2.3 Eliminar dependencias del path/raíz de PlanearIA y probar ejecución desde un tarball externo.
- [ ] 2.4 Crear LICENSE, NOTICE/inventario de terceros, changelog y política SemVer/migraciones.
- [ ] 2.5 Separar el notice MIT de archivos administrados y demostrar que bootstrap/upgrade no eligen ni
  sobrescriben la licencia del producto consumidor.
- [ ] 2.6 Cubrir manifest, bins, allowlist y ausencia de archivos incidentales con tests negativos.

## 3. Upgrade seguro de consumidores

- [ ] 3.1 Extender `state.json` para registrar paquete, versión, schema e identidad verificable sin romper
  fixtures legacy.
- [ ] 3.2 Implementar `upgrade --check` read-only con versión destino explícita, diff determinista,
  migraciones, validaciones y rollback.
- [ ] 3.3 Implementar `upgrade --apply` sobre las transacciones/owners existentes con resume, rollback y
  rechazo de schemas futuros.
- [ ] 3.4 Implementar `--open-pr` opt-in: preflight Git/gh, rama versionada, commit acotado y PR
  create/reuse sin merge ni push directo.
- [ ] 3.5 Probar check repetido, colisión humana, fallo parcial, GitHub no autenticado, PR existente y
  rollback a versión sana.

## 4. Documentación y gobernanza open source

- [ ] 4.1 Escribir README amigable con quickstarts greenfield/brownfield, conceptos, comandos,
  actualización, rollback y troubleshooting.
- [ ] 4.2 Añadir CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, SUPPORT, CODEOWNERS y templates neutrales de
  issue/PR/security.
- [ ] 4.3 Actualizar Prompt 00/01 y runbooks para npm/npx por versión exacta y handoff después de Etapa A.
- [ ] 4.4 Añadir prueba de encontrabilidad en menos de tres saltos y smoke de comandos del README.
- [ ] 4.5 Definir Project OS, labels, estados, branch/ruleset y gates manuales del upstream de forma
  declarativa y previsualizable.

## 5. CI, release y supply chain

- [ ] 5.1 Crear CI del upstream para Node 20/22 en Windows/macOS/Linux con jobs únicos y falsos verdes
  tratados como FAIL.
- [ ] 5.2 Crear scripts de release que validen SemVer/tag/changelog, empaquen una vez, ejecuten smoke del
  `.tgz` y produzcan `SHA256SUMS`.
- [ ] 5.3 Crear workflow de GitHub Release que adjunte el mismo tarball probado y su checksum.
- [ ] 5.4 Crear workflow de publicación con environment, permisos mínimos y trusted publishing OIDC, sin
  fallback silencioso a token persistente.
- [ ] 5.5 Probar `npm pack --dry-run`, inspección del tarball, `npm publish --dry-run`, provenance
  preflight y fallos por versión/checksum divergentes.

## 6. Gate remoto e import inicial

- [ ] 6.1 Revalidar nombres, copyright/NOTICE, cuenta npm/GitHub, scopes, costo y aprobación explícita de
  creación pública/primera publicación sin mostrar secretos.
- [ ] 6.2 Generar el seed mínimo y el tree de import limpio desde el SHA de corte; demostrar que este
  último coincide con el release candidate validado.
- [ ] 6.3 Crear `RitualBoat/project-engineering-os` con el seed, registrar su SHA y activar/verificar
  protección de rama/tags antes de importar el runtime.
- [ ] 6.4 Subir el export completo por `feat/initial-release`, ejecutar CI, corregir Blockers/Majors y
  mergear el primer PR protegido.
- [ ] 6.5 Crear tag/GitHub Release con tarball y checksum ligados al mismo commit.
- [ ] 6.6 Con aprobación humana, realizar la primera publicación npm, configurar trusted publisher,
  verificar provenance y revocar credenciales temporales.

## 7. Migración de PlanearIA a consumidor

- [ ] 7.1 Añadir `create-project-engineering-os` como dependencia exacta y adaptar scripts raíz al binario
  público.
- [ ] 7.2 Sustituir la suite duplicada por smokes contractuales de versión, help, sync/check, doctor y
  fixture mínima.
- [ ] 7.3 Retirar la copia canónica embebida solo después de upstream/npm sanos y comprobar que no queda
  una segunda fuente editable.
- [ ] 7.4 Probar rollback de PlanearIA a la última versión sana mediante PR normal.
- [ ] 7.5 Actualizar plan maestro, roadmap, índices, costos/licencias, compatibilidad, runbooks y
  referencias del constructor.
- [ ] 7.6 Documentar que las specs locales son contrato consumidor fijado y que las specs completas del
  upstream gobiernan la evolución del paquete.

## 8. Evidencia, revisión y cierre

- [ ] 8.1 Ejecutar tests del constructor, documentación, OpenSpec, harness/OPSX, typecheck, lint y tests
  raíz aplicables sin warnings inesperados nuevos.
- [ ] 8.2 Ejecutar fixture desde repositorio vacío con tarball/release publicada, segundo run cero drift,
  upgrade, PR simulado/real controlado y rollback.
- [ ] 8.3 Ejecutar revisión adversarial independiente desde contexto limpio y corregir todos los Blockers
  y Majors.
- [ ] 8.4 Completar `readiness.json` con URLs/artefactos reales, actualizar issue y Projects en ambos
  repositorios y pasar pre-archive con `--run-local`.
- [ ] 8.5 Archivar/sincronizar mediante `opsx:archive`, publicar PR de PlanearIA, esperar checks registrados
  y cerrar con `opsx:finish` tras aprobación.

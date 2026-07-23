# Release `v0.1.4`, cierre de deuda preexistente y gate npm

## Corrección upstream

La ejecución real del Debt Control Loop en PlanearIA descubrió una contradicción que no se ocultó:
un feature que capturaba deuda UX/UI preexistente podía quedar impedido de archivar al activar la pausa
correcta del plan dueño. Además, si GitHub aún no listaba un issue recién creado, el handoff podía decir
incorrectamente que faltaba sincronizarlo.

- Issue upstream: https://github.com/RitualBoat/project-engineering-os/issues/8.
- PR upstream: https://github.com/RitualBoat/project-engineering-os/pull/9.
- Merge protegido: `4560656599e9a0fa9f128f4da9c8a770311fdab4`.
- CI requerida: matriz Ubuntu/macOS/Windows con Node 20.20/22.22 y agregador `CI / required`, todos PASS.
- Cambio: un `feature` puede cerrar tras registrar deuda menor preexistente; una `remediation` que genera
  deuda nueva sigue fallando por `NO GENERAR MAS DEUDA TECNICA`.
- Cambio: `debt sync` extrae el número de issue de la URL de `gh issue create` y persiste el backref sin
  depender de la consistencia eventual del listado.
- Verificación upstream: `npm run check` PASS, 124/124 tests; `npm run pack:verify` PASS.

## Identidad de release

- Tag protegido: `v0.1.4` sobre el merge anterior.
- Workflow: https://github.com/RitualBoat/project-engineering-os/actions/runs/30043434297, PASS.
- GitHub Release: https://github.com/RitualBoat/project-engineering-os/releases/tag/v0.1.4.
- Asset: `create-project-engineering-os-0.1.4.tgz`, 152420 bytes.
- SHA-256 GitHub Release: `9f5096abf42ab178d1231e20fd3c84652ccdf864874495f97d4ea4cfa9e92e4a`.
- npm integrity: `sha512-IPV4J9WJSeDdllXhWDmiPtyFQ8JU6FbR1/cyYPID9gaDLDRDEYJRBfb1/chBxk5fTAxaxrPhkCEspFtTl5ADww==`.
- npm shasum: `f82135087726b3f39632fa517051ff0180c79a53`.
- npm provenance: SLSA `https://slsa.dev/provenance/v1`, publicada solo mediante Trusted Publishing OIDC.

## Gates manuales y deuda

- La reserva `create-project-engineering-os@0.0.0` está deprecada con el mensaje
  `Bootstrap reservation only; use 0.1.3 or later.`
- `npm whoami` devuelve `ENEEDAUTH`: la sesión local temporal quedó revocada.
- La captura del feature creó `debt-d6e2309f9e15`, `debt-9be074c6e888` y `debt-ff7731773cc5`.
- `debt sync` creó el issue de saneamiento UX/UI
  https://github.com/RitualBoat/PlanearIA/issues/141 y la segunda sincronización dejó los backrefs y
  el handoff en `#141`.
- El plan constructor permanece activo; UX/UI queda pausado 5/5 hasta ejecutar su saneamiento.

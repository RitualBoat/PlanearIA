## La propuesta publica el sistema de ingeniería, no PlanearIA

PlanearIA ya probó un constructor neutral y un motor de control de deuda, pero ambos siguen embebidos y
privados. El change crea `RitualBoat/project-engineering-os`, publica
`create-project-engineering-os` bajo MIT y convierte PlanearIA en consumidor de una release exacta.
Constructor y Debt Control Loop viajan en un solo paquete. Quedan fuera la aplicación docente, sus datos,
React/Expo, perfiles de producto y cualquier servicio hospedado.

## El diseño conserva un owner y estados separados

El upstream limpio nace desde una allowlist, no desde el historial completo. Una release única expone
`project-os`, mientras state del constructor y assessments/registro de deuda conservan stores y schemas
separados. Un tarball probado alimenta GitHub Release y npm. Trusted Publishing usa OIDC, permisos mínimos,
acciones fijadas por SHA y un runtime de publicación compatible. Upgrade muestra diff, usa transacciones
y puede abrir PR sin mergear ni tocar una rama protegida.

## Las specs convierten seguridad y gobernanza en comportamiento observable

Los contratos exigen neutralidad, licencia, bins, identidad de release, checksum, provenance, CI
multiplataforma, documentación probada y ownership upstream/consumer. El motor de deuda conserva siete
categorías, assessments inmutables, presupuesto, excepciones, gates y GitHub configurable sin crear issues
sin trigger. Doctor y `--check` son read-only. PlanearIA no elimina sus runtimes embebidos hasta demostrar
upstream, npm y rollback sanos.

## Las tareas llegaron a una release pública y un cutover reversible

El upstream público nació por allowlist y sus tres PR protegidos quedaron fusionados. `v0.1.1` publicó el
mismo tarball en GitHub y npm mediante Trusted Publishing, checksum común y provenance SLSA. Una fixture
externa verificó instalación desde registry, OpenSpec/OPSX, doctor, deuda e idempotencia. PlanearIA fijó
`0.1.1`, reemplazó suites duplicadas por smokes consumidores y retiró las copias editables sin mover su
estado ni su harness. `0.1.0` queda como prerelease no consumible y la reserva `0.0.0` se depreca
explícitamente al cerrar el gate manual.

## Resumen integral del change

`publish-project-engineering-os` convierte tooling interno maduro en un producto MIT utilizable por solo
developers sin propagar PlanearIA. Una única release gobierna constructor y deuda; state y assessments
permanecen en cada consumidor. CI multiplataforma, checksums, provenance, fixtures e idempotencia impiden
falsos verdes. PlanearIA ya consume la versión exacta y revierte por PR. El cierre restante ejecuta QA
completa, ensayo de rollback, revisión adversarial, assessment, archive y merge del PR consumidor.

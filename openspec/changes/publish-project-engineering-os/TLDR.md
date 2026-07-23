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

## Las tareas avanzan de un release candidate al cutover reversible

El corte, allowlist, package, deuda, stores, doctor, upgrade, docs, CI y supply chain ya están implementados
y el tarball local pasa 119 tests, fixture externa, neutralidad, licencias y dry-run de publicación. El
siguiente gate crea el repo protegido e importa el export por PR. Tras probar tag, checksum, npm y
provenance, PlanearIA adopta la versión exacta, ejecuta smokes, ensaya rollback y solo entonces retira las
copias editables. El cierre captura deuda y exige revisión adversarial.

## Resumen integral del change

`publish-project-engineering-os` convierte tooling interno maduro en un producto open source utilizable por
solo developers sin propagar PlanearIA. La arquitectura reduce drift mediante una única release, conserva
evidencia histórica y falla de forma explícita ante CI, OIDC, ownership o migraciones inciertos. La
publicación remota no ocurre durante propose: depende de gates humanos y evidencia del mismo tarball. Al
terminar, cualquier persona podrá bootstrapear y actualizar un proyecto con npm/npx, y PlanearIA será un
consumidor normal con rollback por PR.

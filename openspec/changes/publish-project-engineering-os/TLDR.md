## La propuesta convierte el constructor probado en un upstream público

PlanearIA ya demostró un constructor neutral, pero hoy solo existe como paquete privado y tarball local.
El change crea `project-engineering-os` bajo MIT, publica `create-project-engineering-os` para npm/npx y
convierte PlanearIA en consumidor. Incluye releases verificables, documentación comunitaria y upgrades
mediante rama/PR. Excluye la aplicación docente, servicios hospedados, perfiles de producto y soporte v1
para package managers distintos de npm.

## El diseño separa staging, upstream y consumidores sin dos owners

Un seed mínimo permite proteger `main`; el export completo entra por el primer PR. Un único tarball
probado alimenta GitHub Release y npm, con checksum y provenance. Trusted Publishing usa OIDC después de
un bootstrap manual. Upstream posee runtime/specs/releases; PlanearIA conserva un contrato consumidor
fijado. MIT cubre archivos derivados del constructor sin elegir la licencia del producto. Upgrade corre
con versión explícita, usa transacciones y puede abrir PR sin mergear.

## Las specs exigen distribución y actualización observables

Los contratos cubren neutralidad, MIT, bins npm/npx, identidad de artifacts, provenance, CI
multiplataforma, documentación probada, seguridad comunitaria y ramas protegidas. Los consumidores fijan
release/schema, obtienen diff read-only y aplican migraciones con resume/rollback. La automatización Git
crea o reutiliza ramas y PRs, nunca empuja o mergea una protegida. Los gates humanos detienen creación
pública, autenticación, primera publicación y majors cuando falta aprobación o evidencia.

## Las tareas avanzan de release candidate a migración reversible

Primero se fija el corte y se neutraliza el paquete; después se implementan bins, metadata y upgrade.
Luego se crean README, políticas, CI y supply chain. Un gate revisa nombres, licencia y credenciales antes
del import público y npm. Al comprobar upstream, release, checksum y provenance, PlanearIA adopta la
versión exacta y elimina su duplicado. El cierre exige fixtures, tests, revisión adversarial, evidence real
y PRs verdes.

## Resumen integral del change

`publish-project-engineering-os` convierte una herramienta interna madura en un producto open source
reutilizable sin publicar PlanearIA ni sacrificar reproducibilidad. La arquitectura mantiene una sola
fuente canónica, artifacts inmutables y permisos mínimos. Los usuarios pueden crear un repositorio con
`npx`, actualizarlo mediante cambios revisables y volver a una versión sana. La publicación remota no
ocurre durante propose: permanece detrás de revisión de design/spec, gates legales/autenticados y
evidencia del release candidate.

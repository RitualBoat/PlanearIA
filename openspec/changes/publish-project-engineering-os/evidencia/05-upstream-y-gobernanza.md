# Upstream público y gobernanza

Fecha de verificación: 2026-07-23.

## Repositorio

- URL: `https://github.com/RitualBoat/project-engineering-os`.
- Visibilidad: pública.
- Rama por defecto: `main`.
- Seed: `ffa59e8`.
- Export inicial: `750d81417111c60b0123f73758bf24d0f020e07c`.
- Hash del árbol fuente exportado:
  `d1fbc4eeec90c680ed1d441a7e9857df976ea80710e76e54210e8e9ff1512df8`.
- PR de importación: `https://github.com/RitualBoat/project-engineering-os/pull/1`.

## Protección verificada por API

- `main` exige PR, conversaciones resueltas y el check estricto `CI / required`.
- Administradores incluidos en la protección.
- Force-push y eliminación de `main` deshabilitados.
- Cero aprobaciones obligatorias: decisión explícita para evitar deadlock del único mantenedor. La
  aprobación humana del alcance queda en PlanearIA #126 y las contribuciones externas requieren revisión
  del mantenedor.
- Ruleset activo `protected-release-tags` (`id: 19627973`) para `refs/tags/v*`.
- Environment `npm-publish` (`id: 18639301681`) con revisión requerida del mantenedor y
  `prevent_self_review: false`.
- Dependabot security updates, secret scanning y push protection activos.

## Sesiones y gate pendiente

- GitHub CLI: autenticada como `RitualBoat`, con capacidad de repositorio, workflow y Project.
- npm CLI: `ENEEDAUTH`; no existe sesión publicadora local.
- No se imprimieron credenciales ni valores de secretos.
- La primera publicación no se ejecutará hasta resolver el gate de identidad npm y comprobar el contrato
  de trusted publishing/provenance. La ausencia de sesión se registra como bloqueo manual, no como PASS.

## CI del import

Al registrar esta evidencia aprobaron Ubuntu Node 20/22, Windows Node 20 y macOS Node 20. Windows Node 22
y macOS Node 22 permanecían en ejecución. El agregador requerido aún no había concluido; el PR no se
considera listo para merge hasta que aparezca `CI / required` en verde.

## Recuperación

Antes del tag no hay consumidores públicos. Si el PR falla, se corrige en la fuente canónica de PlanearIA,
se regenera el export y se actualiza el PR. No se fuerza `main`, no se publica una release parcial y no se
crea una segunda fuente editable.

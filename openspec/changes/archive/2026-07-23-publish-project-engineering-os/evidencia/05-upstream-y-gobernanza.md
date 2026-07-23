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

La documentación oficial vigente confirma que `npm trust` exige 2FA y que el paquete ya exista en el
registry. Por ello el bootstrap previsto es:

1. autenticación interactiva local fuera de Git y logs;
2. publicación única `0.0.0` como reserva no consumible;
3. configuración del trusted publisher para `RitualBoat/project-engineering-os`,
   `release.yml` y environment `npm-publish`;
4. publicación estable `0.1.0` exclusivamente con OIDC desde GitHub Actions;
5. deprecación explícita de `0.0.0` y revocación/cierre de la sesión temporal.

Fuentes oficiales:

- `https://docs.npmjs.com/cli/v11/commands/npm-trust/`
- `https://docs.npmjs.com/trusted-publishers/`
- `https://docs.npmjs.com/generating-provenance-statements/`

El gate se resolvió con la cuenta `ritualboat`, 2FA `auth-and-writes` mediante WebAuthn y sin copiar
contraseñas, códigos, tokens o URLs de autenticación a Git. La reserva `0.0.0` publicó únicamente LICENSE,
README y metadata:

- shasum: `f847de4b93bf623c14484ef1b3fb5fca79e9ad16`;
- integridad y metadata verificadas desde el registry;
- Trusted Publisher: GitHub Actions, `RitualBoat/project-engineering-os`, `release.yml`,
  environment `npm-publish`, permiso `publish`;
- relación npm: `0b6b6c8e-49cd-49e4-8d42-bb03415bb4c3`.

El tag protegido `v0.1.0` apunta a `5532f76425e03b4217306d62c2ac140a8fbc67d2`. El workflow de release
inició en `https://github.com/RitualBoat/project-engineering-os/actions/runs/30036132915`.

## CI del import

Al registrar esta evidencia aprobaron Ubuntu Node 20/22, Windows Node 20 y macOS Node 20. Windows Node 22
y macOS Node 22 permanecían en ejecución. El agregador requerido aún no había concluido; el PR no se
considera listo para merge hasta que aparezca `CI / required` en verde.

La matriz terminó después con las seis combinaciones y `CI / required` en `PASS`. El PR #1 se fusionó
mediante la rama protegida en `0fc29c51ef11e7a7a3eb285f66828607b0d21640`.

El primer checkout posterior al merge descubrió un falso drift de finales de línea en Windows. Se
clasificó como Major pre-release, se corrigió en fuente y spec con identidad canónica LF,
`.gitattributes` y fixture CRLF, y se abrió el PR protegido #2:
`https://github.com/RitualBoat/project-engineering-os/pull/2`. No se creará tag hasta que su matriz y
agregador estén verdes.

El PR #2 terminó con seis checks de matriz y `CI / required` en `PASS`, y se fusionó por la rama
protegida en `5532f76425e03b4217306d62c2ac140a8fbc67d2`. Un checkout fresco posterior produjo:

```json
{"result":"PASS","mode":"check","treeHash":"621c4cad9aed3189bdfc580afd23c713aa33ecc83530ca04e4554e6072f27133","hashPolicy":"text-lf-v1"}
```

## Recuperación

Antes del tag no hay consumidores públicos. Si el PR falla, se corrige en la fuente canónica de PlanearIA,
se regenera el export y se actualiza el PR. No se fuerza `main`, no se publica una release parcial y no se
crea una segunda fuente editable.

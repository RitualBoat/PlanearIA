# Investigación vigente y gates remotos

Fecha de revalidación: 2026-07-23.

## Nombres y sesiones

| Check | Resultado | Consecuencia |
| --- | --- | --- |
| `RitualBoat/project-engineering-os` | No existe; nombre disponible | Puede crearse después del release candidate |
| `create-project-engineering-os` en npm | `E404`; nombre disponible | No está reservado; revalidar inmediatamente antes de publicar |
| GitHub CLI | Sesión válida con scopes de repo/workflow/project | Permite crear upstream y configurar gobernanza aprobada |
| npm CLI | `ENEEDAUTH` | Primera publicación queda bloqueada hasta intervención humana |

No se imprimieron tokens ni se creó estado remoto durante estas comprobaciones.

## Licencias y costo

- Código nuevo: MIT, copyright `2026 RitualBoat contributors`.
- `ajv@8.20.0`: MIT, desarrollo/tests.
- `@fission-ai/openspec@1.6.0`: MIT, dependencia de desarrollo del consumidor.
- GitHub público, GitHub Actions y npm público se diseñan para free tiers; no hay SaaS, telemetría,
  backend ni servicio pagado obligatorio.
- La licencia MIT del Engineering OS no selecciona la licencia del producto consumidor.

## Trusted Publishing

La documentación oficial vigente exige un runner hospedado compatible, OIDC `id-token: write`,
repository/workflow registrados exactamente y npm moderno. El release fija Node `>=22.14` y npm
`>=11.5.1` para publicar; la matriz de consumidores sigue Node 20/22.

Fuentes primarias:

- https://docs.npmjs.com/trusted-publishers/
- https://docs.npmjs.com/generating-provenance-statements/
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/actions/tutorials/publish-packages

## Ajuste para mantenedor único

La protección de `main` exige PR, `CI / required`, conversaciones resueltas y bloquea force-push/borrado.
No exige un approval de GitHub que el único mantenedor no puede otorgarse a sí mismo. La aprobación humana
se conserva en #126; contribuciones externas sí requieren revisión del mantenedor. Esta decisión es
reversible cuando exista un segundo revisor activo.

## Gate

El source local puede continuar. La publicación npm no puede ejecutarse hasta que el usuario complete la
autenticación interactiva o la reserva inicial requerida. No se añadirá `NPM_TOKEN` persistente como
fallback.

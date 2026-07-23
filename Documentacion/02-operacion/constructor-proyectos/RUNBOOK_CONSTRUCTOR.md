# Runbook del constructor

> **Alcance:** Etapa A, núcleo universal sin producto.
> **Release fijada:** `create-project-engineering-os@0.1.4`.
> **No hace:** elegir stack, instalar frameworks, crear código de producto ni abrir OAuth.

## 1. Resultado esperado

El repositorio nuevo queda bajo Git y contiene gobernanza, OpenSpec local, harnesses, templates,
Product OS declarativo, doctor, Debt Control Loop y documentación. Los perfiles de UI, backend, auth,
datos/sync, IA, infraestructura y librería permanecen inactivos.

## 2. Prerrequisitos

- repositorio Git nuevo y escribible;
- working tree sin trabajo ajeno;
- Node `^20.20.0 || >=22.22.0` y npm;
- acceso de lectura a npm;
- GitHub CLI solo si después se aplicará Product OS remoto.

No usar `@latest`, instalación global, un fork desconocido ni una URL sin checksum.

## 3. Bootstrap público

Desde la raíz del repositorio destino:

```bash
npx --yes create-project-engineering-os@0.1.4 bootstrap --target .
npm ci
npm run openspec:init
npm run project-os:opsx:adapt
```

El primer comando valida Git, colisiones y runtime antes de escribir; genera un lockfile con OpenSpec
`1.6.0` y el constructor `0.1.4`; crea journals solo al mutar; materializa los cinco harnesses y diez
issues neutrales. `npm ci` instala exactamente el lockfile. La CLI oficial de OpenSpec genera OPSX y
`opsx-adapt` añade únicamente los bloques delimitados del constructor.

Si falta el binario, el nombre no resuelve a `0.1.4`, existe una colisión o el preflight falla, detenerse.
No usar `--force` ni recrear templates desde una conversación.

## 4. Verificación local

```bash
npm run project-os:sync:check
npm run project-os:opsx:check
npm run project-os:doctor
npm run project-os:doctor:json
npm run debt:check
npm run project-os:github-plan
```

Gate:

- sync `IN_SYNC`, cero create/update/delete/conflict;
- OPSX `PASS` y OpenSpec local fijado;
- doctor con `verdict: PASS` y cero `FAIL`;
- `WARN` y `SKIP` conservan causa y recuperación;
- Graphify es `SKIP retirado/manual`;
- perfiles de producto son `SKIP`, no `PASS`;
- debt check pasa sin items creados por bootstrap;
- github-plan muestra operaciones y no muta GitHub.

Doctor no instala, autentica, repara, actualiza ni reindexa. Config MCP, startup, tool listing y smoke
autenticado son evidencias separadas.

## 5. Segundo run e idempotencia

```bash
npx --yes create-project-engineering-os@0.1.4 bootstrap --target .
npm run project-os:sync:check
```

El bootstrap debe devolver `IN_SYNC`, sin transacción nueva. Un diff inesperado es fallo; conservar
estado y journals para diagnóstico.

## 6. GitHub Product OS

`npm run project-os:github-plan` genera un plan. Aplicarlo requiere:

1. autenticar `gh` manualmente;
2. verificar owner, repositorio y scopes sin mostrar token;
3. revisar create/reuse/update/conflict;
4. aprobar labels, campos, Project y protección;
5. ejecutar la operación remota aprobada;
6. guardar URLs/IDs y volver a correr el doctor read-only.

Bootstrap nunca abre OAuth, compra servicios ni cambia branch protection.

## 7. Evidencia mínima

- versión `0.1.4`, integridad npm y SHA-256 de release;
- Node/npm y OpenSpec local;
- primer bootstrap y segundo `IN_SYNC`;
- doctor JSON redactado;
- OPSX y debt check;
- paquete de diez issues neutrales;
- github-plan y aprobación humana;
- perfiles activos/inactivos;
- prueba de rollback pertinente.

La release `v0.1.4` usa el mismo tarball en npm y GitHub Release, SHA-256
`b6520d4d1df55b2e356e149be87497c66ec12560c3d88a631c10934d928f8438`.

## 8. Recuperación e incidentes

| Síntoma | Recuperación |
| --- | --- |
| Colisión antes de escribir | Preservar archivo y resolver ownership; no usar `--force`. |
| Journal incompleto | Elegir resume/rollback con la misma versión; doctor solo reporta. |
| Archivo editado después | Detener rollback de esa ruta y resolver manualmente. |
| OpenSpec ausente | Restaurar manifest/lockfile y `npm ci`; nunca usar global. |
| GitNexus stale | Ejecutar su runbook de reparación fuera del doctor. |
| OAuth requerido | Ejecutar el smoke manual opt-in y guardar recibo redactado. |
| Graphify ausente | Ninguna acción; `SKIP` esperado. |
| Release defectuosa | Deprecarla y publicar patch; no reetiquetar ni sobreescribir. |

Conservar versión, hashes, journals y diff antes de recuperar. Un secreto expuesto se revoca en el
proveedor y se redacta de la evidencia.

## 9. Gate para discovery

Discovery comienza únicamente con bootstrap e idempotencia probados, doctor sin `FAIL`, OpenSpec/OPSX
sanos, Product OS/gates manuales aplicables verificados, perfiles técnicos inactivos y aprobación humana.
Entonces se usa Prompt 01 en una tarea independiente. No preguntar “qué stack quieres” durante Etapa A.

Detalle de upgrades y reversión:
[Actualización y rollback](ACTUALIZACION_Y_ROLLBACK.md).

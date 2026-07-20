# Runbook del constructor

> **Alcance:** Etapa A, núcleo universal sin producto.
> **Estado:** contrato objetivo de Ola 0; no declarar operativo hasta que la fixture esté verde.
> **Entrada humana:** ruta a un tarball local aprobado y su SHA-256.

## 1. Resultado esperado

Al terminar, el repositorio nuevo contiene gobernanza, OpenSpec local, harness, templates, Product OS
declarativo, doctor, CI del constructor y documentación. No contiene código de producto, stack elegido,
framework, base de datos, proveedor cloud, offline, sync, IA ni respuestas de discovery.

## 2. Prerrequisitos

- repositorio Git nuevo y escribible;
- working tree sin trabajo ajeno;
- Node compatible con la versión fijada de OpenSpec;
- npm disponible;
- tarball local del constructor generado y validado por la release;
- hash SHA-256 esperado del tarball;
- GitHub CLI solo si se aplicará Product OS remoto.

No usar `@latest`, instalación global ni una URL de paquete no verificada.

## 3. Preflight humano

1. Confirmar la ruta absoluta del repositorio destino.
2. Ejecutar `git status --short --branch`.
3. Verificar que cualquier archivo existente sea intencional.
4. Comparar el SHA-256 del tarball con la evidencia de release.
5. Confirmar que no se va a preguntar por el producto.
6. Si existe una colisión, detenerse; no usar `--force`.

## 4. Bootstrap

Materializar el tarball verificado en un runner temporal fuera del destino y ejecutar el binario por ruta
explícita:

```bash
npm install --prefix "<RUNNER_TEMP_FUERA_DEL_REPO>" --ignore-scripts --no-audit --no-fund "<TARBALL_LOCAL_APROBADO>"
node "<RUNNER_TEMP_FUERA_DEL_REPO>/node_modules/project-engineering-os-constructor/bin/project-constructor.mjs" bootstrap --target .
```

El comando debe:

- validar Git, escritura, colisiones y versión;
- mostrar el plan de rutas y owners;
- instalar `.project-os/` y `.project-constructor/`;
- declarar OpenSpec local fijado y su lockfile reproducible;
- generar los cinco adaptadores del harness;
- generar templates y manifiesto Product OS sin mutar GitHub;
- dejar perfiles de producto inactivos;
- crear journal solo si efectúa cambios;
- terminar sin preguntas de discovery.

Si el binario no existe, resuelve fuera del runner o la versión/hash no coincide, detenerse. No
precalentar caché, consultar registry ni recrear templates desde el prompt.

Materializar la dependencia de gobernanza exacta:

```bash
npm ci
```

`npm ci` debe resolver únicamente las dependencias fijadas en el lockfile generado. No sustituirlo por una
instalación global o flotante.

## 5. Verificación local

Ejecutar desde la raíz:

```bash
npm run constructor:sync:check
npm run constructor:doctor
npm run constructor:doctor:json
npm run constructor:github-plan
```

Comprobar:

- `sync --check` con exit `0` y sin diff;
- formatos humano/JSON con los mismos IDs y estados;
- `Graphify` como `SKIP retirado/manual`;
- perfiles condicionales como `SKIP`, no `PASS`;
- variables solo por nombre/presencia;
- startup, tool listing y auth MCP separados de la configuración;
- ninguna instalación, OAuth, reparación o reindexado causada por doctor;
- `github-plan` sin mutaciones.

## 6. Segundo run e idempotencia

Capturar `git status` y hashes, ejecutar de nuevo:

```bash
npm run constructor:bootstrap
npm run constructor:sync:check
```

El segundo bootstrap debe informar cero operaciones materiales. Cualquier cambio de archivo, lockfile o
metadata es un fallo de idempotencia salvo migración/version explícitamente distinta.

## 7. GitHub Product OS

`github-plan` produce operaciones propuestas. La aplicación real requiere:

1. autenticar `gh` manualmente;
2. verificar repositorio, owner y scopes sin mostrar token;
3. revisar create/reuse/update/conflict;
4. aprobar labels, campos, estados, Project y estrategia de ramas;
5. aplicar mediante el procedimiento remoto aprobado;
6. volver a ejecutar doctor read-only.

Bootstrap nunca debe abrir OAuth ni activar branch protection.

## 8. Evidencia mínima

Guardar en issue/PR, nunca con secretos:

- versión y SHA-256 del constructor;
- versión Node/npm y OpenSpec local;
- resumen del primer bootstrap;
- diff cero del segundo run;
- salida JSON del doctor redactada;
- `github-plan` y aprobación humana;
- URL del Project y resultado de protección;
- lista de perfiles activos/inactivos;
- rollback/journal probado en fixture.

## 9. Recuperación rápida

| Síntoma | Acción |
| --- | --- |
| Colisión antes de escribir | Preservar archivo, cambiar destino o aprobar adopción versionada. |
| Journal incompleto | Elegir `resume` o `rollback`; doctor solo reporta. |
| Archivo editado después | No sobrescribir; resolver owner manualmente. |
| OpenSpec local ausente | Restaurar manifest/lockfile e instalar fijado; no usar global. |
| GitNexus stale | Ejecutar recuperación documentada fuera del doctor y verificar después. |
| OAuth requerido | Usar el smoke opt-in manual; no repetir doctor como autenticador. |
| Graphify ausente | Ninguna acción; `SKIP` esperado. |

Detalle: [Actualización y rollback](ACTUALIZACION_Y_ROLLBACK.md).

## 10. Gate para discovery

Discovery puede comenzar únicamente cuando:

- bootstrap e idempotencia están probados;
- `sync --check` pasa;
- doctor no contiene `FAIL` no justificado;
- Product OS y gates manuales aplicables están verificados;
- no hay perfiles técnicos activos;
- el usuario aprueba ejecutar Prompt 01 en una ola posterior.

No preguntar “qué stack quieres” durante este runbook.

## 11. Incidentes del constructor

Un incidente es cualquier ejecución que deje ownership ambiguo, archivos parciales, pérdida aparente de
overlay, secretos en salida o mutación externa no aprobada.

1. Detener nuevas ejecuciones y conservar journal, versión y hashes.
2. No borrar temporales ni “limpiar” Git hasta capturar evidencia.
3. Clasificar: seguridad/secreto, integridad de archivos, estado remoto o disponibilidad.
4. Si hubo secreto, revocarlo por el canal del proveedor y redactar la evidencia.
5. Elegir `resume` o `rollback` solo después de identificar la transacción.
6. Verificar `sync --check`, doctor y diff.
7. Registrar causa raíz, alcance, recuperación y acción preventiva en issue.

Un deploy de producto es `N/A` en Etapa A. Cuando se active un perfil de infraestructura deberá añadir su
propio runbook de deploy e incidentes sin reemplazar este procedimiento del constructor.

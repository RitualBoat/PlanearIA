## Context

PlanearIA ya versiona los artefactos OpenSpec y los workflows opsx para seis harnesses, pero no versiona la CLI que los interpreta. El script `agent:opsx:update` invoca `npx --yes openspec@1.5.0`, un nombre de paquete distinto al oficial `@fission-ai/openspec`, mientras que los agentes han estado usando instalaciones globales o `npx ...@latest`. El resultado depende de la maquina y puede cambiar sin un diff intencional.

La version oficial verificada al preparar este change es `@fission-ai/openspec@1.6.0`, con requisito Node `>=20.19.0`. El repositorio y CI ya usan Node 20 y `npm ci`, por lo que la CLI puede formar parte del toolchain local sin introducir un servicio ni un runtime adicional.

## Goals / Non-Goals

**Goals:**

- Hacer que un clon limpio obtenga la misma CLI con `npm ci`.
- Dar a personas y agentes una unica interfaz estable mediante scripts npm.
- Detectar version, instalacion, configuracion o artefactos OpenSpec invalidos con un comando no mutante y mensajes accionables.
- Conservar una ruta explicita y revisable para regenerar workflows opsx.
- Mantener el gate actual de paridad en modo suave; este change mejora su evidencia, no cambia la politica de merge.

**Non-Goals:**

- Cambiar el schema `spec-driven`, el contenido funcional de PlanearIA o la secuencia issue/enrich/propose/apply/QA/archive.
- Ejecutar `update --force` silenciosamente durante cada instalacion o cada validacion.
- Actualizar dependencias no relacionadas o resolver otros hallazgos de herramientas de inteligencia de codigo.

## Decisions

### D1. Dependencia local exacta del paquete oficial

Se agregara `@fission-ai/openspec` a `devDependencies` con version exacta `1.6.0`, sin `^` ni `~`. Los scripts npm invocaran `openspec`, que npm resuelve desde `node_modules/.bin`.

Alternativas descartadas:

- Instalacion global: no queda registrada en `package-lock.json` y difiere entre agentes.
- `npx @fission-ai/openspec@latest`: reproducible solo en el instante de ejecucion, no entre dias.
- Conservar `openspec@1.5.0`: es el nombre de paquete incorrecto y actualmente no resoluble como la CLI oficial.

### D2. Comandos de lectura separados del comando mutante

Se expondran scripts npm para version, listado, validacion estricta y diagnostico. `agent:opsx:update` seguira siendo el unico comando mutante: ejecutara la CLI local con `update --force` y despues el parche idempotente.

No se ejecutara update dentro del smoke check ni de `postinstall`, porque regenerar hasta 30 archivos es una accion que debe producir un diff visible y revisable.

### D3. Smoke check implementado en Node sin dependencias nuevas

`scripts/checkOpenSpecCli.mjs` verificara, en orden:

1. que `package.json` declare una version exacta del paquete oficial;
2. que la version instalada coincida con la declarada;
3. que el Node activo satisfaga el minimo requerido por la CLI;
4. que el binario reporte esa misma version;
5. que `list --json` pueda leer el repositorio;
6. que `validate --all --strict --no-interactive --json` valide changes y specs.

Cada fallo terminara con codigo distinto de cero e indicara el comando de recuperacion apropiado (`npm ci`, correccion de Node o reparacion del artefacto reportado). El script usara `spawnSync` y la ruta local de `.bin` para funcionar igual en Windows y Linux.

Alternativa descartada: encadenar comandos directamente en `package.json`; daria errores crudos, repetiria logica y dificultaria comprobar la coincidencia entre version declarada, instalada y ejecutada.

### D4. CI observa sin endurecer aun el gate

El workflow `agent-harness-parity.yml` ejecutara `npm run openspec:check` despues de `npm ci`, inicialmente con `continue-on-error: true`, coherente con el arranque suave existente. El cierre de #49 exige que el comando pase localmente y en el PR; convertir el gate completo a obligatorio pertenece a la politica de branch protection (#45).

### D5. Regeneracion con limite de blast radius

Despues de instalar la CLI se ejecutara una vez `npm run agent:opsx:update`. Se aceptaran cambios solo en destinos declarados del generador OpenSpec y en el parche relacionado. Cualquier cambio fuera de esos destinos abortara la regeneracion y se revertira en la rama del change. Luego se ejecutaran el patch check, el harness check y la validacion estricta.

Las plantillas 1.6.0 aun emiten el comando continue zombi y, ademas, escriben invocaciones `openspec ...` que presuponen una instalacion global. El parche post-update normalizara ambos defectos: sustituira el estado bloqueado por la pausa con issue de seguimiento, convertira cada invocacion a `npm exec --yes=false -- openspec ...` y alineara el permiso `allowed-tools` cuando exista. `--yes=false` impide que npm descargue o elija otro paquete si falta la dependencia local. El modo `--check` fallara si cualquiera de esas referencias reaparece.

Si una version futura corrige ambos defectos, el parche permanece temporalmente como guardia idempotente y su retiro se hace en un change separado para evitar mezclar upgrade y limpieza.

## Risks / Trade-offs

- [La actualizacion del CLI regenera muchos archivos] -> revisar `git diff --stat` y limitar el diff a los destinos opsx conocidos antes de aceptar la salida.
- [El gate suave no bloquea por si solo un PR] -> exigir evidencia verde en #49 y tratar el endurecimiento como parte de #45.
- [Una version futura exige otro Node] -> el smoke check lee y valida el `engines.node` instalado; la actualizacion debe ser un PR explicito con CI.
- [Validar todos los changes puede fallar por trabajo ajeno incompleto] -> el error es intencional: identifica el artefacto invalido; no se oculta ni se modifica desde el smoke check.
- [El parche zombi puede volverse innecesario] -> al ser idempotente no altera output limpio; se retira solo con evidencia en un change posterior.

## Migration Plan

1. Agregar la dependencia exacta y actualizar `package-lock.json` con npm.
2. Agregar scripts npm y el smoke check; ejecutarlo contra el estado actual.
3. Regenerar workflows con la CLI local, aplicar el parche y revisar el diff permitido.
4. Actualizar CI y la guia operativa.
5. Ejecutar validaciones OpenSpec, harness, lint, typecheck y tests afectados.
6. Publicar PR ligado a #49 y verificar los checks remotos.

Rollback: revertir el commit del change restaura `package.json`, lockfile, scripts y workflows previos. No hay migracion de datos ni estado externo.

## Open Questions

Ninguna para apply. El endurecimiento de branch protection y el eventual retiro del parche quedan deliberadamente fuera de alcance.

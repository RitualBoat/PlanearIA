# Actualización y rollback

## 1. Contrato de versión

El constructor usa SemVer para paquete y schema. El estado instalado registra:

- `constructorVersion`;
- `schemaVersion`;
- SHA-256 del paquete probado;
- owners y hashes por ruta;
- transacción aplicada;
- migraciones completadas.

Un runtime antiguo debe rechazar un schema futuro. Una migración no reconocida falla antes de escribir.

## 2. Preparar una actualización

1. Verificar release, licencia y SHA-256.
2. Leer changelog y migraciones.
3. Confirmar working tree limpio o aislar cambios.
4. Ejecutar el nuevo CLI en modo `sync --check`.
5. Revisar rutas, owners, perfiles, migraciones y rollback.
6. Resolver colisiones antes del apply.
7. Crear commit/punto de recuperación ordinario; no usar `git reset --hard`.

## 3. Aplicar

```bash
npm install --prefix "<RUNNER_TEMP_FUERA_DEL_REPO>" --ignore-scripts --no-audit --no-fund "<NUEVO_TARBALL_LOCAL>"
node "<RUNNER_TEMP_FUERA_DEL_REPO>/node_modules/project-engineering-os-constructor/bin/project-constructor.mjs" sync --target .
npm run constructor:sync:check
npm run constructor:doctor:json
```

La aplicación debe calcular todas las salidas antes de escribir, crear backups de rutas reemplazadas,
registrar archivos nuevos, escribir mediante temporal + rename y actualizar `state.json` al final.

## 4. Fallo parcial

Si queda journal incompleto:

- no ejecutar otro generador ni editar `state.json`;
- revisar operaciones completadas y hashes;
- elegir una sola ruta: reanudar la misma versión o rollback de esa transacción;
- si hubo edición humana posterior, clasificar el conflicto antes de continuar;
- adjuntar evidencia al issue si afecta un change versionado.

Reanudar debe converger byte a byte con una ejecución limpia y no duplicar bloques.

## 5. Rollback

```bash
npm run constructor:rollback -- --transaction "<ID>"
npm run constructor:sync:check
```

Rollback:

- restaura backups registrados;
- elimina archivos nuevos solo si conservan el hash escrito;
- no toca `.git`;
- no borra archivos no owned;
- se detiene por ruta si detecta edición posterior;
- conserva un reporte humano/JSON.

No ejecutar `git reset --hard`, borrado recursivo ni limpieza global como recuperación.

## 6. Rollback de OpenSpec

OpenSpec es owner de OPSX. Para un upgrade:

1. cambiar versión exacta mediante change;
2. actualizar lockfile;
3. ejecutar CLI oficial para regenerar;
4. ejecutar checker OPSX separado;
5. ejecutar harness check;
6. revertir el commit del upgrade si falla.

El renderer general nunca reconstruye OPSX ni ejecuta `/opsx:sync` antes del archive que aplicará las mismas
deltas.

## 7. Rollback de perfiles

Desactivar un perfil requiere:

- decisión registrada;
- lista de archivos/dependencias que el perfil posee;
- evidencia de que otro perfil no los consume;
- reversión de validaciones y secretos requeridos;
- no eliminar datos ni infraestructura sin runbook específico.

Los perfiles inactivos de Ola 0 no necesitan rollback porque no instalan dependencias de producto.

## 8. Validación posterior

- segundo `sync --check` sin drift;
- doctor humano y JSON equivalentes;
- fixture relevante verde;
- ninguna pérdida de overlay humano;
- OPSX bajo su owner;
- perfiles esperados;
- Project/issue actualizado si la actualización fue versionada.

# Recuperación

Cada bootstrap, sync o upgrade crea una transacción antes de escribir. La salida incluye su ID.

## Ejecución interrumpida

Repite exactamente el comando y versión originales. Si blueprint, configuración o contenido planeado no
cambiaron, el journal permite reanudar.

## Cancelar la transacción

```sh
project-os rollback --target . --transaction <id>
```

El rollback verifica hashes antes de restaurar. Si detecta una edición posterior, se detiene sin aplicar
una restauración parcial. Conserva esa edición, revisa el journal y decide manualmente.

## Fallo de `--open-pr`

La rama local, commit o push ya realizados se conservan. La salida indica la rama y el comando de
recuperación. El CLI nunca hace merge. Para cancelar, vuelve a la rama base solo después de preservar o
revertir el cambio mediante un PR normal.

Nunca borres el registro de deuda para reanudar un plan, no elimines journals como reparación y no uses
`git reset --hard`.


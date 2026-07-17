## Proposito de la propuesta

#92 alinea solamente el paquete `expo` con el parche que recomienda Expo SDK 54 y cierra la ultima discrepancia Expo que rastrea #66.

## Enfoque tecnico del diseno

Se usa el instalador explicito de Expo, se reinstala el arbol para respetar el lockfile, se revisa el diff y no se cambia SDK ni codigo.

## Contrato de comportamiento

`expo` deja de aparecer como incompatible y el doctor deja de reportar FAIL de compatibilidad; una deuda MCP ajena sigue visible.

## Plan de trabajo verificable

Se instala el paquete objetivo, se valida Expo, doctor, typecheck, lint y tests, y se guarda evidencia para archive.

## Resumen integral

El change es reversible con revert y `npm ci`, no toca datos ni UI, y deja #66 listo para actualizarse o cerrarse.

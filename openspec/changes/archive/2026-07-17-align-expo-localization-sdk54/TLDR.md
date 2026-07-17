## Propósito de la propuesta

#75 alinea solamente `expo-localization` con Expo SDK 54 y mantiene separado el aviso de `expo`.

## Enfoque técnico del diseño

Se usa el instalador explícito de Expo, se revisa el diff y no se cambia SDK ni código.

## Contrato de comportamiento

Localization deja de aparecer como incompatible; una discrepancia ajena de Expo sigue visible.

## Plan de trabajo verificable

Se instala el paquete objetivo, se valida Expo/typecheck y se guarda evidencia para archive.

## Resumen integral

El change es reversible, no toca datos ni UI y preserva #66 como tracking abierto.

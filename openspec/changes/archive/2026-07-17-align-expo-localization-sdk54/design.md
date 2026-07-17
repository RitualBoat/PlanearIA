## Context

#75 corrige un desalineamiento de dependencias de Expo SDK 54. `npx expo install --check` informa localization y también, por separado, una versión de `expo` distinta de la esperada. Es tooling transversal: no afecta bounded contexts de dominio, no intercambia datos y no requiere contrato cruzado. No hay UI ni validación visual aplicable.

## Goals / Non-Goals

**Goals:**

- Alinear solo `expo-localization` al rango que determine Expo para el SDK instalado.
- Verificar la ausencia del aviso de localization y conservar el aviso independiente de Expo visible.
- Mantener un rollback con revert y `npm ci`.

**Non-Goals:**

- No actualizar `expo`, Expo SDK, React Native, otras dependencias ni configuración nativa.
- No modificar código de internacionalización, UI, backend, sync o datos; no usar `--fix`, `latest` ni exclusiones de validación.

## Decisions

Se ejecutará `npx expo install expo-localization` desde la raíz, usando npm indicado por el lockfile. Se descartan edición manual, `npm install` directo y `npx expo install --fix` porque no preservan la selección acotada de Expo. La evidencia usará `npx expo install expo-localization --check` para el objetivo y `npx expo install --check` para registrar sin silenciar la discrepancia de Expo. Si el diff toca archivos o dependencias no necesarios, se revierte y se detiene.

## Risks / Trade-offs

- [El CLI modifica transitivos no necesarios] → inspeccionar diff y revertir cualquier ampliación injustificada.
- [La red o npm fallan] → no editar versiones manualmente; reintentar con el registro disponible.
- [Persiste el aviso de Expo] → registrarlo como deuda fuera de alcance, no como fallo de localization.

## Migration Plan

Capturar línea base, ejecutar la instalación explícita, revisar diff, comprobar ambos modos de Expo y typecheck. Para rollback, revertir el commit y ejecutar `npm ci`; no hay migraciones ni regeneración nativa.

## Open Questions

Se confirmará durante apply que el CLI deja localization en `~17.0.9` sin cambios de alcance.

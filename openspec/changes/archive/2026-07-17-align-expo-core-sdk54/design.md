## Context

#92 corrige la ultima discrepancia de dependencias de Expo SDK 54 registrada por #66. `npx expo install --check` informa `expo@54.0.35` frente a `~54.0.36`, lo que produce `FAIL expo-compatibility` en el doctor. El rango declarado `~54.0.34` ya admite `54.0.36`, pero el lockfile fija `54.0.35`, por lo que la version resuelta no satisface la recomendacion y hace falta una resolucion explicita, no solo un rango permisivo.

La misma comprobacion informa `expo-localization@17.0.8` pese a que #75 dejo `~17.0.9` en manifiesto y lockfile: `node_modules` quedo desactualizado frente al lockfile tras el merge. Es un arbol obsoleto, no una regresion de #75.

Es tooling transversal: no afecta bounded contexts de dominio, no intercambia datos y no requiere contrato cruzado. No hay UI ni validacion visual aplicable.

## Goals / Non-Goals

**Goals:**

- Alinear solo `expo` al rango que determine Expo para el SDK instalado.
- Dejar `node_modules` coherente con el lockfile para que la comprobacion refleje el estado real.
- Verificar la ausencia del aviso de `expo` y conservar visible la deuda MCP ajena.
- Mantener un rollback con revert y `npm ci`.

**Non-Goals:**

- No actualizar Expo SDK a 55, React Native, otras dependencias ni configuracion nativa.
- No modificar codigo, UI, backend, sync o datos; no usar `--fix`, `latest` ni exclusiones de validacion.
- No remediar el `FAIL mcp-smoke` por OAuth del servidor MCP `expo`.

## Decisions

Se ejecutara `npx expo install expo` desde la raiz, usando npm indicado por el lockfile. Se descartan la edicion manual, `npm install expo@54.0.36` directo y `npx expo install --fix` porque no preservan la seleccion acotada que Expo determina para el SDK instalado. `--fix` ademas ampliaria el alcance a cualquier otra dependencia desalineada.

El instalador de Expo sincroniza el arbol al resolver, por lo que se espera que la reinstalacion corrija de paso el `node_modules` obsoleto de `expo-localization` sin tocar su declaracion. Si no ocurre, se ejecutara `npm ci` como paso explicito de coherencia. En ambos casos el diff versionado debe seguir acotado a `expo`.

La evidencia usara `npx expo install --check` para el estado global y `npm run harness:doctor` para el veredicto del gate. Si el diff toca archivos o dependencias no necesarios, se revierte y se detiene.

## Risks / Trade-offs

- [El CLI modifica transitivos no necesarios] -> inspeccionar diff y revertir cualquier ampliacion injustificada.
- [La red o npm fallan] -> no editar versiones manualmente; reintentar con el registro disponible.
- [El bump de `expo` arrastra cambios de runtime] -> es un parche dentro de 54.0.x; se valida con typecheck, lint y la suite de tests antes de cerrar.
- [Persiste `FAIL mcp-smoke`] -> registrarlo como deuda independiente fuera de alcance, no como fallo de esta remediacion.

## Migration Plan

Capturar linea base, ejecutar la instalacion explicita, revisar diff, confirmar coherencia de `node_modules`, comprobar Expo y el doctor, y ejecutar typecheck, lint y tests. Para rollback, revertir el commit y ejecutar `npm ci`; no hay migraciones ni regeneracion nativa.

## Open Questions

Se confirmara durante apply que el CLI deja `expo` en `~54.0.36` sin cambios de alcance y si la reinstalacion basta para alinear el arbol de `expo-localization`.

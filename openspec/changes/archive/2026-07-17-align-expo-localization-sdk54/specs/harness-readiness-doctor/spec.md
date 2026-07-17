## ADDED Requirements

### Requirement: La compatibilidad de expo-localization se mantiene separada de deuda Expo ajena

El conjunto de dependencias raíz SHALL mantener `expo-localization` en el rango compatible que determine el CLI de Expo para el SDK instalado, usando el flujo de instalación compatible y actualizando de forma coherente el manifiesto y lockfile. La comprobación SHALL conservar visible cualquier discrepancia independiente de `expo` y SHALL NOT atribuirla a localization ni silenciarla.

#### Scenario: Se corrige únicamente localization

- **WHEN** la comprobación Expo identifica `expo-localization` como incompatible
- **THEN** la remediación actualiza exclusivamente la resolución necesaria mediante un comando Expo con localization como objetivo
- **AND** `npx expo install expo-localization --check` deja de identificar localization como incompatible

#### Scenario: Persiste una discrepancia independiente de Expo

- **WHEN** la comprobación global aún informa una versión de `expo` diferente de la esperada
- **THEN** el resultado conserva y registra esa discrepancia como deuda fuera del alcance
- **AND** no actualiza Expo SDK ni otras dependencias para silenciarla

#### Scenario: Se revierte la actualización acotada

- **WHEN** la actualización de localization debe deshacerse
- **THEN** revertir su commit y ejecutar `npm ci` restaura manifiesto, lockfile y árbol previos
- **AND** el rollback no requiere migrar datos ni regenerar proyectos nativos

## ADDED Requirements

### Requirement: El paquete expo se mantiene alineado al parche recomendado por su SDK

El conjunto de dependencias raiz SHALL mantener `expo` en el rango compatible que determine el CLI de Expo para el SDK instalado, usando el flujo de instalacion compatible y actualizando de forma coherente el manifiesto, el lockfile y el arbol resuelto. La comprobacion SHALL NOT depender de un rango permisivo cuando la version resuelta por el lockfile quede fuera de la recomendacion, y SHALL conservar visible cualquier deuda ajena sin atribuirla a `expo`.

#### Scenario: Se corrige unicamente expo

- **WHEN** la comprobacion Expo identifica `expo` como incompatible frente al parche recomendado por el SDK instalado
- **THEN** la remediacion actualiza exclusivamente la resolucion necesaria mediante un comando Expo con `expo` como objetivo
- **AND** `npx expo install --check` deja de identificar `expo` como incompatible
- **AND** el veredicto del doctor deja de reportar `FAIL expo-compatibility`

#### Scenario: Un rango permisivo no basta como evidencia de alineacion

- **WHEN** el manifiesto declara un rango que admitiria el parche recomendado pero el lockfile resuelve una version anterior
- **THEN** la comprobacion considera la dependencia desalineada
- **AND** la remediacion actualiza la resolucion del lockfile en lugar de ampliar o reinterpretar el rango

#### Scenario: El arbol resuelto refleja el lockfile vigente

- **WHEN** `node_modules` contiene una version distinta de la que el lockfile ya fija para una dependencia Expo
- **THEN** la remediacion reinstala el arbol para restaurar la coherencia
- **AND** no modifica la declaracion de esa dependencia en el manifiesto

#### Scenario: Persiste una deuda ajena a la compatibilidad Expo

- **WHEN** el doctor aun informa un fallo cuyo origen es distinto de la version de las dependencias Expo
- **THEN** el resultado conserva y registra esa deuda fuera del alcance de esta remediacion
- **AND** no actualiza Expo SDK ni otras dependencias para silenciarla

#### Scenario: Se revierte la actualizacion acotada

- **WHEN** la actualizacion de `expo` debe deshacerse
- **THEN** revertir su commit y ejecutar `npm ci` restaura manifiesto, lockfile y arbol previos
- **AND** el rollback no requiere migrar datos ni regenerar proyectos nativos

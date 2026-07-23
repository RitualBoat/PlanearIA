## ADDED Requirements

### Requirement: El doctor verifica identidad de la release consumida

El doctor SHALL comparar nombre/versión/schema del state con manifest, lockfile e instalación. Un path
embebido, versión flotante, binario global o source duplicado SHALL producir `FAIL` con recovery. El doctor
SHALL NOT instalar, actualizar ni cambiar la dependencia.

#### Scenario: Release fijada sana

- **WHEN** state, package, lockfile e instalación coinciden
- **THEN** reporta `PASS` con versión e identidad no sensible
- **AND** no ejecuta red ni mutaciones

#### Scenario: Source duplicado

- **WHEN** el consumidor conserva runtime editable además de la dependencia upstream
- **THEN** reporta `FAIL` de ownership
- **AND** indica retirar la copia solo mediante migración/PR

#### Scenario: Latest persistido

- **WHEN** la identidad instalada depende de `latest` sin versión concreta
- **THEN** reporta `FAIL`
- **AND** exige fijar una release exacta

### Requirement: El doctor reporta salud del control de deuda sin mutarlo

El doctor SHALL validar presencia/schema de política, registro y assessments, ejecutar únicamente la ruta
read-only equivalente a `debt check` y distinguir motor no configurado, estado sano, pausa y corrupción.
SHALL NOT capturar, sincronizar GitHub, crear issues, renovar excepciones o reparar el registro.

#### Scenario: Registro sano y vacío

- **WHEN** una fixture greenfield contiene política y registro válidos sin deuda
- **THEN** el doctor reporta `PASS`
- **AND** conserva cero cambios de filesystem

#### Scenario: Plan pausado

- **WHEN** debt check devuelve triggers válidos
- **THEN** el doctor conserva el estado/triggers sin convertirlos en fallo interno
- **AND** remite al issue/handoff aplicable

#### Scenario: Assessment no reflejado

- **WHEN** existe assessment válido ausente del registro
- **THEN** reporta `FAIL` con recuperación explícita
- **AND** no ejecuta capture automáticamente

#### Scenario: GitHub off

- **WHEN** la política desactiva integración remota
- **THEN** la salud local se evalúa y GitHub se reporta `SKIP`
- **AND** la ausencia remota no se presenta como `PASS`

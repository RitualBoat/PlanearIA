## ADDED Requirements

### Requirement: Multi-row alumno import persists every valid row
The alumno import flow SHALL persist all valid rows selected for import in a single coherent batch operation.

#### Scenario: Multiple valid rows are imported
- **WHEN** the teacher imports a file with N valid alumno rows
- **THEN** the local alumno store contains N new alumnos after import
- **AND** earlier valid rows are not overwritten by later rows.

#### Scenario: Imported ids remain stable and incremental
- **WHEN** multiple alumnos are created from one import batch
- **THEN** generated ids start after the current maximum alumno id
- **AND** each imported alumno receives a unique incremental id.

#### Scenario: Imported alumnos keep assigned group
- **WHEN** the teacher imports valid rows into a selected group
- **THEN** every imported alumno is persisted with the selected grupoId.

### Requirement: Batch import remains offline-first and sync-compatible
The alumno batch import path SHALL persist locally first and queue sync operations for created alumnos without creating a parallel sync client.

#### Scenario: Import runs while offline or remote sync is unavailable
- **WHEN** the teacher imports valid alumno rows without remote sync availability
- **THEN** the rows are still saved locally
- **AND** sync operations are queued through the existing sync service.

#### Scenario: Import validation has errors
- **WHEN** some rows are invalid
- **THEN** the import flow persists only valid selected rows
- **AND** keeps validation errors visible to the teacher.

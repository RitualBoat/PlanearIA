## ADDED Requirements

### Requirement: El bootstrap acepta una release pública verificable

El constructor SHALL poder iniciar desde una versión exacta de `create-project-engineering-os`
resuelta por npm/npx o desde el tarball equivalente de GitHub Release. Antes de escribir SHALL mostrar
nombre y versión resueltos, comprobar compatibilidad Node/schema y registrar la identidad del paquete.
SHALL NOT depender de una instalación global ni de un path interno de PlanearIA.

#### Scenario: Ejecución por npx fijado

- **WHEN** un repositorio vacío ejecuta `npx create-project-engineering-os@<version> bootstrap`
- **THEN** el preflight muestra y registra la versión exacta resuelta
- **AND** la salida es equivalente a instalar el tarball aprobado de esa release

#### Scenario: Tarball de GitHub Release

- **WHEN** una persona instala el `.tgz` adjunto cuya suma coincide con `SHA256SUMS`
- **THEN** el CLI ejecuta el mismo entrypoint y blueprint que el paquete npm de esa versión
- **AND** el estado conserva la misma identidad de release

#### Scenario: Runtime incompatible

- **WHEN** la versión Node o schema del destino no cumple el manifest de la release
- **THEN** el bootstrap falla antes de escribir
- **AND** explica una combinación soportada sin instalar o actualizar Node automáticamente

#### Scenario: Solo existe un path de PlanearIA

- **WHEN** la guía, fixture o comando depende de `tools/project-constructor` en el repositorio consumidor
- **THEN** la prueba de portabilidad falla
- **AND** exige usar el paquete o tarball público autocontenido

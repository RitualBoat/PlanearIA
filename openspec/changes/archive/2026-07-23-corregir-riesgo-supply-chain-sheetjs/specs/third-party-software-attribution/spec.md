## ADDED Requirements

### Requirement: Artefacto SheetJS vendorizado verificable

El repositorio SHALL conservar el tarball oficial `xlsx-0.20.3.tgz`, metadata de origen y SHA-256, y SHALL ejecutar un check determinista que falle si falta o cambia el artefacto, la versión no es `0.20.3`, la dependencia deja de usar `file:` o falta la evidencia legal requerida.

#### Scenario: Manifest y artefacto coinciden

- **WHEN** se ejecuta el check sobre el repositorio intacto
- **THEN** origen, SHA-256, versión, dependencia local y archivos legales pasan

#### Scenario: Alteración se detecta sin tocar el artefacto real

- **WHEN** una prueba modifica una copia temporal del tarball o manifest
- **THEN** el check falla y el tarball versionado permanece intacto

### Requirement: Disclosure de terceros encontrable

PlanearIA SHALL incluir `THIRD_PARTY_NOTICES.md` con la atribución oficial de SheetJS CE, la licencia Apache-2.0 y los notices aplicables, enlazado desde el índice documental en menos de tres saltos. La licencia propia de PlanearIA MUST permanecer sin cambios.

#### Scenario: Atribución oficial está completa

- **WHEN** se inspecciona el disclosure
- **THEN** contiene nombre, sitio, copyright, licencia Apache-2.0, enlace a la licencia y notices conservados

### Requirement: Licencias de terceros accesibles en la app

La pantalla legal SHALL preservar Términos y Privacidad y ofrecer una pestaña de licencias de terceros con la atribución de SheetJS. Los controles SHALL tener nombre accesible, estado seleccionado, navegación por teclado en web, contraste mediante tokens y objetivo táctil mínimo de 44 pt.

#### Scenario: Navegación conserva documentos legales

- **WHEN** el docente abre Términos, Privacidad o Licencias mediante la ruta tipada
- **THEN** la pestaña solicitada se selecciona y las otras dos continúan disponibles

#### Scenario: Pestañas son accesibles

- **WHEN** un lector de pantalla o usuario de teclado recorre las pestañas
- **THEN** cada control anuncia su etiqueta y estado seleccionado con foco visible

#### Scenario: Presentación responde por breakpoint

- **WHEN** se abre la pantalla en móvil, tablet y web
- **THEN** el contenido permanece legible, escalable y alcanzable sin crear implementaciones por plataforma

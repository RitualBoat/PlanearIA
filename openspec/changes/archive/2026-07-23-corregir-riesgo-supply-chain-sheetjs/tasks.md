## 1. Evidencia y contrato base

- [x] 1.1 Conservar el SHA-256 del assessment #133 y corregir comentarios/documentos que prometen evitar todo cuelgue.
- [x] 1.2 Crear la reproducción segura del bloqueo exclusivamente en proceso hijo con timeout y terminación controlada.

## 2. Vendoring y supply chain

- [x] 2.1 Descargar del canal oficial, inspeccionar y versionar `xlsx-0.20.3.tgz` bajo `vendor/sheetjs/`.
- [x] 2.2 Crear metadata de origen/licencia/SHA-256 y un check determinista de tarball, versión, dependencia y notices.
- [x] 2.3 Cambiar `package.json` a `file:`, regenerar lockfile sin `audit fix` y probar alteración sobre copia temporal.

## 3. Licencias y atribución

- [x] 3.1 Crear `THIRD_PARTY_NOTICES.md`, conservar Apache-2.0/notices y enlazarlo desde el índice documental.
- [x] 3.2 Añadir Licencias de terceros a `TerminosScreen`, tipar ruta sin `any` nuevo y preservar Términos/Privacidad.
- [x] 3.3 Añadir tests de contenido, navegación y accesibilidad de la superficie legal.

## 4. Gobernanza y cadencia

- [x] 4.1 Actualizar el ADR para enlazar registro/excepción, revisión mensual y recuperación exacta sin duplicar estado.
- [x] 4.2 Crear assessment `remediation`/`debt` con candidato y excepción exactos y capturarlo solo mediante `debt:capture`.
- [x] 4.3 Verificar item `debt-770acc1e9d53` en `accepted-exception`, expiración, `debt:check` PASS y hash #133 intacto.

## 5. Validación proporcional

- [x] 5.1 Pasar tests focalizados de import/export, manifest/checksum, alteración negativa y UI legal/accesibilidad.
- [x] 5.2 Validar web con Playwright en móvil, tablet y web después de HTTP 200; guardar capturas y checklist Nielsen.
- [x] 5.3 Pasar typecheck, lint, suite Jest, backend, debt-control, harness, OpenSpec, Expo check y npm audit.
- [x] 5.4 Ejecutar `npm ci` dos veces sin drift y demostrar que `xlsx` no depende del CDN durante instalación.
- [x] 5.5 Ejecutar revisión adversarial desde contexto limpio y corregir todos los Blockers/Majors.

## 6. Cierre SDD

- [x] 6.1 Completar readiness/evidencia para ejecutar el gate local de archive.

El archive y el cierre GitHub/Product OS son operaciones posteriores al gate, no tareas pendientes del
artefacto que el propio gate exige completo. Se ejecutarán únicamente con `opsx:archive`,
`opsx:finish` y `debt:sync`, preservando #129 abierto, cerrando #137 y moviendo #136 a Ready.

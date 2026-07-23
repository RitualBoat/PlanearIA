## Context

#133 instaló SheetJS 0.20.3 desde el CDN y añadió límite de 5 MB y conversión de excepciones lanzadas a error de dominio. La reproducción aislada posterior demostró que un ZIP truncado puede entrar en un bucle síncrono que `try/catch` no puede interrumpir. El assessment de #133 es evidencia histórica inmutable y se conservará byte a byte; esta corrección crea un assessment nuevo mediante el motor.

SheetJS recomienda vendorizar para desacoplarse de su infraestructura y exige atribución Apache-2.0 enlazada desde Términos/EULA. El cambio toca dos bounded contexts ligeros: Operación/Engineering OS posee manifest, checksum, assessment y ADR; Cuenta posee la presentación legal. El contrato es unidireccional y estático: la UI consume texto de atribución versionado, sin datos académicos, `userId`, sync, permisos ni proveedores nuevos.

## Goals / Non-Goals

**Goals:**

- Hacer reproducible y verificable el origen, versión, licencia y SHA-256 de `xlsx-0.20.3.tgz`.
- Registrar el riesgo residual como `external-risk` Minor con excepción temporal válida.
- Hacer honesto el contrato de importación y accesible la atribución en repo y app.
- Preservar import/export, Términos, Privacidad, temas, escalado tipográfico y daltonismo.

**Non-Goals:**

- Eliminar el bloqueo síncrono, sustituir SheetJS o introducir workers/backend.
- Rediseñar Cuenta, añadir animación o separar archivos por plataforma.
- Resolver #136, actualizar Expo SDK o cambiar la licencia de PlanearIA.

## Decisions

### D1. Tarball oficial vendorizado y manifest verificable

Se descargará una sola vez desde `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, se inspeccionará antes de versionarlo y se guardará bajo `vendor/sheetjs/`. `package.json` usará `file:vendor/sheetjs/xlsx-0.20.3.tgz`. Un manifest versionará URL, versión, SHA-256, licencia y archivos legales encontrados. Un script determinista verificará existencia, checksum, versión del `package/package.json`, dependencia local y LICENSE/NOTICE exigibles; su prueba negativa operará sobre una copia temporal.

Alternativas descartadas: mantener HTTPS directo conserva dependencia de red; desempaquetar toda la librería aumenta superficie y riesgo de modificaciones accidentales; migrar de librería excede la decisión aprobada.

### D2. Evidencia de deuda append-only

Se escribirá un input de assessment nuevo y se capturará exclusivamente con `npm run debt:capture`. El mismo assessment crea el fingerprint esperado y aplica la excepción. El hash SHA-256 del assessment de #133 se comprobará antes y después. El registro no se edita manualmente.

### D3. Contrato explícito de dos clases de fallo

El tamaño máximo evita parsear archivos grandes y `try/catch` convierte únicamente excepciones lanzadas en `SpreadsheetImportError`. El contrato declarará que un bloqueo síncrono dentro de `XLSX.read` no cede control y no puede ser capturado. Cualquier reproducción peligrosa se ejecutará en proceso hijo con timeout y terminación.

### D4. Disclosure único y UI legal existente

`THIRD_PARTY_NOTICES.md` contendrá la atribución oficial y referenciará la copia Apache-2.0/NOTICE incluida. `Documentacion/README.md` lo hará encontrable en menos de tres saltos. `TerminosScreen` añadirá la pestaña `Licencias de terceros`, usando el mismo componente responsive y tokens. La ruta raíz aceptará `tab: "terminos" | "privacidad" | "licencias"` mediante `RouteProp`, eliminando `useRoute<any>()`.

En móvil `<768`, tablet `768-1279` y web `>=1280` se conserva la pantalla madre: pestañas flexibles con etiquetas accesibles, estado seleccionado y controles de al menos 44 pt. No existe ground truth Figma para este añadido legal ni se requiere una UI de alta paridad; Playwright validará la extensión mínima sobre la superficie vigente.

### D5. ADR como índice, registro como estado

El ADR mantendrá revisión mensual, enlazará `debt-770acc1e9d53` y repetirá solo la recuperación operativa. La expiración y el estado se leerán del registro; el ADR no tendrá un campo paralelo actualizable.

## Risks / Trade-offs

- [El tarball aumenta el repositorio] → aceptar el costo acotado y verificarlo con manifest/checksum.
- [El import `.xlsx` puede congelarse] → excepción temporal, selección manual, preview y recuperación obligatoria al vencer; no declarar eliminado el riesgo.
- [Una pestaña adicional puede saturar móvil] → etiquetas claras, distribución flexible, escalado y Playwright por breakpoint.
- [Un test de reproducción puede colgar CI] → solo proceso hijo con timeout y kill controlado; nunca Jest/gate principal.
- [Rollback podría borrar evidencia] → todo rollback preserva assessment, item, excepción y notices.

## Migration Plan

1. Descargar e inspeccionar tarball; crear manifest/check.
2. Cambiar a `file:` y regenerar lockfile sin `audit fix`.
3. Añadir notices, UI, tipado y tests.
4. Corregir contrato/ADR/specs y validar.
5. Capturar assessment y comprobar excepción.
6. Si falla vendoring, un PR puede restaurar temporalmente HTTPS con `integrity`, preservando notices y registro. Si vence sin solución, un PR desactiva solo import `.xlsx`, conservando CSV y exportación.

## Open Questions

Ninguna decisión material pendiente; owner, aprobador, expiración, recuperación, vendoring y atribución fueron aprobados en #137.

# Upstream y consumidores

Este repositorio público gobierna runtime, blueprint, schemas, tests, documentación de distribución,
Debt Control Loop y specs completas de evolución.

Un proyecto consumidor fija una versión exacta y conserva:

- configuración, perfiles y políticas seed-once;
- registros y assessments de deuda;
- licencia y código del producto;
- contratos locales de aceptación de la versión adoptada.

El consumidor no edita una copia del runtime. Un cambio de comportamiento se propone upstream, se publica
como release SemVer y después se adopta mediante `upgrade --check` y PR normal. Los workflows OPSX siguen
siendo generados por la CLI oficial de OpenSpec; el renderer solo adapta bloques neutrales delimitados.


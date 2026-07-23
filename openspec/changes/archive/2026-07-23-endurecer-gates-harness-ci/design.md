## Context

El issue #136 y el baseline del motor de deuda identifican dos fallos correlacionados: los guards de cuatro scripts construyen una file URL de forma manual y todos los pasos del workflow de paridad son advisory. En Linux, un `argv[1]` absoluto convierte esa comparación en `file:////...`, por lo que el proceso termina sin ejecutar su CLI. Las pruebas existentes importan helpers o cubren lógica interna, pero no prueban de forma uniforme el contrato de proceso.

La señal actual también incluye tres fuentes verificadas: `baseline-browser-mapping@2.8.22` transitivo y obsoleto, `docx` leyendo el `localStorage` experimental de Node desde Jest, y `execFileSync` propagando el `stderr` del fixture positivo de codificación. El change no cambia datos docentes ni código de producto.

### Contextos delimitados

El change pertenece al contexto operativo de Harness/SDD, que es infraestructura de desarrollo y no posee entidades del mapa DDD. No modifica los bounded contexts de Identidad, Contenido, Classroom, Seguimiento, Comunicación ni Experiencia/Preferencias, por lo que no requiere contrato cruzado, `userId`, `src/sync` ni migración de datos.

## Goals / Non-Goals

**Goals:**

- Hacer que los cuatro CLI se detecten como entrypoints tanto en Windows como en POSIX y que sus pruebas fallen si el bloque no se ejecuta.
- Bloquear en CI los checks del harness con baseline verde, ejecutar la prueba de CLI en Windows y Linux, y no interpretar la ausencia de ejecución como éxito.
- Eliminar las tres señales reproducidas manteniendo la visibilidad de errores inesperados.
- Resolver `debt-2887d890144e` mediante assessment de remediación, sin introducir deuda nueva.

**Non-Goals:**

- No cambiar branch protection, required checks remotos, Expo SDK, `npm audit fix`, SheetJS ni los artifacts de #137.
- No convertir en bloqueante una señal que no tenga baseline estable ni usar `--no-warnings`, filtros o redirecciones globales.
- No cambiar UI, backend, sync, contratos de datos ni publicar el constructor.

## Decisions

### D1. Guard portable y comprobación de proceso

Cada script sustituirá el guard manual por una comparación con `pathToFileURL(process.argv[1]).href`, protegida cuando falte `argv[1]`. Es la misma normalización que ya protege `checkSourceEncoding.mjs`; evita depender de la cantidad de barras de una ruta absoluta.

Un único test Node de entrypoints invocará los cuatro archivos mediante `spawnSync`, afirmará un marcador semántico de cada CLI y cubrirá una invocación inválida de readiness. Para el doctor, la prueba invoca `--json --entrypoint-test`: el entrypoint construye el reporte real con un runner determinista que marca cada verificación operativa como fallida, entrega JSON, checks y código coherente, y los checks MCP omitidos quedan como `FAIL` explícitos; por diseño ese modo nunca puede ser un diagnóstico verde. Así la prueba portable no depende de OAuth, herramientas del host ni procesos MCP remotos. `--help` sigue comprobando la ruta sin checks externos y la suite del doctor cubre el diagnóstico operativo completo `--json`. El caso negativo asertará que resultado vacío o código de éxito inesperado hace fallar el test: así el test no puede pasar si el guard deja de ejecutar. La matriz de workflow lo correrá en `windows-latest` y `ubuntu-latest`.

Alternativas descartadas: comparar strings con reemplazos de barras (reintroduce la ambigüedad POSIX) y limitar la prueba a imports (no ejercita el bloque CLI).

### D2. Cutover de CI por estabilidad demostrada

Los siete pasos de verificación actuales se ejecutarán sin `continue-on-error` solo después de pasar su baseline local, incluida la nueva prueba CLI. El workflow usará una matriz explícita; por ello una falta de comando, una salida vacía o un código no cero detiene el job. El inventario final de advisories será vacío; si un paso necesitara conservar `continue-on-error`, su propia entrada deberá declarar señal, causa, owner, recuperación y condición de cutover en el workflow antes de volverlo advisory.

No se modifica la configuración remota de branch protection: hacer que un workflow falle es distinto de declarar un required check remoto. Si apareciera esa necesidad, el change se detiene para pedir una decisión.

### D3. Señal limpia sin ocultación global

`baseline-browser-mapping` se declara como devDependency en su versión actual para prevalecer sobre el dato transitivo obsoleto; se valida que lint y Jest ya no emitan el aviso. El lockfile conserva la resolución reproducible y `npm audit --json` se compara contra 1 low, 20 moderate y 0 high/critical.

Un wrapper de Jest detectará si el runtime acepta `--no-experimental-webstorage` y relanzará Jest con esa API experimental deshabilitada. Esto no suprime warnings: elimina la API Node no usada que `docx` consulta en un entorno de pruebas. En runtimes que no admiten la flag, el wrapper conserva la ejecución normal. Los scripts de test del repositorio usarán el mismo wrapper.

El test de encoding reemplazará `execFileSync` por `spawnSync` con pipes, conservará las seis líneas como aserciones de salida esperada y no las heredará a la consola de Jest. La guardia de consola sigue fallando sobre cualquier `console.error`/`console.warn` no declarado dentro de los tests. Durante la validación en Node 26 apareció además `DEP0190`: el doctor usaba `shell: true` para ejecutar `npm.cmd` con argumentos separados. El runner invocará `cmd.exe` explícitamente con `shell: false`; la prueba de proceso exige que el JSON del doctor no tenga stderr inesperado.

### D4. Evidencia y deuda inmutables

El assessment `kind: remediation` incluirá únicamente la resolución comprobada de `debt-2887d890144e` y los candidatos verificados de las tres señales. Solo se declarará `clean` si no queda candidato residual verificable; cualquier candidato nuevo se corrige o se gobierna antes de archive. El registro histórico y la excepción `debt-770acc1e9d53` no se editan.

## Risks / Trade-offs

- [Actualización de datos de navegadores cambia el lockfile] → se limita a `baseline-browser-mapping`, se revisa `npm audit`, se ejecuta `npm ci`/checks dos veces y no se modifica Expo.
- [Una versión de Node no admite `--no-experimental-webstorage`] → el wrapper consulta `process.allowedNodeEnvironmentFlags` y ejecuta Jest sin la flag cuando no existe; el workflow prueba ambos sistemas.
- [Un check estable se vuelve inestable en CI] → revertir el PR o reintroducir el advisory con causa, owner, recuperación y fecha/condición de cutover mediante PR de corrección; nunca silenciarlo.
- [El doctor depende de entorno externo] → el test de CLI verifica ejecución y forma de reporte, no fuerza una respuesta verde de servicios externos inexistentes.
- [Cambiar required checks remotos] → fuera de alcance; detener y solicitar decisión explícita.

## Migration Plan

1. Reproducir los guards y las tres señales antes de editar; conservar comandos y resultados en evidencia.
2. Añadir guards portables, wrapper de Jest, captura local del fixture y la prueba de procesos; actualizar el dataset de navegador.
3. Ejecutar el baseline local, `npm audit --json`, runs repetidos de paridad y pruebas CLI en Windows/WSL Linux.
4. Retirar los `continue-on-error` respaldados por esa evidencia y validar la matriz real en el PR.
5. Capturar assessment, revisar adversarialmente, ejecutar readiness, archivar y cerrar mediante `opsx:finish`.

Rollback: revertir el PR restaura guards, comandos y configuración CI anteriores. Si una señal de CI demuestra inestabilidad, se restituye solo su advisory documentado en un PR de corrección; no se toca branch protection ni registros históricos.

## Open Questions

- Ninguna para implementación local. El estado de checks requeridos remotos queda deliberadamente sin consultar ni mutar; una necesidad de cambio requeriría decisión del responsable.

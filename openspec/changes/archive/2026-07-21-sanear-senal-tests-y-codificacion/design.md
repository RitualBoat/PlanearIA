# Design: sanear-senal-tests-y-codificacion

## Context

`development@65fd077` esta verde (116 suites / 815 tests) pero con senal degradada, verificado el 2026-07-20:

- ~18 suites emiten `console.log/warn/error`. Tres origenes distintos confirmados con ejecuciones reales:
  1. Warnings `act()` reales de React (p.ej. `useDetalleGrupoViewModel.test.tsx`, 18 ocurrencias).
  2. Warnings de terceros en tiempo de importacion/evaluacion (p.ej. `expo-notifications` avisa que Expo Go ya no soporta push remotas).
  3. Logs de la app via `src/utils/logger.ts` (guardado por `__DEV__`, activo en Jest) en caminos de exito y de error esperados por el propio test.
- Mojibake UTF-8 doble en exactamente 5 archivos de `src` (2 de producto, 3 de tests), sin ningun check que lo detecte.
- `package.json#jest` no declara setup files propios; jest-expo aporta los suyos.

**Contextos DDD (regla obligatoria de design):** este change toca unicamente infraestructura de pruebas y un script de repo. No modifica ningun bounded context del mapa (`MAPA_DDD_ESTRATEGICO_LIGERO.md`) ni datos compartidos; por tanto no requiere contrato cruzado. Las cadenas de texto corregidas viven en Planeacion y Contenido Docente (pantalla de exportacion) y en Classroom (seccion curricular), pero la correccion restaura el texto previsto sin cambiar comportamiento ni ownership.

## Goals / Non-Goals

**Goals:**

- `console.error`/`console.warn` inesperados rompen el test que los emite, con mensaje accionable.
- Los logs esperados se declaran de forma explicita y local (por test), y una declaracion que no se usa tambien falla (una allowance muerta es la puerta a silenciar regresiones).
- Warnings `act()` reales se corrigen en las suites afectadas, no se allowlistean.
- Check determinista de codificacion con cero falsos positivos sobre UTF-8 legitimo del espanol (á é í ó ú ü ñ ¿ ¡ — → … • emojis).
- Las 116 suites / 815 tests siguen verdes; la salida queda sin lineas `console.*` no declaradas.

**Non-Goals:**

- No se guarda `console.log/info/debug` con fallo duro (la remediacion de la deuda acota el fallo a `error/warn`); el ruido de `log` existente se limpia espiando el logger en las suites tocadas.
- No se mockean librerias de terceros para esconder sus warnings; se declaran con justificacion.
- No se toca el contrato de `src/utils/logger.ts` ni se refactorizan suites enteras.

## Decisions

### D1. Guardia de consola como `setupFilesAfterEach` + helper importable

Se anade `jest.setup.consoleGuard.ts` (referenciado en `package.json#jest.setupFilesAfterEach`, la opcion estandar de Jest para codigo que necesita el framework ya instalado; se verifica contra `npx jest --showConfig` antes de escribir). La guardia:

- Envuelve `console.error` y `console.warn` antes de cada test; registra cada llamada y NO la reenvia a la salida (la salida limpia es el objetivo; al fallar, el mensaje de fallo incluye las llamadas capturadas).
- Despues de cada test: llamadas no declaradas -> `throw` con archivo, patron y contenido; allowances declaradas y no consumidas -> `throw` distinto que pide retirar la allowance muerta.
- Helper `jest/helpers/consoleSignal.ts` exporta `expectConsoleError(...patterns)` / `expectConsoleWarn(...patterns)` (strings o RegExp, match por substring o test regex, por llamada individual).
- Restauracion total tras cada test (sin fugas entre suites).

Alternativas consideradas: (a) `failOnConsole` de jest-fail-on-console — dependencia nueva con comportamiento no controlable (sin allowances locales por test), rechazada por presupuesto cero y control; (b) espiar suite por suite sin guardia global — no impide regresiones futuras, rechazada; (c) fallar tambien `console.log` — rompe ruido legitimo de RN/jest-expo fuera de nuestro control y excede la remediacion aprobada, rechazada.

### D2. Tres tratamientos segun el origen del ruido

- `act()` real: corregir el test (await de efectos, `waitFor`, flush de promesas). Nunca allowance.
- Warning de terceros (expo-notifications u otro modulo): allowance con comentario que justifica por que es esperado y por que no se puede eliminar (warning en importacion, fuera de nuestro control, sin mock pesado).
- Log de app esperado (`logger.*` en caminos de exito/error que el test ejercita a proposito): allowance via helper en el test concreto, o spy local con restore si el test ya usa ese patron. Las pruebas de la propia guardia demuestran que una allowance no silencia una llamada inesperada posterior.

### D3. Check de codificacion como script Node + test Jest con fixtures

`scripts/checkSourceEncoding.mjs` exporta `findEncodingIssues(root)` y tiene CLI (`node scripts/checkSourceEncoding.mjs [root]`, exit 1 listando archivo:linea). Deteccion determinista sobre el texto leido como UTF-8:

- Patron principal: `[\u00C0-\u00C5\u00C2][\u0080-\u00BF]` (lead byte UTF-8 reinterpretado como Latin-1 seguido de continuacion huerfana: Ã¡, Ã³, Ã±, Â¡, Â¿, Â°...). En espanol correcto `Ã`/`Â` no aparecen seguidos de esos rangos; la firma es estructural de la doble codificacion.
- Patron secundario: `\u00E2\u20AC[\u0093\u0094\u0099\u00A2\u00A6\u0153\u009C]` y `\u00E2\u2020\u0092` (â€", â€", â€™, â€¢, â€¦, â€œ, â€; â†’).

`src/__tests__/harness/sourceEncoding.test.ts`: (a) fixture positivo con mojibake -> detectado con lineas correctas; (b) fixture negativo con UTF-8 legitimo (acentos, enies, signos de apertura, em-dash, flechas, emoji) -> cero hallazgos; (c) escaneo de `src` -> cero hallazgos (este es el gate permanente que corre con `npm test` y CI). Los fixtures viven en `src/__tests__/harness/fixtures/` y el escaneo los excluye.

Alternativas consideradas: (a) lint rule — requiere plugin custom y no corre en CI sin mas cableado, rechazada; (b) check solo como script npm sin test — se olvida porque nada lo ejecuta, rechazada; (c) validar bytes crudos — equivalente, pero el match sobre string UTF-8 es mas legible y suficiente.

### D4. Correccion de mojibake limitada a los 5 archivos verificados

Cada archivo se corrige al texto espanol previsto (verificado por contexto: p.ej. `EvaluaciÃ³n` -> `Evaluación`, `MatemÃ¡ticas` -> `Matemáticas`, `3Â°` -> `3°`, `â€”` -> `—`). Las aserciones de tests que esperaban el texto corrompido se actualizan al texto correcto; las aserciones sobre la pantalla de exportacion ya documentan el comportamiento visible. Cualquier candidato nuevo descubierto durante el change se reporta en el assessment como hallazgo aparte; no se corrige aqui.

## Risks / Trade-offs

- [La guardia rompe suites por ruido de terceros no catalogado] -> Mitigacion: corrida completa durante apply catalogando cada llamada; allowances solo con justificacion; la propia spec exige la prueba negativa.
- [Allowances muertas acumuladas] -> Mitigacion: la guardia falla ante allowances no consumidas (D1).
- [Falsos positivos del check sobre texto legitimo] -> Mitigacion: fixture negativo con el repertorio completo del espanol + simbolos usados en la app; el patron exige la secuencia estructural, no un caracter aislado.
- [Suites con ruido condicional (solo en CI o solo en alguna ruta)] -> Mitigacion: el helper permite declarar la allowance dentro del test/branch exacto; si aparece una suite asi durante apply se documenta en el assessment.
- [Corregir `act()` expone tests que dependian del comportamiento no awaited] -> Mitigacion: se corrige la sincronizacion del test, no la asercion; si una asercion cambia, se justifica en el PR.

## Migration Plan

1. Guardia + helper + pruebas de la guardia (sin activar fallo global todavia en suites no limpiadas).
2. Check de codificacion + fixtures + correccion de los 5 archivos.
3. Limpieza suite por suite hasta salida limpia.
4. Rollback: revertir el PR retira guardia, check y correcciones; ningun cambio es irreversible ni toca datos.

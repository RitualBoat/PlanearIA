# Revisión adversarial

**Fecha:** 2026-07-19

**Alcance:** issue #103 y change `constructor-proyectos-nuevos`.

**Método:** pase separado desde contexto limpio sobre proposal, design, specs, tasks, implementación,
fixtures, evidencia y diff. Se intentó refutar cada regla adversarial del issue.

## Veredicto

**PASS CON HUECOS.** No quedan Blockers ni Majors abiertos. La deuda de warnings/logs preexistentes de
la suite raíz permanece como Minor rastreado y no se propaga al constructor. La matriz CI multi-SO es
un gate externo todavía pendiente de ejecutar en el PR.

## Hallazgos corregidos

| Severidad | Área | Hallazgo | Corrección y evidencia |
| --- | --- | --- | --- |
| Major | Bootstrap real | Prompt 00 invocaba un binario sin demostrar que el paquete estuviera instalado desde un artefacto verificable. | La fixture empaqueta, calcula SHA-256, instala el tarball en un runner temporal separado y ejecuta el bootstrap sobre un repositorio Git vacío. |
| Major | Readiness | Placeholders y campos adicionales podían producir un falso verde. | Contratos exactos, rechazo de placeholders, validación fail-closed y pruebas negativas. |
| Major | Secretos | Una asignación genérica como `token=valor` podía redactarse en salida sin bloquear metadata persistida. | Detección genérica en cualquier campo, permiso solo para referencias `${ENV_VAR}` y pruebas de regresión. |
| Major | Doctor | El schema declarado no coincidía con la salida humana/JSON real. | Schema corregido al contrato `schemaVersion/verdict/counts/results`; tests de equivalencia y política de secretos sin falso positivo. |
| Major | OpenSpec | La fixture asumía 15 workflows sintéticos; la CLI oficial fijada genera 25 superficies. | Generación con OpenSpec 1.6.0, conteo oficial 25 y pruebas de ownership externo. |
| Major | CI | El workflow no ejecutaba la suite negativa completa ni la fixture empaquetada. | CI ejecuta `constructor:check`, 44 tests, fixture, `npm pack --dry-run` y publica evidencia en Ubuntu/Windows/macOS. |
| Major | Gate circular | `tasks.md` exigía archive/finish antes del pre-archive que requiere todas las tareas completas. | Archive, sync, PR y finish se clasifican como pasos posteriores al change, conforme a la convención vigente; el dry-run y gate sí permanecen verificables antes del archive. |
| Major | Gate silencioso | El pre-archive pasó sus 14 controles pero emitió `DEP0190` porque el runner usaba `shell: true` para npm en Windows. | Runner explícito mediante `cmd.exe`, argumentos restringidos a la allowlist estática, cero `shell: true`, pruebas de resolución/inyección y gate repetido sin warning. |
| Minor | Human overlay | La preservación fuera del bloque gestionado no tenía una prueba explícita. | Test que conserva contenido humano, actualiza el bloque y falla en conflicto si se edita el bloque gestionado. |
| Minor | Stderr externo | OpenSpec escribe progreso normal por stderr y la fixture podía confundirlo con regresión. | Allowlist cerrada de diez señales normales; warnings, comandos desconocidos y archivos ausentes siguen fallando. |
| Minor | Licencias | La guía manual no pedía evidencia observada de versión, licencia y SHA-256. | Paso manual ampliado con valor esperado/observado y hash del artefacto. |

## Intentos de refutación que no prosperaron

- **Copia PlanearIA:** el scanner de neutralidad y la fixture rechazan dominio docente, Expo, React,
  MVVM, `userId`, breakpoints y proveedores dentro del núcleo.
- **Configuración equivale a operación:** doctor separa config, startup, listing y smoke autenticado;
  `SKIP`/`WARN` no se convierten en `PASS`.
- **Instalación prematura:** el target instala únicamente OpenSpec fijado y el harness; todos los perfiles
  de producto permanecen inactivos.
- **Dependencia de agente/SO:** cinco adaptadores comparten una fuente canónica, degradan de forma
  explícita y la lógica usa rutas/fin de línea deterministas.
- **Múltiples fuentes de verdad:** blueprint canónico + state/ownership; los workflows OPSX conservan
  ownership externo y los bloques humanos son overlays acotados.
- **Ejecución parcial destructiva:** preflight antes de escribir, journal, backups, reanudación y rollback
  hash-aware probados.
- **Explosión de issues:** bootstrap solo genera diez payloads neutrales locales; no crea issues remotos.
- **Trabajo humano ficticio:** OAuth, entrevistas, aprobaciones y merge son gates manuales, no changes
  simulados.
- **Graphify obligatorio:** siempre `SKIP` retirado/manual.
- **Tests verdes igual a producto listo:** el cierre se limita explícitamente a Etapa A; discovery,
  perfil técnico y producto siguen pendientes.

## Hallazgos abiertos

| Severidad | Área | Hallazgo | Tratamiento |
| --- | --- | --- | --- |
| Minor | Suite raíz | 116/116 suites y 815/815 tests pasan, pero existen warnings `act`/keys, Expo push y logs de sync preexistentes. | Registrado en auditoría, matriz de transferibilidad y gap G6. No se silencian ni se atribuyen al constructor; su corrección pertenece a changes de producto separados. |
| Pregunta | Distribución | El paquete sigue privado y `UNLICENSED`; no se ha elegido licencia para publicarlo. | Mantener sin publicación hasta decisión humana explícita. |
| Gate | CI | Falta observar la matriz Ubuntu/Windows/macOS en GitHub Actions. | Publicar PR, esperar checks reales y no mergear por ausencia de checks. |

## Evidencia comprobada

- `npm run constructor:test`: 44/44.
- `npm run constructor:fixture -- --evidence artifacts/constructor/fixture.json`: PASS, segundo run sin
  drift.
- `npm pack ./tools/project-constructor --dry-run --json`: 94 archivos; tarball verificable.
- `npm run test:constructor-docs`: 12 artefactos y 50 filas.
- `npm run typecheck`, `npm run lint -- --quiet`, `git diff --check`: PASS.
- `npm test -- --runInBand`: 116 suites y 815 tests PASS; ruido histórico clasificado.
- `npm run openspec:validate` y strict del change: PASS.
- `npm run gitnexus:diagnose`: índice fresco.
- `npm run harness:doctor -- --json`: `ok=true`, cero FAIL.

## Recomendación

Continuar al gate pre-archive. Publicar el PR después del archive, esperar la matriz CI real y reservar el
merge para la autorización manual aplicable.

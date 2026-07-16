## 1. Contrato de readiness y perfiles

- [x] 1.1 Definir el contrato JSON versionado para el bloque pre-propose del issue y `readiness.json`, incluidos campos obligatorios, superficies, evidencia, rollback y excepciones permitidas.
- [x] 1.2 Definir en código los perfiles estáticos de validación para `docs`, `harness`, `ui`, `sync`, `ia` y `backend`, con IDs, comandos locales fijos y evidencia manual requerida.
- [x] 1.3 Documentar y probar la lista de campos no excepcionables, los datos obligatorios de una excepción y su expiración ISO.

## 2. Checker read-only

- [x] 2.1 Crear `scripts/checkOpenSpecReadiness.mjs` con parseo de argumentos, resultados ordenados `PASS`/`FAIL`/`EXCEPTION`, sanitización y salidas humana/JSON.
- [x] 2.2 Implementar la fase `propose`: consulta GitHub solo de lectura, valida issue abierto/Project/enrich/metadata y entrega recuperaciones por campo.
- [x] 2.3 Implementar la fase `archive`: resolver y confinar el change, validar propuesta, metadata, TLDR, tareas, evidencia, rollback, revisión adversarial y matriz proporcional.
- [x] 2.4 Implementar `--run-local` usando únicamente comandos del perfil estático; rechazar comandos, rutas o IDs inyectados por el manifest.
- [x] 2.5 Exponer scripts npm explícitos para ambas fases y su prueba, sin engancharlos todavía a `openspec:check` ni a CI bloqueante.

## 3. Instrucciones, workflows y documentación

- [x] 3.1 Actualizar `.agents/instructions/core.md` y `openspec/config.yaml` con el uso de DoR/DoD, metadata, matriz y excepciones; regenerar los espejos con el generador existente.
- [x] 3.2 Extender `scripts/patchOpsxWorkflows.mjs` para insertar y comprobar la guía de gate en `propose` y `archive` después de cada update de OpenSpec.
- [x] 3.3 Actualizar la documentación operativa/SDD y el issue #62 con el formato de metadata y las recuperaciones, preservando la historia original.
- [x] 3.4 Verificar que la ampliación no duplica ni altera las responsabilidades de `harnessDoctor.mjs`, `openspec:check` o los workflows propiedad de la CLI.

## 4. Fixtures y pruebas

- [x] 4.1 Crear fixtures y pruebas inyectables para issue/change completo, campos faltantes, JSON inválido, Project inaccesible, ruta fuera del change y tareas/evidencia/rollback ausentes.
- [x] 4.2 Cubrir excepción válida, excepción vencida y excepción de campo no permitida; comprobar códigos de salida y remediaciones sin secretos.
- [x] 4.3 Cubrir perfiles `docs`/`harness` y al menos un perfil de UI que exija evidencia manual sin ejecutar comandos arbitrarios.
- [x] 4.4 Ejecutar las pruebas nuevas y `npm run openspec:check`, `npm run agent:harness:check` y `npm run agent:opsx:patch:check` con salidas adjuntables al issue.

## 5. Cierre de la implementación

- [x] 5.1 Ejecutar typecheck, lint y las pruebas focalizadas del checker; corregir cualquier regresión antes de marcar tareas.
- [ ] 5.2 Ejecutar el gate sobre #62 y el change de prueba con evidencia válida e inválida, y registrar en el issue los resultados y las excepciones si existieran.
- [ ] 5.3 Solicitar revisión adversarial del diff, resolver hallazgos bloqueantes y confirmar que el rollback descrito funciona sin borrar changes ni evidencia.

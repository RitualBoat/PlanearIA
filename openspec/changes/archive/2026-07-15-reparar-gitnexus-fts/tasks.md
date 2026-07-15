## 1. Diagnostico y decision de compatibilidad

- [x] 1.1 Capturar en la evidencia el baseline degradado: version de Node y GitNexus, commit/index, diagnostico FTS, query MVVM vacia e impact por UID.
- [x] 1.2 Probar de forma controlada una version exacta de GitNexus sobre el runtime activo con `analyze --repair-fts --index-only`, sin ejecutar `setup` ni modificar configuracion global.
- [x] 1.3 Aceptar y registrar una version exacta solo si pasa el contrato completo; si ninguna pasa, mover #50 a `Blocked`, conservar la evidencia y pedir decision sobre runtime o politica temporal.

## 2. Contrato de tooling reproducible

- [x] 2.1 Agregar los comandos/wrapper versionados de diagnostico, repair y verify, manteniendo el indice generado como unico efecto mutable.
- [x] 2.2 Implementar el verificador que falle ante diagnostico FTS, query sin contexto o impact ambiguo, y que use el fixture UID de `useCrearPlaneacionViewModel`.
- [x] 2.3 Agregar una prueba o smoke determinista del verificador, incluidos el caso sano, el diagnostico FTS y la deteccion de cambios inesperados en archivos de agentes.

## 3. Documentacion y evidencia

- [x] 3.1 Actualizar los comandos oficiales desde `.agents/instructions/core.md` si cambian, generar sus espejos y comprobar la paridad del harness.
- [x] 3.2 Documentar en los runbooks la reparacion index-only, el rollback del indice local, el uso de UID y el criterio de fallback de CodeGraph.
- [x] 3.3 Crear evidencia versionada del antes/despues, la version aprobada, los resultados de query/impact y la decision tomada si la compatibilidad falla.

## 4. Validacion y cierre de change

- [x] 4.1 Ejecutar el smoke/prueba de GitNexus, `npm run typecheck`, `npm run lint -- --quiet`, `npm run agent:harness:check` cuando aplique y `npm run openspec:validate`.
- [x] 4.2 Confirmar que `git status` no contiene artefactos GitNexus ni cambios inyectados fuera del alcance, adjuntar la evidencia al issue #50 y actualizar su estado de Project segun el resultado.
- [x] 4.3 Realizar review adversarial de rollback, version/runtime, false-green de `status` y dependencia de CodeGraph antes de archivar.

## Intención de la propuesta

Este change hace comprobable que un trabajo OpenSpec esté preparado antes de proponer y realmente terminado antes de archivar. Evita avanzar con un issue sin contexto, evidencia, rollback o alcance claro, sin reemplazar las decisiones humanas ni volver el flujo más costoso de lo necesario.

## Enfoque de diseño

Se añadirá un checker Node read-only con fases para issue y change. Usará JSON pequeño y versionado, perfiles fijos por superficie y excepciones temporales visibles. Reutiliza los checks de OpenSpec y paridad existentes, sin ejecutar comandos entregados por un manifest ni convertir al doctor del harness en otro gate.

## Comportamiento esperado de la spec

Antes de propose se comprueban issue, Project, enrich y datos de readiness. Antes de archive se comprueban artefactos, tareas, matriz proporcional, evidencia, rollback y revisión adversarial. Cada resultado es PASS, FAIL o EXCEPTION, con recuperación segura. Las excepciones incompletas, vencidas o que oculten integridad fallan.

## Plan práctico de tareas

Primero se define el contrato y perfiles. Luego se crea el checker y sus comandos. Después se actualizan instrucciones fuente, parche de workflows y documentación. Finalmente se añaden fixtures de casos válidos y negativos, se verifican los checks actuales y se registra evidencia para una revisión adversarial posterior.

## Resumen integral del change

El resultado será un flujo SDD más confiable y explicable: cada change tendrá trazabilidad desde el issue hasta el archive y validaciones adecuadas a su riesgo. Se mantienen los límites actuales: no hay aplicación automática, no hay nuevo bloqueo global de CI y no se sustituye QA visual, auditoría ni aprobación humana.

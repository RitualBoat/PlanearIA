# TLDR: normalizar Product OS de readiness

## Intencion de la propuesta

La propuesta evita que el plan de readiness parezca cerrado o bloquee trabajo por estados antiguos. Conserva la epic #42 y los gates reales, cierra solo ciclos históricos comprobados y mantiene #66 como deuda separada. No cambia la aplicación ni resuelve GitNexus o Expo.

## Enfoque de diseño

El diseño usa una fotografía de GitHub CLI antes y después de cada acción. Una matriz conservadora decide qué se conserva, aparca o cierra. No se renombra nada. Si el estado externo cambió, apply se detiene. Toda operación es reversible sin borrar historial.

## Comportamiento exigido por la spec

El Product OS debe distinguir trabajo terminado, activo, aparcado y deuda posterior. Los milestones solo se cierran si no tienen trabajo abierto ni plan vigente. #66 se mantiene abierta en Backlog, fuera de Ola 0, y cada remediación futura tendrá su propio ciclo OpenSpec.

## Plan práctico de tareas

Primero se confirma la evidencia. Después se actualizan las dos fuentes documentales. Solo entonces se aplican las decisiones externas aprobadas, se consulta GitHub otra vez y se validan los artefactos. El archive exige evidencia real, PR, revisión adversarial y gate de cierre verde.

## Resumen integral del change

Este change ordena el seguimiento operativo del plan sin convertir gobernanza en trabajo de producto. Mantiene visibles los gates R2, cerró milestones históricos verificables y evita que los hallazgos posteriores del doctor se mezclen con #65. Cada mutación externa quedó explícita, verificable y reversible.

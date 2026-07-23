# TLDR: endurecer-gates-harness-ci

## Intención de la propuesta

El issue #136 corrige cuatro gates que podían terminar verdes sin ejecutar su CLI en Linux y elimina el modo advisory indiscriminado del workflow de harness. El resultado buscado es evidencia confiable antes de que un PR avance.

## Enfoque técnico del diseño

Los guards usan la URL de archivo que Node normaliza. Las pruebas lanzan procesos reales en Windows y Linux. El workflow bloquea checks estabilizados y no cambia configuración remota de protección.

## Comportamiento exigido por las specs

Cada CLI debe emitir evidencia semántica o un fallo accionable; salida vacía no vale como PASS. El fixture de codificación conserva sus seis hallazgos dentro de su prueba, y las señales inesperadas siguen siendo visibles.

## Plan de trabajo verificable

Primero se registra el baseline, después se corrigen guards, señal y CI. Finalmente se ejecutan pruebas locales y cruzadas, auditoría de dependencias, assessment de remediación, revisión adversarial y gate de archive.

## Resumen integral del change

Este cambio fortalece la infraestructura SDD sin tocar datos docentes, UI, backend, Expo ni SheetJS. Resuelve la deuda de checks advisory con evidencia reproducible y preserva un rollback limitado a revertir el PR.

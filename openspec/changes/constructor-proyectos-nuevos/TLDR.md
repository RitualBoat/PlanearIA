## La propuesta limita la primera entrega al núcleo universal

La Ola 0 extrae la disciplina operativa de PlanearIA sin copiar su aplicación ni decidir todavía qué
producto o stack se construirá. Entrega un constructor ejecutable para repositorios vacíos, con OpenSpec
local, gobernanza, harnesses, doctor read-only, CI advisory, fixtures, rollback, documentación y Prompt 00.
Prompt 01 queda instalado como handoff inerte, pero su ejecución, los perfiles técnicos y el código de
producto quedan para olas posteriores.

## El diseño usa un CLI neutral como única fuente ejecutable

Un paquete Node autocontenido posee schema, blueprint, renderers, estado, transacciones y migraciones.
Templates, prompts y un posible template repository son adaptadores del mismo motor. Ownership y hashes
protegen archivos humanos; journals y backups permiten reanudar o revertir. Los workflows OPSX siguen bajo
ownership de OpenSpec. Los cinco harnesses declaran capacidades y degradaciones en vez de fingir paridad
idéntica.

## Las specs convierten la intención en comportamiento comprobable

Cuatro capacidades cubren bootstrap, gobernanza, harness y doctor. Exigen repositorio vacío, segundo run
sin drift, OpenSpec local fijado, Product OS declarativo, documentación encontrable, perfiles inactivos,
gates DoR/DoD read-only, sync/check determinista y doctor humano/JSON sin side effects. Separan
configuración MCP, startup, listado y smoke autenticado; Graphify queda `SKIP`. Los escenarios negativos
protegen colisiones, secretos, timeouts, falsos verdes y rollback con ediciones posteriores.

## Las tareas construyen y prueban el sistema por capas

El trabajo empieza con package/schema y documentación, continúa con blueprint, transacciones, harness y
doctor, y termina con fixtures, CI y evidencia. Cada checkbox requiere un resultado verificable. No hay
QA visual porque el change no toca UI. La fixture vacía, el fallo parcial, la reanudación, el segundo run,
el diff por harness y la prueba de no mutación del doctor forman el gate técnico principal.
El pase real del pre-archive detectó `DEP0190`; el runner Windows se corrigió sin `shell: true` y quedó
cubierto contra argumentos con metacaracteres.

## Resumen integral del change

`constructor-proyectos-nuevos` convierte prácticas maduras pero acopladas en un núcleo portable,
actualizable y recuperable para proyectos futuros. La arquitectura híbrida evita que templates y prompts
se conviertan en fuentes paralelas. El primer change se mantiene deliberadamente anterior al discovery:
prepara el terreno, demuestra idempotencia y deja las decisiones de producto para después. El cierre exige
fixtures verdes, doctor sin `FAIL` injustificados, neutralidad, revisión adversarial y PR con checks reales.

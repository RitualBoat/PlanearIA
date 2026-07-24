# TLDR: sanear-correctitud-react-uxui

## Intencion del Proposal (por que existe)

El plan UX/UI esta pausado 5/5 por presupuesto de deuda. Tres hallazgos de correctitud React son,
juntos, la totalidad de los 11 errores que reporta React Doctor full: SyncContext muta refs durante
render (el estado que observa la sincronizacion puede no corresponder al commit visible), tres
efectos con cleanup no verificable (posible fuga tras unmount) y cuatro actualizadores de estado
impuros (historial, dirty-state y temporizador se corrompen bajo replay). Este change (issue #143,
epic #141) los resuelve para dejar React Doctor full en 0 errores sin cambiar comportamiento.

## Enfoque del Design (como se resuelve)

Tres decisiones. SyncContext: mover las cuatro escrituras de refs a un efecto post-commit,
conservando el patron latest-value ref y la estabilidad de `syncNow` (sin re-suscribir efectos).
Cleanup: refactor que preserva el comportamiento hacia una forma de cleanup que la regla reconoce,
verificado re-corriendo React Doctor por archivo. Updaters: sacar `clearInterval` del updater del
temporizador (updater puro + efecto de parada) y reemplazar la maquina de historial del editor por un
`useReducer` con transiciones puras y atomicas, idempotente ante la doble invocacion de React.

## Comportamiento esperado del Spec (que se promete)

El orquestador de sincronizacion observa solo estado committeado y `syncNow` permanece estable sin
re-suscribir intervalo, foreground ni conectividad. Los efectos marcados liberan su suscripcion,
listener o animacion al desmontar, sin ejecutar callbacks tras el unmount. Los actualizadores del
editor y del temporizador son puros: undo/redo, dirty-state, el limite de 30 entradas y la cuenta
regresiva permanecen correctos cuando React invoca un updater mas de una vez. Sin delta de UI
visible: sync, animacion del pill, guard de navegacion, offline y undo/redo se conservan.

## Plan practico de Tasks (en que orden se hace)

Cuatro grupos. Primero SyncContext (efecto post-commit + test de frescura + React Doctor por archivo).
Segundo los tres cleanups de efectos con sus pruebas de montaje/desmontaje, cada uno verificado contra
React Doctor. Tercero los updaters: temporizador del reto puro y reducer del historial del editor,
cableando boot, autoguardado y guardado, con pruebas de undo/redo, dirty, limite e idempotencia. Al
final: React Doctor full 0 errores, typecheck, lint, suite completa sin ruido, test:sync,
test:debt-control, agent:harness:check, openspec:validate, revision adversarial, assessment y gate de
archive. Cada tarea se marca solo con evidencia.

## Resumen integral del change

Change de saneamiento del plan UX/UI que elimina los 11 errores de React Doctor (4 refs en render, 3
cleanups no verificables, 4 updaters impuros) sin cambiar comportamiento observable y sin tocar el
motor de sync, el storage ni la UI visible. No agrega dependencias ni deuda nueva: su assessment
resuelve `debt-9be074c6e888`, `debt-d6e2309f9e15` y `debt-ff7731773cc5` (3 unidades) y baja el
presupuesto del plan pausado de 5/5 a 2/5, por debajo del umbral, dejando solo la Ola 2
(theming/breakpoints) y la disposicion del optional-improvement.

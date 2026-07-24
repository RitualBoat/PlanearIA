# Spec: react-render-safety-remediation

Correctitud de runtime React en las superficies del plan UX/UI: el estado que observa la
sincronizacion corresponde al commit visible, los efectos liberan sus recursos al desmontar y los
actualizadores de estado son puros e idempotentes bajo replay.

## ADDED Requirements

### Requirement: El orquestador de sincronizacion observa solo estado committeado

El orquestador global de sincronizacion (`SyncContext`) SHALL mantener sus refs de ultimo valor
(`isOnline`, `syncEnabled`, `status`, `authError`) sincronizados con el estado committeado mediante un
efecto post-commit, y SHALL NOT mutar refs durante la fase de render. `syncNow` SHALL leer esos cuatro
valores solo desde estado que corresponde a un render committeado. La identidad de `syncNow` SHALL
permanecer estable ante cambios de esos estados, de modo que los efectos de intervalo, foreground y
conectividad no se re-suscriban.

#### Scenario: El render no muta refs

- **WHEN** se inspecciona el cuerpo de render del proveedor de sincronizacion
- **THEN** ninguna asignacion a `ref.current` ocurre durante la fase de render
- **AND** las asignaciones de refs viven en un efecto que corre tras el commit

#### Scenario: syncNow observa el ultimo estado committeado

- **WHEN** cambian `syncEnabled`, `isOnline`, `status` o `authError` y luego corre un ciclo de sync
- **THEN** `syncNow` usa el ultimo valor committeado de cada uno, no un valor de un render descartado

#### Scenario: syncNow permanece estable

- **WHEN** cambian esos estados de sincronizacion
- **THEN** la identidad de la funcion `syncNow` no cambia
- **AND** los efectos de intervalo, foreground y conectividad no se dan de baja ni se re-suscriben

### Requirement: Los efectos liberan sus suscripciones y timers al desmontar

Los efectos marcados SHALL retornar una funcion de cleanup que libere cada suscripcion, listener,
timer o animacion que asignan, verificable al desmontar el componente o hook, sin cambiar el
comportamiento observable.

#### Scenario: AnimatedTopPill se desmonta

- **WHEN** el componente `AnimatedTopPill` se desmonta
- **THEN** la animacion de glow se detiene y el listener de `focus` de navegacion se da de baja
- **AND** no se ejecutan callbacks del efecto tras el desmontaje

#### Scenario: useContenidoViewModel se desmonta

- **WHEN** el hook `useContenidoViewModel` se desmonta
- **THEN** el listener de conectividad de NetInfo se da de baja

#### Scenario: DocEditorScreen se desmonta

- **WHEN** la pantalla `DocEditorScreen` se desmonta
- **THEN** el listener `beforeRemove` de navegacion se da de baja
- **AND** el guard de cambios sin guardar deja de interceptar la navegacion

### Requirement: Los actualizadores de estado son puros

Los actualizadores de estado del editor de documentos (aplicacion de cambios, deshacer y rehacer) y
del temporizador del reto SHALL computar el proximo estado sin ejecutar efectos laterales ni
actualizaciones de estado anidadas dentro de la funcion updater. El historial (deshacer/rehacer),
el dirty-state, el limite de historial y el temporizador SHALL permanecer correctos cuando React
invoque un updater mas de una vez.

#### Scenario: El historial de undo/redo se conserva

- **WHEN** el docente edita el documento y luego deshace y rehace
- **THEN** el documento, el historial y el dirty-state resultan correctos
- **AND** el historial no crece por encima de su limite de 30 entradas

#### Scenario: El updater del editor es idempotente

- **WHEN** React invoca un actualizador de estado del editor mas de una vez para la misma transicion
- **THEN** el resultado es el mismo que con una sola invocacion
- **AND** no se dispara ningun efecto lateral adicional ni se duplica una entrada de historial

#### Scenario: El temporizador del reto limpia fuera del updater

- **WHEN** el temporizador del reto llega a cero o la pantalla se desmonta
- **THEN** el intervalo se limpia fuera de la funcion updater de `setTimeLeft`
- **AND** el updater de `setTimeLeft` solo computa el proximo valor

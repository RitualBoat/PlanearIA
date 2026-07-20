# opsx-change-closure Delta

## ADDED Requirements

### Requirement: El cierre ejecuta una red de seguridad de deuda posterior al merge

Cuando el motor de deuda esta configurado, el comando de cierre SHALL ejecutar, despues de confirmar
el merge remoto y actualizar el target local, una comprobacion final de deuda que recalcula el estado
del registro y sincroniza el expediente GitHub segun el modo configurado. Un resultado FAIL de esta
comprobacion SHALL reflejarse en la salida y en el exit code del cierre con causa y recuperacion; un
WARN SHALL reflejarse en la salida con su causa sin alterar el exit code. Ningun resultado SHALL
revertir el merge ya realizado ni presentarse como exito cuando no lo es. Si el motor no esta
configurado, el cierre SHALL reportar la comprobacion como omitida de forma explicita.

#### Scenario: Cierre que detecta una pausa aun no reconocida

- **WHEN** el merge remoto termina, un plan esta pausado y su expediente aun no lo refleja (el issue de
  remediacion se crea en esta ejecucion o la sincronizacion requerida falla)
- **THEN** el cierre reporta el trigger y el issue o el fallo de sincronizacion
- **AND** termina con exit code distinto de cero explicando que el merge ya ocurrio y que sigue

#### Scenario: Cierre con pausa ya reconocida

- **WHEN** el merge remoto termina y los planes pausados ya tienen su expediente al dia (issue de
  remediacion existente y sincronizacion sin cambios, o modos advisory/off con registro local)
- **THEN** la comprobacion reporta la pausa como WARN visible con su causa
- **AND** el cierre termina con exito sin presentar la pausa como resuelta

#### Scenario: Cierre limpio

- **WHEN** el merge remoto termina y el registro no tiene triggers activos
- **THEN** la red de seguridad reporta PASS y el cierre conserva su salida habitual

#### Scenario: Motor ausente

- **WHEN** el repositorio no tiene politica de deuda configurada
- **THEN** el cierre reporta la comprobacion de deuda como omitida y continua sin fallo

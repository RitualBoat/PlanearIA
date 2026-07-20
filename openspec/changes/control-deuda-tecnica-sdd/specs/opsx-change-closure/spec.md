# opsx-change-closure Delta

## ADDED Requirements

### Requirement: El cierre ejecuta una red de seguridad de deuda posterior al merge

Cuando el motor de deuda esta configurado, el comando de cierre SHALL ejecutar, despues de confirmar
el merge remoto y actualizar el target local, una comprobacion final de deuda que recalcula el estado
del registro y sincroniza el expediente GitHub segun el modo configurado. Un resultado FAIL o WARN de
esta comprobacion SHALL reflejarse en la salida y en el exit code del cierre con causa y recuperacion,
sin revertir el merge ya realizado y sin presentarse jamas como exito. Si el motor no esta
configurado, el cierre SHALL reportar la comprobacion como omitida de forma explicita.

#### Scenario: Cierre con deuda que cruza el umbral

- **WHEN** el merge remoto termina y el registro cruza un trigger de saneamiento
- **THEN** el cierre reporta el trigger, sincroniza o nombra el issue de remediacion segun el modo
- **AND** termina con exit code distinto de cero explicando que el merge ya ocurrio y que sigue

#### Scenario: Cierre limpio

- **WHEN** el merge remoto termina y el registro no tiene triggers activos
- **THEN** la red de seguridad reporta PASS y el cierre conserva su salida habitual

#### Scenario: Motor ausente

- **WHEN** el repositorio no tiene politica de deuda configurada
- **THEN** el cierre reporta la comprobacion de deuda como omitida y continua sin fallo

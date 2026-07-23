# TLDR

## Intención de proposal

Evitar que una pausa de deuda reconocida bloquee un job explícitamente advisory.

## Enfoque de design

Ejecutar deuda, avisar de forma visible y mantener bloqueantes los contratos reales.

## Comportamiento de spec

Pausa legítima: warning; contrato roto: fallo.

## Plan de tareas

Ajustar el workflow, probarlo y cerrar con assessment limpio.

## Resumen integral del change

La CI advisory conserva señal sin producir un falso verde ni impedir un merge ajeno.

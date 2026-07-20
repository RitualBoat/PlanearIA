# TLDR: control-deuda-tecnica-sdd

## Que problema ataca (Proposal)

Hoy, cuando un agente termina un flujo SDD, los avisos y hallazgos residuales quedan como texto suelto
y se olvidan. Este change crea un motor verificable de control de deuda tecnica: cada hallazgo se
clasifica, se verifica con evidencia y entra a un registro con presupuesto. Cuando la deuda cruza un
limite, el sistema pausa el plan afectado, crea un issue de saneamiento y exige atacarla antes de
seguir. Cierra el issue #128 y desbloquea la publicacion open source (#126).

## Como se construye (Design)

Un nucleo neutral en `tools/debt-control/` (Node puro, sin dependencias, reutilizable en otros
proyectos) con comandos para verificar, capturar, sincronizar con GitHub y generar prompts de relevo.
El estado vive en `.project-os/debt/`: politica, registro canonico y assessments historicos
inmutables. Los gates existentes de propose y archive ganan verificaciones de deuda, y el cierre de un
change ejecuta una red de seguridad despues del merge. La pausa se deriva de los datos: no hay switch
manual.

## Que comportamiento garantiza (Spec)

Todo cierre SDD produce un assessment, incluso limpio. Blockers y Majors bloquean de inmediato; los
Minors consumen presupuesto (umbral 5). Cinco flujos con deuda, tres reapariciones del mismo hallazgo
o una excepcion vencida disparan saneamiento. Solo se pausa el plan afectado, salvo deuda critica
transversal. GitHub funciona en modos required, advisory y off sin falsos exitos, con un issue de
remediacion idempotente por plan. Los warnings de scanners nunca se vuelven deuda sin verificacion.

## Plan de trabajo (Tasks)

Primero el nucleo con sus modulos y pruebas (esquema, presupuesto, captura idempotente, GitHub
simulado, prompts). Despues la integracion en PlanearIA: configuracion real, gates, cierre y scripts.
Luego el blueprint del constructor y la documentacion operativa. Al final, el baseline real: se audita
la deuda actual de PlanearIA candidato por candidato, se captura con el motor y, si el presupuesto se
agota, se crea el issue de saneamiento y se pausa el plan. Cierra una revision adversarial.

## Resumen integral del change

Este change convierte los avisos olvidados de los agentes en deuda gobernada: verificada, registrada,
presupuestada y con freno automatico. Un desarrollador solo recibe orientacion clara: que se encontro,
que tan grave es, si conviene seguir en el mismo chat o abrir uno nuevo con un prompt listo, y que
condiciones reabren un plan pausado. El motor es neutral y reutilizable: servira igual en PlanearIA
que en el futuro Project Engineering OS, sin depender de React, Expo ni GitHub obligatorio.

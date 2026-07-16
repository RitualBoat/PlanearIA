## 1. Confirmar la evidencia y las guardas de gobernanza

- [x] 1.1 Consultar de nuevo Project 1, #42, #44, #46 a #52, #62 a #66 y los milestones; guardar en la documentacion la fotografia previa con fecha, conteos y enlaces.
- [x] 1.2 Comparar la fotografia con la matriz de `design.md`; detener apply y actualizar la propuesta si una edicion concurrente cambia una decision, dependencia o conteo relevante.
- [x] 1.3 Mantener #65 como el unico change versionable activo y confirmar que #66 sigue abierto, en `Backlog`, sin milestone de Ola 0 y sin correcciones de GitNexus/Expo incluidas en este trabajo.

## 2. Actualizar las fuentes versionadas de Product OS

- [x] 2.1 Actualizar `Documentacion/02-operacion/GITHUB_PRODUCT_OS.md` con el ciclo de vida conservador de milestones, la evidencia requerida y la regla de no renombrar/cerrar por estetica.
- [x] 2.2 Actualizar `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md` con el tracking real de Ola 1, Gate M/R2, la decision de milestones y la clasificacion post-Ola 0 de #66.
- [ ] 2.3 Actualizar `readiness.json` con referencias reales de validacion, issue, PR, evidencia documental y rollback a medida que esten disponibles; no registrar comandos arbitrarios ni evidencia pendiente como final.

## 3. Aplicar unicamente las decisiones externas aprobadas

- [x] 3.1 Al iniciar apply, mover el item de #65 de `Backlog` a `In progress`; conservar #42 abierta/en progreso y ampliar su seguimiento de Ola 1 sin cerrar ni renombrar la epic.
- [x] 3.2 Conservar #46 y #47 abiertos en `Parked`; documentar que siguen bloqueando R2 y no satisfacen el gate por estar diferidos.
- [x] 3.3 Clasificar #66 en su issue como deuda operacional post-Ola 0, enlazar su origen #52 y sus dos remediaciones futuras independientes, sin cambiarlo de `Backlog`, asignarle milestone, marcarlo Done ni crear esos changes.
- [x] 3.4 Tras comprobar que no tienen issues abiertos, cerrar solo los milestones `Ciclo 0 - Reorientacion y GitHub`, `Ciclo 1 - Plan Classroom`, `Ciclo 2 - Fundacion Classroom`, `Ciclo 3 - Infraestructura Local y CI` y `Readiness Ola 0`.
- [x] 3.5 Conservar abiertos `Ciclo 3 - UX/Navegacion Global`, `Ciclo 4 - Auth y Seguridad` y `Readiness Gate M`; no renombrar ningun milestone y registrar el motivo de cada conservacion.
- [x] 3.6 Reconsultar GitHub despues de cada lote, adjuntar la evidencia a #65/#42 y confirmar que ninguna accion afecto issues, items o milestones fuera de la matriz.

## 4. Validar, revisar y preparar el cierre posterior

- [x] 4.1 Ejecutar `npm exec --yes=false -- openspec validate --all --strict --no-interactive` y `npm run openspec:validate`; corregir cualquier regresion atribuible a los artefactos o documentos del change.
- [x] 4.2 Verificar con GitHub CLI la matriz final, estados Project y ausencia de mutaciones ajenas; enlazar la salida relevante al issue #65 sin exponer tokens.
- [x] 4.3 Solicitar revision adversarial independiente, resolver blockers/majors y registrar su referencia real en `readiness.json`.
- [ ] 4.4 Vincular el PR y la evidencia documental reales en `readiness.json`; el archive ejecutara su gate DoD y no movera el change mientras exista algun `FAIL`.

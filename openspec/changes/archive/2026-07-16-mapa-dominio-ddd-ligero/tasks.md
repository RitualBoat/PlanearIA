## 1. Mapa estratégico de dominio

- [x] 1.1 Contrastar el inventario de módulos, Contexts, servicios, `src/sync`, rutas backend y documentación fundamental para registrar el owner técnico actual de cada límite.
- [x] 1.2 Crear `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md` con glosario, seis contextos, fronteras y declaración explícita de monolito modular sin microservicios.
- [x] 1.3 Completar la matriz de entidades con owner único, consumidores, referencia permitida e invariantes para las entidades especificadas.
- [x] 1.4 Documentar Sync/offline, adjuntos, notificaciones, seguridad/autorización y asistencia IA como capacidades transversales, incluyendo consultas de decisión de Classroom, Contenido, Comunicación y Sync o IA.
- [x] 1.5 Enlazar el mapa desde la arquitectura o el índice fundamental correspondiente y comprobar su encontrabilidad desde las entradas de agentes.

## 2. Contrato proporcional para changes cruzados

- [x] 2.1 Actualizar las instrucciones de `design` en `openspec/config.yaml` para exigir contextos afectados y una declaración explícita de no contrato en changes intra-contexto.
- [x] 2.2 Definir en esas instrucciones el contenido mínimo de un contrato cruzado: owner, consumidores, dirección y forma, compatibilidad e invariantes aplicables.
- [x] 2.3 Verificar que la regla no exige microservicios, CQRS, event sourcing, colas paralelas ni providers nuevos.

## 3. Validación y evidencia documental

- [x] 3.1 Revisar la matriz y las consultas de ejemplo contra los escenarios de `strategic-domain-map` y `cross-context-change-contract`.
- [x] 3.2 Ejecutar `npm exec --yes=false -- openspec validate --all --strict --no-interactive` y corregir cualquier fallo atribuido al change.
- [x] 3.3 Ejecutar `npm run agent:harness:check` y registrar el resultado proporcional a la superficie `docs`.
- [x] 3.4 Vincular al issue #63 las consultas de ejemplo, las validaciones y el diff documental sin exponer datos sensibles.

## 4. Cierre SDD posterior a la aprobación de apply

- [x] 4.1 Solicitar una revisión adversarial independiente del diff y registrar su referencia en `readiness.json`.
- [x] 4.2 Completar las referencias de PR y evidencia para el gate de archive.

El archive y la sincronización de specs son la fase formal posterior a estas tareas; se ejecutan solo después de que el gate `openspec:ready:archive` pase.

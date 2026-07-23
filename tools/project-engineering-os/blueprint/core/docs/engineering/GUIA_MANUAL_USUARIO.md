# Guía manual del usuario

| Momento | Acción humana | Verificación | Evidencia |
|---|---|---|---|
| Etapa A | Elegir repo, licencia y versión exacta | Git root y versión | decisión/SHA |
| Cierre A | Aprobar núcleo sin producto | doctor y sync check | JSON/log |
| GitHub | Autenticar y aprobar Project/ruleset | `gh auth status` y dry-run | URL |
| Discovery | Responder y aprobar visión | resumen sin contradicciones | issue |
| Perfil | Elegir ADR y perfiles | tradeoffs, costo, rollback | ADR |
| Secretos/OAuth | Crear credenciales fuera de Git | smoke sin valor impreso | evidencia redactada |
| Release | Aprobar tag/publicación | CI, checksum, provenance | URLs |
| Incidente | Aprobar rollback/deprecación | runbook y estado | issue/PR |

Un agente preguntará si deseas continuar o recibir un prompt para chat nuevo. Recomendará chat nuevo
cuando el contexto mezcle discovery, investigación extensa o implementación grande. El relevo incluirá
objetivo, hechos, decisiones, rutas, comandos, gates, rollback y prohibiciones, nunca secretos.

Entrevistas, aprobaciones y OAuth son gates manuales, no changes ficticios. Si una decisión produce código
o documentación versionada, esa escritura sí sigue SDD.


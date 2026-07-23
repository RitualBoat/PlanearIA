# Guía manual del usuario

Estas acciones requieren una persona porque implican intención, identidad, costo, términos o riesgo
remoto.

| Momento | Acción humana | Cómo verificar | Evidencia |
|---|---|---|---|
| Antes de Etapa A | Elegir repo, licencia del producto y versión del paquete | Git root y versión exacta | URL/SHA y decisión |
| Después de bootstrap | Aprobar que solo existe núcleo universal | doctor, sync check y diff | salida JSON |
| GitHub | Autenticar `gh` y aprobar creación de Project/ruleset | `gh auth status`, plan dry-run | URL y captura/log |
| Discovery | Responder y aprobar visión/restricciones | resumen sin contradicciones | issue/decisión |
| Perfil técnico | Elegir ADR y perfiles | tradeoffs, costo, licencia, rollback | ADR aprobado |
| Secretos/OAuth | Crear credenciales fuera del repo | nombre presente, valor no impreso | smoke redactado |
| Release | Aprobar tag y publicación | CI, checksum, provenance | URLs de release/npm |
| Incidente | Decidir deprecación, rotación o rollback | runbook y estado remoto | issue/PR |

Un agente debe preguntar si conviene continuar en el mismo chat o generar un prompt para uno nuevo. Debe
recomendar chat nuevo cuando el contexto mezcle discovery, implementación extensa o investigación ajena
al change. El prompt de relevo incluirá objetivo, hechos verificados, decisiones, rutas, comandos, gates,
rollback y prohibiciones; nunca secretos.

Entrevistas, aprobaciones y clics OAuth son gates trazables, no changes ficticios. Si su respuesta produce
código o documentación versionada, esa escritura sí sigue SDD.


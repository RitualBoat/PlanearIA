# PROMPT_01_DISCOVERY_PROYECTO

Este prompt es independiente. Úsalo después de aprobar la Etapa A.

```text
Actúa como Principal Engineer, product architect y entrevistador técnico. Conduce la Etapa B antes de
elegir tecnología; después prepara la recomendación de Etapa C. No escribas código de producto, instales
dependencias, actives perfiles o servicios durante la entrevista.

Gate inicial:

1. Lee AGENTS.md y docs/engineering/README.md.
2. Verifica versión exacta instalada, segundo sync sin drift, doctor read-only sin FAIL no justificados,
   OpenSpec/OPSX sanos, perfiles limitados a documentation y harness-tooling, `project-os debt check` sin
   pausa y aprobación humana para discovery.
3. Confirma que no existe otro change grande ni trabajo superpuesto.
4. Si falta evidencia, reporta causa y recuperación; no comiences la entrevista.

Trabaja en modo NORMAL. Entrevista una sección a la vez, adapta las preguntas a respuestas anteriores y
resume hechos, hipótesis, decisiones y preguntas abiertas. No preguntes primero qué stack quiero.

Orden mínimo:

1. Problema, visión y evidencia.
2. Usuarios, partes interesadas y trabajos principales.
3. Resultados, métricas, línea base y horizonte.
4. Alcance inicial, no objetivos y criterio de corte.
5. Tiempo, presupuesto, equipo y capacidad de mantenimiento.
6. Plataformas, distribución y restricciones operativas.
7. Datos, propietarios, sensibilidad, retención, privacidad, seguridad y cumplimiento.
8. Offline, sync, tiempo real, concurrencia y multiusuario.
9. IA, revisión humana, límites, proveedores, costos y fallback.
10. UX, accesibilidad, investigación, golden journeys y ground truth.
11. Integraciones y contratos externos.
12. Rendimiento, disponibilidad, recuperación y observabilidad.
13. Riesgos, pruebas, evidencia manual y casos negativos.
14. Preferencias/restricciones tecnológicas, tratadas como restricciones a evaluar.

Tracking:

- Usa .project-os/github/discovery-issues.json; busca duplicados antes de crear.
- Conserva texto original y agrega Enriquecida con historia, criterios observables, dependencias, owner,
  superficies, riesgos, evidencia, rollback y no objetivos.
- Crea o muta GitHub solo con autorización y autenticación. Entrevistas, OAuth y aprobaciones son gates
  manuales, no changes ficticios.

Cuando el discovery esté aprobado:

1. Propón visión versionada y DDD estratégico ligero solo si aporta valor.
2. Compara al menos dos stacks/arquitecturas viables usando costo total, mantenimiento, capacidad del
   developer, compatibilidad, privacidad, rendimiento, licencia, lock-in y rollback.
3. Recomienda una opción y presenta ADR propuesto y diff de perfiles/validaciones.
4. Define pruebas, evidencia manual, negativos, N/A y gate de cierre.
5. Propón plan maestro con olas; materializa solo ola activa y siguiente.
6. Detente para aprobación humana de arquitectura y perfiles.

Toda escritura versionada usa issue/Project, enrich, pre-propose y change SDD con proposal, design, specs
SHALL y WHEN/THEN, tasks, TLDR, brownfield baseline, readiness, evidencia, revisión adversarial y
assessment de deuda. Antes de archive, el gate debe rechazar Blockers/Majors o candidatos sin clasificar.

Al cerrar, pregunta si conviene continuar en este chat o generar un prompt excelente para uno nuevo.
Recomienda chat nuevo si la implementación técnica excederá un change pequeño o el contexto está cargado.
El relevo debe incluir decisiones, rutas, gates, comandos, rollback y prohibiciones, sin secretos.

Entrega gate inicial, resumen de entrevista, visión, mapa estratégico si aplica, alternativas, recomendación,
ADR, perfiles propuestos, riesgos/costos/licencias, gates humanos, issues activos/siguiente ola y alcance
del primer change. No declares producto listo por documentos, herramientas o tests verdes.
```


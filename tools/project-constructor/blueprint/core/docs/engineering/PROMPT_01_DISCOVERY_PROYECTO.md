# PROMPT_01_DISCOVERY_PROYECTO

Este prompt es independiente de Prompt 00. Está almacenado durante el bootstrap, pero no se ejecuta
automáticamente. Úsalo en una tarea nueva solo después de que una persona apruebe el cierre de la Etapa A.

```text
Actúa como responsable principal de producto y arquitectura. Tu objetivo es conducir el discovery antes de
elegir tecnología, producir decisiones versionables y preparar un perfil técnico verificable. No escribas
código de producto, no instales dependencias, no actives servicios ni cambies perfiles durante la entrevista.

Gate inicial obligatorio:

1. Lee AGENTS.md y docs/engineering/README.md.
2. Verifica evidencia existente de:
   - segundo bootstrap o sync sin drift inesperado;
   - doctor read-only sin FAIL no justificados;
   - OpenSpec local fijado y OPSX check aprobado;
   - perfiles activos limitados a documentation y harness-tooling;
   - gates manuales de repositorio, GitHub y secretos registrados;
   - aprobación humana explícita para comenzar discovery.
3. Si falta una evidencia, informa FAIL o pendiente con causa y recuperación. No entrevistes todavía.
4. Confirma que no hay otro change grande activo ni trabajo superpuesto.

Trabaja en modo NORMAL. No preguntes primero qué stack quiero. Conduce una entrevista adaptativa, una
sección a la vez, resume lo entendido y separa hechos, hipótesis, decisiones y preguntas abiertas.

Orden mínimo de la entrevista:

1. Problema, visión y evidencia de que el problema existe.
2. Usuarios, partes interesadas y trabajos principales.
3. Resultados esperados, métricas de éxito, línea base y horizonte.
4. Alcance inicial, no objetivos y criterios de corte.
5. Tiempo, presupuesto, equipo, capacidad de mantenimiento y licencias aceptables.
6. Plataformas, distribución y restricciones operativas.
7. Datos, propietarios, sensibilidad, retención, privacidad, seguridad y cumplimiento.
8. Necesidades de uso sin conexión, sincronización, tiempo real, concurrencia o multiusuario.
9. Necesidades de IA, revisión humana, proveedores permitidos, límites, costos y fallback.
10. UX, accesibilidad, investigación, recorridos críticos y fuentes de ground truth.
11. Integraciones y contratos externos.
12. Rendimiento, disponibilidad, recuperación y observabilidad.
13. Riesgos y estrategia de pruebas, evidencia manual, casos negativos y golden journeys.
14. Preferencias o restricciones tecnológicas. Trátalas como restricciones a evaluar, no como decisión
    automática.

Tracking del discovery:

- Usa .project-os/github/discovery-issues.json como paquete neutral de diez issues.
- Busca duplicados antes de crear o reutilizar un issue.
- Conserva el texto original y agrega una sección Enriquecida con contexto, criterios observables,
  dependencias, owner, superficies, riesgos, evidencia, rollback y no objetivos.
- Solo muta GitHub si existe autorización y autenticación explícitas. Si no, entrega el plan dry-run.
- Entrevistas, OAuth y aprobaciones son gates manuales; no inventes changes para simularlos.

Después de que el discovery sea aprobado:

1. Produce una visión versionada con problema, usuarios, resultados, alcance, no objetivos y métricas.
2. Propón glosario, contextos delimitados, propietarios de entidades, invariantes y contratos solo cuando
   ayuden al producto. No infieras microservicios, CQRS ni event sourcing.
3. Compara al menos dos alternativas viables de stack y arquitectura. Evalúa costo total, mantenimiento,
   capacidad del desarrollador, compatibilidad, rendimiento, privacidad, licencias, lock-in, migración y
   rollback con documentación oficial vigente.
4. Recomienda una opción y registra la decisión propuesta como ADR, incluyendo motivos, tradeoffs,
   consecuencias, fecha y condiciones para revisarla.
5. Presenta el diff propuesto de perfiles condicionales y validaciones específicas. La presencia de una
   herramienta no activa un perfil.
6. Define estrategia de pruebas, evidencia manual, casos negativos, condiciones N/A y gate de cierre para
   las superficies aprobadas.
7. Propón el primer plan maestro, sus olas y dependencias. Materializa issues solo para la ola activa y la
   siguiente.

Antes de versionar la visión, ADR, configuración técnica o perfiles, crea o reutiliza el issue y Project
item, enriquécelo y ejecuta `npm run sdd:ready:propose -- --issue <number>`. Cualquier escritura al
repositorio debe ocurrir mediante un change SDD aprobado con proposal, design, specs SHALL y WHEN/THEN,
tasks, TLDR.md, brownfield-baseline.md, readiness.json, evidencia y rollback. Antes de archive, ejecuta
`npm run sdd:ready:archive -- --change <kebab-case> --run-local` y resuelve cada FAIL.

Detente para aprobación humana al presentar la recomendación técnica y el diff de perfiles. Incluso con la
decisión aprobada, deja la instalación de frameworks, dependencias, bases de datos, proveedores y servicios
para un change SDD técnico separado. No inicies código de producto en esta tarea.

Entrega:

- estado del gate inicial;
- resumen de entrevista con hechos, hipótesis y preguntas abiertas;
- visión propuesta;
- mapa estratégico ligero, si aplica;
- matriz de alternativas y recomendación;
- ADR propuesto;
- perfiles y validaciones que se propone activar, sin activarlos;
- riesgos, costos, licencias, secretos y gates manuales;
- plan de issues activos/siguiente ola;
- alcance y evidencia esperada del siguiente change SDD;
- decisiones que requieren aprobación.

No declares producto listo por tener documentos, configuración, tests verdes o herramientas instaladas.
```

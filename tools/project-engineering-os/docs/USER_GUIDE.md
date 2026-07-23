# Guía del usuario

## Etapa A: núcleo universal

Ejecuta el quickstart del README en un repositorio Git vacío o revisa `bootstrap --dry-run` en uno
existente. Esta etapa instala gobernanza y tooling; no pregunta qué producto deseas crear.

Comprueba:

1. `npm run project-os:check`;
2. `npm run project-os:doctor`;
3. segundo `project-os sync --check` sin drift;
4. OPSX local generado por OpenSpec y estabilizado por `project-os opsx-adapt`;
5. política de deuda y paquete de discovery presentes;
6. gates humanos todavía pendientes, claramente declarados.

Usa el [Prompt 00](prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md) para guiar a un agente.

## Etapa B: discovery

Solo después de aprobar Etapa A, usa el [Prompt 01](prompts/PROMPT_01_DISCOVERY_PROYECTO.md). La
entrevista comienza por problema, usuarios, resultados y restricciones; el stack se compara después.

## Etapa C: perfil técnico

Una decisión versionada activa únicamente los perfiles necesarios. Frameworks, bases de datos, cloud,
IA, UI, offline/sync o testing visual se instalan mediante un change SDD posterior.

## Etapa D: producto

Crea visión, glosario/DDD estratégico cuando aporte valor, plan maestro, epic y solo issues de la ola
activa y siguiente. La primera entrega vertical recorre el ciclo SDD completo.

## Operación diaria

- `project-os sync --check` detecta drift sin escribir.
- `project-os doctor --json` entrega evidencia machine-readable.
- `project-os debt check` evalúa presupuesto y pausas sin mutar.
- `project-os upgrade --check` compara una release destino explícita.
- [Recuperación](RECOVERY.md) explica transacciones y rollback.


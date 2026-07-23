# PROMPT_00_BOOTSTRAP_ENTORNO

Copia únicamente el bloque siguiente en una tarea abierta en la raíz del repositorio nuevo.

```text
Actúa como Principal Engineer y prepara exclusivamente la Etapa A, el núcleo universal de ingeniería de
este repositorio. No preguntes todavía qué producto deseo crear. No elijas ni instales frameworks, bases
de datos, cloud, IA, UI o dependencias de aplicación.

Usa la versión exacta de Project Engineering OS que te indicaré como <VERSION_APROBADA>. Si falta esa
decisión, detente y pídela; no uses latest ni una copia improvisada.

1. Lee AGENTS.md si existe y clasifica Git root, working tree, trabajo activo y conflictos.
2. Comprueba Git, npm y Node ^20.20.0 o >=22.22.0 sin reparar automáticamente.
3. Si el repositorio tiene contenido, ejecuta primero:
   npx --yes create-project-engineering-os@<VERSION_APROBADA> bootstrap --target . --dry-run
   Revisa cada colisión y detente si requiere decisión humana.
4. Ejecuta:
   npx --yes create-project-engineering-os@<VERSION_APROBADA> bootstrap --target .
   npm ci
5. Genera workflows OPSX únicamente con la CLI OpenSpec local:
   npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
   npm run project-os:opsx:adapt
   No uses --tools all ni dupliques OPSX en el renderer general.
6. Ejecuta:
   npm run project-os:check
   npm run project-os:doctor
   npm run project-os:doctor:json
   npm run project-os:github-plan
   npm run project-os:bootstrap
   npm run project-os:check
7. Comprueba un segundo run sin drift, cinco harnesses, OpenSpec fijado, política/registro de deuda
   válidos y vacíos, diez issues neutrales de discovery, documentación encontrable y ausencia de
   decisiones de producto.
8. Revisa los gates SDD y Debt Control Loop. No inventes issue/change durante el bootstrap. No crees
   recursos GitHub, autentiques servicios, cambies branch protection o publiques nada sin autorización.
9. Presenta PASS/FAIL/WARN/SKIP con causa y recuperación, transaction ID, versión exacta, archivos
   administrados, gates manuales y rollback.
10. Pregunta si deseo recibir un prompt de relevo para ejecutar PROMPT_01_DISCOVERY_PROYECTO en un chat
    nuevo. Recomienda chat nuevo si el contexto actual contiene implementación o investigación extensa.

Doctor y checks son read-only: nunca instalan, reparan, autentican, actualizan o reindexan. No interpretes
SKIP, configuración presente o ausencia de checks como éxito. Termina antes del discovery.
```


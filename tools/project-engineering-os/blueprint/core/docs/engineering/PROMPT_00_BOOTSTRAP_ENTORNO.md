# PROMPT_00_BOOTSTRAP_ENTORNO

Copia este bloque en una tarea abierta en la raíz del repositorio:

```text
Actúa como Principal Engineer y completa exclusivamente la Etapa A de este repositorio. No preguntes qué
producto deseo crear y no instales frameworks, bases de datos, cloud, IA, UI ni dependencias de producto.

1. Lee AGENTS.md y clasifica Git root, working tree, conflictos y trabajo activo.
2. Comprueba Git, npm, la versión exacta de create-project-engineering-os y Node compatible.
3. Ejecuta `npm run project-os:bootstrap`; revisa colisiones y transaction ID.
4. Ejecuta `npm ci`.
5. Genera OPSX solo con:
   `npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode`
   y después `npm run project-os:opsx:adapt`.
6. Ejecuta `npm run project-os:check`, `npm run project-os:doctor`,
   `npm run project-os:doctor:json` y `npm run project-os:github-plan`.
7. Repite bootstrap/check y exige cero drift, cinco harnesses, política/registro de deuda válidos, diez
   issues neutrales de discovery y ninguna decisión de producto.
8. No autentiques, publiques o cambies GitHub sin autorización. Doctor nunca instala, repara o autentica.
9. Entrega PASS/FAIL/WARN/SKIP, causa, recuperación, versión, transaction ID, rollback y gates humanos.
10. Pregunta si deseo un prompt de relevo para PROMPT_01 en chat nuevo. Recomienda cambiar de chat si el
    contexto ya contiene implementación o investigación extensa.

No interpretes SKIP, configuración presente o checks ausentes como éxito. Termina antes del discovery.
```


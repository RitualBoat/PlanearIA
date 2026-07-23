# PROMPT_00_BOOTSTRAP_ENTORNO

> Copiar únicamente el bloque siguiente en el agente que preparará un repositorio nuevo.
> Este prompt no realiza discovery ni contiene templates del constructor.

```text
Actúa como Principal Engineer responsable de preparar un repositorio nuevo mediante el Constructor
reutilizable de proyectos.

OBJETIVO ÚNICO

Completa la Etapa A: instala y verifica el núcleo universal de gobernanza, SDD/OpenSpec, harnesses,
documentación, GitHub Product OS, doctor y CI del constructor. Al terminar, el entorno debe quedar listo
para iniciar discovery, pero no debes preguntar qué producto se construirá.

LÍMITES

- No preguntes por problema, usuarios, funcionalidades, stack, plataforma o arquitectura de producto.
- No instales frameworks, bases de datos, proveedores cloud, IA, auth, UI, offline, sync ni dependencias de
  producto.
- No uses @latest, una instalación global o descargas implícitas.
- No publiques, compres, autentiques, abras OAuth, actives branch protection ni crees recursos remotos sin
  el gate humano indicado.
- No expongas secretos ni valores de variables.
- No uses git reset --hard, borrado recursivo ni --force genérico.
- Graphify es SKIP retirado/manual y nunca bloquea.
- Si falta el CLI aprobado, detente: no recrees templates ni lógica desde este prompt.

FUENTES

1. Lee AGENTS.md si existe.
2. Usa `create-project-engineering-os@0.1.4`; verifica npm, licencia MIT, provenance y checksum de la
   release. No uses una versión flotante.
3. Lee el runbook y la guía manual distribuidos con ese paquete.
4. Trata el CLI como única fuente ejecutable. Los prompts y documentos solo lo orquestan.
5. Los workflows OPSX pertenecen a la CLI local fijada de OpenSpec, no al renderer general.

MODO DE TRABAJO

Usa NORMAL para preflight, ownership, conflictos, costos y gates. Usa CAVEMAN solo después de que el plan
de escritura sea inequívoco, para ejecutar comandos mecánicos, fixtures y validaciones. Vuelve a NORMAL si
aparece una decisión nueva.

PROCEDIMIENTO

1. Confirma la raíz Git, rama, writability y estado del working tree con acciones read-only.
2. Verifica que npm resuelve exactamente `create-project-engineering-os@0.1.4` y registra integridad y
   provenance sin imprimir credenciales.
3. Si el repositorio contiene archivos, previsualiza:

   npx --yes create-project-engineering-os@0.1.4 bootstrap --target . --dry-run

   Revisa las colisiones. Después ejecuta:

   npx --yes create-project-engineering-os@0.1.4 bootstrap --target .
   npm ci

4. Revisa antes de aceptar cualquier escritura:
   - ruta;
   - owner;
   - operación;
   - fuente canónica;
   - colisiones;
   - rollback.
5. Si hay una colisión no owned, detente sin sobrescribir y presenta recuperación.
6. `npm ci` materializa exclusivamente OpenSpec local desde el lockfile fijado. No uses una
   instalación global ni una versión flotante.
7. Genera OPSX solo mediante OpenSpec local y adapta sus bloques delimitados:

   npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
   npm run project-os:opsx:adapt

8. Verifica que solo estén activos los perfiles documentation y harness-tooling. Ejecuta:

   npm run project-os:check
   npm run project-os:doctor
   npm run project-os:doctor:json
   npm run project-os:github-plan

9. Interpreta PASS/FAIL/WARN/SKIP por evidencia:
   - configuración MCP no demuestra startup;
   - startup no demuestra tools/list;
   - tools/list no demuestra autenticación;
   - el doctor nunca ejecuta el smoke autenticado;
   - un check ausente no es éxito.
10. Ejecuta `npm run project-os:bootstrap` y después `npm run project-os:check`. Deben producir cero
    cambios inesperados.
11. Comprueba que AGENTS.md contiene el núcleo aunque el agente no soporte skills o MCP.
12. Comprueba paridad/degradación declarada para Codex, Claude Code, Cursor, OpenCode y GitHub Copilot.
13. Comprueba OpenSpec local fijado, lockfile y ausencia de fallback global.
14. Genera el plan dry-run de GitHub. Pide intervención humana únicamente para auth/scopes, Project,
    labels/estados, estrategia/protección de ramas y cualquier costo.
15. Después de las acciones humanas, repite solo los checks read-only afectados.
16. No ejecutes PROMPT_01_DISCOVERY_PROYECTO. Limítate a declarar si el entorno está listo para ejecutarlo
    en una sesión posterior.

STOP CONDITIONS

Detente y reporta sin mutar cuando:

- el paquete o hash no coincide;
- el destino no es Git o no es escribible;
- existe trabajo ajeno o una colisión;
- una acción requiere OAuth, pago, licencia o permisos administrativos;
- un perfil técnico intenta activarse;
- aparece un journal incompleto que requiere elegir resume o rollback;
- OpenSpec solo está disponible globalmente;
- doctor o sync --check tiene FAIL;
- CI/checks están ausentes y alguien pretende contarlos como éxito.

EVIDENCIA FINAL

Entrega:

- versión/integridad/provenance/SHA-256 del constructor y versiones Node/npm/OpenSpec;
- archivos y owners creados;
- resultado del primer bootstrap;
- prueba de segundo run sin drift;
- sync --check;
- doctor humano y JSON redactado;
- estados separados MCP config/startup/list/auth;
- perfiles activos e inactivos;
- github-plan y lista exacta de pasos humanos;
- rollback disponible;
- warnings/skips y su razón;
- confirmación explícita de que no se preguntó por el producto ni se instaló stack.

No declares éxito si alguna evidencia requerida falta. El resultado correcto puede ser “bloqueado con
recuperación concreta”.
```

# PROMPT_00_BOOTSTRAP_ENTORNO

Copy the text below into a new task opened at the root of an empty Git repository.

```text
Actúa como responsable principal de ingeniería y prepara exclusivamente el entorno universal de trabajo de
este repositorio. No me preguntes todavía qué producto quiero construir y no selecciones ni instales
frameworks, bases de datos, proveedores cloud, patrones de producto o dependencias de aplicación.

Usa el tarball local e inmutable del constructor y el SHA-256 esperado que te proporcionaré. Si falta el
tarball o el hash esperado, detente para pedirlos; no sustituyas el constructor por archivos improvisados
ni por una versión flotante de internet.

Procedimiento:

1. Comprueba en modo read-only la ruta raíz, Git, working tree, Node ^20.20.0 o >=22.22.0 y npm.
2. Confirma que no existe una ejecución parcial ni trabajo superpuesto.
3. Calcula el SHA-256 del tarball sin modificarlo, registra el valor observado y compáralo exactamente con
   el SHA-256 esperado. Si difiere, aborta antes de instalar. Después crea un runner temporal fuera del
   repositorio, instala ahí exclusivamente el tarball verificado y ejecuta una sola invocación inicial por
   ruta explícita:
   npm install --prefix "<RUNNER_TEMP_FUERA_DEL_REPO>" --ignore-scripts --no-audit --no-fund "<TARBALL_LOCAL_APROBADO>"
   node "<RUNNER_TEMP_FUERA_DEL_REPO>/node_modules/project-engineering-os-constructor/bin/project-constructor.mjs" bootstrap --target .
   No uses npx, registry, una caché precalentada ni fallback global.
4. Revisa el reporte, ownership, colisiones y transaction ID.
5. Ejecuta npm ci. Solo debe instalar la dependencia de gobernanza fijada; no agregues producto.
6. Genera OPSX por primera vez exclusivamente con la CLI OpenSpec local y la lista soportada exacta:
   npm exec --yes=false -- openspec init --tools codex,claude,cursor,github-copilot,opencode
   No uses --tools all ni generes esos workflows mediante el renderer general.
   Después ejecuta:
   npm run constructor:opsx:adapt
   El adaptador solo puede estabilizar los bloques neutrales delimitados de propose, apply y archive.
   Para actualizaciones futuras usa npm exec --yes=false -- openspec update y vuelve a ejecutar
   constructor:opsx:adapt.
7. Ejecuta:
   npm run constructor:sync:check
   npm run constructor:opsx:check
   npm run constructor:doctor
   npm run constructor:doctor:json
   npm run constructor:github-plan
   npm run constructor:bootstrap
   npm run constructor:sync:check
8. Verifica segundo run sin drift, cinco harnesses, diez payloads de discovery en dry-run, enlaces críticos
   en dos saltos, perfiles activos y ausencia de secretos o defaults de producto.
9. Revisa el plan de GitHub ya generado. No autentiques, no abras OAuth y no cambies GitHub todavía.
10. Confirma que el handoff documenta estos gates read-only para changes futuros:
    npm run sdd:ready:propose -- --issue <number>
    npm run sdd:ready:archive -- --change <kebab-case> --run-local
    No los ejecutes con un issue o change inventado durante el bootstrap. GitHub o Project no verificables
    deberán producir FAIL o una EXCEPTION temporal válida y visible cuando el trabajo SDD comience.
11. Entrégame resultados, rutas, comandos, PASS/FAIL/WARN/SKIP, recuperación, transaction ID y la lista
    exacta de gates humanos de docs/engineering/GUIA_MANUAL_USUARIO.md.

No declares éxito por configuración presente, checks ausentes o SKIP. No repares ni instales desde el
doctor. No publiques el constructor. Al terminar, detente antes del discovery.
```

# MCPs Y Flujos De IA - PlanearIA

> Estado: activo para el repo (2026-07-04).
> Objetivo: usar MCPs para ahorrar contexto, validar mejor y evitar accesos peligrosos a datos.

## Base Universal Del Proyecto

`.mcp.json` declara los MCPs seguros y utiles para cualquier agente que trabaje en PlanearIA:

| MCP | Uso principal | Regla |
| --- | --- | --- |
| `codegraph` | Rayos X del codigo: flujos, simbolos, impacto y tests relacionados. | Primero para preguntas estructurales. |
| `context7` | Docs actuales de librerias. | Usar antes de tocar APIs nuevas o dudosas. |
| `github` | Issues, PRs, Project y `enrich-us`. | Usar para leer/actualizar trabajo, no para reemplazar OpenSpec. |
| `figma` | Ground truth visual. | Obligatorio cuando la UI tenga diseno de referencia. |
| `vercel` | Deploys, logs y estado de web/backend. | Solo diagnostico/deploy operativo. |
| `expo` | Contexto Expo SDK 54 y proyecto local. | Para problemas Expo/dev-client/build. |
| `playwright` | Validacion visual web e interaccion end-to-end. | Obligatorio si un change OpenSpec toca UI. |
| `planearia-sqlite` | Inspeccion read-only de SQLite local opt-in. | Solo diagnostico; nunca activa SQLite como default. |

No se agregan por defecto Puppeteer, Browserless, Brave Search ni Fetch. Playwright ya cubre navegador local,
Context7 cubre documentacion actual, y el browsing manual sigue disponible cuando se necesita una fuente exacta.

El mismo set queda reflejado en las configs locales del usuario para Claude, Cursor, Codex, Gemini, Kiro,
VS Code, opencode y Hermes cuando el cliente soporta ese transporte. Figma usa MCP HTTP remoto y requiere
autenticacion OAuth dentro de cada cliente antes de listar herramientas; `codex mcp login figma` inicia ese
flujo en Codex.

Smoke test automatizado:

```bash
npm run mcp:test -- --timeout=90000
```

Este tester valida handshake `initialize` y `tools/list` de los servidores stdio/locales. Para servidores HTTP
remotos con OAuth, valida que la configuracion este presente y deja el login al cliente MCP.

## Flujo OpenSpec Recomendado

```text
Idea / issue
  -> GitHub MCP si viene de issue o Project
  -> CodeGraph para impacto real
  -> Context7 si toca librerias o APIs recientes
  -> Figma si toca UI con ground truth
  -> OpenSpec propose/design/tasks
  -> apply por tarea
  -> Playwright MCP si toca UI
  -> planearia-sqlite si toca cola SQLite/offline local
  -> MongoDB MCP opt-in solo si toca backend/sync remoto
```

Reglas:

- OpenSpec sigue siendo la fuente de decision; los MCPs solo traen evidencia.
- CodeGraph se usa antes de escribir specs cuando la pregunta sea "donde vive", "que llama a" o "que se rompe".
- Context7 se usa cuando una API pueda haber cambiado.
- Playwright debe dejar capturas o evidencia cuando hay UI.
- `planearia-sqlite` y MongoDB MCP no sustituyen tests de sync ni `backend:check`.

## MCP PlanearIA SQLite

Servidor local:

```bash
npm run mcp:sqlite
```

CLI equivalente para humanos o agentes sin MCP:

```bash
npm run sqlite:inspect -- locate
npm run sqlite:inspect -- overview --db C:\ruta\planearia_classroom.db
npm run sqlite:inspect -- sync-queue --db C:\ruta\planearia_classroom.db --limit 10
npm run sqlite:inspect -- recent --db C:\ruta\planearia_classroom.db --table sync_queue
```

Tambien se puede definir:

```powershell
$env:PLANEARIA_SQLITE_DB="C:\ruta\planearia_classroom.db"
npm run sqlite:inspect -- sync-queue
```

Herramientas expuestas por MCP:

- `planearia_sqlite_locate`
- `planearia_sqlite_overview`
- `planearia_sqlite_classroom_counts`
- `planearia_sqlite_sync_queue`
- `planearia_sqlite_recent_rows`

Seguridad:

- No hay herramienta de SQL arbitrario.
- El servidor abre la DB en modo read-only.
- Las tablas permitidas estan limitadas a Classroom, `sync_queue`, `failed_sync_ops` y `schema_migrations`.
- Por defecto resume `payload_json`; usar `includePayload: true` solo si hace falta revisar el dato completo.
- No activar SQLite como storage default por usar este MCP.

Prompt util:

```text
Usa planearia-sqlite para revisar la cola local SQLite. Primero localiza la DB; si no existe, dime que path necesitas.
No ejecutes SQL libre ni modifiques datos. Resume pending/failed por entidad y dime que prueba de sync recomiendas.
```

## MongoDB MCP Opt-In

MongoDB MCP es util para diagnosticar sync remoto y verificar aislamiento por `userId`, pero no queda activo en
`.mcp.json` porque necesita credenciales privadas.

Uso recomendado:

- Crear un usuario Atlas **read-only** para dev/staging.
- Usar una DB de desarrollo o staging, no datos reales de docentes.
- Pasar credenciales por variables de entorno, no por argumentos ni archivos versionados.
- Ejecutar con `--readOnly`, `--indexCheck` y telemetria desactivada.

Comando local:

```bash
npm run mcp:mongodb:readonly
```

Snippet para config local privada del IDE:

```json
{
  "mcpServers": {
    "mongodb-dev-readonly": {
      "command": "npx",
      "args": ["-y", "mongodb-mcp-server@latest", "--readOnly", "--indexCheck", "--telemetry", "disabled"],
      "env": {
        "MDB_MCP_CONNECTION_STRING": "mongodb+srv://READONLY_USER:READONLY_PASS@cluster.mongodb.net/planearia_dev"
      }
    }
  }
}
```

Prompt util:

```text
Usa MongoDB MCP read-only para verificar si el flujo X insertó documentos del userId fixture.
No actualices, no borres, no crees indices y no consultes otros usuarios.
Contrasta el resultado con backend:check o tests de aislamiento.
```

## Cuándo No Usar MCP

- Cambios simples de texto: editar directo.
- Refactors mecanicos: `rg`, typecheck y tests suelen bastar.
- Secretos o datos reales: no pasar a prompts ni MCPs.
- Sync productivo multiusuario: preferir tests y endpoints backend con fixtures controlados.

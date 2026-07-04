# CodeGraph MCP - PlanearIA

> Estado: activo localmente en esta maquina (2026-07-04).
> Proposito: reducir tokens y llamadas de herramientas al investigar codigo de PlanearIA.

## Que Queda Instalado

CodeGraph queda integrado en dos niveles:

1. Global en los agentes soportados del usuario: Claude Code, Cursor, Codex CLI, opencode, Hermes,
   Gemini CLI, Antigravity IDE y Kiro.
2. Local en este repo: `.mcp.json` declara el servidor `codegraph` y `.codegraph/` contiene el indice
   generado de PlanearIA.

El indice local se ignora por Git. Cada maquina debe generarlo con:

```bash
npm run codegraph:init
```

## Uso Diario Para IAs

Usar CodeGraph primero cuando la pregunta sea estructural:

- "como funciona X?"
- "donde vive X?"
- "que llama a X?"
- "que se puede romper si cambio X?"
- "que tests se relacionan con este archivo?"
- investigar un flujo antes de un change OpenSpec.

Fallback CLI si el MCP no aparece en la sesion:

```bash
npm run codegraph:explore -- "how does SyncContext reach entitySync and syncEngine?"
```

Regla practica:

- Si CodeGraph devuelve source blocks, tratarlos como fuente ya leida.
- Si el indice esta atrasado despues de cambios, correr `npm run codegraph:sync`.
- Si se edita un archivo, leer el fragmento exacto antes de aplicar cambios cuando haga falta contexto de
  parche.
- Usar `rg`/lecturas directas para docs Markdown extensas, assets, archivos generados, prompts, logs,
  fixtures no indexadas o rutas fuera del repo.

## Comandos

```bash
npm run codegraph:status
npm run codegraph:init
npm run codegraph:sync
npm run codegraph:explore -- "<pregunta estructural>"
```

Comandos directos utiles si `codegraph` esta en PATH:

```bash
codegraph status
codegraph query SyncContext --limit 5
codegraph node src/context/SyncContext.tsx
codegraph affected src/context/SyncContext.tsx --quiet
```

## OpenSpec

Durante `explore`, `propose`, `apply` o red-team:

1. Consultar CodeGraph para entender el flujo real antes de escribir specs o tocar codigo.
2. Usar el resultado para ubicar archivos, simbolos, llamadas y blast radius.
3. Mantener las reglas SDD: un change a la vez, specs como verdad de comportamiento y `[x]` solo con
   evidencia.

CodeGraph no reemplaza OpenSpec. Solo evita redescubrir el codigo con muchas lecturas.

## Validacion Local Ejecutada

El indice inicial se genero correctamente:

```text
Files: 416
Nodes: 5,224
Edges: 12,951
DB Size: 15.89 MB
Status: Index is up to date
```

Comparacion con la consulta:

```text
how does SyncContext reach entitySync and syncEngine?
```

| Metodo | Resultado | Tiempo observado |
| --- | --- | --- |
| CodeGraph | 1 consulta; devolvio archivos clave, source blocks, relaciones y blast radius. | ~693 ms |
| `rg` clasico | 191 coincidencias en 41 archivos; todavia requiere elegir y leer archivos. | ~260 ms solo busqueda |

Conclusion: `rg` localiza texto mas rapido, pero CodeGraph ahorra contexto humano/IA porque entrega el
mapa estructural y las lecturas relevantes en una sola llamada.

## Mantenimiento

- Tras `git pull` grande o cambios externos: `npm run codegraph:sync`.
- Si algo queda bloqueado: `codegraph unlock`.
- Si se quiere borrar el indice local: `codegraph uninit`.
- Si se quiere retirar la integracion global: `codegraph uninstall`.

Telemetria de CodeGraph quedo desactivada en esta maquina:

```bash
codegraph telemetry off
```

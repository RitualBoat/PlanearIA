# CodeGraph MCP fallback - PlanearIA

> Estado: activo localmente en esta maquina (2026-07-04).
> Proposito vigente: servir como fuente lineada y fallback rapido cuando GitNexus no baste.
> Politica relacionada: issue #40 y `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`.

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

La politica actual de PlanearIA es **GitNexus primero** para preguntas estructurales, flujos,
dependencias, impact analysis y decisiones SDD sobre "que se conecta con que":

```bash
npx -y gitnexus@latest status
npx -y gitnexus@latest analyze --index-only --name PlanearIA .
npx -y gitnexus@latest query -r PlanearIA "<pregunta estructural>"
npx -y gitnexus@latest impact -r PlanearIA --uid "<uid>" --depth 3
```

Usar **CodeGraph despues o como fallback** cuando:

- GitNexus no este instalado, este desactualizado o falle.
- GitNexus omita un archivo clave o devuelva una respuesta ambigua.
- La tarea necesite source blocks lineados estilo lectura de codigo antes de editar.
- Se quiera corroborar una ruta puntual sin duplicar todo el contexto.

Fallback CLI de CodeGraph si el MCP no aparece en la sesion:

```bash
npm run codegraph:explore -- "how does SyncContext reach entitySync and syncEngine?"
```

Regla practica:

- Si CodeGraph devuelve source blocks, tratarlos como fuente ya leida.
- Si el indice esta atrasado despues de cambios, correr `npm run codegraph:sync`.
- Si se edita un archivo, leer el fragmento exacto antes de aplicar cambios cuando haga falta contexto de parche.
- No llamar GitNexus y CodeGraph por reflejo para la misma pregunta; el segundo entra solo por falla,
  ambiguedad, omision o necesidad de fuente lineada.
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

1. Consultar GitNexus para entender el flujo real antes de escribir specs o tocar codigo.
2. Usar CodeGraph solo si hace falta fuente lineada, GitNexus falla/omite contexto, o se requiere
   corroboracion puntual.
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

Conclusion historica: `rg` localiza texto mas rapido, pero CodeGraph ahorra contexto humano/IA cuando
entrega source blocks y relaciones relevantes en una sola llamada. Tras issue #40, GitNexus queda como
primario para mapa estructural amplio y CodeGraph queda como fallback/fuente lineada.

## Mantenimiento

- Tras `git pull` grande o cambios externos: `npm run codegraph:sync`.
- Si algo queda bloqueado: `codegraph unlock`.
- Si se quiere borrar el indice local: `codegraph uninit`.
- Si se quiere retirar la integracion global: `codegraph uninstall`.

Telemetria de CodeGraph quedo desactivada en esta maquina:

```bash
codegraph telemetry off
```

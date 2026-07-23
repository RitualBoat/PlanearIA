# Compatibilidad por agente y sistema operativo

> **Estado:** soporte estable del núcleo en la matriz de `v0.1.1`.

## 1. Capacidades por harness

| Harness | Instrucción raíz | Reglas por path | Skills | Permisos | MCP | Degradación obligatoria |
| --- | --- | --- | --- | --- | --- | --- |
| Codex | `AGENTS.md` nativo | Texto fallback en `AGENTS.md` | Project-owned cuando soporte | Config/aprobaciones donde existan; resto documental | TOML estructural | Nunca contar subtables como servers |
| Claude Code | `CLAUDE.md` generado | Documentadas en `AGENTS.md`/`CLAUDE.md`; sin enforcement por glob en Ola 0 | Project-owned | Documental hasta validar enforcement estable | Config compatible | AGENTS conserva el núcleo alternativo |
| Cursor | Instrucciones generadas | Documentadas en la entrada universal; sin enforcement por glob en Ola 0 | Documentadas o generadas según capacidad verificada | Advisory | JSON estructural | No afirmar skills/permisos no soportados |
| OpenCode | `AGENTS.md` como entrada universal | Documentadas en la entrada universal | Según capacidad verificada | Documental | JSON estructural | El núcleo no depende de extensiones |
| GitHub Copilot | `copilot-instructions.md` generado | Documentadas en la entrada universal | Prompts/adaptadores, no equivalencia automática | Documental | Según cliente compatible | No afirmar runtime autenticado desde config |

Estados permitidos en la matriz machine-readable: `native`, `generated`, `documented` y `unsupported`.
`documented` no equivale a enforcement; `unsupported` no se omite.

## 2. Invariantes multiagente

- `AGENTS.md` siempre contiene el núcleo universal.
- todos los destinos derivan de `.project-os/`;
- una capacidad se valida contra su destino real;
- overlays se declaran y no sombrean IDs universales;
- reglas de permisos se conservan aun sin enforcement;
- OPSX tiene owner OpenSpec, no el renderer;
- config MCP, startup, listing y auth son señales diferentes;
- ninguna herramienta global del perfil del usuario es requisito oculto.

## 3. Compatibilidad por SO

| Superficie | Windows | macOS | Linux | Gate |
| --- | --- | --- | --- | --- |
| Node CLI | Soportado | Soportado | Soportado | Node mínimo y tests |
| Rutas | `path`/URL, sin asumir `/` | Igual | Igual | Fixtures con espacios y unicode |
| Escritura | temporal + rename | temporal + rename | temporal + rename | fallo inyectado |
| Fin de línea | LF canónico | LF canónico | LF canónico | salida byte a byte |
| Git | CLI no interactiva | CLI no interactiva | CLI no interactiva | fixture repo vacío |
| Shell | Sin depender de PowerShell/Bash para lógica | Igual | Igual | Node ejecuta comandos con args |
| Symlinks/permisos | No requeridos por el core | No requeridos | No requeridos | fixture sin privilegios |
| GitHub | `gh` opcional/manual | Igual | Igual | smoke read-only |

## 4. Evidencia actual

- Upstream `v0.1.1` ejecutó 122 tests y fixture en Ubuntu, Windows y macOS con Node 20.20/22.22.
- `main` exige `CI / required`; la ausencia de checks no cuenta como éxito.
- La fixture externa desde npm ejecutó `npm ci` dos veces sin drift, verificó firmas/attestations,
  inicializó OpenSpec, adaptó OPSX, obtuvo doctor `PASS` con 0 `FAIL` y tercer bootstrap `IN_SYNC`.
- PlanearIA conserva su propio `agent:harness:check`; valida sus espejos específicos, no reemplaza CI
  upstream.
- No se declara paridad solo porque el archivo existe; cada degradación tiene aserción.

## 5. Política de soporte

Un SO/harness pasa a “estable” únicamente con:

1. fixture de bootstrap;
2. segundo run sin diff;
3. drift intencional detectado;
4. doctor sin side effects;
5. rollback probado;
6. versión de runtime documentada.

Si falta evidencia se etiqueta “experimental” o “no verificado”, nunca `PASS`.

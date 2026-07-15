## Context

El harness toma `.mcp.json` como fuente canónica y `scripts/syncAgentHarness.mjs` genera `.codex/config.toml` y `.cursor/mcp.json`. El validador actual de paridad compara que cada nombre canónico aparezca en ambos espejos, mientras que el smoke MCP intenta iniciar cada servidor stdio configurado.

Graphify está en la fuente canónica y, por propagación, en los dos espejos. Sin embargo, el entorno no tiene `uv`, `graphify` ni `graphify-mcp`; además, la configuración registrada no especifica `graphify-out/graph.json`. El resultado es un falso verde de paridad y una ruta de startup no reproducible. La decisión aprobada es retirar Graphify del runtime activo; no se modifica ninguna ruta de producto.

## Goals / Non-Goals

**Goals:**

- Hacer que el conjunto MCP canónico contenga solamente herramientas activas del flujo predeterminado.
- Evitar que Graphify se propague a los clientes, a la paridad o al doctor bloqueante.
- Mantener GitNexus como ruta estructural primaria y CodeGraph como fallback lineado.
- Dejar `graphify-out/` como resultado local opcional y regenerable, no como indicador de salud.
- Dejar una validación reproducible que impida reintroducir Graphify como MCP activo por accidente.

**Non-Goals:**

- Instalar, fijar versión, reparar o ejecutar Graphify.
- Crear un servidor Graphify compartido, un servicio Python o una dependencia de CI.
- Borrar `graphify-out/`, cambiar la aplicación, backend, sync, autenticación o datos académicos.
- Rediseñar el doctor completo del harness o sustituir GitNexus/CodeGraph.

## Decisions

### 1. Retirar Graphify desde la fuente canónica y regenerar espejos

Se elimina únicamente la entrada `graphify` de `.mcp.json`; se ejecuta el sincronizador para materializar la ausencia en `.codex/config.toml` y `.cursor/mcp.json`. Los espejos no se editan a mano porque el generador los sobrescribiría y el cambio perdería paridad.

Alternativa considerada: quitar Graphify solo de un cliente. Se descarta porque deja comportamiento distinto entre IDEs y no resuelve el falso verde de la fuente canónica.

### 2. Separar herramienta opcional de runtime activo

Las instrucciones activas y los scripts npm dejan de presentar Graphify como comando disponible por defecto. La documentación operativa puede conservar una nota explícita de auditoría manual: requiere instalación local deliberada, reconstrucción del grafo y no forma parte de CI, `mcp:parity`, `mcp:test` ni del doctor bloqueante.

`graphify-out/` no se borra ni se interpreta como instalación válida. Sigue siendo una salida local regenerable; una futura decisión de limpieza requerirá su propio alcance y evidencia.

Alternativa considerada: mantener los scripts `graphify:*` como acceso rápido opcional. Se descarta porque apuntan a un runtime no instalado y vuelven a anunciar disponibilidad implícita; la auditoría manual debe empezar por una instalación aprobada y documentada fuera del baseline.

### 3. Convertir la ausencia de Graphify en una regresión comprobable

La validación MCP se amplía para rechazar `graphify` si aparece en la fuente canónica o en cualquiera de los espejos generados. `mcp:parity` sigue validando el conjunto activo de la fuente canónica; el nuevo chequeo evita que una futura adición accidental de Graphify vuelva a pasar por el mero hecho de propagarse correctamente.

Alternativa considerada: usar solo una búsqueda manual en la evidencia. Se descarta porque no protege cambios futuros ni ofrece una señal determinista para el doctor.

### 4. Conservar el routing aprobado de conocimiento de código

Las instrucciones se reducen a GitNexus para preguntas estructurales y CodeGraph solo cuando GitNexus sea insuficiente, ambiguo o se necesite fuente lineada. Graphify no se menciona como paso rutinario ni como fallback del flujo SDD.

Alternativa considerada: promover Graphify a tercer fallback. Se descarta porque introduce un requisito Python/uv y una posible pasada semántica de documentos sin una ganancia necesaria para los flujos de implementación actuales.

## Risks / Trade-offs

- [Se pierde una consulta estratégica de código+documentación siempre disponible] → La auditoría manual permanece posible, pero requiere una instalación y rebuild explícitos cuando el beneficio justifique el costo.
- [Un documento o espejo conserva Graphify después de editar la fuente] → El sincronizador, `agent:harness:check` y la nueva validación de nombre prohibido lo detectan.
- [Se borra accidentalmente un artefacto local que el desarrollador quería conservar] → Este change no elimina `graphify-out/`; el rollback no depende de él.
- [GitNexus vuelve a fallar en un entorno] → CodeGraph sigue siendo el fallback documentado; la retirada de Graphify no degrada ese contrato.

## Migration Plan

1. Registrar el baseline de configuración y confirmar que `graphify-out/` es local/ignorado.
2. Eliminar Graphify de la fuente MCP, scripts e instrucciones de runtime.
3. Regenerar los espejos exclusivamente con `npm run agent:harness:sync`.
4. Añadir y ejecutar la validación que prohíbe Graphify en el baseline activo.
5. Ejecutar paridad, smoke de los servidores activos, chequeo del harness y las validaciones estáticas afectadas.
6. Adjuntar al issue la comparación de nombres antes/después y los resultados, sin interpretar artefactos locales como health check.

Para rollback, se revierte el commit de configuración/fuente y se ejecuta de nuevo el sincronizador. No se restaura ni se regenera `graphify-out/`, porque no es parte del contrato activo.

## Open Questions

No hay preguntas bloqueantes para apply. La posible reinstalación y evaluación periódica de Graphify queda fuera de este change y requiere una nueva decisión explícita.

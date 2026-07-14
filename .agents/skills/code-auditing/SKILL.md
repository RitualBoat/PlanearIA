---
name: code-auditing
description: Use for systematic code quality audits, security assessments, tech-debt sweeps, pre-release reviews or dependency audits. Trigger with "audita", "audit", "revision de calidad", "code audit".
version: 1.0.0
---
# Code Auditing Skill (adaptada a PlanearIA)

Metodologia sistematica para auditorias de calidad de codigo. Stack objetivo:
React Native + Expo + TypeScript (frontend) y Node serverless + MongoDB (backend).

## Cuando usarla
- Auditorias de calidad, evaluacion de vulnerabilidades, deteccion de deuda tecnica.
- Revisiones pre-release, verificacion de buenas practicas, auditoria de dependencias.

## Baseline de PlanearIA (Phase 0)
Antes de auditar, corre y anota como linea base:
- `npm run typecheck`
- `npm run lint -- --quiet`
- `npm test -- --runInBand` (o los suites focalizados: test:classroom, test:planeaciones, test:sync)
- `npm run backend:check`
En Windows, si Jest necesita rootDir: `--rootDir C:\Users\RitualBoatLaptop\Documents\Projects\PlanearIA`.

## Fases de la auditoria
### Phase 0: Pre-analisis
1. Lee configuracion (package.json, tsconfig.json, jest config, eslint).
2. Identifica stack y librerias principales.
3. Corre los comandos baseline de arriba.
4. Carga documentacion de las librerias core (Context7 MCP si esta disponible).

### Phase 1: Descubrimiento
1. Encuentra archivos por tipo. 2. Crea lista de seguimiento. 3. Agrupa por modulo/feature.

### Phase 2: Analisis archivo por archivo
Codigo muerto, code smells, implementaciones custom reemplazables por libreria, vulnerabilidades,
problemas de rendimiento, patrones deprecados, manejo de errores ausente, funciones complejas, duplicacion.

### Phase 3: Verificacion de buenas practicas
Por cada libreria/framework: doc oficial -> comparar contra patrones oficiales -> desviaciones -> anti-patrones.

### Phase 4: Deteccion de patrones
Anti-patrones recurrentes, logica duplicada abstraible, estilos inconsistentes, manejo de errores ausente.

### Phase 5: Recomendaciones de libreria
Para implementaciones custom: verificar si una libreria existente ya lo cubre y su salud (commits, issues, actividad).

### Phase 6: Reporte
Resumen ejecutivo, criticos inmediatos, hallazgos por archivo, plan priorizado, estimaciones, recomendaciones.

## Niveles de prioridad
- **Critical** - Vulnerabilidades, funcionalidad rota.
- **High** - Cuellos de botella, codigo inmantenible.
- **Medium** - Calidad, desviaciones de buenas practicas.
- **Low** - Estilo, mejoras menores.
- **Quick Wins** - Menos de 30 min.

## Categorias de analisis
### Seguridad
Secrets hardcodeados, inyeccion, XSS, validacion de input faltante, datos sensibles expuestos,
**keys de proveedor de IA en el frontend (prohibido: debe ir via backend gateway)**,
**entidades sin aislamiento por userId**.
### Rendimiento
Algoritmos ineficientes, operaciones bloqueantes, fugas de memoria, cache faltante, N+1.
### TypeScript / Type Safety
Anotaciones faltantes, uso de `any`, tipos custom que duplican oficiales, @types faltantes.
### Async/Promise
`await` faltante, rechazos no manejados, callback hell.
### Codigo muerto
Imports/exports sin uso, funciones/clases/variables sin uso, bloques inalcanzables, archivos y dependencias sin uso.
**Herramientas:** JS/TS `npx knip --reporter json`; Python `deadcode . --dry`.
**Importante:** verifica siempre antes de reportar. Cuidado con imports dinamicos, patrones de framework
(componentes React), re-exports de API publica y entry points (handlers serverless, scripts CLI).

## Recursos
- `references/audit-methodology.md` - proceso completo de 6 fases con checklists.
- `references/dead-code-methodology.md` - deteccion de codigo muerto, verificacion y limpieza.

## Referencia rapida
### Antes: leer config, identificar stack, correr linters baseline, crear lista de seguimiento.
### Durante: marcar en progreso, analizar por categoria, anotar lineas, documentar antes/despues, marcar completado.
### Despues: categorizar por prioridad, generar reporte, guardarlo, resumen breve en consola.

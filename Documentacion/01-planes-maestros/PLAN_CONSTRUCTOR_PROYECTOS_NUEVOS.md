# Plan Maestro: Constructor reutilizable de proyectos nuevos

> **Estado:** activo, Ola 0 en cierre; implementación y evidencia local completas, pre-archive pendiente.
> **Issue/Epic:** [#103](https://github.com/RitualBoat/PlanearIA/issues/103).
> **Change:** `openspec/changes/constructor-proyectos-nuevos/`.
> **Snapshot de evidencia:** 2026-07-19.
> **Owner:** RitualBoat.

## Estado de la Ola 0

- Issue #103 y su item en PlanearIA Product OS permanecen activos y sin duplicado.
- Paquete privado `project-engineering-os-constructor` 0.1.0 implementado y probado.
- 48/48 tests del constructor y fixture desde repositorio Git vacío en PASS.
- Segundo bootstrap y `sync --check` sin drift; rollback y reanudación ensayados.
- OpenSpec strict, paridad de 36 espejos, parche OPSX, typecheck y lint en PASS.
- Revisión adversarial: `PASS CON HUECOS`, con cero Blockers y cero Majors abiertos.
- Pendiente: gate pre-archive, archive, PR y matriz CI real multi-SO. El merge requiere el gate humano
  aplicable.

## 1. Objetivo y visión

Extraer el sistema operativo de ingeniería de PlanearIA y convertirlo en un constructor neutral,
reproducible y verificable para repositorios nuevos. El constructor prepara primero gobernanza,
OpenSpec/SDD, harnesses, Product OS, documentación y calidad. Solo después habilita discovery; no pregunta
por el producto ni elige stack durante el bootstrap.

El resultado objetivo es una solución híbrida:

- un CLI Node versionado como única fuente ejecutable;
- un blueprint neutral y perfiles inactivos;
- prompts, skills y un posible template repository como adaptadores del CLI;
- fixtures que prueban bootstrap, actualización, rollback e idempotencia;
- gates humanos para autenticación, costos, licencias y cambios remotos.

## 2. Problema actual

PlanearIA ya posee piezas maduras, pero no son directamente transferibles:

- `.agents/`, el doctor y los scripts viven en la raíz del producto;
- `openspec/config.yaml` mezcla SDD universal con React Native/Expo, sync, IA y dominio docente;
- los espejos actuales conocen capacidades concretas de PlanearIA;
- no existe una fixture de repositorio vacío ni un canal probado de actualización;
- el doctor vigente ejecuta `npm run mcp:test`, que puede iniciar procesos MCP y un flujo OAuth;
- el parser MCP de Codex usa una expresión regular que también interpreta subtables TOML como nombres de
  servidor;
- planes y specs archivadas contienen decisiones históricas que no siempre son política vigente.

La auditoría completa está en
[`AUDITORIA_AS_IS.md`](../02-operacion/constructor-proyectos/AUDITORIA_AS_IS.md) y la separación
transferible en
[`MATRIZ_TRANSFERIBILIDAD.md`](../02-operacion/constructor-proyectos/MATRIZ_TRANSFERIBILIDAD.md).

## 3. Principios

1. Núcleo antes que producto.
2. Un owner por artefacto y una sola fuente ejecutable.
3. Estado real, política, evidencia e historia no son intercambiables.
4. `PASS` requiere evidencia positiva; ausencia de checks nunca es éxito.
5. El doctor diagnostica, no instala, autentica, repara ni reindexa.
6. Toda mutación es explícita, previsualizable y recuperable.
7. Capacidades desiguales se degradan de forma visible.
8. Costos, licencias, secretos y lock-in se deciden antes de activar una herramienta.
9. Un change grande a la vez y backlog lazy.
10. DDD se transfiere como estrategia ligera, no como topología distribuida.

## 4. Arquitectura elegida

| Alternativa | Ventaja | Límite | Decisión |
| --- | --- | --- | --- |
| Template repository | Arranque simple | Drift y migraciones débiles después de copiar | Semilla opcional futura |
| Generador/CLI | Idempotencia, versiones, fixtures y migraciones | Requiere mantener un paquete | Fuente ejecutable |
| Prompts/skills/scripts | Fácil acceso desde agentes | Salida no determinista si contienen templates | Adaptadores del CLI |
| Híbrida | Combina motor verificable con entradas humanas | Exige ownership estricto | **Elegida** |

El CLI se aloja inicialmente bajo `tools/project-constructor/`, usa APIs estándar de Node y permanece
privado/`UNLICENSED` durante Ola 0. No se publica ni se concede licencia sin decisión del propietario.

### 4.1 Blueprint objetivo

```text
tools/project-constructor/
  blueprint/
    core/
    profiles/
    schema/
  src/
  test/
  fixtures/

repositorio generado/
  .project-os/                    fuente canónica del proyecto
  .project-constructor/
    config.json                   selección humana
    state.json                    versión, owners y hashes
    runtime/                      CLI instalado
    transactions/                 journals y backups
  AGENTS.md                       fallback universal
  openspec/                       SDD local neutral
  docs/engineering/               contexto encontrable
```

### 4.2 Owners

| Owner | Regla |
| --- | --- |
| `constructor` | El CLI posee el archivo completo si coincide con el hash conocido. |
| `human-overlay` | El CLI posee únicamente bloques delimitados y preserva el resto byte a byte. |
| `external-openspec` | OpenSpec genera OPSX; el renderer general no escribe esas rutas. |
| `project` | Se crea si falta y luego queda bajo control del proyecto. |

`manual` clasifica acciones externas —GitHub Project, OAuth, costos y protecciones—, no ownership de
filesystem.

## 5. Núcleo universal y perfiles

### 5.1 Núcleo universal

- repositorio Git y estrategia de ramas parametrizable;
- `AGENTS.md` universal y harness single-source;
- OpenSpec local fijado, sin fallback global;
- issue → enrich → DoR → propose → apply → QA → revisión adversarial → DoD → archive → PR/CI/merge;
- TLDR, brownfield baseline, readiness y excepciones temporales;
- Product OS declarativo, templates y dry-run;
- doctor humano/JSON read-only;
- CI del constructor inicialmente advisory;
- jerarquía de fuentes, context engineering y encontrabilidad;
- permisos, secretos, costos, licencias y rollback;
- modos NORMAL y CAVEMAN;
- perfiles `documentation` y `harness-tooling`.

### 5.2 Perfiles condicionales, inactivos en Ola 0

- UI, accesibilidad, Figma, Playwright y breakpoints;
- frontend React/React Native y React Doctor;
- backend/API;
- auth/seguridad;
- datos, migración, offline y sync;
- IA y revisión humana;
- infraestructura, deploy y observabilidad;
- librería/CLI.

### 5.3 Decisiones específicas excluidas

No se copian como defaults: dominio docente, nombres de módulos, `userId`, MVVM, Expo, MongoDB, Vercel,
AsyncStorage, SQLite, sync, gateway de IA ni breakpoints de PlanearIA.

### 5.4 Histórico o retirado

Graphify queda `SKIP retirado/manual`; una auditoría voluntaria exige instalación y rebuild explícitos y no
entra al doctor, paridad, CI ni bootstrap.

## 6. Decisiones tomadas

| ID | Decisión | Evidencia |
| --- | --- | --- |
| D1 | Solución híbrida; CLI como única fuente ejecutable. | `design.md`, sección D1. |
| D2 | Node `^20.20.0 || >=22.22.0`, sin dependencias runtime externas en el constructor. | El lock de OpenSpec `1.6.0` resuelve `posthog-node 5.45.2` con ese engine efectivo; D2. |
| D3 | JSON machine-readable y Markdown humano; no YAML runtime adicional. | D2 y D3. |
| D4 | Preflight total, journals, backups y rollback hash-aware; sin `--force` genérico. | D4 y D5. |
| D5 | Cinco harnesses: Codex, Claude Code, Cursor, OpenCode y GitHub Copilot. | Spec `project-constructor-harness`. |
| D6 | OPSX conserva ownership de la CLI oficial de OpenSpec. | D6 y D7. |
| D7 | Doctor por evidencia; startup, listing y auth no se infieren desde config. | D9. |
| D8 | Solo documentación y harness/tooling activos antes del discovery. | D8. |
| D9 | CI advisory hasta baseline estable y decisión explícita. | D10. |
| D10 | Paquete privado/`UNLICENSED`; distribución pública diferida. | D2 y D11. |

## 7. Open questions

- nombre público, registry, firma y licencia de distribución;
- si se ofrece un template repository generado desde el blueprint;
- umbral medible para promover CI advisory a blocking;
- mecanismo remoto para aplicar `github-plan` después de aprobación;
- política de soporte y migraciones cuando existan dos versiones mayores instaladas.

Estas preguntas no bloquean la fixture local de Ola 0, pero sí la distribución.

## 8. Definition of Ready

Un change del constructor está listo cuando:

- existe issue y Project item sin duplicado;
- dependencias y gates están declarados y cerrados;
- working tree está limpio o aislado;
- estado actual y fuentes vigentes fueron verificados;
- arquitectura, criterios observables, evidencia y rollback están aprobados;
- no objetivos, costos, licencias y acciones humanas están identificados;
- `openspec:ready:propose` termina en `PASS`;
- no existe otro change grande activo.

## 9. Definition of Done

La Ola 0 se cierra solo si:

- artefactos OpenSpec completos y válidos;
- plan, auditoría, matriz, gaps, runbooks, Prompt 00 y guía manual versionados;
- tests y fixtures verdes sin warnings/logs inesperados del constructor;
- cinco harnesses en la degradación declarada;
- doctor humano/JSON sin `FAIL` no justificado y sin efectos laterales;
- repositorio Git vacío preparado de extremo a extremo;
- segundo bootstrap y segundo sync sin drift;
- fallo parcial, resume y rollback comprobados;
- el núcleo no contiene dominio ni stack de PlanearIA;
- perfiles condicionales permanecen inactivos;
- documentación crítica encontrable en menos de tres saltos;
- revisión adversarial sin Blockers ni Majors;
- PR con checks aplicables; ausencia de checks no cuenta como éxito;
- issue, Project y plan reflejan el estado final.

## 10. Olas y dependencias

| Ola | Resultado | Dependencias | Tracking |
| --- | --- | --- | --- |
| 0. Núcleo universal | CLI local, blueprint, harness, doctor, docs, Prompt 00, Prompt 01 inerte, CI advisory y fixture vacía | #81, #111 y #112 cerrados; #103 listo | Change `constructor-proyectos-nuevos` |
| 1. Discovery | Ejecución de `PROMPT_01_DISCOVERY_PROYECTO`, entrevista, visión y paquete de issues activos | Ola 0 cerrada | Issue se crea al activar la ola |
| 2. Perfil técnico | alternativas, ADR, dependencias fijadas, doctor/CI específicos | Discovery aprobado | Backlog en este plan |
| 3. Inicio de producto | visión versionada, DDD ligero, plan, epic, olas y primer change vertical | Perfil técnico operativo | Backlog en este plan |
| 4. Distribución | paquete publicado o template generado, firma, soporte y migraciones | licencia/canal aprobados | Gate manual |

Solo se crean issues para la ola activa y la siguiente. El resto permanece aquí para evitar ruido.

## 11. Backlog de changes

### Ola 0 activa

- `constructor-proyectos-nuevos`: alcance completo del núcleo universal.

### Ola 1, crear después del cierre de Ola 0

- `discovery-proyecto-guiado`: ejecutar Prompt 01, validar la entrevista y versionar visión/decisiones.
- `product-os-discovery-payloads`: aplicación remota aprobada de los diez issues neutrales.

### Olas posteriores, sin issue todavía

- `activar-perfil-tecnico-inicial`.
- `crear-blueprint-producto-y-primer-change`.
- `distribuir-constructor-versionado`.

## 12. Gates manuales

| Gate | Momento | Evidencia |
| --- | --- | --- |
| Licencia/canal | Antes de publicar | Decisión aprobada y manifest del paquete. |
| GitHub auth/scopes | Antes de mutar Project | `gh auth status` sin tokens y prueba read-only. |
| Project/labels/campos | Después de `github-plan` | Diff aprobado y URL del Project. |
| Branch protection | Antes de cerrar bootstrap remoto | Captura o JSON sin secretos. |
| OAuth MCP | Solo si una tarea posterior lo necesita | Smoke read-only separado; nunca doctor. |
| Costos/servicios | Antes de activar cualquier pago | Presupuesto, owner y rollback. |
| CI blocking | Tras baseline estable | Historial verde y ADR/política. |
| Discovery | Después del doctor de Etapa A | Aprobación humana para ejecutar Prompt 01. |

La guía exacta está en
[`GUIA_MANUAL_USUARIO.md`](../02-operacion/constructor-proyectos/GUIA_MANUAL_USUARIO.md).

## 13. Riesgos y anti-patrones

- Copiar PlanearIA en lugar de abstraerlo.
- Tratar config presente como runtime autenticado.
- Hacer que el doctor abra OAuth o repare el entorno.
- Permitir que un regex TOML confunda subtables con servidores.
- Generar OPSX desde dos owners.
- Instalar frameworks antes del discovery.
- Hacer mutaciones remotas durante bootstrap.
- Crear todos los issues futuros de una vez.
- Convertir entrevistas o aprobaciones en changes ficticios.
- Usar tests verdes como sustituto de evidencia manual.
- Ejecutar `npm audit --fix`, Knip fix o borrado automático.
- Convertir Graphify en requisito.

## 14. Rollback

En PlanearIA, revertir el commit/PR del change sin `git reset --hard`. En un repositorio generado, usar el
journal de la transacción: restaurar backups y eliminar solo archivos nuevos cuyo hash sigue coincidiendo.
Una edición posterior detiene el rollback de esa ruta y requiere decisión humana.

Procedimiento completo:
[`ACTUALIZACION_Y_ROLLBACK.md`](../02-operacion/constructor-proyectos/ACTUALIZACION_Y_ROLLBACK.md).

## 15. Distribución y versionado

- SemVer para paquete y schema.
- `state.json` registra versión, schema y SHA-256 del paquete probado.
- runtime antiguo rechaza estado futuro.
- migraciones explícitas y probadas; nunca heurísticas.
- Ola 0 usa `npm pack` local y paquete privado.
- publicación, firma y template remoto requieren gate de licencia/distribución.
- upgrade deliberado de OpenSpec, regeneración OPSX por su CLI y checker separado.

## 16. Criterio de cierre

El plan se cierra cuando las cuatro etapas pueden ejecutarse sin mezclar responsabilidades: bootstrap
neutral verificado, discovery aprobado, perfil técnico operativo y primer change de producto completo. El
cierre de Ola 0 no declara que el producto esté descubierto ni listo; declara únicamente que el entorno
puede iniciar discovery de forma segura.

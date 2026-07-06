# Meta Guia de Planes Maestros - PlanearIA (v3, SDD con OpenSpec)

> **Proposito:** esta guia define el estandar obligatorio para crear y ejecutar planes maestros en PlanearIA.
> **Cambio central de la v3:** los planes maestros ya NO son documentos con fases y tareas tecnicas secuenciales.
> Ahora un plan maestro es **Blueprint + Backlog de changes OpenSpec**. Las historias/features del backlog se
> "destripan" en specs y tareas tecnicas mediante el flujo SDD (`/opsx:propose`), una a la vez, con evidencia.
> **Version anterior:** `Documentacion/99-archivo/meta_guia_planes_v2_pre-sdd_2026-07.md` (referencia historica;
> sus reglas valiosas fueron migradas aqui, a `openspec/config.yaml` y a `.claude/rules/`).

---

## 0. Que Cambio y Que No Cambio

**Cambio:**

- Un plan maestro ya no lista fases `FASE 0..N` con checkboxes de implementacion.
- Cada unidad de trabajo es un **change de OpenSpec**: una feature/historia en lenguaje docente que el flujo
  SDD convierte en `proposal.md` + `specs/` (requirements con escenarios WHEN/THEN) + `design.md` + `tasks.md`.
- Las tareas tecnicas pequenas viven en el `tasks.md` de cada change (las genera `/opsx:propose`), no en el plan.
- Al archivar un change, sus specs se acumulan en `openspec/specs/` como **verdad permanente** del comportamiento
  del sistema. El plan maestro solo marca el change como archivado.

**No cambio:**

- Las reglas de arquitectura (MVVM, `src/sync`, `userId`, IA via gateway, offline-first, presupuesto bajo).
  Viven en `CLAUDE.md`, `openspec/config.yaml` (bloque `context` + `rules`) y `.claude/rules/`.
- El contrato de ground truth y niveles de paridad (seccion 4).
- GitHub Projects como tablero operativo y Actions como evidencia (seccion 6).
- La regla de evidencia: nada se marca completo sin typecheck/lint/tests, y la UI de alta paridad
  exige ademas validacion visual manual.
- El contexto real: desarrollador solo, estudiante, presupuesto cero/bajo, laptop potente
  (Ryzen 7 7735H, RTX 4060 8GB, 64GB RAM) que permite backend local, LLM local via LM Studio
  (solo detras del gateway y solo si el backend lo alcanza) y procesos batch locales.

---

## 1. Anatomia de un Plan Maestro (formato SDD)

Todo plan maestro nuevo se guarda en `Documentacion/01-planes-maestros/` y tiene tres partes:

1. **Blueprint.** La vision y las decisiones estables: objetivo, arquitectura de experiencia, decisiones
   tecnicas/UX tomadas, nivel de paridad, ground truth, riesgos y anti-patrones. Es referencia, no checklist.
   Se construye de forma iterativa con el desarrollador (encuadre -> vision -> arquitectura -> backlog),
   pidiendo aprobacion por bloques; no se entrega de golpe.
2. **Backlog de changes por olas.** La cola ordenada de features. Cada entrada usa la plantilla de la
   seccion 10.2: historia en lenguaje docente, criterio de aceptacion, ground truth requerido, dependencias
   y estado. Las olas agrupan changes que conviene ejecutar juntos (fundaciones -> shell -> experiencias).
3. **Registro de decisiones y open questions.** Que se decidio, que quedo abierto, que requiere luz verde.

Estados de un change en el backlog:

- `pendiente`: solo existe la historia en el plan.
- `en curso`: existe en `openspec/changes/<nombre>/` (ya paso por propose).
- `archivado`: vive en `openspec/changes/archive/` y sus specs en `openspec/specs/`.

Regla: **no implementar cambios de producto no triviales sin un change propuesto.** El plan maestro es el mapa;
el change es la unidad ejecutable.

---

## 2. El Ciclo SDD por Change (guia operativa para el desarrollador)

Este es el flujo completo para ejecutar UNA entrada del backlog. Los comandos son slash commands de Claude Code.

### Paso 0 — Elegir el change

Toma la siguiente entrada `pendiente` de la ola activa cuyo `Depende de:` ya este archivado.
No abras dos changes grandes a la vez.

### Paso 1 — (Opcional) Crear el issue en GitHub

Si quieres tracking operativo desde el inicio:

```bash
gh issue create --title "<nombre-del-change>" --body "<historia del backlog>" --label "change,ux-ui"
```

y agregalo al GitHub Project del plan. Tambien puedes crearlo despues del propose, con el scope ya afinado.

### Paso 2 — Enriquecer la historia: `/enrich-us`

Cuando la historia del backlog esta verde o vaga:

```text
/enrich-us <pega la historia del backlog o el numero de issue>
```

Devuelve `## Original` + `## Enriquecida` (descripcion funcional, datos, endpoints, archivos MVVM,
definition of done, NFRs). Revisala: tu decides que entra. Si la historia del backlog ya es especifica,
puedes saltarte este paso.

### Paso 3 — (Opcional) Explorar: `/opsx:explore`

Si el alcance o el enfoque tecnico no estan claros, explora antes de proponer. Explore piensa y compara,
no implementa.

### Paso 4 — Proponer: `/opsx:propose`

```text
/opsx:propose "<historia enriquecida o resumen del change>"
```

Genera en `openspec/changes/<nombre>/`: `proposal.md` (why/what/capabilities/impact + No objetivos),
`specs/` (requirements con escenarios `#### Scenario:` WHEN/THEN), `design.md` y `tasks.md`.
**Tu trabajo aqui es revisar y corregir la spec, no el codigo.** Es el momento barato de cambiar de opinion.
Verifica que las specs cumplan las reglas de `openspec/config.yaml` (estados loading/empty/error/offline,
IA confirmable, accesibilidad) y que `design.md` cite el ground truth visual si toca UI.

### Paso 5 — Implementar: `/opsx:apply`

```text
/opsx:apply
```

La IA implementa `tasks.md` una tarea a la vez y marca `[x]` solo con evidencia (typecheck, lint, tests
afectados). Si el change toca UI, la ultima tarea es validacion visual: capturas por breakpoint
(Playwright MCP en web) contra el ground truth + checklist Nielsen
(`Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`, seccion 6). Si la IA se bloquea, pausa y pregunta;
no adivina. Un fix que cambie el comportamiento esperado se corrige primero en la spec, luego en el codigo.

### Paso 6 — Red team: `/adversarial-review`

Idealmente en una sesion nueva (contexto limpio):

```text
/adversarial-review
```

Veredictos: PASS / PASS CON HUECOS / FAIL. Blockers (sev. 4) y Majors (sev. 3) se corrigen antes de archivar.

### Paso 7 — Archivar: `/opsx:archive`

```text
/opsx:archive
```

Mueve el change a `openspec/changes/archive/YYYY-MM-DD-<nombre>/` y sincroniza sus specs a
`openspec/specs/` como verdad permanente. `openspec/specs/` NUNCA se edita a mano; solo via archive
(o `/opsx:sync` en casos especiales).

### Paso 8 — Cerrar el ciclo

- Marcar el change como `archivado` en el backlog del plan maestro.
- Mover el issue/item del Project a `Done` (o `Review Manual` si quedo validacion visual pendiente).
- Commit/PR si se desea (la IA solo commitea si se lo pides).
- Actualizar documentacion de `Documentacion/` solo si cambio la arquitectura o la vision.

### Prompts utiles durante el ciclo

- Revisar una spec: `Lee openspec/changes/<n>/specs/ y dime que escenarios faltan segun las reglas de config.yaml.`
- Retomar trabajo: `Continua /opsx:apply del change <n>; revisa tasks.md para ver donde quedamos.`
- Estado general: `openspec status --json` (CLI) o `Lista los changes activos y su avance.`
- Antes de archivar: `Corre /adversarial-review sobre el change <n> comparando spec vs git diff.`

---

## 2.5 Protocolo de Interaccion Guiada (estandar de ejecucion con el desarrollador)

El ciclo SDD de la seccion 2 dice QUE artefactos se generan. Este protocolo dice COMO se ejecuta con el
desarrollador: con paradas explicitas para aprobar y con QA real obligatoria. Es el estandar por defecto
para implementar cualquier historia de usuario; nace de un piloto que fallo por saltarse GitHub Projects y
por auto-eximirse de la validacion visual ("tests verdes" != "feature lista").

Pasos y paradas:

- **Paso 0 - Creacion.** Se sugiere la User Story y se crea en GitHub Projects (issue + item del board).
  **PARADA:** se espera OK del desarrollador.
- **Paso 1 - Enrich.** Se enriquece la historia con criterios de aceptacion observables en el issue (`/enrich-us`).
  **PARADA:** se espera OK del desarrollador.
- **Paso 2 - Propose & Apply.** `/opsx:propose` (spec WHEN/THEN) + `/opsx:apply` (codigo real, tarea a tarea con evidencia).
- **Paso 3 - Audit & QA.** **OBLIGATORIO** para UI: levantar la app y validar con el MCP de navegador
  (Playwright), tomando capturas por breakpoint que demuestren cada criterio de aceptacion, y adjuntar el
  reporte al issue. No se cierra un change de UI solo con tests automaticos.

Override: si el desarrollador dice "hazlo de inicio a fin en automatico", se corren los 4 pasos de corrido
**sin omitir** la QA real del Paso 3.

Reglas anti-fallo (lecciones del piloto):

- No redefinir el objetivo para auto-eximirse del QA. Si el change toca una pantalla visible, el gate visual
  aplica; declararlo "N/A" no es una opcion valida por defecto.
- No saltarse GitHub Projects: todo trabajo formal nace como issue en el board (Paso 0).
- "Tests verdes" no es "feature lista": la evidencia visual del Paso 3 es parte del Definition of Done.
- Antes de navegar con Playwright, levantar `expo start --web` y **esperar** a que el bundler responda
  (HTTP 200 en el puerto, tipicamente 8081); navegar antes produce `ERR_CONNECTION_REFUSED`.

### MCP por paso

| Paso | MCP principal | Por que |
| --- | --- | --- |
| 0 Creacion | `github` (via `gh`/puente local) | Crear issue y agregarlo al Project. |
| 1 Enrich | `github` + `codegraph` | Enriquecer con criterios; verificar el codigo real antes de prometer. |
| 2 Propose | `codegraph`, `context7`, `figma` | Impacto/flujos, APIs recientes, ground truth visual. |
| 2 Apply | `codegraph` | Editar con blast radius a la vista; el codigo gana sobre el diagnostico previo. |
| 3 QA (UI) | `playwright` (+ `expo` si hace falta) | Levantar web, navegar, capturar por breakpoint, adjuntar evidencia. |
| 3 QA (datos) | `planearia-sqlite` / MongoDB opt-in | Diagnostico read-only de cola offline o aislamiento por `userId`. |

Detalle canonico de MCPs por flujo: `Documentacion/02-operacion/MCP_FLUJOS_PLANEARIA.md`.

---

## 3. Reglas que Todo Change Debe Respetar

Las fuentes normativas, en orden:

1. **Codigo real** (si contradice a la documentacion, gana el codigo).
2. `openspec/config.yaml` — contexto + reglas de oro + reglas por artefacto (se inyectan solas en propose/apply).
3. `CLAUDE.md` y `.claude/rules/{backend,frontend,testing}.md`.
4. `Documentacion/00-fundamentos/` (vision, arquitectura, sync, IA, mapa de modulos, roadmap, IHC).

Reglas de producto transversales que ningun change debe violar:

- **Office Docente une lo documental y lo tabular** (NotasPLAN/CalcuPLAN/PresentaPLAN); no crear mundos separados.
- **Classroom organiza y asigna; no crea todo.** La creacion profunda vive en Office/DiseñaPLAN.
- **Contenido/Biblioteca es transversal**, no experiencia madre: selector de adjuntos + biblioteca, sin competir
  con Office/Classroom.
- **Calificar requiere contexto**: no pantallas de calificacion sueltas sin actividad/entrega/alumno.
- **Legacy no es entrada principal**: si existe flujo moderno, la ruta vieja se redirige o se documenta como deuda.
- **La IA propone, el docente decide**: confirmacion antes de guardar/asignar/enviar; correcciones como
  copia/borrador/diff, nunca sobrescribir.
- **Toda pantalla nueva parte de una pantalla madre responsiva** (movil <768, tablet 768-1279, web >=1280);
  `.web.tsx`/`.native.tsx` solo por interaccion, con justificacion.

---

## 4. Contrato de Experiencia Madre y Ground Truth

Antes de proponer un change de UI, clasificar el nivel de paridad:

- **Clon/paridad alta**: debe sentirse como la experiencia conocida. Office Docente (Word/Excel/PowerPoint),
  AsistePLAN (ChatGPT/Gemini), Classroom, DiseñaPLAN (Canva/Genially), ConectaPLAN (WhatsApp).
- **Inspirado/paridad media**: toma patrones pero adapta. Escritorio, Calendario, Reportes, Notificaciones.
- **Funcional/administrativo**: prioriza robustez y costo. Infra, auth, sync, configuracion.

Para paridad alta, el `design.md` del change debe incluir un contrato verificable (no basta "tipo Word"):

```markdown
### Brief Ground Truth

- Nivel de paridad: Clon/paridad alta.
- Ground truth visual: [link Figma frame aprobado y/o ruta en context/<modulo>-ground-truth/]
- Referencias reales: context/<modulo>-ground-truth/03-referencias-reales/...
- Referencias open source: context/referencias-opensource/<repo>/FUENTE.md (inspiracion, no copia)
- Flujos prohibidos: [rutas legacy, patrones que rompen la experiencia madre]
- Criterio de cierre UX: el desarrollador confirma que se siente como [X], no como modulos sueltos.
```

Si falta ground truth, **declararlo como bloqueo** en el design y conseguirlo antes de implementar pantallas.
Estructura estandar si hay que crear la carpeta:

```text
context/<modulo>-ground-truth/
  01-errores-actuales/README.md
  02-capturas-actuales-de-la-app/
  03-referencias-reales/
  04-flujos-deseados/
  05-notas-del-desarrollador/README.md
```

Pipeline visual vigente (detalle en el plan UX/UI): Stitch/Claude Design generan conceptos ->
el frame curado en **Figma** es el ground truth oficial -> Figma MCP (`get_design_context`) alimenta la
implementacion -> Playwright MCP captura la app real por breakpoint para comparar. Los resultados
intermedios de Stitch se guardan en `context/stitch-results/<tarea>/`.

Regla de cierre: en paridad alta, TypeScript/lint/tests NO bastan; el change solo se archiva con
validacion visual manual confirmada por el desarrollador.

---

## 5. Validacion y Evidencia

Comandos base (la regla de `tasks` en config.yaml los exige antes de marcar `[x]`):

```bash
npm run typecheck
npm run lint -- --quiet
npm test -- --runInBand        # o tests focalizados justificados
npm run backend:check           # si el change toca backend
```

Ademas, por tipo de change:

- **UI:** capturas por breakpoint (Playwright MCP en web; movil manual o emulador) + checklist Nielsen
  con severidad 0-4 (`IHC_DISCOVERY_DOCENTE.md` seccion 6).
- **Sync/datos:** validar offline -> reconexion -> cross-device -> servidor caido sin perdida local.
- **IA:** probar exito, error de proveedor, sin proveedor configurado y limite de uso.
- **Navegacion:** entrar desde todos los puntos esperados, ejecutar acciones principales y volver sin
  perder contexto; sin botones muertos ni pantallas sin salida.

---

## 6. GitHub Product OS (tracking)

- El markdown (plan + specs archivadas) es la fuente de verdad arquitectonica.
- GitHub Projects es la fuente de verdad operativa diaria.
- GitHub Actions es evidencia automatica, no gestor de tareas.

Mapping vigente (adaptado a SDD):

| Elemento | Donde vive | Uso |
| --- | --- | --- |
| Plan maestro | Markdown + issue/draft `epic` | Vision, backlog y seguimiento macro. |
| Ola | Milestone | Ciclo de trabajo. |
| Change | Issue + item del Project | Unidad ejecutable en Kanban. |
| Tarea tecnica | `tasks.md` dentro del change | Detalle diario; no ensuciar el Project con esto. |
| Validacion CI | GitHub Actions | Evidencia automatica. |

Labels sugeridas: `change`, `ux-ui`, `offline-first`, `ai`, `infra`, `testing`, `docs`, `needs-input`, `low-cost`.
No crear issues para todos los changes futuros de golpe; solo la ola activa y la siguiente.

---

## 7. Presupuesto e Infraestructura

Sin cambios de fondo respecto a la v2:

- Presupuesto cero/bajo. Free tiers (Vercel, MongoDB Atlas M0, OpenRouter/Groq free) primero.
- La laptop del desarrollador puede dar backend local, LLM local (LM Studio detras del gateway,
  nunca asumir que Vercel alcanza localhost) y batch local.
- Todo change que toque backend, IA, almacenamiento, notificaciones o distribucion debe declarar costo
  en su `proposal.md` (regla candidata si se repite el olvido).
- Documentar riesgos de free tier: limites, cold starts, suspension.
- Profesional no significa caro: empezar simple, poder crecer.

---

## 8. Directrices por Experiencia

La vision completa vive en `Documentacion/00-fundamentos/VISION_ACTUAL.md`. Resumen normativo para changes:

| Experiencia | Regla clave para cualquier change |
| --- | --- |
| Escritorio (Inicio) | Launcher de herramientas + tablero accionable del dia; nunca landing decorativa ni feed. |
| NotasPLAN / CalcuPLAN / PresentaPLAN | Se sienten como Word/Excel/PowerPoint; "Crear" ofrece tipos de archivo, la IA detecta la intencion escolar despues (chip descartable). |
| AsistePLAN | Chat propio via gateway; adjuntos de objetos reales; toda accion de salida confirmable; estados cloud/local/no-configurada/error/2o-plano visibles. |
| Clases (Classroom) | Organiza, asigna y da seguimiento; recibe objetos de Office/DiseñaPLAN/AsistePLAN sin descargas manuales. |
| DiseñaPLAN | Editor visual opcional; empezar minimal (plantillas + bloques + export); frontera clara con PresentaPLAN. |
| ConectaPLAN | Mensajeria profesional 1:1/grupos disenada desde cero; el feed social no es la entrada de nada. |
| AgendaPLAN | Vista temporal de objetos reales; cada evento abre su clase/documento/actividad. |
| ReportaPLAN | Espera datos reales; gamificacion prudente; alertas de riesgo siempre con el dato que las sustenta. |
| Cuenta/Accesibilidad | Tema/fuente/daltonismo deben propagarse en runtime (useTheme), no switches decorativos. |
| Auth/Seguridad | RBAC pragmatico validado en backend; bcrypt, JWT+refresh, rate limiting en criticos, secretos solo en env. |
| Notificaciones | Compatibilidad Expo Go/dev build; fallback in-app; opt-in/opt-out. |
| Onboarding/Ayuda | Actualizar tras refactors grandes; el mensaje de suite vive aqui y en empty states, no en el uso diario. |

---

## 9. Modo de Trabajo y Modelos (orientativo)

- **NORMAL** (razonamiento alto): explore, propose, revision de specs, decisiones de arquitectura/UX/costos,
  adversarial-review.
- **CAVEMAN / eficiente** (`.agents/skills/token-efficiency/SKILL.md` si existe): apply de tareas ya
  especificadas, fixes de lint/typecheck, marcar checkboxes, sincronizar Project.
- Si una tarea de apply revela ambiguedad o decision nueva: volver a NORMAL, decidir (o actualizar la spec),
  y solo entonces continuar.
- Modelos: fuertes con razonamiento alto para planear/red-team; rapidos para lo mecanico. No bloquear el
  trabajo si la oferta de modelos cambia.

---

## 10. Plantillas

### 10.1 Plantilla de Plan Maestro (Blueprint + Backlog)

```markdown
# Plan Maestro: [Nombre] - PlanearIA

> **Version:** 1.0
> **Fecha:** YYYY-MM-DD
> **Formato:** SDD con OpenSpec (meta_guia_planes.md v3)
> **Alcance:** [que cubre y que no]
> **Estado:** [en construccion | activo | cerrado]

## 1. Blueprint

### 1.1 Objetivo y vision
### 1.2 Decisiones tomadas (con fecha)
### 1.3 Nivel de paridad y ground truth por experiencia
### 1.4 Riesgos y anti-patrones
### 1.5 No objetivos

## 2. Backlog de Changes

### Ola 0: [nombre]
[entradas con la plantilla 10.2]

### Ola 1: [nombre]
...

## 3. Registro de Decisiones y Open Questions

## 4. Criterio de Cierre del Plan
```

### 10.2 Plantilla de Entrada de Backlog (change story)

```markdown
#### Change: `<nombre-kebab-case>`

- **Historia:** Como docente, [quiero/veo/puedo ...] para [beneficio].
- **Criterio de aceptacion:** [2-5 bullets observables en lenguaje docente]
- **Paridad:** [alta | media | funcional]
- **Ground truth:** [frame Figma / carpeta context/... / "pendiente: bloqueo"]
- **Depende de:** [changes previos o "nada"]
- **Estado:** pendiente | en curso | archivado (YYYY-MM-DD)
- **Notas:** [decisiones locales, riesgos, costo si aplica]
```

---

## 11. Criterio de Calidad y Mandato Final

Un plan maestro es aceptable solo si:

- Una IA futura puede tomar cualquier entrada del backlog y proponerla sin redescubrir el repo.
- El blueprint distingue legacy vs objetivo y declara paridad + ground truth por experiencia.
- El backlog tiene dependencias explicitas y olas realistas para un desarrollador solo.
- Cada historia esta en lenguaje docente con criterio de aceptacion observable.
- Integra offline-first, presupuesto bajo, web/tablet/movil e IA con fallback desde la historia, no como parche.
- Define criterio de cierre en lenguaje de usuario.

Mandato final (sin cambios): PlanearIA debe crecer como una app profesional con una estrategia realista para
un estudiante que trabaja solo. La meta no es impresionar con tecnologia: es que la app funcione bien para
docentes reales, cueste lo minimo razonable, sea mantenible, aproveche IA con responsabilidad y pueda
evolucionar experiencia por experiencia.

---

## Version

- v3.0 — 2026-07-04. Migracion al formato SDD con OpenSpec. Version anterior en
  `Documentacion/99-archivo/meta_guia_planes_v2_pre-sdd_2026-07.md`.

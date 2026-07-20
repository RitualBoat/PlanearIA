# Plan Maestro: UX/UI y Navegacion Global - PlanearIA

> **Version:** 1.0
> **Fecha:** 2026-07-04
> **Formato:** SDD con OpenSpec (`meta_guia_planes.md` v3): Blueprint + Backlog de changes. Las tareas
> tecnicas de cada change las genera `/opsx:propose`; este plan no lleva fases con checkboxes.
> **Alcance:** redisenio completo de la experiencia, navegacion y sistema visual de PlanearIA como
> suite docente conectada. Incluye fundaciones tecnicas de UI (theming runtime, breakpoints, shell).
> **No cubre:** logica de negocio nueva ajena a UI (salvo el backend minimo del Asistente IA),
> activacion de SQLite, cambios de stack.
> **Estado:** activo.
> **Origen:** auditoria UX/UI 2026-07 (bloques 1-5, sesion de discovery con Claude).
> **Insumo IHC:** `Documentacion/00-fundamentos/IHC_DISCOVERY_DOCENTE.md`.

> **Plan y snapshot, no estado operativo.** Este documento es el blueprint del redisenio y una fotografia
> de su fecha de redaccion. El **estado operativo real** (que esta hecho, en curso o pendiente) se rastrea
> en el epic [`#101`](https://github.com/RitualBoat/PlanearIA/issues/101) y sus milestones `UX/UI Ola N`.
> Los campos **Estado** de cada change en este documento son intencion de planificacion, **no autoridad de
> estado**: ante una discrepancia, GitHub manda. Las estimaciones, paridades y dependencias registradas
> aqui son historicas y no se reescriben.

---

## 1. Blueprint

### 1.1 Objetivo y vision

PlanearIA opera como un **escritorio docente**:
el profesor abre sus herramientas de siempre (Word, Excel, PowerPoint, Canva, Classroom, ChatGPT, WhatsApp)
al instante, ya conectadas entre si y sincronizadas offline-first.

Mensaje de producto (vive en onboarding, empty states y landing; NUNCA en el uso diario recurrente):

1. "Toda tu oficina docente en un solo lugar."
2. "Sigue trabajando igual. Solo que mejor."
3. "Adios a las mil pestanas y los archivos perdidos."

Principio rector: **reconocimiento antes que memoria**. La innovacion esta en la conexion entre
herramientas familiares, no en controles nuevos.

### 1.2 Decisiones tomadas (2026-07, confirmadas por el desarrollador)

| # | Decision | Detalle |
| --- | --- | --- |
| D1 | Ruta inicial = Escritorio Docente | Dock de herramientas + tablero del dia. Reemplaza a FeedTab como landing. |
| D2 | Office con nombres propios | **NotasPLAN** (Word), **CalcuPLAN** (Excel), **PresentaPLAN** (PowerPoint). |
| D3 | Crear tipo-primero, intencion-despues | Un solo boton "Crear" -> modal de TIPOS de archivo (Documento/Hoja/Presentacion/Diseno/Preguntar a IA). Ya en el editor, un chip IA descartable detecta la intencion escolar ("Estas creando una planeacion?"). Nunca un modal que bloquee. |
| D4 | Asistente IA adaptativo | Tab/pantalla completa en movil; panel acoplable derecho en web/tablet (>=1024px utiles). Nombre propuesto: **AsistePLAN** (motor conceptual: DocenteLLM). |
| D5 | Feed + Social se funden en **ConectaPLAN** | WhatsApp Docente disenado desde cero, sin arrastrar el feed/social legacy. Retos/posts se retiran del flujo principal. |
| D6 | ContenidoTab se disuelve | Su funcion pasa a: biblioteca dentro de Office + selector transversal "Asignar/Adjuntar". |
| D7 | Navegacion adaptativa | Movil: 5 tabs (Inicio, Office, Clases, Asistente, Mas). Tablet: rail. Web: sidebar completa + panel IA. Misma arquitectura de informacion, distinta presentacion. |
| D8 | Editor creativo separado | **DisenaPLAN** (Canva/Genially). Frontera: PresentaPLAN = laminas lineales texto-primero; DisenaPLAN = lienzo visual/infografias/interactivos. |
| D9 | Nombres secundarios (provisionales) | AgendaPLAN (calendario), ReportaPLAN (reportes), Clases (sin sufijo por ahora). Revisables. |
| D10 | Plan en formato SDD | Blueprint + backlog de changes OpenSpec; specs se acumulan en `openspec/specs/` como verdad de comportamiento UX. |
| D11 | Pipeline visual | Stitch/Claude Design divergen -> frame curado en Figma = ground truth oficial -> Figma MCP alimenta implementacion -> Playwright MCP captura y compara por breakpoint. |
| D12 | IHC | Proto-personas ya definidas; 3-5 entrevistas con prototipo antes de cerrar Ola 2. Checklist Nielsen + severidad 0-4 como gate en adversarial-review. |
| D13 | Estandar de Excelencia Visual | Toda UI nueva cumple la seccion 1.9: cero diseno generico ("AI slop"), micro-interacciones con fisica spring (reanimated), presupuesto de performance para Android gama media, y vocabulario premium TRADUCIDO al stack RN (no Tailwind/GSAP/Framer en la app). |
| D14 | Landing web con tratamiento showcase completo | La landing/marketing web es un artefacto separado de la app RN; ahi SI aplican verbatim los patrones Awwwards-tier (hero glassmorphism, parallax, scroll-triggered, magnetic buttons, GSAP/Framer permitidos). Change `landing-web` en Ola 4+. |
| D15 | Anti-alucinacion de tooling | Toda fase de design/apply que use APIs de librerias (reanimated, gesture-handler, tentap, expo-*) consulta Context7 antes de escribir codigo; toda edicion parte de GitNexus para inventario/blast radius estructural y usa CodeGraph (`codegraph_explore`) solo si hace falta fuente lineada, simbolos puntuales o fallback. |

### 1.3 Arquitectura de experiencias (resumen)

| Experiencia | Rol | Superficie | Prioridad |
| --- | --- | --- | --- |
| Escritorio (Inicio) | Launcher de herramientas + tablero del dia | Tab movil / sidebar web; ruta inicial | P0 |
| Office: NotasPLAN, CalcuPLAN, PresentaPLAN | Crear/editar documentos, hojas, presentaciones; todo asignable | Tab/sidebar (experiencia madre) | P0 |
| Clases (Classroom) | Organizar, asignar, dar seguimiento; recibe objetos de las demas | Tab/sidebar (experiencia madre) | P0 |
| AsistePLAN | Conversacion IA con adjuntos reales + tareas en 2o plano | Tab movil / panel acoplable web | P1 |
| Cuenta/Accesibilidad | Control de cuenta, sesiones, tema/fuente/daltonismo reales | Secundaria + chrome global | P1 |
| ConectaPLAN | Mensajeria profesional docente | Secundaria (hub Mas / sidebar) | P2 |
| DisenaPLAN | Materiales visuales (empezar minimal: plantillas+bloques+export) | Secundaria | P2 |
| AgendaPLAN | Vista temporal; cada evento abre el objeto real | "Hoy" en Escritorio + vista completa secundaria | P2 |
| ReportaPLAN | Analitica y gamificacion prudente | Secundaria | P3 |
| (Transversal) AssignSheet | Selector "Asignar a clase / Adjuntar" sobre `SYNC_ENTITIES` | Componente, no pantalla | P0 |

### 1.4 Sistema visual (resumen; detalle en specs de los changes de Ola 0-1)

- **Principios:** familiaridad sobre originalidad; calma por defecto; jerarquia por elevacion/espacio;
  estado visible pero tranquilo; accesible de origen.
- **Tokens:** los semanticos de color ya existen (`src/themes/colors.ts`, light/dark + Material 3).
  Faltan: espaciado (escala 4pt), radios (8/12/16/pill), tipografia escalable por `FontSizeContext`,
  elevacion (3 niveles con `shadowBlue`), movimiento (150/250ms), z-index nombrado.
- **Bloqueo R1 (el primero a resolver):** las pantallas consumen `COLORS` estatico en vez del tema en
  runtime; tema/fuente/daltonismo no se propagan. Solucion: `useTheme()` + estilos como fabrica memoizada;
  `COLORS` queda como fallback legacy; lint prohibe importarlo en pantallas nuevas.
- **Bloqueo R2:** `src/utils/responsive.ts` usa `Dimensions.get()` (no reactivo). Solucion: hook
  `useBreakpoint()` sobre `useWindowDimensions()`. Breakpoints: movil <768, tablet 768-1279, web >=1280.
- **Biblioteca base:** AppShell, Screen, Card, Button, Input, Chip, Modal/Sheet, Toast, Banner,
  EmptyState, Skeleton, TabBar/SidebarRail/TopBar; componentes IA (AiSuggestionChip, ChatBubble,
  AiActionBar, ProviderStatusPill, BackgroundTaskCard); componentes sync (SyncStatusChip, SaveStateLabel,
  PendingBadge, ConflictSheet); datos (DataTable, KpiCard, Chart).
- **`.web.tsx`/`.native.tsx`** solo por interaccion distinta (editor WebView, picker/print/share);
  el precedente pdfjs aplica. Scroll siempre via patron `WebScrollView`.

### 1.5 Paridad y ground truth por experiencia

| Experiencia | Paridad | Ground truth requerido antes de UI final |
| --- | --- | --- |
| NotasPLAN / CalcuPLAN / PresentaPLAN | Alta (Word/Excel/PowerPoint, Docs/Sheets/Slides, LibreOffice/OnlyOffice) | Frames Figma + `context/planeaciones-ground-truth/` (docs) y `context/excel-ground-truth/` (hojas), ambos ya existen |
| AsistePLAN | Alta (ChatGPT/Gemini/NotebookLM) | Frames Figma + patrones de chat con adjuntos (crear `context/asistente-ground-truth/`) |
| Clases | Alta (Google Classroom/Classroomio) | Frames Figma + `context/classroom-ground-truth/` (ya existe) |
| ConectaPLAN | Alta (WhatsApp profesional) | Frames Figma + `context/chat-ground-truth/` (ya existe); NO usar pantallas legacy como referencia |
| DisenaPLAN | Alta (Canva/Genially), version minimal | Frames Figma del MVP |
| Escritorio, AgendaPLAN, ReportaPLAN | Media | Concepto Stitch/Figma aprobado |
| Cuenta, shell, sync UI | Funcional | Tokens + biblioteca base |

### 1.6 Riesgos tecnicos que el redisenio no puede ignorar

| # | Riesgo | Severidad | Mitigacion |
| --- | --- | --- | --- |
| R1 | Tokens estaticos: tema/daltonismo no se propagan | 3-4 | Change `theming-runtime` primero (Ola 0). |
| R2 | Responsive no reactivo (`Dimensions.get`) | 2-3 | Change `breakpoints-reactivos` (Ola 0). |
| R3 | Rutas legacy y modernas coexisten (grupos/ vs classroom/) | 2 | Cada change de Ola 3 declara la ruta moderna y redirige la legacy. |
| R4 (RESUELTO 2026-07-18) | `FloatingActionIcons` = segunda navegacion paralela | 2 | Mitigacion ejecutada en `app-shell-navegacion`: se integro al TopBar y se retiro el componente. Ver OQ2. |
| R5 | Mojibake UTF-8 en fuentes | 1 | Normalizar al tocar cada archivo. |
| R6 | Asistente IA requiere backend nuevo (conversaciones, adjuntos, jobs persistibles) | Alcance | Changes `asistente-ia-base` y `asistente-ia-2plano` lo dimensionan como backend+UI, no solo pantalla. |
| R7 | Editor tentap: comportamiento web vs nativo incierto | 2-3 | Spike dentro de `notasplan-editor` antes de comprometer diseno. |

### 1.7 Anti-patrones (lo que ninguna IA futura debe hacer en este plan)

- Copiar codigo open source sin revisar licencia/stack (LibreOffice y similares son referencia conceptual).
- Cambiar stack o proponer microservicios/infra cara.
- Crear pantallas aisladas sin entrada/salida/relacion con el shell.
- Duplicar Classroom y Contenido (o resucitar ContenidoTab).
- Llamar IA desde frontend o asumir que Vercel alcanza LM Studio local.
- Permitir que el Asistente guarde/asigne/envie sin confirmacion.
- Crear pantallas bonitas sin estados loading/empty/error/offline ni sync.
- Romper web o movil (funciones fantasma, scroll roto, botones muertos).
- Ignorar accesibilidad (labels, contraste, area de toque, propagacion de tema).
- Tratar el redisenio como cambio de colores: es reagrupacion de experiencias + sistema visual.
- Reorganizar la vision desde las tabs legacy o proteger la estructura actual del repo.
- Meter el discurso de marketing en el uso diario (solo onboarding/empty/landing).

### 1.8 No objetivos

- No se reescribe el motor de sync, el gateway de IA ni el backend academico existente.
- No se activa SQLite como default ni se tocan claves `@planearia:*`.
- No se construye el lienzo completo de DisenaPLAN (solo MVP con plantillas cuando toque).
- No se disena para alumnos/padres (solo docente en este plan).
- No se implementa email real ni cierre de Auth (plan aparte, activo).

### 1.9 Estandar de Excelencia Visual (obligatorio para todo change de UI)

Objetivo: que PlanearIA se vea y se sienta de nivel premium/showcase, SIN traicionar la vision
"familiaridad y calma" ni el presupuesto de hardware de las personas (Maria usa Android gama media).
La regla de oro: **el wow vive en el pulido (motion, ritmo, detalle), no en layouts exoticos.**

#### 1.9.1 Donde aplica cada nivel de intensidad

| Zona | Intensidad | Por que |
| --- | --- | --- |
| Landing web / marketing | Maxima (Awwwards-tier, jaw-dropping) | Es una pagina web DOM; vende el producto. Change `landing-web`. |
| Onboarding, empty states, transiciones entre experiencias | Alta (momentos memorables) | Primer impacto y momentos de baja frecuencia: pueden ser espectaculares sin estorbar. |
| Escritorio (dock, tablero) | Media-alta (Bento premium, micro-interacciones) | Se ve a diario: premium pero calmado. |
| Pantallas de trabajo (editores, listas, calificar) | Sobria (calma, precision, cero distraccion) | Carmen y Maria trabajan aqui horas; la elegancia es ritmo y claridad, no efectos. |

#### 1.9.2 Traduccion del vocabulario premium al stack real (React Native + Expo)

| Concepto pedido | En la app RN se implementa como | Prohibido |
| --- | --- | --- |
| Smooth spring physics | `react-native-reanimated` v4 (`withSpring`, config en tokens de movimiento: rigidez/amortiguacion estandar) | GSAP, Framer Motion (DOM-only; rompen la app) |
| Micro-interactions | Catalogo reanimated: scale 0.97 en Pressable, chip que se desvanece al descartar, checkmark que dibuja, dock tile bounce sutil, pull-to-refresh custom | Animaciones >300ms en acciones frecuentes |
| Glassmorphism | Superficies translucidas con tokens + `expo-blur` (dep opcional a evaluar en `tokens-completos`) SOLO en overlays/modales/dock; fallback solido en Android de gama baja | Blur en listas largas o superficies grandes (mata FPS) |
| Bento Box UI | Grid del Escritorio (dock + tarjetas del dia) con radios/elevacion de tokens | Bento generico sin jerarquia de tareas |
| Spatial UI / profundidad | Escala de elevacion (3 niveles `shadowBlue`) + transiciones de navegacion con profundidad (shared-element donde sea barato) | Parallax pesado en la app (solo landing) |
| Scroll-triggered animations | `useAnimatedScrollHandler` (reanimated): headers que colapsan, toolbars que se condensan | Librerias de scroll DOM |
| Magnetic buttons | Solo landing web (hover no existe en touch). En app: feedback haptico + spring en press | Hover-dependencias en la app |
| Tipografia elegante | Escala tipografica en tokens (`tokens-completos`) con jerarquia intencional; `expo-font` si se adopta una fuente de marca (decision en tokens-completos, licencia libre) | Fuentes por pantalla, tamanos magicos |

#### 1.9.3 Checklist anti-diseno-generico ("zero AI slop") — gate por pantalla

Antes de aprobar un frame de Figma o cerrar la validacion visual de un change, la pantalla debe pasar:

- [ ] No parece plantilla: si le quitas el logo, sigue reconocible como PlanearIA (paleta azul docente, ritmo 4pt, radios propios).
- [ ] Cero placeholders genericos: nada de lorem ipsum, avatares grises por defecto ni cards vacias sin proposito.
- [ ] Tipografia con jerarquia intencional (display/title/body/caption de tokens), no todo el mismo peso.
- [ ] Cada estado (loading/empty/error/offline) esta disenado, no improvisado: skeletons con shimmer sutil, empties accionables con ilustracion o icono con intencion.
- [ ] Al menos 1 micro-interaccion significativa por pantalla (no decorativa: comunica estado o confirma accion).
- [ ] Densidad correcta por breakpoint: movil respira, web aprovecha el ancho (nada de columna movil estirada).
- [ ] Pasa el checklist Nielsen (IHC seccion 6) sin severidad >=3.

#### 1.9.4 Presupuesto de performance y accesibilidad del motion

- 60fps en interacciones sobre Android gama media (el telefono de Maria); animaciones en UI thread (reanimated worklets).
- Toda animacion respeta "reducir movimiento" del sistema (`AccessibilityInfo.isReduceMotionEnabled`): version estatica equivalente.
- Blur/gradientes: medir antes de adoptar; si un efecto cuesta jank, se degrada a solido. El efecto nunca es mas importante que el trabajo del docente.

#### 1.9.5 Herramientas del estandar (verificadas en este entorno)

- **Figma MCP** (`get_design_context`, `get_screenshot`): traduccion pixel-perfect frame -> tokens/layout. Requiere autenticacion previa.
- **GitNexus** (indexado en `.gitnexus/`): herramienta primaria para inventario estructural, flujos MVVM,
  call chains, dependencias, procesos e impacto ANTES de editar. Verificar frescura con
  `npx -y gitnexus@latest status`; reindexar con
  `npx -y gitnexus@latest analyze --index-only --name PlanearIA .`.
- **CodeGraph** (indexado en `.codegraph/`): herramienta secundaria/fallback para fuente lineada estilo Read,
  simbolos puntuales y comprobacion cuando GitNexus sea ambiguo, stale o no devuelva contexto editable suficiente.
- **Context7**: docs vigentes de reanimated/gesture-handler/tentap/expo antes de usar sus APIs; cero APIs alucinadas.
- **Playwright MCP**: bucle de QA visual (seccion 5 de la meta guia v3).
- **impeccable** (skill instalada, capa de vocabulario/craft por elemento). Herramienta local NO versionada
  (`.agents/` esta en `.gitignore`): reinstalar con `npx skills add pbakaus/impeccable` si falta en una
  maquina/CI. Setup opcional: `/teach-impeccable` (genera `.impeccable.md`, tambien local). Riesgo Med (Gen/Snyk):
  revisar antes de uso intensivo.
- **awwwards** (skill local versionada en `.claude/skills/awwwards/`): capa aspiracional/evaluacion
  (zona de intensidad + pipeline 9 fases + scoring). Complementa a impeccable; no sustituye los gates.
- **Higgsfield AI** (MCP conectado): media generativa de paga; usar solo en el change `landing-web`.
- **Regla:** estas tres alimentan los gates; el checklist anti-slop y la QA Playwright siguen decidiendo. Ver OQ6.

### 1.10 Plan de transicion conceptual

- **Primero fundaciones invisibles (Ola 0):** theming runtime y breakpoints. Sin esto, toda pantalla
  nueva nace con deuda de accesibilidad/responsive.
- **Gate operativo R1 antes de Ola 1:** doctor del harness, DoR/DoD, cronologia IHC y mapa DDD ligero estan listos antes
  de iniciar trabajo UX/UI de shell.
- **El shell y el discovery avanzan en paralelo (Ola 1):** la navegacion nueva apunta a pantallas viejas,
  mientras se actualizan los recorridos IHC y se prepara el prototipo Figma navegable de Escritorio + Crear
  una vez tomadas las decisiones de shell. La app cambia de esqueleto sin perder funcionalidad; las pantallas
  se re-visten una a una despues.
- **Gate operativo R2 antes de UI visible de Ola 2:** los frames Figma aprobados/accesibles, golden journeys, senal limpia
  de tests y reclutamiento IHC preparado son gates. La aprobacion de Figma y el reclutamiento siguen sus
  gates manuales; este plan no los da por satisfechos por documentarlos.
- **Validar con docentes durante Ola 2:** con el prototipo Figma de Escritorio + Crear, aplicar el guion de
  `IHC_DISCOVERY_DOCENTE.md` antes de cerrar Ola 2 y, cuando sea viable, antes de comprometer las pantallas
  de mayor costo. Sintetizar los hallazgos antes de iniciar Ola 3.
- **Prototipable sin backend:** todo lo visual (frames Figma, shell, Escritorio con datos locales,
  office-home, chip IA con heuristica local). **Requiere backend nuevo:** AsistePLAN (conversaciones,
  adjuntos, cola de tareas persistible).
- **Se rescata (referencia tecnica, no limite visual):** `SyncContext`, `aiGateway` + `aiUsageLimiter`,
  `DocEditor`/tentap, import/export (mammoth/docx/xlsx/pdfjs), `WebScrollView`, todos los Contexts de
  datos, pantallas actuales como inventario.
- **Se difiere:** DisenaPLAN completo, ReportaPLAN/gamificacion, PresentaPLAN avanzado, comunidad publica.
- **Migracion segura:** la nueva navegacion es capa de presentacion; cero cambios destructivos en
  AsyncStorage o `SYNC_ENTITIES`. Rutas legacy se reapuntan, no se borran de golpe.

---

## 2. Backlog de Changes

> Ejecutar con el ciclo de `meta_guia_planes.md` v3 seccion 2 (enrich -> propose -> apply ->
> adversarial-review -> archive). Un change grande a la vez. Las olas son milestones en GitHub Projects.

### Ola 0: Fundaciones (sin cambio visual visible)

#### Baseline brownfield de las primeras superficies UX

Antes de proponer estos changes, su `brownfield-baseline.md` declara la fuente vigente, el delta y la
compatibilidad a conservar. El owner de spec describe la superficie de experiencia; no reemplaza el owner
de datos definido por `MAPA_DDD_ESTRATEGICO_LIGERO.md`.

| Change | Contexto owner | Owner de spec y fuentes brownfield | Compatibilidad que debe declararse |
| --- | --- | --- | --- |
| `theming-runtime` | Experiencia y Preferencias | `ThemeContext`, `FontSizeContext`, `DaltonismoContext`, `src/themes/` | `COLORS` y pantallas no migradas permanecen como fallback hasta su rollout por contacto. |
| `breakpoints-reactivos` | Experiencia y Preferencias | `src/utils/responsive.ts`, consumidores de layout y futuro `useBreakpoint()` | Estilos a nivel de módulo y rutas responsive actuales se migran gradualmente, sin congelar resize/rotación. |
| `tokens-completos` | Experiencia y Preferencias | `src/themes/` y primitives consumidoras | Tokens y consumidores existentes se conservan hasta que cada superficie adopte el contrato nuevo. |
| `app-shell-navegacion` | Experiencia y Preferencias | `App.tsx`, `src/navigation/` y hubs de navegación | Rutas actuales permanecen accesibles; Office, Classroom, Sync e IA son destinos/consumidores, no datos del shell. |

#### Change: `theming-runtime`

- **Historia:** Como docente, cuando cambio el tema, el tamano de fuente o el modo daltonismo en
  preferencias, toda la app lo refleja al instante, sin reiniciar.
- **Criterio de aceptacion:** cambiar tema oscuro repinta cualquier pantalla redisenada; fuente escala
  tipografia; daltonismo ajusta colores de estado; nada de esto rompe pantallas legacy no migradas.
- **Paridad:** funcional. **Ground truth:** no aplica.
- **Depende de:** nada. **Estado:** pendiente (patron piloteado en 1 pantalla; falta el rollout completo).
- **Dimensionamiento (verificado 2026-07):** 60 archivos importan `COLORS` estatico; 18 pantallas ya usan
  el patron reactivo (`getStyles`/`useTheme`). O sea el trabajo es **desplegar un patron probado**, no
  inventarlo. Es un rollout grande: acotar el piloto a (a) construir la infra `useTheme()` + fabrica +
  lint, y (b) migrar un primer lote demostrativo, dejando el resto como rollout rastreado. No intentar
  los 60 archivos en un solo change.
- **Notas:** hook `useTheme()` + fabrica de estilos `getStyles(DT, isDark, scaled, ...)`; `COLORS` queda
  como fallback legacy; regla de lint contra `import { COLORS }` en archivos nuevos/redisenados. Resuelve R1.
- **Piloto real (2026-07-06):** el patron se aplico y valido en `CuentaScreen` via el change archivado
  `apply-cuenta-runtime-accessibility` (issue #34): fabrica de estilos por tema + `scaled()` + `applyDaltonismo`
  + `AccessibilityPreferencesContext` para los 3 toggles. QA Playwright en 3 breakpoints
  (evidencia historica externalizada en respaldo del usuario). Ese change es antecedente; el trabajo nuevo debe generar evidencia vigente en su propio issue/change.

#### Change: `breakpoints-reactivos`

- **Historia:** Como docente, cuando roto la tablet o redimensiono la ventana del navegador, la interfaz
  se reacomoda al momento.
- **Criterio de aceptacion:** hook `useBreakpoint()` reactivo (movil/tablet/web); `responsive.ts` jubilado
  o delegando al hook; rotacion/resize no requiere recargar.
- **Paridad:** funcional. **Depende de:** `theming-runtime` (comparte la migracion, ver abajo). **Estado:** pendiente.
- **Hallazgo verificado (2026-07):** el problema real de R2 no es `Dimensions.get()`, es que 10 de 11
  consumidores llaman `responsive()`/`isWeb()` dentro de un `StyleSheet.create` **a nivel de modulo**
  (congelado al importar). Jubilar `responsive.ts` obliga a mover esos estilos a una fabrica
  `getStyles(theme, width, ...)` en render — **la misma migracion que exige `theming-runtime`**. Regla:
  tocar cada archivo UNA sola vez. `theming-runtime` establece la fabrica `getStyles(theme, ...)`;
  `breakpoints-reactivos` solo le agrega el parametro `width` y provee `useBreakpoint()`. Memoizar la
  fabrica (ej. `useMemo` por bucket de ancho) para no recrear estilos en cada render.
- **Superficie:** 11 archivos, 4 primitivas (`responsive`, `isWeb`, `isLargeScreen`, `getScreenDimensions`).
  Los 6 que mezclan ambas estrategias (`ListaRecursosScreen`, `RecursosDidacticosScreen`, `CuentaScreen`,
  `CrearGrupoScreen`, `ListaGruposScreen`, `ListaPlantillasScreen`) son los de mayor riesgo de
  inconsistencia visual: priorizarlos y cubrirlos con QA Playwright por breakpoint. **Notas:** resuelve R2.

#### Change: `tokens-completos`

- **Historia:** Como desarrollador, tengo un set unico de tokens (espaciado, tipografia, radios,
  elevacion, movimiento, z-index) para que toda pantalla nueva sea consistente sin decisiones ad hoc.
- **Criterio de aceptacion:** tokens definidos en `src/themes/`, tipografia multiplicada por
  `FontSizeContext`, documentados con previews (Claude Design/DesignSync).
- **Paridad:** funcional. **Depende de:** `theming-runtime`. **Estado:** pendiente.

### Ola 1: Shell y componentes

#### Change: `app-shell-navegacion`

- **Historia:** Como docente, navego con tabs abajo en el telefono (Inicio, Office, Clases, Asistente, Mas)
  o con una barra lateral en web/tablet, y la app abre en mi Escritorio, no en un feed.
- **Criterio de aceptacion:** AppShell adaptativo por breakpoint; navegadores anidados por experiencia
  (adios stack plano de ~50 rutas hermanas y parametros `returnToClassroom`); ruta inicial = Escritorio
  (placeholder temporal); pantallas actuales siguen accesibles desde los nuevos hubs; decidir destino de
  `FloatingActionIcons` (integrar a TopBar o retirar).
- **Paridad:** funcional. **Ground truth:** wireframe Figma del shell (3 breakpoints).
- **Depende de:** `theming-runtime`, `breakpoints-reactivos`. **Estado:** archivado 2026-07-18 (issue #81).
- **Notas:** el change mas delicado de navegacion; migracion por reapuntado, sin borrar rutas.
  El destino de `FloatingActionIcons` se resolvio integrandolo al TopBar y retirando el componente
  (design.md 3.5 del change archivado); ver OQ2 y R4.

#### Change: `componentes-base`

- **Historia:** Como desarrollador, tengo la biblioteca base (Button, Card, Input, Chip, Modal, Toast,
  EmptyState, Skeleton, TabBar/TopBar...) con estados y accesibilidad, para ensamblar pantallas sin
  reinventar estilos.
- **Criterio de aceptacion:** componentes con normal/pressed/disabled/loading, `accessibilityRole/Label`,
  toque >=44pt, foco visible en web; documentados con previews.
- **Paridad:** funcional. **Depende de:** `tokens-completos`. **Estado:** archivado 2026-07-19 (issue #82).

#### Change: `sync-status-ui`

- **Historia:** Como docente, siempre se si mi trabajo esta guardado, sincronizando, pendiente o sin
  conexion, con el mismo lenguaje visual en toda la app y sin mensajes alarmantes.
- **Criterio de aceptacion:** SyncStatusChip global (idle/syncing/synced/offline/error/authError desde
  `SyncContext`), SaveStateLabel en editores, PendingBadge, textos tranquilizadores actuales conservados.
- **Paridad:** funcional. **Depende de:** `componentes-base`. **Estado:** archivado 2026-07-19 (issue #83).

#### Change: `assign-sheet`

- **Historia:** Como docente, desde cualquier documento, hoja o recurso puedo "Asignar a clase" o
  "Adjuntar" con el mismo selector, sin descargar ni copiar nada.
- **Criterio de aceptacion:** un solo componente sobre `SYNC_ENTITIES` (clase/unidad/actividad);
  operacion encolada offline; usado por al menos un flujo real al cerrar.
- **Paridad:** funcional. **Depende de:** `componentes-base`. **Estado:** archivado 2026-07-19 (issue #84).

### Hitos pre-Ola 2: prototipo Figma e IHC (manuales)

Estos hitos comienzan en paralelo a Ola 1 una vez tomadas las decisiones de shell. Deben quedar listos
como gates del R2 operativo antes de implementar la UI visible de Ola 2; no son changes de codigo ni se satisfacen
por modificar este repositorio.

#### Hito de diseno (no es change de codigo): `prototipos-figma-ola2`

Produce el material visual que las entrevistas y los changes de Ola 2-3 necesitan. Sin este hito,
`escritorio-docente` y `office-home-crear` no tienen ground truth y las entrevistas no tienen estimulo.

- **Entregable A — Prototipo navegable (fidelidad alta):** frames movil + web de (1) Escritorio
  (dock + tablero, con estado con-datos y empty), (2) modal Crear tipo-primero, (3) Office home
  (bandeja unificada), (4) NotasPLAN con el chip IA de intencion visible. Conectados como prototipo
  clickeable en Figma para las entrevistas.
- **Entregable B — Concept boards (fidelidad media, 1 frame por modulo):** Clases/Classroom redisenado,
  ConectaPLAN (hilo estilo WhatsApp profesional), DiseñaPLAN (galeria + plantilla), AsistePLAN
  (chat movil + panel web), Onboarding (3 pantallas con el copy D1.1). Sirven como estimulo de
  entrevista ("esto viene despues, que opinas?") y fijan el lenguaje visual de la Ola 3-4.
- **Proceso:** pipeline D11 (Stitch/Claude Design divergen -> curaduria -> Figma como ground truth,
  generable/editable via `use_figma` del Figma MCP) usando los tokens reales de `src/themes/colors.ts`.
- **Gate de aprobacion:** cada frame pasa el checklist anti-slop (1.9.3) y el vocabulario traducido
  (1.9.2) antes de marcarse "aprobado"; los aprobados se registran en `context/<modulo>-ground-truth/`
  y se referencian desde el design.md del change correspondiente.
- **Gate manual #46:** la aprobacion de frames y el acceso autenticado al Figma MCP siguen la evidencia
  de su gate; preparar esta cronologia no los aprueba ni los cierra.
- **Depende de:** decisiones de shell; puede correr en paralelo a la implementacion de Ola 1.

#### Hito IHC (no es change de codigo): entrevistas con docentes

- Con el prototipo navegable del hito anterior (`prototipos-figma-ola2`), aplicar el guion de
  `IHC_DISCOVERY_DOCENTE.md` seccion 5 a 3-5 docentes, incluyendo los concept boards como estimulo
  de los modulos futuros. Las entrevistas ocurren antes de cerrar Ola 2 y, cuando sea viable, antes
  de comprometer sus pantallas de mayor costo. Sintetizar y ajustar backlog antes de iniciar Ola 3.
- **Gate manual #47:** reclutamiento, consentimiento, agenda y notas anonimizadas requieren evidencia
  humana; este plan no permite marcarlos completos por trabajo documental.

### Ola 2: Nucleo visible (aqui entran las entrevistas IHC)

#### Change: `escritorio-docente`

- **Historia:** Como docente, al abrir PlanearIA veo mi escritorio: mis herramientas (NotasPLAN, CalcuPLAN,
  PresentaPLAN, DisenaPLAN, Asistente, Clases) y mi dia (que sigue, pendientes, continuar trabajo,
  una sugerencia IA descartable), en vez de un feed.
- **Criterio de aceptacion:** dock de herramientas + tablero accionable; empty state de docente nuevo con
  3 caminos (crear clase / crear-importar documento / probar asistente); chip de sync en el encabezado;
  funciona 100% offline con datos locales.
- **Paridad:** media. **Ground truth:** frame Figma aprobado (movil y web).
- **Depende de:** `app-shell-navegacion`, `sync-status-ui`. **Estado:** pendiente.

#### Change: `office-home-crear`

- **Historia:** Como docente, tengo una bandeja unica de documentos/hojas/presentaciones con un boton
  "Crear" que me ofrece tipos de archivo (no tareas escolares); al abrir un documento en blanco, un chip
  discreto puede preguntarme si estoy creando una planeacion/examen y ofrecer ayuda, o dejarme en paz.
- **Criterio de aceptacion:** bandeja unificada con filtros (recientes/por clase/borradores/plantillas);
  modal Crear tipo-primero (D3); chip IA descartable (heuristica local primero, LLM despues); import
  visible como camino de adopcion; cero perdida de acceso a planeaciones existentes.
- **Paridad:** alta (patron Docs/Drive). **Ground truth:** frame Figma aprobado.
- **Depende de:** `app-shell-navegacion`, `componentes-base`, `assign-sheet`. **Estado:** pendiente.

#### Change: `onboarding-suite`

- **Historia:** Como docente nuevo, el primer uso me recibe con el mensaje de suite ("toda tu oficina
  docente en un solo lugar; sigue trabajando igual, solo que mejor") y me deja empezando algo real.
- **Criterio de aceptacion:** 3 pantallas maximo con el copy de D1.1; cierra en el Escritorio con el
  empty accionable; se puede saltar.
- **Paridad:** media. **Depende de:** `escritorio-docente`. **Estado:** pendiente.

### Ola 3: Experiencias nucleo

#### Change: `notasplan-editor`

- **Historia:** Como docente, edito documentos en NotasPLAN y se siente como Word/Docs: toolbar familiar,
  tablas, guardado local inmediato y "Asignar a clase" a un toque.
- **Criterio de aceptacion:** DocEditor re-vestido con la nueva toolbar/tokens; spike tentap web vs nativo
  resuelto (R7); estados guardado/sync visibles; export/import intactos.
- **Paridad:** alta. **Ground truth:** frame Figma + `context/office-ground-truth/`.
- **Depende de:** `office-home-crear`. **Estado:** pendiente.

#### Change: `calcuplan-hoja`

- **Historia:** Como docente, abro o importo una hoja (lista de alumnos, calificaciones) y la edito como
  en Excel; la app puede proponerme convertirla en datos de una clase, con vista previa y mi confirmacion.
- **Criterio de aceptacion:** grid editable basico; import xlsx/csv; mapeo de columnas con preview
  obligatorio antes de convertir; conversion via `src/sync`.
- **Paridad:** alta. **Ground truth:** frame Figma. **Depende de:** `office-home-crear`. **Estado:** pendiente.

#### Change: `classroom-redesign`

- **Historia:** Como docente, entro a Clases y veo mis grupos con "lo que sigue"; dentro de una clase,
  Tablon/Trabajo/Personas con el nuevo sistema visual, y asigno objetos de Office sin salir.
- **Criterio de aceptacion:** rediseno visual completo sobre los datos existentes; una sola ruta moderna
  por accion (legacy redirigida, R3); asistencia/calificaciones contextuales; AssignSheet integrado.
- **Paridad:** alta. **Ground truth:** frame Figma + `context/classroom-ground-truth/`.
- **Depende de:** `app-shell-navegacion`, `assign-sheet`. **Estado:** pendiente.

#### Change: `asistente-ia-base`

- **Historia:** Como docente, converso con AsistePLAN (pantalla completa en movil, panel junto a mi
  documento en web), adjunto objetos reales de mi cuenta y toda accion de salida (guardar/crear/asignar)
  requiere mi confirmacion.
- **Criterio de aceptacion:** backend de conversaciones/adjuntos sobre `aiGateway` + `aiUsageLimiter`
  con JWT/userId; UI de chat con AiActionBar y ProviderStatusPill (cloud/local/no-configurada/error);
  fallback honesto sin proveedor; historial persistente.
- **Paridad:** alta. **Ground truth:** frame Figma (2 superficies).
- **Depende de:** `app-shell-navegacion`, `componentes-base`. **Estado:** pendiente.
- **Notas:** es backend+UI (R6). Definir politica de privacidad de datos de alumnos hacia proveedores
  cloud dentro de la spec.

#### Change: `asistente-ia-2plano`

- **Historia:** Como docente, puedo aceptar "Pedir correcciones al DocenteLLM?" y seguir trabajando;
  la tarea corre en segundo plano con estado visible y el resultado llega como copia/resumen/comparacion
  revisable que nunca sobrescribe mi original.
- **Criterio de aceptacion:** cola de tareas persistible/recuperable; estados pendiente/generando/listo/
  error/cancelado; BackgroundTaskCard en AsistePLAN y en el editor de origen; cancelacion cuando viable.
- **Paridad:** alta. **Depende de:** `asistente-ia-base`, `notasplan-editor`. **Estado:** pendiente.

### Ola 4+: Resto de la suite (activar por prioridad tras Ola 3)

#### Change: `cuenta-preferencias`

- **Historia:** Como docente, controlo mi cuenta, sesiones, privacidad y comodidad visual (tema, fuente,
  daltonismo) en pantallas que se sienten parte de la misma suite, y lo que ajusto se aplica de verdad
  en toda la app.
- **Criterio de aceptacion:** pantallas Cuenta/Preferencias/Accesibilidad con biblioteca y tokens nuevos;
  los 3 ajustes se propagan (via `theming-runtime`); sesiones activas y roles intactos; verificacion real
  de accesibilidad (lector de pantalla en acciones principales).
- **Paridad:** funcional. **Ground truth:** tokens + biblioteca base.
- **Depende de:** `theming-runtime`, `componentes-base`. **Estado:** pendiente.
- **Notas:** construye sobre la spec archivada `settings-accessibility-preferences` (no rehacerla).

#### Change: `conectaplan`

- **Historia:** Como docente, converso con colegas como en WhatsApp profesional: contactos, hilos con
  estados de envio, y comparto una planeacion/recurso que el receptor puede guardar en su biblioteca o
  asignar a su clase con un toque.
- **Criterio de aceptacion:** lista de conversaciones + hilo + contactos con la biblioteca nueva; adjuntos
  de objetos reales via AssignSheet; estados enviando/enviado/entregado/error con reintento offline
  (cola `src/sync`); empty state accionable ("busca a un colega"); cero UI legacy de feed/social.
- **Paridad:** alta (WhatsApp profesional). **Ground truth:** frames Figma + `context/chat-ground-truth/`.
- **Depende de:** `componentes-base`, `assign-sheet`. **Estado:** pendiente.
- **Notas:** reusa fontaneria de `MensajesContext`/`ContactosContext`; retos/posts quedan fuera del flujo.

#### Change: `agendaplan`

- **Historia:** Como docente, veo mi semana (clases, entregas, recordatorios) y al tocar un evento se abre
  la clase, el documento o la actividad real, no una ficha muerta.
- **Criterio de aceptacion:** vistas semana/mes responsivas; cada evento navega a su objeto; recordatorios
  con `expo-notifications` (permiso + fallback in-app); funciona offline con datos locales; "hoy" del
  Escritorio y AgendaPLAN muestran lo mismo (una sola fuente).
- **Paridad:** media. **Ground truth:** concepto Stitch/Figma aprobado.
- **Depende de:** `escritorio-docente`. **Estado:** pendiente.

#### Change: `presentaplan-mvp`

- **Historia:** Como docente, armo las laminas de mi clase de manana escribiendo texto-primero (titulo +
  bullets + imagen), las presento desde la app y las exporto a PDF/PPTX.
- **Criterio de aceptacion:** editor lineal de laminas (sin lienzo libre); rail de miniaturas; modo
  presentar; export PDF (y PPTX si el costo es razonable); "Asignar a clase" integrado.
- **Paridad:** alta (patron PowerPoint/Slides simplificado). **Ground truth:** frames Figma del MVP.
- **Depende de:** `office-home-crear`. **Estado:** pendiente.
- **Notas:** frontera con DiseñaPLAN (D8): aqui NO hay capas ni lienzo.

#### Change: `disenaplan-mvp`

- **Historia:** Como docente, creo material visual (infografia, actividad imprimible, examen visual)
  partiendo de una plantilla rellenable con bloques simples, y lo exporto o asigno a mi clase sin salir.
- **Criterio de aceptacion:** galeria de plantillas por tipo; edicion por bloques (texto/imagen/forma
  basica, sin lienzo libre completo); export a imagen/PDF; AssignSheet integrado; "convertir desde
  planeacion" como camino de entrada (IA sugiere estructura, confirmable).
- **Paridad:** alta (Canva/Genially), version minimal consciente. **Ground truth:** frames Figma del MVP.
- **Depende de:** `office-home-crear`, `assign-sheet`. **Estado:** pendiente.
- **Notas:** NO construir lienzo completo (no objetivo 1.8); validar demanda antes de crecer.

#### Change: `reportaplan`

- **Historia:** Como docente, al cierre de semana/unidad veo como van mis grupos (asistencia, entregas,
  promedios, alumnos en riesgo) y cada alerta muestra el dato que la sustenta; la IA puede redactarme
  observaciones que yo reviso antes de usar.
- **Criterio de aceptacion:** resumen + reporte de grupo/alumno consolidados con la biblioteca nueva;
  estado "datos insuficientes" honesto; alertas de riesgo siempre con evidencia visible; observaciones IA
  revisables (nunca auto-enviadas); export/compartir via ConectaPLAN.
- **Paridad:** media. **Ground truth:** concepto Stitch/Figma aprobado.
- **Depende de:** `classroom-redesign`. **Estado:** pendiente. **Notas:** activar solo con datos reales;
  gamificacion prudente (rachas/logros discretos), nunca infantilizar.

#### Change: `notificaciones-chrome`

- **Historia:** Como docente, las notificaciones me avisan lo importante (entregas, mensajes, tareas IA
  terminadas) sin invadir, y el badge/campana vive integrado en el chrome del shell.
- **Criterio de aceptacion:** pantalla de notificaciones redisenada; badge en TopBar segun decision de
  `FloatingActionIcons` (OQ2); agrupacion por experiencia; deep link al objeto real.
- **Paridad:** funcional. **Depende de:** `app-shell-navegacion`. **Estado:** pendiente.
- **Notas:** puede absorberse dentro de `app-shell-navegacion` si resulta chico.

#### Change: `landing-web`

- **Historia:** Como docente que descubre PlanearIA, llego a una landing web impactante que me muestra la
  suite (NotasPLAN, CalcuPLAN, PresentaPLAN, DiseñaPLAN, AsistePLAN, Clases, ConectaPLAN) y me lleva a
  probar la demo.
- **Criterio de aceptacion:** pagina web separada de la app RN (puede ser estatica en Vercel, costo cero);
  hero con el mensaje D1.1; secciones por herramienta con capturas/video reales de la app; CTA a demo web;
  Lighthouse/Core Web Vitals decentes; accesible.
- **Paridad:** showcase (Awwwards-tier permitido al 100%). **Ground truth:** frames Figma de la landing.
- **Depende de:** Ola 2 archivada (necesita capturas reales que presumir). **Estado:** pendiente.
- **Notas:** AQUI aplican verbatim los patrones showcase (D14): tema oscuro + glassmorphism, Spatial UI,
  parallax, scroll-triggered (GSAP/Framer/Tailwind permitidos: es DOM, no RN), magnetic buttons,
  Bento Box de features, media generativa (Higgsfield u otra) si el costo lo permite. Las skills de
  web-quality (accessibility/performance/core-web-vitals) sirven como auditoria de cierre.

---

## 3. Registro de Decisiones y Open Questions

Decisiones: ver 1.2 (D1-D12).

Open questions:

- OQ1: nombres finales de DisenaPLAN/AsistePLAN/ConectaPLAN/AgendaPLAN/ReportaPLAN ("de momento asi",
  revisar antes de Ola 3).
- OQ2 (RESUELTO 2026-07-18): destino de `FloatingActionIcons` (se decidio en `app-shell-navegacion`).
  - **Decision:** integrar al TopBar **y** retirar el componente flotante. Ver
    `openspec/changes/archive/2026-07-18-app-shell-navegacion/design.md` seccion 3.5.
  - **Resultado verificable:** `src/components/FloatingActionIcons.tsx` eliminado (commit `2e5acfb`); sus
    tres afordancias (notificaciones con badge, ayuda, menu de cuenta) viven en `src/navigation/AppTopBar.tsx`
    con toque >=44pt, colores desde el tema en runtime y foco visible en web.
- OQ3: politica de privacidad de datos de alumnos hacia proveedores IA cloud (se decide en la spec de
  `asistente-ia-base`; minimo: avisar que se envia y a que tipo de proveedor).
- OQ4: comunidad publica (muro) futura: fuera de este plan; reevaluar tras ConectaPLAN.
- OQ5: CLI de openspec global no esta en `package.json` (documentado; decidir si se agrega como devDependency).
- OQ6 (RESUELTO 2026-07-07): herramientas de diseno instaladas/definidas.
  - **impeccable** (Paul Bakaus, `pbakaus/impeccable`, gratis): instalado via `npx skills add pbakaus/impeccable`
    en `.agents/skills/impeccable/` con symlink a Claude Code (funciona en este Windows). Es la capa de
    VOCABULARIO/craft por elemento (tipografia, color, motion, anti-slop). Rating de riesgo del instalador:
    Med (Gen/Snyk), 0 alertas Socket; contiene `scripts/`, corre con permisos de agente: revisar antes de uso intensivo.
  - **awwwards**: skill LOCAL creada en `.claude/skills/awwwards/SKILL.md` (archivo real, versionado). Capa
    ASPIRACIONAL/evaluacion: decide zona de intensidad (1.9.1), aplica el pipeline de 9 fases y puntua estilo
    Awwwards (Design/Usability/Creativity/Content), sin sobreescribir la seccion 1.9. Complementa a impeccable.
  - **Higgsfield AI**: MCP HTTP hosteado `https://mcp.higgsfield.ai/mcp`, media generativa de PAGA con OAuth
    interactivo. NO conectado (esta sesion no puede hacer OAuth). Conectar con
    `claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp` + autenticar en `/mcp`.
    Solo aplica al change `landing-web` (Ola 4+); no bloquea nada antes.
  - Regla de integracion: estas herramientas NO reemplazan los gates de la seccion 1.9 ni del Protocolo 2.5;
    los alimentan. impeccable/awwwards proponen; el checklist anti-slop y la QA Playwright siguen decidiendo.

Coordinacion con trabajo en vuelo (verificado 2026-07):

- Hay un change activo `raise-react-doctor-score-baseline` (23/23 tareas implementadas,
  issue #38). Es de **seguridad/calidad**, no de UI: toca `apiConfig`/`apiClient`/`authService`
  (frontera del `EXPO_PUBLIC_API_SECRET`), helper de escape HTML para exports
  (`alumno/grupo/reportesExportService`), decision de `pdfjs-dist` y config de react-doctor.
- **No hay colision de archivos con la Ola 0:** react-doctor toca servicios/config/exports; theming y
  breakpoints tocan pantallas y `src/themes`. Son ortogonales.
- **react-doctor CERRADO por completo (2026-07-07):** ambos changes archivados; `openspec list` no reporta
  changes activos. El arbol de changes queda limpio para arrancar la Ola 0.
  - `raise-react-doctor-score-baseline`: adversarial PASS CON HUECOS (1 Minor rastreado: consolidar
    `planeacionExportService` en el helper de escape compartido). Specs: `react-doctor-scan-baseline`,
    `frontend-public-env-boundary`, `safe-html-export-sinks`, `dependency-risk-decision`.
  - `fix-react-doctor-top-findings`: adversarial PASS (secretos fail-closed, allowlist + userId en
    notificaciones sin spread de body, fix de perdida de datos en import con test batch dedicado). Specs:
    `secure-react-doctor-remediation`, `react-native-react-doctor-remediation`, `alumno-import-integrity`.
  - Las 7 specs son ahora verdad permanente en `openspec/specs/` (9 en total con las 2 previas).
- El flujo SDD ya esta probado end-to-end en este repo: `openspec list` responde y hay specs archivadas
  (`ai-friendly-repository-context`, `settings-accessibility-preferences`) + un archive
  (`2026-07-06-repo-max-clean-context-externalization`). No es un estreno del CLI.

---

## 4. Criterio de Cierre del Plan

El plan se cierra cuando:

- Olas 0-3 archivadas: fundaciones, shell, Escritorio, Office home + NotasPLAN/CalcuPLAN, Clases
  redisenadas y AsistePLAN base operando con confirmaciones.
- Un docente (entrevistas de Ola 2 + validacion final) reconoce la app como "mis herramientas de siempre,
  conectadas" y completa los 3 recorridos IHC sin ayuda.
- Tema oscuro, fuente y daltonismo se propagan en todas las pantallas redisenadas.
- Ninguna pantalla redisenada carece de estados loading/empty/error/offline.
- `openspec/specs/` contiene la verdad de comportamiento de shell, Escritorio, Office base, Clases y
  Asistente.
- La Ola 4 queda como backlog priorizado (no es requisito ejecutarla para cerrar este plan).

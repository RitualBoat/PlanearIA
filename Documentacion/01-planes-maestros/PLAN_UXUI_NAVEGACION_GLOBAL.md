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

---

## 1. Blueprint

### 1.1 Objetivo y vision

PlanearIA deja de ser "una app de planeaciones con modulos" y se convierte en un **escritorio docente**:
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
| D8 | Editor creativo separado | **DiseñaPLAN** (Canva/Genially). Frontera: PresentaPLAN = laminas lineales texto-primero; DiseñaPLAN = lienzo visual/infografias/interactivos. |
| D9 | Nombres secundarios (provisionales) | AgendaPLAN (calendario), ReportaPLAN (reportes), Clases (sin sufijo por ahora). Revisables. |
| D10 | Plan en formato SDD | Blueprint + backlog de changes OpenSpec; specs se acumulan en `openspec/specs/` como verdad de comportamiento UX. |
| D11 | Pipeline visual | Stitch/Claude Design divergen -> frame curado en Figma = ground truth oficial -> Figma MCP alimenta implementacion -> Playwright MCP captura y compara por breakpoint. |
| D12 | IHC | Proto-personas ya definidas; 3-5 entrevistas con prototipo antes de cerrar Ola 2. Checklist Nielsen + severidad 0-4 como gate en adversarial-review. |

### 1.3 Arquitectura de experiencias (resumen)

| Experiencia | Rol | Superficie | Prioridad |
| --- | --- | --- | --- |
| Escritorio (Inicio) | Launcher de herramientas + tablero del dia | Tab movil / sidebar web; ruta inicial | P0 |
| Office: NotasPLAN, CalcuPLAN, PresentaPLAN | Crear/editar documentos, hojas, presentaciones; todo asignable | Tab/sidebar (experiencia madre) | P0 |
| Clases (Classroom) | Organizar, asignar, dar seguimiento; recibe objetos de las demas | Tab/sidebar (experiencia madre) | P0 |
| AsistePLAN | Conversacion IA con adjuntos reales + tareas en 2o plano | Tab movil / panel acoplable web | P1 |
| Cuenta/Accesibilidad | Control de cuenta, sesiones, tema/fuente/daltonismo reales | Secundaria + chrome global | P1 |
| ConectaPLAN | Mensajeria profesional docente | Secundaria (hub Mas / sidebar) | P2 |
| DiseñaPLAN | Materiales visuales (empezar minimal: plantillas+bloques+export) | Secundaria | P2 |
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
| NotasPLAN / CalcuPLAN / PresentaPLAN | Alta (Word/Excel/PowerPoint, Docs/Sheets/Slides, LibreOffice/OnlyOffice) | Frames Figma aprobados + `context/office-ground-truth/` |
| AsistePLAN | Alta (ChatGPT/Gemini/NotebookLM) | Frames Figma + patrones de chat con adjuntos |
| Clases | Alta (Google Classroom/Classroomio) | Frames Figma + `context/classroom-ground-truth/` (ya existe) |
| ConectaPLAN | Alta (WhatsApp profesional) | Frames Figma; NO usar pantallas legacy como referencia |
| DiseñaPLAN | Alta (Canva/Genially), version minimal | Frames Figma del MVP |
| Escritorio, AgendaPLAN, ReportaPLAN | Media | Concepto Stitch/Figma aprobado |
| Cuenta, shell, sync UI | Funcional | Tokens + biblioteca base |

### 1.6 Riesgos tecnicos que el redisenio no puede ignorar

| # | Riesgo | Severidad | Mitigacion |
| --- | --- | --- | --- |
| R1 | Tokens estaticos: tema/daltonismo no se propagan | 3-4 | Change `theming-runtime` primero (Ola 0). |
| R2 | Responsive no reactivo (`Dimensions.get`) | 2-3 | Change `breakpoints-reactivos` (Ola 0). |
| R3 | Rutas legacy y modernas coexisten (grupos/ vs classroom/) | 2 | Cada change de Ola 3 declara la ruta moderna y redirige la legacy. |
| R4 | `FloatingActionIcons` = segunda navegacion paralela | 2 | Se integra al TopBar del AppShell o se retira (decidir en `app-shell-navegacion`). |
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
- No se construye el lienzo completo de DiseñaPLAN (solo MVP con plantillas cuando toque).
- No se disena para alumnos/padres (solo docente en este plan).
- No se implementa email real ni cierre de Auth (plan aparte, activo).

### 1.9 Plan de transicion conceptual

- **Primero fundaciones invisibles (Ola 0):** theming runtime y breakpoints. Sin esto, toda pantalla
  nueva nace con deuda de accesibilidad/responsive.
- **El shell antes que las pantallas (Ola 1):** navegacion nueva apuntando a pantallas viejas.
  La app cambia de esqueleto sin perder funcionalidad; las pantallas se re-visten una a una despues.
- **Validar con docentes en la Ola 2:** prototipo Figma de Escritorio + Crear -> entrevistas
  (guion en `IHC_DISCOVERY_DOCENTE.md`) -> ajustar backlog de Ola 3.
- **Prototipable sin backend:** todo lo visual (frames Figma, shell, Escritorio con datos locales,
  office-home, chip IA con heuristica local). **Requiere backend nuevo:** AsistePLAN (conversaciones,
  adjuntos, cola de tareas persistible).
- **Se rescata (referencia tecnica, no limite visual):** `SyncContext`, `aiGateway` + `aiUsageLimiter`,
  `DocEditor`/tentap, import/export (mammoth/docx/xlsx/pdfjs), `WebScrollView`, todos los Contexts de
  datos, pantallas actuales como inventario.
- **Se difiere:** DiseñaPLAN completo, ReportaPLAN/gamificacion, PresentaPLAN avanzado, comunidad publica.
- **Migracion segura:** la nueva navegacion es capa de presentacion; cero cambios destructivos en
  AsyncStorage o `SYNC_ENTITIES`. Rutas legacy se reapuntan, no se borran de golpe.

---

## 2. Backlog de Changes

> Ejecutar con el ciclo de `meta_guia_planes.md` v3 seccion 2 (enrich -> propose -> apply ->
> adversarial-review -> archive). Un change grande a la vez. Las olas son milestones en GitHub Projects.

### Ola 0: Fundaciones (sin cambio visual visible)

#### Change: `theming-runtime`

- **Historia:** Como docente, cuando cambio el tema, el tamano de fuente o el modo daltonismo en
  preferencias, toda la app lo refleja al instante, sin reiniciar.
- **Criterio de aceptacion:** cambiar tema oscuro repinta cualquier pantalla rediseñada; fuente escala
  tipografia; daltonismo ajusta colores de estado; nada de esto rompe pantallas legacy no migradas.
- **Paridad:** funcional. **Ground truth:** no aplica.
- **Depende de:** nada. **Estado:** pendiente (patron piloteado en 1 pantalla; falta el rollout completo).
- **Notas:** hook `useTheme()` + fabrica de estilos `getStyles(DT, isDark, scaled, ...)`; `COLORS` queda
  como fallback legacy; regla de lint contra `import { COLORS }` en archivos nuevos/rediseñados. Resuelve R1.
- **Piloto real (2026-07-06):** el patron se aplico y valido en `CuentaScreen` via el change archivado
  `apply-cuenta-runtime-accessibility` (issue #34): fabrica de estilos por tema + `scaled()` + `applyDaltonismo`
  + `AccessibilityPreferencesContext` para los 3 toggles. QA Playwright en 3 breakpoints
  (`Documentacion/03-validacion/openspec-sdd-cuenta-2026-07-06/`). Ese change es la plantilla para migrar el resto.

#### Change: `breakpoints-reactivos`

- **Historia:** Como docente, cuando roto la tablet o redimensiono la ventana del navegador, la interfaz
  se reacomoda al momento.
- **Criterio de aceptacion:** hook `useBreakpoint()` reactivo (movil/tablet/web); `responsive.ts` jubilado
  o delegando al hook; rotacion/resize no requiere recargar.
- **Paridad:** funcional. **Depende de:** nada. **Estado:** pendiente. **Notas:** resuelve R2.

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
- **Depende de:** `theming-runtime`, `breakpoints-reactivos`. **Estado:** pendiente.
- **Notas:** el change mas delicado de navegacion; migracion por reapuntado, sin borrar rutas.

#### Change: `componentes-base`

- **Historia:** Como desarrollador, tengo la biblioteca base (Button, Card, Input, Chip, Modal, Toast,
  EmptyState, Skeleton, TabBar/TopBar...) con estados y accesibilidad, para ensamblar pantallas sin
  reinventar estilos.
- **Criterio de aceptacion:** componentes con normal/pressed/disabled/loading, `accessibilityRole/Label`,
  toque >=44pt, foco visible en web; documentados con previews.
- **Paridad:** funcional. **Depende de:** `tokens-completos`. **Estado:** pendiente.

#### Change: `sync-status-ui`

- **Historia:** Como docente, siempre se si mi trabajo esta guardado, sincronizando, pendiente o sin
  conexion, con el mismo lenguaje visual en toda la app y sin mensajes alarmantes.
- **Criterio de aceptacion:** SyncStatusChip global (idle/syncing/synced/offline/error/authError desde
  `SyncContext`), SaveStateLabel en editores, PendingBadge, textos tranquilizadores actuales conservados.
- **Paridad:** funcional. **Depende de:** `componentes-base`. **Estado:** pendiente.

#### Change: `assign-sheet`

- **Historia:** Como docente, desde cualquier documento, hoja o recurso puedo "Asignar a clase" o
  "Adjuntar" con el mismo selector, sin descargar ni copiar nada.
- **Criterio de aceptacion:** un solo componente sobre `SYNC_ENTITIES` (clase/unidad/actividad);
  operacion encolada offline; usado por al menos un flujo real al cerrar.
- **Paridad:** funcional. **Depende de:** `componentes-base`. **Estado:** pendiente.

### Ola 2: Nucleo visible (aqui entran las entrevistas IHC)

#### Change: `escritorio-docente`

- **Historia:** Como docente, al abrir PlanearIA veo mi escritorio: mis herramientas (NotasPLAN, CalcuPLAN,
  PresentaPLAN, DiseñaPLAN, Asistente, Clases) y mi dia (que sigue, pendientes, continuar trabajo,
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

#### Hito IHC (no es change de codigo): entrevistas con docentes

- Con los frames/prototipo de `escritorio-docente` y `office-home-crear`: aplicar el guion de
  `IHC_DISCOVERY_DOCENTE.md` seccion 5 a 3-5 docentes. Sintetizar y ajustar backlog de Ola 3.

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

- `cuenta-preferencias`: pantallas de Cuenta/Preferencias/Accesibilidad con el nuevo sistema; verificacion
  real de accesibilidad (depende de `theming-runtime`).
- `conectaplan`: mensajeria profesional desde cero (contactos, hilos, compartir recursos con guardar/asignar
  del receptor); reusa fontaneria de mensajes/contactos, cero UI legacy.
- `agendaplan`: vista semana/mes; cada evento abre su objeto real; recordatorios con expo-notifications.
- `presentaplan-mvp`: laminas lineales texto-primero con export.
- `disenaplan-mvp`: plantillas rellenables + bloques simples + export; NO lienzo completo.
- `reportaplan`: consolidar reportes existentes; alertas de riesgo con dato que las sustente; gamificacion
  prudente. Activar solo con datos reales suficientes.

---

## 3. Registro de Decisiones y Open Questions

Decisiones: ver 1.2 (D1-D12).

Open questions:

- OQ1: nombres finales de DiseñaPLAN/AsistePLAN/ConectaPLAN/AgendaPLAN/ReportaPLAN ("de momento asi",
  revisar antes de Ola 3).
- OQ2: destino de `FloatingActionIcons` (se decide en `app-shell-navegacion`).
- OQ3: politica de privacidad de datos de alumnos hacia proveedores IA cloud (se decide en la spec de
  `asistente-ia-base`; minimo: avisar que se envia y a que tipo de proveedor).
- OQ4: comunidad publica (muro) futura: fuera de este plan; reevaluar tras ConectaPLAN.
- OQ5: CLI de openspec global no esta en `package.json` (documentado; decidir si se agrega como devDependency).

---

## 4. Criterio de Cierre del Plan

El plan se cierra cuando:

- Olas 0-3 archivadas: fundaciones, shell, Escritorio, Office home + NotasPLAN/CalcuPLAN, Clases
  redisenadas y AsistePLAN base operando con confirmaciones.
- Un docente (entrevistas de Ola 2 + validacion final) reconoce la app como "mis herramientas de siempre,
  conectadas" y completa los 3 recorridos IHC sin ayuda.
- Tema oscuro, fuente y daltonismo se propagan en todas las pantallas rediseñadas.
- Ninguna pantalla rediseñada carece de estados loading/empty/error/offline.
- `openspec/specs/` contiene la verdad de comportamiento de shell, Escritorio, Office base, Clases y
  Asistente.
- La Ola 4 queda como backlog priorizado (no es requisito ejecutarla para cerrar este plan).

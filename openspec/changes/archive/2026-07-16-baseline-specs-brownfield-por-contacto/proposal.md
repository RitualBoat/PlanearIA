## Why

El enrich y los gates actuales enlazan un issue, sus superficies y la evidencia de cierre, pero no registran el comportamiento brownfield que un change modifica o debe conservar. Sin esa comparación, una spec nueva puede reemplazar compatibilidad legacy por omisión, especialmente al iniciar las primeras fundaciones UX/UI.

## What Changes

- Definir un `brownfield-baseline.md` raíz, breve y versionado, para cada change nuevo que documente solamente las superficies que toca: fuentes de verdad, comportamiento vigente, delta objetivo, compatibilidad legacy, owners y evidencia existente.
- Hacer que las instrucciones de propose y el gate read-only de archive exijan y validen sus secciones mínimas, con recuperación segura ante un archivo faltante o incompleto.
- Registrar los owners de spec de las primeras superficies UX para distinguir la responsabilidad de Experiencia y Preferencias de los datos que Office, Classroom, Sync e IA conservan como propios.
- Añadir un ejemplo de delta brownfield y fixtures positivos/negativos que demuestren el contrato sin implementar ninguna pantalla UX.

## Capabilities

### New Capabilities

- `brownfield-surface-baseline`: Define el contrato ligero que compara la superficie vigente y el comportamiento objetivo de cada change, con compatibilidad legacy, owners y evidencia verificable.

### Modified Capabilities

- `openspec-readiness-gates`: El gate de archive también valida que el baseline brownfield requerido exista y contenga el contrato mínimo, sin ejecutar contenido arbitrario.

## Impact

- Reglas y documentación: `openspec/config.yaml`, la fuente de instrucciones `.agents`, la guía SDD pertinente y los planes maestro de preparación/UX para el proceso y owners iniciales.
- Harness: `scripts/checkOpenSpecReadiness.mjs` y sus pruebas/fixtures focalizadas.
- OpenSpec: capability nueva `brownfield-surface-baseline`, delta a `openspec-readiness-gates`, este `brownfield-baseline.md`, `readiness.json` y `TLDR.md`.
- Validación: OpenSpec estricto, pruebas del readiness checker, paridad del harness y verificación del parche de workflows si se modifica su contrato.

## No objetivos

- No implementar `theming-runtime`, breakpoints, AppShell ni componentes o pantallas UX.
- No inventariar toda la aplicación, migrar datos/rutas/storage ni alterar `src/sync`, APIs o proveedores IA.
- No convertir el gate en CI global bloqueante, ejecutar comandos desde Markdown/manifest o sustituir revisión humana y QA visual.

## Referencias

- Issue: #64 — Baseline brownfield para superficies tocadas por cada change.
- Plan maestro: `Documentacion/01-planes-maestros/PLAN_PREPARACION_OPERATIVA_SDD_HARNESS_SOLO_DEV.md`, Ola 1.
- Plan consumidor: `Documentacion/01-planes-maestros/PLAN_UXUI_NAVEGACION_GLOBAL.md`, fundaciones y shell.
- Ground truth: `openspec/specs/`, código y pruebas actuales, `openspec/config.yaml` y `Documentacion/00-fundamentos/MAPA_DDD_ESTRATEGICO_LIGERO.md`.
